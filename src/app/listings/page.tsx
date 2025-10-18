"use client";

import Listings from "./_components/Listings";
import { baseSepolia } from "thirdweb/chains";
import { getContract } from "thirdweb/contract";
import { client } from "../client";
import Header from "../components/Header";

const MARKETPLACE_ADDRESS = process.env
  .NEXT_PUBLIC_MARKETPLACE_ADDRESS as string;
if (!MARKETPLACE_ADDRESS) {
  throw new Error("NEXT_PUBLIC_MARKETPLACE_ADDRESS is not set");
}

export default function ListingsPage() {
  const contract = getContract({
    client,
    chain: baseSepolia,
    address: MARKETPLACE_ADDRESS,
  });

  return (
    <>
      <Header />
      <main className="p-4 pb-10 min-h-[100vh] container max-w-screen-lg mx-auto">
        <Listings contract={contract} />
      </main>
    </>
  );
}
