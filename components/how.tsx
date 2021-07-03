import React from "react";
import FeatureIllustrationOne from "./home/illustrations/feature-illustration-one";
import Report from "./home/illustrations/report";
import Clipboard from "./home/illustrations/clipboard";
import Note from "./home/illustrations/note";

function How() {
  return (
    <div className="w-full flex justify-center">
      <div className="text-center">
        <div>
          <p className="text-gray text-sm font-medium">
            Simplicity First, and Second.
          </p>
          <h2 className="text-gray-dark text-4xl font-medium font-serif mt-2">
            Investing CELO is Easy, as it should be.
          </h2>
          <p className="text-gray mt-5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
        <section className="mt-32 space-y-28">
          <div>
            <p className="text-gray text-sm font-medium">STEP 1</p>
            <h3 className="font-serif font-medium text-3xl text-gray-dark mt-2">
              Select the investment amount
            </h3>
            <div className="mt-10 flex justify-center">
              <FeatureIllustrationOne />
            </div>
            <p className="text-gray mt-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <div>
            <p className="text-gray text-sm font-medium">STEP 2</p>
            <h3 className="font-serif font-medium text-3xl text-gray-dark mt-2">
              Vote for Validator Group
            </h3>
            <div className="mt-10 -ml-7 flex justify-center">
              <Clipboard />
            </div>
            <p className="text-gray mt-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <div>
            <p className="text-gray text-sm font-medium">STEP 3</p>
            <h3 className="font-serif font-medium text-3xl text-gray-dark mt-2">
              Activate Your Vote
            </h3>
            <div className="mt-10 -mr-10 flex justify-center">
              <Note />
            </div>
            <p className="text-gray mt-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <div>
            <p className="text-gray text-sm font-medium">All set!</p>
            <h3 className="font-serif font-medium text-3xl text-gray-dark mt-2">
              Earn Profits & Monitor Growth
            </h3>
            <div className="mt-10 flex justify-center">
              <Report />
            </div>
            <p className="text-gray mt-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default How;
