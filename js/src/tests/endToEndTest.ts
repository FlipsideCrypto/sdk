import { ApiError, Flipside } from "../flipside";
import { Query, QueryResultSet } from "../types";

// @ts-ignore
const API_KEY = process.env.FLIPSIDE_API_KEY;
if (!API_KEY || API_KEY === "" || API_KEY.length === 0) {
  throw new Error("No API Key Provided");
}

const runIt = async (): Promise<void> => {
  const flipside = new Flipside(API_KEY, "https://api-v2.flipsidecrypto.xyz");

  await runWithSuccess(flipside);
  await runWithError(flipside);
  await pageThruResults(flipside);
  await getQueryRunSuccess(flipside);
  await getQueryRunError(flipside);
  await cancelQueryRun(flipside);
};

async function runWithSuccess(flipside: Flipside) {
  // Create a query object for the `query.run` function to execute
  const query: Query = {
    sql: "select nft_address, mint_price_eth, mint_price_usd from ethereum.core.ez_nft_mints limit 100",
    ttlMinutes: 10,
    pageSize: 5,
    pageNumber: 1,
    maxAgeMinutes: 10,
  };

  const result: QueryResultSet = await flipside.query.run(query);

  const records = result?.records?.length ? result?.records?.length : 0;
  if (records > 0) {
    console.log("✅ runWithSuccess");
    return;
  }
  throw new Error("Failed runWithSuccess: no records returned");
}

async function runWithError(flipside: Flipside) {
  // Create a query object for the `query.run` function to execute
  const query: Query = {
    sql: "select nft_address mint_price_eth mint_price_usd from ethereum.core.ez_nft_mints limit 100",
    ttlMinutes: 10,
    pageSize: 5,
    pageNumber: 1,
    maxAgeMinutes: 10,
  };

  const result: QueryResultSet = await flipside.query.run(query);
  if (!result.error) {
    throw new Error("❌ runWithSuccess");
  }
  console.log("✅ runWithError");
}

async function pageThruResults(flipside: Flipside) {
  // Create a query object for the `query.run` function to execute
  const query: Query = {
    sql: "select nft_address, mint_price_eth, mint_price_usd from ethereum.core.ez_nft_mints limit 100",
    ttlMinutes: 10,
    pageSize: 25,
    pageNumber: 1,
    maxAgeMinutes: 10,
  };

  const result: QueryResultSet = await flipside.query.run(query);
  if (result.error || !result.queryId || !result.page) {
    throw new Error(`❌ pageThruResults: ${result.error}`);
  }
  let allRecords: any[] = [];
  let pageNumber = 1;
  let pageSize = 25;
  while (pageNumber <= result.page.totalPages) {
    const results = await flipside.query.getQueryResults({ queryRunId: result.queryId, pageSize, pageNumber });
    if (results.records) {
      allRecords = [...allRecords, ...results.records];
    }
    if (results.page?.currentPageNumber !== pageNumber) {
      throw new Error("❌ pageThruResults: currentPageNumber does not match requested pageNumber");
    }
    pageNumber++;
  }

  if (allRecords.length !== 100 || allRecords.length !== result.runStats?.recordCount) {
    throw new Error("❌ pageThruResults");
  }

  console.log("✅ pageThruResults");
}

async function getQueryRunSuccess(flipside: Flipside) {
  // Create a query object for the `query.run` function to execute
  const query: Query = {
    sql: "select nft_address, mint_price_eth, mint_price_usd from ethereum.core.ez_nft_mints limit 100",
    ttlMinutes: 10,
    pageSize: 5,
    pageNumber: 1,
    maxAgeMinutes: 10,
  };

  const result: QueryResultSet = await flipside.query.run(query);
  const queryId = result.queryId || "";
  const queryRun = await flipside.query.getQueryRun({ queryRunId: queryId });
  if (queryRun.errorName !== null) {
    throw new Error("❌ getQueryRunSuccess");
  }
  console.log("✅ getQueryRunSuccess");
}

async function getQueryRunError(flipside: Flipside) {
  try {
    const queryRun = await flipside.query.getQueryRun({ queryRunId: "randomid" });
  } catch (e) {
    if (e instanceof ApiError) {
      console.log("✅ getQueryRunError");
      return;
    }
  }
  throw new Error("❌ getQueryRunError");
}

async function cancelQueryRun(flipside: Flipside) {
  // Create a query object for the `query.run` function to execute
  const query: Query = {
    sql: "select nft_address, mint_price_eth, mint_price_usd from ethereum.core.ez_nft_mints limit 100",
    ttlMinutes: 10,
    pageSize: 5,
    pageNumber: 1,
    maxAgeMinutes: 10,
  };

  const queryRun = await flipside.query.createQueryRun(query);
  try {
    await flipside.query.cancelQueryRun({ queryRunId: queryRun.id });
  } catch (e) {
    console.log("❌ cancelQueryRun");
    throw e;
  }

  console.log("✅ cancelQueryRun");
}

runIt();
