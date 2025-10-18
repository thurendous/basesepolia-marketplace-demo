import { baseSepolia } from "thirdweb/chains";
import { client } from "./client";
import { getContract } from "thirdweb/contract";
import Link from "next/link";
import Header from "./components/Header";

// menu-only home; listings moved to /listings

export default function Home() {
  const contract = getContract({
    client,
    chain: baseSepolia,
    address: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as string,
  });

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
        {/* links to listings and my nfts */}
        <div className="flex gap-3 justify-center mb-8">
          <Link href="/listings" className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700">Listings</Link>
          <Link href="/my-nfts" className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700">My NFTs</Link>
        </div>

    </main>
  );
}
