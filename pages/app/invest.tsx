import React, { useCallback, useEffect, useState } from "react";

import { useContractKit } from "@celo-tools/use-contractkit";

import { createMachine } from "xstate";
import { useMachine } from "@xstate/react";

import { BigNumber } from "bignumber.js";
import axios from "axios";

import useStore from "../../store/store";

import Layout from "../../components/app/layout";
import CeloInput from "../../components/app/celo-input";
import { fetchExchangeRate } from "../../lib/utils";
import { getCELOBalance, getNonVotingLockedGold } from "../../lib/celo";
import useVG from "../../hooks/useValidatorGroup";
import { VGSuggestion } from "../../lib/types";

const InvestMachine = createMachine({
  id: "InvestFlow",
  initial: "idle",
  states: {
    idle: {
      on: { NEXT: "voting" },
    },
    voting: {
      on: { NEXT: "activating" },
    },
    activating: {
      on: { NEXT: "completed" },
    },
    completed: {
      on: { NEXT: "idle" },
    },
  },
});

async function fetchTargetAPY() {
  const resp = await axios.get(
    "https://celo-on-chain-data-service.onrender.com/target-apy"
  );
  return resp.data;
}

function Invest() {
  const { address, network, kit, performActions } = useContractKit();

  const [current, send] = useMachine(InvestMachine);

  const [celoToInvest, setCeloToInvest] = useState("");
  const [monthlyEarning, setMonthlyEarning] = useState<BigNumber>(
    new BigNumber(0)
  );
  const [yearlyEarning, setYearlyEarning] = useState<BigNumber>(
    new BigNumber(0)
  );
  const [maxCeloToInvest, setMaxCeloToInvest] = useState(new BigNumber(0));
  const [unlockedCelo, setUnlockedCelo] = useState<BigNumber>();
  const [nonVotingLockedCelo, setNonVotingLockedCelo] = useState<BigNumber>();
  const [exchangeRate, setExchangeRate] = useState(0);
  const [estimatedAPY, setEstimatedAPY] = useState<BigNumber>(new BigNumber(0));
  const [selectedVG, setSelectedVG] = useState<VGSuggestion>();

  const { fetching: fetchingVG, error: errorFetchingVG, data } = useVG(true, 5);

  const state = useStore();

  useEffect(() => {
    state.setUser(address);
    state.setNetwork(network.name);
    fetchExchangeRate().then((rate) => setExchangeRate(rate));
    fetchTargetAPY().then((resp) =>
      setEstimatedAPY(new BigNumber(parseFloat(resp.target_apy)))
    );
  }, []);

  useEffect(() => {
    if (fetchingVG == false && errorFetchingVG == undefined) {
      setSelectedVG(data["ValidatorGroups"][0]);
      console.log(data["ValidatorGroups"]);
    }
  }, [fetchingVG, errorFetchingVG, data]);

  const fetchAccountData = useCallback(
    async (address: string) => {
      const [unlockedCelo, nonVotingLockedCelo] = await Promise.all([
        getNonVotingLockedGold(kit, address),
        getCELOBalance(kit, address),
      ]);

      return { unlockedCelo, nonVotingLockedCelo };
    },
    [address]
  );

  useEffect(() => {
    if (address.length < 1) return;

    fetchAccountData(address).then(({ unlockedCelo, nonVotingLockedCelo }) => {
      setUnlockedCelo(unlockedCelo);
      setNonVotingLockedCelo(nonVotingLockedCelo);
      setMaxCeloToInvest(unlockedCelo.minus(0.5).plus(nonVotingLockedCelo));
    });
  }, [address]);

  useEffect(() => {
    if (celoToInvest === "") {
      setMonthlyEarning(new BigNumber(0));
      setYearlyEarning(new BigNumber(0));
    }
    const celoToInvestBN = new BigNumber(celoToInvest);
    const yearly = celoToInvestBN.times(estimatedAPY).div(100);
    const monthly = yearly.div(12);
    setMonthlyEarning(monthly);
    setYearlyEarning(yearly);
  }, [celoToInvest]);

  useEffect(() => {
    console.log("State machine:", current.value);
  }, [current.value]);

  const lockCELO = async (amount: BigNumber) => {
    try {
      await performActions(async (k) => {
        // await ensureAccount(k, k.defaultAccount);
        const lockedCelo = await k.contracts.getLockedGold();
        return lockedCelo.lock().sendAndWaitForReceipt({
          value: amount.toString(),
          from: k.defaultAccount,
        });
      });

      console.log("CELO locked");
      send("NEXT");
    } catch (e) {
      console.error(e.message);
    }
  };

  const voteOnVG = async () => {
    if (selectedVG == undefined || selectedVG == null) return;

    if (!celoToInvest) return;

    try {
      await performActions(async (k) => {
        const election = await k.contracts.getElection();
        await (
          await election.vote(
            selectedVG.Address,
            new BigNumber(parseFloat(celoToInvest)).times(1e18)
          )
        ).sendAndWaitForReceipt({ from: k.defaultAccount });
      });
      send("NEXT");
    } catch (e) {
      console.log("unable to vote", e.message);
    }
  };

  return (
    <Layout
      // TODO: Fix the state structure so you don't have to pass disconnectWallet to layout everytime.
      disconnectWallet={async () => {
        console.log("destroy wallet function");
      }}
    >
      <>
        <h1 className="text-2xl font-medium mb-10 text-gray-dark">
          Invest CELO
        </h1>
        <main className="space-y-10">
          {/* Amount Panel */}
          <div
            className={`border ${
              current.matches("idle")
                ? "border-gray-light"
                : "border-primary bg-primary-light-light"
            } rounded-md py-8 px-10`}
          >
            <h3
              className={`${
                current.matches("idle") ? "text-gray-dark" : "text-primary-dark"
              } text-xl`}
            >
              Step 1: Investment Amount
            </h3>
            <div className={`${!current.matches("idle") && "hidden"}`}>
              <div className="flex items-end mt-5">
                <div className="w-1/3">
                  <CeloInput
                    celoAmountToInvest={celoToInvest}
                    setCeloAmountToInvest={setCeloToInvest}
                    exchangeRate={exchangeRate}
                    maxAmount={maxCeloToInvest}
                  />
                </div>
                <div className="ml-5 mb-3 text-gray">
                  / out of {maxCeloToInvest.div(1e18).toFormat(2)} Total CELO ($
                  {maxCeloToInvest.div(1e18).times(exchangeRate).toFormat(2)})
                  in your Wallet
                </div>
              </div>
              <div className="mt-5 flex space-x-32">
                <div className="text-gray-dark">
                  <p className="text-sm">You could be earning</p>
                  <p className="mt-2 text-lg font-medium">
                    {estimatedAPY.toFormat(2)}% APY
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray">Yearly Earnings</p>
                  <div className="mt-2 space-x-5 flex items-baseline">
                    <p className="text-lg text-gray-dark">
                      {yearlyEarning.toFormat(2)} CELO
                    </p>
                    <p className="text-gray">
                      $ {yearlyEarning.times(exchangeRate).toFormat(2)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray">Monthly Earnings</p>
                  <div className="mt-2 space-x-5 flex items-baseline">
                    <p className="text-lg text-gray-dark">
                      {monthlyEarning.toFormat(2)} CELO
                    </p>
                    <p className="text-gray">
                      $ {monthlyEarning.times(exchangeRate).toFormat(2)}
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="bg-primary text-white text-lg block w-full rounded-md mt-5 py-3"
                onClick={() => {
                  if (
                    unlockedCelo === undefined ||
                    nonVotingLockedCelo === undefined
                  )
                    return;
                  /* 
                - If celoToInvest is lesser than nonVotingLocked
                  - continue to next step 
                - If celoToInvest is higher than nonVotingLockedCelo and lesser than the sum of unlockedCelo and nonVotingLockedCelo
                  - Lock the required CELO
                - If celoToInvest is higher than the sum of nonVotingLockedCelo and unlockedCelo
                  - Error state.
                */
                  const celoToInvestBN = new BigNumber(
                    parseFloat(celoToInvest)
                  ).times(1e18);
                  if (nonVotingLockedCelo.gte(celoToInvestBN)) {
                    // continue to the next step.
                    console.log("continue to the next step.");
                    send("NEXT");
                  } else if (
                    nonVotingLockedCelo.plus(unlockedCelo).gt(celoToInvestBN)
                  ) {
                    console.log("need to lock CELO");
                    lockCELO(celoToInvestBN.minus(nonVotingLockedCelo));
                  } else if (
                    nonVotingLockedCelo.plus(unlockedCelo).lte(celoToInvestBN)
                  ) {
                    // can't move forward, error.
                    console.log("can't move forward, error.");
                  }
                }}
              >
                Confirm &amp; Continue
              </button>
            </div>
          </div>

          {/* Voting Panel */}
          <div
            className={`border ${
              current.matches("idle") || current.matches("voting")
                ? "border-gray-light"
                : "border-primary bg-primary-light-light"
            } rounded-md py-8 px-10`}
          >
            <h3
              className={`${
                current.matches("activating") || current.matches("completed")
                  ? "text-primary-dark"
                  : "text-gray-dark"
              } text-xl`}
            >
              Step 2: Vote For Validator
            </h3>
            <div className={`${!current.matches("voting") && "hidden"}`}>
              <div className="text-gray mt-5">
                <p className="font-medium">
                  Why am I voting? What are Validator Groups?
                </p>
                <p className="mt-3 max-w-5xl">
                  Its easier than it sounds. Here’s how it work:
                  <ul className="list-disc list-inside my-2 space-y-1">
                    <li>
                      The investment process of Celo is based on the mechanism
                      where you vote for Validator Groups with your CELO
                    </li>
                    <li>
                      When the Validator Groups you vote for performs well - you
                      earn CELOs. Its that simple!
                    </li>
                  </ul>
                  You don’t have to go through the hustle of deciding which
                  Validator Group to vote for. We have the most suited Group for
                  you. You can vote for it right-away!
                </p>
              </div>
              <div className="mt-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-dark">
                    Recommended Validator Group to vote for:
                  </span>
                  <button className="text-primary">
                    Edit Validator Group preference
                  </button>
                </div>
                <div className="border border-gray-light rounded-md grid grid-cols-5 gap-9 px-12 py-5 mt-3 text-center">
                  <div className="grid grid-rows-2 gap-2">
                    <span className="text-gray">Name</span>
                    <span className="text-gray-dark text-base">
                      {selectedVG?.Name}
                    </span>
                  </div>
                  <div className="grid grid-rows-2 gap-2">
                    <span className="text-gray">Group Score</span>
                    <span className="text-gray-dark text-base">
                      {selectedVG?.GroupScore}
                    </span>
                  </div>
                  <div className="grid grid-rows-2 gap-2">
                    <span className="text-gray">Performance Score</span>
                    <span className="text-gray-dark text-base">
                      {selectedVG?.PerformanceScore}%
                    </span>
                  </div>
                  <div className="grid grid-rows-2 gap-2">
                    <span className="text-gray">Transparency Score</span>
                    <span className="text-gray-dark text-base">
                      {selectedVG?.TransparencyScore}%
                    </span>
                  </div>
                  <div className="grid grid-rows-2 gap-2">
                    <span className="text-gray">Estimated APY</span>
                    <span className="text-gray-dark text-base">
                      {selectedVG?.EstimatedAPY}%
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="bg-primary text-white text-lg block w-full rounded-md mt-5 py-3"
                onClick={() => {
                  voteOnVG();
                }}
              >
                Vote
              </button>
            </div>
          </div>

          {/* Activate Votes Panel */}
          <div className="border border-gray-light rounded-md py-8 px-10">
            <h3 className="text-gray-dark text-xl">
              Step 3: Activate Investment
            </h3>
            <div className={`${!current.matches("activating") && "hidden"}`}>
              <p className="text-gray font-medium mt-5">Almost there!</p>
              <p className="text-gray mt-3">
                To finish your investment & start earning profits - please
                return back in a day.
              </p>
              <button className="bg-primary text-white text-lg block w-full rounded-md mt-5 py-3">
                Activate
              </button>
            </div>
          </div>
        </main>
      </>
    </Layout>
  );
}

export default Invest;
