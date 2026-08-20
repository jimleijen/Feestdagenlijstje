export interface ProviderQuote {
  shopName: string;
  price: number;
  currency: string;
  productUrl: string;
  inStock: boolean;
}

export interface PriceProvider {
  shopName: string;
  /** False when its API key is missing from .env — the aggregator silently skips it. */
  isConfigured(): boolean;
  /**
   * Look up ONE specific product (by the URL/EAN/title the wishlist owner supplied),
   * not a generic search — this is what keeps the shown price tied to the exact item.
   */
  lookup(query: ProductQuery): Promise<ProviderQuote | null>;
}

export interface ProductQuery {
  title: string;
  /** EAN/GTIN is far more reliable than a title match when the provider supports it. */
  ean?: string;
  /** If the wishlist owner pasted a link from this exact shop, prefer resolving that URL directly. */
  sourceUrl?: string;
}
