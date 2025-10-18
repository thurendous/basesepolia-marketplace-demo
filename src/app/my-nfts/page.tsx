"use client";

import { MediaRenderer, useActiveAccount, CreateDirectListingButton } from "thirdweb/react";
import { baseSepolia } from "thirdweb/chains";
import { Insight } from "thirdweb";
import { client } from "../client";
import { useEffect, useState } from "react";

const MARKETPLACE_ADDRESS = process.env
  .NEXT_PUBLIC_MARKETPLACE_ADDRESS as string;
if (!MARKETPLACE_ADDRESS) {
  throw new Error("NEXT_PUBLIC_MARKETPLACE_ADDRESS is not set");
}

export default function MyNftsPage() {
  const account = useActiveAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [askPriceByKey, setAskPriceByKey] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      if (!account) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await Insight.getOwnedNFTs({
          client,
          chains: [baseSepolia],
          ownerAddress: account.address,
          includeMetadata: true,
        });
        console.log("My NFTs count:", data.length);
        setNfts(data);
      } catch (e: any) {
        console.error("Failed to load owned NFTs", e);
        setError(e?.message || "Failed to load NFTs");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [account]);

  return (
    <main className="p-4 pb-10 min-h-[100vh] container max-w-screen-lg mx-auto">
      {!account && <div>Please connect your wallet.</div>}
      {account && (
        <>
          {loading && <div className="text-zinc-300">Loading...</div>}
          {error && <div className="text-red-400">{error}</div>}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nfts.length === 0 && <div className="text-zinc-400">No NFTs found</div>}
              {nfts.map((nft, idx) => {
                const img = nft?.metadata?.image as string | undefined;
                const name = (nft?.metadata?.name as string | undefined) || `#${nft?.id?.toString?.() || idx}`;
                const tokenAddress = nft?.tokenAddress as string | undefined;
                const tokenId = nft?.id as bigint | undefined;
                const key = `${tokenAddress || "noaddr"}-${tokenId?.toString?.() || idx}`;

                console.log("Token address:", tokenAddress);
                console.log("Token ID:", tokenId);
                console.log("Key:", key);
                console.log("NFT:", nft);
                return (
                  <div key={key} className="border border-zinc-800 rounded-lg p-3 flex flex-col gap-3">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <MediaRenderer client={client} src={img} className="w-full aspect-square rounded-md object-cover bg-zinc-900" />
                    ) : (
                      <div className="w-full aspect-square rounded-md bg-zinc-900" />
                    )}
                    <div className="text-zinc-100 font-medium truncate" title={name}>
                      {name}
                    </div>
                    {/* List for sale controls */}
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 rounded-md bg-zinc-900 border border-zinc-800 px-2 py-1 text-sm text-zinc-200 outline-none"
                        placeholder="Price (ETH)"
                        value={askPriceByKey[key] || ""}
                        onChange={(e) =>
                          setAskPriceByKey((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                      />
                      {tokenAddress && tokenId !== undefined && (
                        <CreateDirectListingButton
                          client={client}
                          chain={baseSepolia}
                          contractAddress={MARKETPLACE_ADDRESS}
                          assetContractAddress={tokenAddress as `0x${string}`}
                          tokenId={tokenId}
                          pricePerToken={askPriceByKey[key] || ""}
                          disabled={!askPriceByKey[key]}
                          className="text-zinc-300 text-sm bg-blue-800 px-2 py-1 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          List for sale
                        </CreateDirectListingButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}


