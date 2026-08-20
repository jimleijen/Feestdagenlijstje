export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Wishlist {
  id: string;
  title: string;
  occasion?: string | null;
  shareCode: string;
  createdAt: string;
  items?: WishlistItem[];
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  priority: number;
  reservedByName?: string | null;
  reservedAt?: string | null;
}

export interface PriceComparison {
  cheapest: { shopName: string; price: number; currency: string; productUrl: string } | null;
  all: { shopName: string; price: number; currency: string; productUrl: string; inStock: boolean }[];
  fetchedAt: string;
  noProvidersConfigured: boolean;
}

export type DrawKind = "LOOTJES" | "SECRET_SANTA";
export type DrawStatus = "OPEN" | "DRAWN" | "CLOSED";

export interface NameDraw {
  id: string;
  title: string;
  kind: DrawKind;
  status: DrawStatus;
  budget?: string | null;
  eventDate?: string | null;
  joinCode: string;
  drawnAt?: string | null;
  participants: DrawParticipant[];
}

export interface DrawParticipant {
  id: string;
  name: string;
  email: string;
  excludeIds: string;
}

export interface Hint {
  id: string;
  text: string;
  createdAt: string;
}

export interface GameRule {
  face: number;
  text: string;
}

export interface GameSession {
  id: string;
  title: string;
  joinCode: string;
  rules: GameRule[];
}
