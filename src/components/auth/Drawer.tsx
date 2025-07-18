import type { ReactNode } from "react";

import { signOut } from "next-auth/react";
import Link from "next/link";

import { DrawerIcon } from "../icons/DrawerIcon";
import { ThemeController } from "../ui/ThemeController";

interface Props {
  children: ReactNode;
}
export const Drawer = ({ children }: Props) => {
  return (
    <div className="drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Drawer Icon */}
        <label
          htmlFor="my-drawer"
          className="btn btn-ghost drawer-button tooltip tooltip-secondary tooltip-right absolute left-10 top-12 z-20 flex"
          data-tip="Open Drawer"
        >
          <DrawerIcon />
        </label>
        {/* Page content here */}
        <div className="z-10 h-[100vh] w-full">{children}</div>
      </div>
      <div className="drawer-side z-30">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu min-h-full w-80 space-y-3 bg-base-200 px-4 pt-14 text-base-content">
          {/* Sidebar content here */}
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/trades">Trade History</Link>
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
