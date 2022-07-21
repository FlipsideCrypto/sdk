import { Flipside, Query } from "@flipsidecrypto/sdk";

const SHROOMDK_API_KEY = process.env.REACT_APP_SHROOMDK_API_KEY;
const API_BASE_URL = process.env.REACT_APP_SHROOMDK_API_BASE_URL;

export async function getEnsAddr(
  domain: string
): Promise<[string | null, Error | null]> {
  if (!SHROOMDK_API_KEY) throw new Error("no api key");

  // Create an instance of the SDK
  const flipside = new Flipside(SHROOMDK_API_KEY, API_BASE_URL);

  // Create the query object
  // sql: use string interpolation to build the query
  // ttlMinutes: cache the query for this many minutes
  const query: Query = {
    sql: `
      SELECT
        origin_from_address
      FROM ethereum.core.fact_event_logs
      WHERE
        contract_address = lower('0x283af0b28c62c092c9727f1ee09c02ca627eb7f5')
        AND event_inputs:name = lower('${domain}')
        AND event_name = 'NameRegistered'
        AND block_timestamp >= GETDATE() - interval'2 year'
    `,
    ttlMinutes: 60 * 24,
  };

  const result = await flipside.query.run(query);
  if (result.error) {
    return [null, result.error];
  }

  let records = result.records;
  if (!records || records?.length === 0) {
    return [null, null];
  }

  let record = records[0];
  return [record["origin_from_address"] + "", null];
}
