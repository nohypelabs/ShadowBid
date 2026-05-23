export interface Auction {
  seller: string;
  title: string;
  biddingEnd: bigint;
  finalized: boolean;
  minimumBid: `0x${string}`;
  highestBid: `0x${string}`;
  highestBidder: `0x${string}`;
  revealedBid: bigint;
  revealedWinner: string;
}

export interface AuctionWithId extends Auction {
  id: number;
}