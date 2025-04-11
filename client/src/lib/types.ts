export interface Trader {
  id: number;
  username: string;
  walletAddress: string;
  topToken: string | null;
  pnl24h: number | null;
  pnl7d: number | null;
  pnl?: number; // Used in the UI for displaying the current timeframe's PnL
}

export type Timeframe = '24h' | '7d';
