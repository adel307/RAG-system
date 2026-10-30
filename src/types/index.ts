export interface ItemPayload {
  title: string;
  category: string;
  author: string;
  [key: string]: unknown;
}

export interface PdfPayload {
  id: string;
  vector: number[];
  payload: {
    filename: string;
    chunkIndex: number;
    text: string;
  };
}

export interface Item {
  id: number;
  text: string;
  payload: ItemPayload;
}

export interface Point {
  id: number|string;
  vector: number[] | Record<string, number[]>;
  payload?: Record<string, any>;
}