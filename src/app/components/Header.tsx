"use client";

import { useEffect, useState } from "react";
import { client } from "../client";
import { ConnectButton } from "thirdweb/react";
import { baseSepolia } from "thirdweb/chains";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <h1>Hello Base Sepolia Marketplace Demo</h1>
      <div className="flex justify-center mt-10">
        {mounted && (
          <ConnectButton
            client={client}
            chain={baseSepolia}
            appMetadata={{
              name: "Base Sepolia marketplace demo",
              url: "https://basesepolia-marketplace-demo.vercel.app",
            }}
          />
        )}
      </div>
    </header>
  );
}
