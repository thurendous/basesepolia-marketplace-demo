"use client";

import {
  createContractQuery,
  MediaRenderer,
  useActiveAccount,
} from "thirdweb/react";
import {
  cancelListing,
  getAllListings,
  buyFromListing,
  DirectListing,
} from "thirdweb/extensions/marketplace";
import { sendTransaction } from "thirdweb";
import type { ThirdwebContract } from "thirdweb/contract";

const useAllListings = createContractQuery(getAllListings);

export default function YourNfts(props: { contract: ThirdwebContract }) {
  const { contract } = props;
  const account = useActiveAccount();

  const { data, isLoading, error } = useAllListings({
    contract,
    start: 0,
    count: 20n,
  });

  if (isLoading) {
    return <div className="text-zinc-300">Loading...</div>;
  }

  if (error) {
    console.error("Failed to load listings", error);
    return (
      <div className="text-red-400">An error came out：{error.message}</div>
    );
  }

  console.log("All listings count:", data?.length);
  console.table(
    (data || []).map((l) => ({
      id: l.id.toString(),
      tokenId: l.tokenId.toString(),
      status: l.status,
    })),
  );

  if (!data || data.length === 0) {
    return <div className="text-zinc-400">No NFTs listed</div>;
  }

  const buyNft = async (listingId: bigint, quantity: bigint) => {
    try {
      if (!account) {
        console.error("No connected account");
        alert("Please connect your wallet first.");
        return;
      }
      const tx = buyFromListing({
        contract,
        listingId,
        quantity,
        recipient: account.address,
      });
      const { transactionHash } = await sendTransaction({
        account,
        transaction: tx,
      });
      console.log("Buy success:", transactionHash);
      alert("NFT purchased successfully");
    } catch (error) {
      console.error("Failed to buy NFT", error);
      alert("Failed to buy NFT");
    }
  };

  const isListingOwner = (listing: DirectListing) => {
    return (
      listing.asset?.owner?.toLowerCase() === account?.address?.toLowerCase?.()
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {data.map((listing) => {
        const img = listing.asset?.metadata?.image as string | undefined;
        const name =
          (listing.asset?.metadata?.name as string | undefined) ||
          `#${listing.tokenId.toString()}`;
        const price = listing.currencyValuePerToken?.displayValue as
          | string
          | undefined;
        const symbol = listing.currencyValuePerToken?.symbol as
          | string
          | undefined;

        return (
          <div
            key={listing.id.toString()}
            className="border border-zinc-800 rounded-lg p-3 flex flex-col gap-3"
          >
            {img ? (
              <MediaRenderer
                client={contract.client}
                src={img}
                className="w-full aspect-square rounded-md object-cover bg-zinc-900"
              />
            ) : (
              <div className="w-full aspect-square rounded-md bg-zinc-900" />
            )}
            <div className="flex items-center justify-between">
              <div
                className="text-zinc-100 font-medium truncate max-w-[60%]"
                title={name}
              >
                {name}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 capitalize">
                  {listing.status?.toLowerCase?.() || "unknown"}
                </span>
                <span className="text-zinc-300 text-sm">
                  {price ? `${price} ${symbol || ""}` : "-"}
                </span>
                {/* anyone can see the buy now button */}
                <button
                  onClick={() => buyNft(listing.id, 1n)}
                  className="text-zinc-300 text-sm bg-green-800 px-2 py-1 rounded-md hover:bg-green-700 transition-colors"
                >
                  Buy Now
                </button>
                {/* only show cancel listing button if the listing is owned by the current account */}
                {isListingOwner(listing) && (
                  <button
                    onClick={() =>
                      cancelListing({ contract, listingId: listing.id })
                    }
                    className="text-zinc-300 text-sm bg-red-800 px-2 py-1 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cancel Listing
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
