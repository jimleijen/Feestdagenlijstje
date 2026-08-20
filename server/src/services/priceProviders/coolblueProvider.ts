import { PriceProvider, ProductQuery, ProviderQuote } from "./types";

/**
 * Coolblue affiliate feed adapter. Same contract and same caveat as BolPartnerProvider:
 * TODO wire up against Coolblue's real affiliate/product feed once you have credentials,
 * and keep returning null on any doubt rather than guessing a price.
 */
export class CoolblueProvider implements PriceProvider {
  shopName = "Coolblue";

  isConfigured(): boolean {
    return Boolean(process.env.COOLBLUE_AFFILIATE_API_KEY);
  }

  async lookup(_query: ProductQuery): Promise<ProviderQuote | null> {
    if (!this.isConfigured()) return null;
    // TODO: call the Coolblue affiliate feed/API here and map the response to ProviderQuote.
    return null;
  }
}
