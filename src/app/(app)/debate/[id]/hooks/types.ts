export interface Message {
  id: string;
  sender: "user" | "opponent" | "system";
  content: string;
  timestamp: Date;
}

export const ROUND_TIME = 90;
