export interface Trader {
  id: number;
  username: string;
  walletAddress: string;
  topToken: string | null;
  earnings24h: number | null;
  earnings7d: number | null;
  volume24h: number | null;
  volume7d: number | null;
  earnings?: number; // Used in the UI for displaying the current timeframe's earnings
  volume?: number; // Used in the UI for displaying the current timeframe's volume
}

export type Timeframe = '24h' | '7d';
