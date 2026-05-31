import type { Auction, AuctionWithId } from '../types';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Parse a raw contract tuple into an Auction or AuctionWithId object.
 * The contract returns a positional array — this maps indices to named fields.
 */
export function parseAuction(raw: unknown[], id?: number): AuctionWithId {
  const auction: Auction = {
    seller: raw[0] as string,
    title: raw[1] as string,
    biddingEnd: raw[2] as bigint,
    finalized: raw[3] as boolean,
    paymentClaimed: raw[4] as boolean,
    minimumBid: raw[5] as `0x${string}`,
    highestBid: raw[6] as `0x${string}`,
    highestBidder: raw[7] as `0x${string}`,
    revealedBid: raw[8] as bigint,
    revealedWinner: raw[9] as string,
  };

  return { ...auction, id: id ?? 0 };
}
