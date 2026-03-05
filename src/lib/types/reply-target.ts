export type ReplyTarget =
  | { type: "post"; id: number }
  | { type: "comment"; id: number }
  | null;
