import type { Auction, AuctionStatus } from '../types';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Derive auction status from contract state.
 */
export function deriveStatus(biddingEnd: bigint, finalized: boolean, revealedWinner: string): AuctionStatus {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (finalized && revealedWinner !== ZERO_ADDRESS) return 'FINALIZED';
  if (finalized || biddingEnd <= now) return 'SETTLEMENT';
  return 'ACTIVE';
}

/**
 * Parse a raw contract tuple into a frontend-friendly Auction object.
 *
 * Off-chain fields (description, category, imageURI) default to empty strings.
 * These should be populated from IPFS or a metadata backend keyed by auction ID.
 *
 * @param raw - Contract return tuple (positional array)
 * @param id - Auction ID
 * @param sealedBidCount - From getBidderCount()
 * @param metadata - Optional off-chain metadata
 */
export function parseAuction(
  raw: unknown[],
  id: number,
  sealedBidCount: number = 0,
  metadata?: { description?: string; category?: string; imageURI?: string },
): Auction {
  const biddingEnd = raw[2] as bigint;
  const finalized = raw[3] as boolean;
  const revealedWinner = raw[9] as string;

  return {
    id,
    seller: raw[0] as string,
    title: raw[1] as string,
    description: metadata?.description ?? '',
    category: metadata?.category ?? '',
    imageURI: metadata?.imageURI ?? '',
    encryptedReservePrice: raw[5] as `0x${string}`,
    duration: Number(biddingEnd) - Math.floor(Date.now() / 1000), // approximate
    revealWindow: 0, // not on-chain yet
    status: deriveStatus(biddingEnd, finalized, revealedWinner),
    sealedBidCount,
    biddingEnd,
    finalized,
    paymentClaimed: raw[4] as boolean,
    revealedWinner,
    revealedBid: raw[8] as bigint,
    createdAt: 0, // not on-chain yet
  };
}

/**
 * Parse a raw contract bid tuple into a Bid object.
 */
export function parseBid(raw: unknown, auctionId: number, bidder: string): { exists: boolean; ethDeposited: bigint } {
  const bidData = raw as { exists: boolean; ethDeposited: bigint };
  return {
    exists: bidData.exists,
    ethDeposited: bidData.ethDeposited,
  };
}
