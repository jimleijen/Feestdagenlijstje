import { PriceProvider, ProductQuery, ProviderQuote } from "./types";

/**
 * Amazon Product Advertising API (PA-API 5.0) adapter. Requires an approved Associates
 * account plus access/secret key and partner tag. Same contract and caveat as the other
 * providers — TODO wire up the real signed PA-API request, never guess a price.
 */
export class AmazonProvider implements PriceProvider {
  shopName = "Amazon.nl";

  isConfigured(): boolean {
    return Boolean(
      process.env.AMAZON_PA_API_ACCESS_KEY &&
        process.env.AMAZON_PA_API_SECRET_KEY &&
        process.env.AMAZON_PA_API_PARTNER_TAG
    );
  }

  async lookup(_query: ProductQuery): Promise<ProviderQuote | null> {
    if (!this.isConfigured()) return null;
    // TODO: call PA-API 5.0 GetItems/SearchItems here and map the response to ProviderQuote.
    return null;
  }
}
