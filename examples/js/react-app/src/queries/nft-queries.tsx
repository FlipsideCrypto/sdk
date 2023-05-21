import { Flipside, QueryResultSet, Query } from "@flipsidecrypto/sdk";

const FLIPSIDE_API_KEY = process.env.REACT_APP_FLIPSIDE_API_KEY;
const API_BASE_URL = process.env.REACT_APP_FLIPSIDE_API_BASE_URL;

export async function getNFTMints(
  address: string,
  pageSize: number = 100000,
  pageNumber: number = 1
): Promise<[QueryResultSet | null, Error | null]> {
  if (!FLIPSIDE_API_KEY) throw new Error("no api key");

  // Create an instance of the SDK
  const flipside = new Flipside(FLIPSIDE_API_KEY, API_BASE_URL);

  // Create the query object
  // - sql: use string interpolation to build the query
  // - ttlMinutes: cache the query for this many minutes
  const query: Query = {
    sql: `
        SELECT 
          nft_address, 
          mint_price_eth, 
          mint_price_usd 
        FROM ethereum.core.ez_nft_mints 
        WHERE 
          nft_to_address = LOWER('${address}')`,
    maxAgeMinutes: 120,
    pageSize,
    pageNumber,
  };

  const result = await flipside.query.run(query);
  if (result.error) {
    return [null, result.error];
  }

  return [result, null];
}
