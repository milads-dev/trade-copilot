import type { ReactNode } from "react";

import { signOut } from "next-auth/react";
import Link from "next/link";

import { DrawerIcon } from "./icons/DrawerIcon";
import { ThemeController } from "./ui/ThemeController";

interface Props {
  children: ReactNode;
}
export const Drawer = ({ children }: Props) => {
  return (
    <div className="drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label
          htmlFor="my-drawer"
          className="top-12 tooltip-right left-10 z-20 absolute flex btn btn-ghost drawer-button tooltip tooltip-secondary"
          data-tip="Open Drawer"
        >
          <DrawerIcon />
        </label>
        {/* Page content here */}
        <div className="z-10 w-full h-[100vh]">{children}</div>
      </div>
      <div className="z-30 drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="space-y-3 bg-base-200 px-4 pt-14 w-80 min-h-full text-base-content menu">
          {/* Sidebar content here */}
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/trades">Trade History</Link>
          </li>
          <li>
            <Link href="/market-analysis">Market Analysis</Link>
          </li>
          <li className="flex-grow justify-end">
            <button onClick={() => void signOut()}>Sign Out</button>
          </li>
          <ThemeController />
        </ul>
      </div>
    </div>
  );
};
