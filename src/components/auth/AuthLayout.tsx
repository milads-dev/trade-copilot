import type { ReactNode } from "react";

import Image from "next/image";

interface Props {
  children: ReactNode;
}
export const AuthLayout = ({ children }: Props) => {
  return (
    <div className="flex h-screen items-center justify-center ">
      <div className="hidden h-full w-full justify-between md:flex ">
        <div className="flex w-full flex-col justify-between overflow-hidden bg-neutral text-center">
          <Image
            className="mx-auto mt-52 md:max-w-full md:px-4"
            src="/assets/tradeDesk.svg"
            alt="Trade Desk"
            width={800}
            height={800}
          />
          <div className="mockup-code max-h-36 flex-grow overflow-auto bg-info-content text-start text-primary">
            <pre data-prefix="$">
              <code>npm create t3-app@latest</code>
            </pre>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};
