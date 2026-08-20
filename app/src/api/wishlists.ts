import { api } from "./client";
import { PriceComparison, Wishlist, WishlistItem } from "../types";

export const wishlistsApi = {
  list: () => api.get<Wishlist[]>("/wishlists").then((r) => r.data),
  create: (data: { title: string; occasion?: string }) => api.post<Wishlist>("/wishlists", data).then((r) => r.data),
  get: (id: string) => api.get<Wishlist>(`/wishlists/${id}`).then((r) => r.data),
  remove: (id: string) => api.delete(`/wishlists/${id}`),

  addItem: (wishlistId: string, data: Partial<WishlistItem> & { title: string }) =>
    api.post<WishlistItem>(`/wishlists/${wishlistId}/items`, data).then((r) => r.data),
  removeItem: (itemId: string) => api.delete(`/wishlists/items/${itemId}`),

  prices: (itemId: string, refresh = false) =>
    api.get<PriceComparison>(`/wishlists/items/${itemId}/prices${refresh ? "?refresh=true" : ""}`).then((r) => r.data),

  // Shared (buyer-facing) endpoints, keyed by the wishlist's public share code.
  getShared: (shareCode: string) => api.get<Wishlist>(`/wishlists/shared/${shareCode}`).then((r) => r.data),
  reserve: (shareCode: string, itemId: string, buyerName: string) =>
    api.post<WishlistItem>(`/wishlists/shared/${shareCode}/items/${itemId}/reserve`, { buyerName }).then((r) => r.data),
  unreserve: (shareCode: string, itemId: string) =>
    api.post<WishlistItem>(`/wishlists/shared/${shareCode}/items/${itemId}/unreserve`).then((r) => r.data),
};
