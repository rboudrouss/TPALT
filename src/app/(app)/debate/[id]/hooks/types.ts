export interface Message {
  id: string;
  sender: "user" | "opponent" | "system";
  content: string;
  timestamp: Date;
}
