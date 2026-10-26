export interface ItemPayload {
  title: string;
  category: string;
  author: string;
  [key: string]: unknown;
}

export interface Item {
  id: number;
  text: string;
  payload: ItemPayload;
}

export interface Point {
  id: number;
  vector: number[];
  payload: ItemPayload;
}