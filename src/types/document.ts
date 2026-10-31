export interface DocumentMeta {
  id: string;
  title: string;
  icon?: string;
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DocumentData extends DocumentMeta {
  content: string; // HTML string or serialized content
}

export type SaveStatus = "saved" | "saving" | "unsaved" | "offline-cached" | "error";
export type NetworkStatus = "online" | "offline";
