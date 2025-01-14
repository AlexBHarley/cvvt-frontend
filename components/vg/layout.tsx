import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useContractKit } from "@celo-tools/use-contractkit";
import { useRouter } from "next/router";
import Nav from "./nav";
import useStore from "../../store/vg-store";

interface layoutProps {
  children: React.ReactChild;
}

export default function layout({ children }: layoutProps) {
  const navigation = [
    {
      text: "Dashboard",
      to: "/vg/dashboard",
      icon: "/assets/nav/nav-home",
    },
    {
      text: "View Profile",
      to: "/vg/profile",
      icon: "/assets/nav/nav-view-profile",
    },
    {
      text: "Edit Profile",
      to: "/vg/edit",
      icon: "/assets/nav/nav-edit-profile",
    },
  ];
  const { destroy } = useContractKit();
  const router = useRouter();
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  const userConnected = useMemo(() => user.length > 0, [user]);

  const disconnectWallet = useCallback(() => {
    destroy();
    setUser("");
  }, []);

  useEffect(() => {
    console.log("userConnected", userConnected);
  }, [userConnected]);

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Nav />
      <div className="flex-1 flex overflow-hidden">
        <div className="bg-primary-light-light w-64 flex flex-col flex-shrink-0">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-7 flex-1 px-2.5 space-y-4">
              {navigation.map((item) => {
                let path = router.asPath;
                let disabled = !userConnected;

                if (router.asPath.charAt(router.asPath.length - 1) == "#")
                  path = router.asPath.slice(0, -1);
                if (item.to.includes("dashboard")) disabled = false;

                return (
                  <MenuLink
                    text={item.text}
                    to={item.to}
                    icon={item.icon}
                    isActive={path == item.to}
                    disabled={disabled}
                    key={item.to}
                  />
                );
              })}
            </nav>
            <div className="mb-40 mx-7 text-primary-dark">
              {userConnected && (
                <button
                  className="flex items-center focus:ring-outline-none"
                  onClick={disconnectWallet}
                >
                  <img src="/assets/nav/nav-logout-outlined.png" />
                  <span className="ml-5 text-lg">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <main className="flex-1 p-16 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function MenuLink({
  text,
  to,
  icon,
  isActive,
  disabled,
}: {
  text: string;
  to: string;
  icon: string;
  isActive: boolean;
  disabled: boolean;
}) {
  return (
    <Link href={to} passHref>
      <a
        className={`${
          disabled
            ? "opacity-40 text-primary-dark cursor-not-allowed"
            : isActive
            ? "bg-primary text-white"
            : "text-primary-dark hover:bg-primary-light transition-all duration-150"
        }  group flex justify-start items-center px-6 py-3 text-lg rounded-md space-x-2`}
      >
        <img
          src={`${icon}${isActive ? "" : "-outlined"}.svg`}
          className="h-5 w-5"
        />
        <span>{text}</span>
      </a>
    </Link>
  );
}
