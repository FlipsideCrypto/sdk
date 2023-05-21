# Flipside Crypto JS SDK

Programmatic access to the most comprehensive blockchain data in Web3 🥳.
<br>
<br>

![tests](https://github.com/flipsidecrypto/sdk/actions/workflows/ci_js.yml/badge.svg)
<br>
<br>
GM frens, you've found yourself at the Flipside Crypto JS/typescript sdk.
<br>
<br>

## 💾 Install the SDK

```bash
yarn add @flipsidecrypto/sdk
```

or if using npm

```bash
npm install @flipsidecrypto/sdk
```

## 🦾 Getting Started

```typescript
import { Flipside, Query, QueryResultSet } from "@flipsidecrypto/sdk";

// Initialize `Flipside` with your API key
const flipside = new Flipside(
  "<YOUR_API_KEY>",
  "https://api-v2.flipsidecrypto.xyz"
);

// Parameters can be passed into SQL statements via simple & native string interpolation
const myAddress = "0x....";

// Create a query object for the `query.run` function to execute
const query: Query = {
  sql: `select nft_address, mint_price_eth, mint_price_usd from flipside_prod_db.ethereum_core.ez_nft_mints where nft_to_address = LOWER('${myAddress}')`,
  maxAgeMinutes: 30,
};

// Send the `Query` to Flipside's query engine and await the results
const result: QueryResultSet = await flipside.query.run(query);

// Iterate over the results
result.records.map((record) => {
  const nftAddress = record.nft_address
  const mintPriceEth = record.mint_price_eth
  const mintPriceUSD = = record.mint_price_usd
  console.log(`address ${nftAddress} minted at a price of ${mintPrice} ETH or $${mintPriceUSD} USD`);
});
```

## The Details

### The `Query` Object

The `Query` object contains both the sql and configuration you can send to the query engine for execution.

```typescript
type Query = {
  // SQL query to execute
  sql: string;

  // The number of minutes you are willing to accept cached
  // result up to. If set to 30, if cached results exist within
  // the last 30 minutes the api will return them.
  maxAgeMinutes?: number;

  // An override on the query result cahce.
  // A value of false will re-execute the query and override
  // maxAgeMinutes
  cached?: boolean;

  // The number of minutes until your query run times out
  timeoutMinutes?: number;

  // The number of records to return, defaults to 100000
  pageSize?: number;

  // The page number to return, defaults to 1
  pageNumber?: number;

  // The owner of the data source (defaults to 'flipside')
  dataProvider?: string;

  // The data source to execute the query against (defaults to 'snowflake-default')
  dataSource?: string;
};
```

Let's create a query to retrieve all NFTs minted by an address:

```typescript
const yourAddress = "<your_ethereum_address>";

const query: Query = {
  sql: `select nft_address, mint_price_eth, mint_price_usd from flipside_prod_db.ethereum_core.ez_nft_mints where nft_to_address = LOWER('${myAddress}')`,
  maxAgeMinutes: 5,
  cached: true,
  timeoutMinutes: 15,
  pageNumber: 1,
  pageSize: 10,
};
```

Now let's execute the query and retrieve the results.

```typescript
const result: QueryResultSet = await flipside.query.run(query);
```

The results of this query will be cached for 60 minutes, given the `ttlMinutes` parameter.

### The `QueryResultSet` Object

After executing a query the results are stored in a `QueryResultSet` object.

```typescript
interface QueryResultSet {
  // The server id of the query
  queryId: string | null;

  // The status of the query (`PENDING`, `FINISHED`, `ERROR`)
  status: QueryStatus | null;

  // The names of the columns in the result set
  columns: string[] | null;

  // The type of the columns in the result set
  columnTypes: string[] | null;

  // The results of the query
  rows: any[] | null;

  // Summary stats on the query run (i.e. the number of rows returned, the elapsed time, etc)
  runStats: QueryRunStats | null;

  // The results of the query transformed as an array of objects
  records: QueryResultRecord[] | null;

  // The page of results
  page: PageStats | null;

  // If the query failed, this will contain the error
  error:
    | ApiError
    | QueryRunRateLimitError
    | QueryRunTimeoutError
    | QueryRunExecutionError
    | ServerError
    | UserError
    | UnexpectedSDKError
    | null;
}
```

Let's iterate over the results from our query above.
<br>
<br>
Our query selected `nft_address`, `mint_price_eth`, and `mint_price_usd`. We can access the returned data via the `records` parameter. The column names in our query are assigned as keys in each record object.

```typescript
result.records.map((record) => {
  const nftAddress = record.nft_address;
  const mintPriceEth = record.mint_price_eth;
  const mintPriceUSD = record.mint_price_usd;
  console.log(
    `address ${nftAddress} minted at a price of ${mintPriceEth} ETH or $${mintPriceUSD} USD`
  );
});
```

### Pagination
To page over the results use the `getQueryResults` method.

```typescript
// what page are we starting on?
let currentPageNumber = 1

// How many records do we want to return in the page?
let pageSize = 1000

// set total pages to 1 higher than the `currentPageNumber` until
// we receive the total pages from `getQueryResults` given the 
// provided `pageSize` (totalPages is dynamically determined by the API 
// based on the `pageSize` you provide)
let totalPages = 2

// we'll store all the page results in `allRows`
let allRows = []

while (currentPageNumber <= totalPages) {
  results = await flipside.query.getQueryResults({
    queryRunId: result.queryId,
    pageNumber: currentPageNumber,
    pageSize: pageSize
  })
  totalPages = results.page.totalPages
  allRows = [...allRows, ...results.records]
  currentPageNumber += 1
}

```

### Sort the Results
Let's fetch the results sorted in descending order by `mint_price_usd`.

```typescript
results = await flipside.query.getQueryResults({
  queryRunId: result.queryId,
  pageNumber: 1,
  pageSize: 1000,
  sortBy: [
    {
      column: 'mint_price_usd',
      direction: 'desc'
    }
  ]
})
```

Valid directions include `desc` and `asc`. You may also sortBy multiple columns. The order you provide the sortBy objects determine which sortBy object takes precedence.

The following example will first sort results in descending order by `mint_price_usd` and then in ascending order by `nft_address`.

```typescript
results = await flipside.query.getQueryResults({
  queryRunId: result.queryId,
  pageNumber: 1,
  pageSize: 1000,
  sortBy: [
    {
      column: 'mint_price_usd',
      direction: 'desc'
    },
    {
      column: 'nft_address',
      direction: 'asc'
    }
  ]
})
```

For reference here is the `SortBy` type:

```typescript
interface SortBy {
  column: string;
  direction: "desc" | "asc";
}

```

### Filter the results
Now let's filter the results where `mint_price_usd` is greater than $10

```typescript
results = await flipside.query.getQueryResults({
  queryRunId: result.queryId,
  pageNumber: 1,
  pageSize: 1000,
  filters: [
    {
      gt: 10,
      column: 'mint_price_usd'
    }
  ]
})
```

Filters can be applied for: equals, not equals, greater than, greater than or equals to, less than, less than or equals to, like, in, not in. All filters are executed server side over the entire result set.

Here is the Filter type:
```typescript
interface Filter {
  column: string;
  eq?: string | number | null;
  neq?: string | number | null;
  gt?: number | null;
  gte?: number | null;
  lt?: number | null;
  lte?: number | null;
  like?: string | number | null;
  in?: any[] | null;
  notIn?: any[] | null;
}
```

### Understanding MaxAgeMinutes (and caching of results)
The parameter `maxAgeMinutes` can be used to control whether a query will re-execute or return cached results. Let's talk thru an example.

Set `maxAgeMinutes` to 30:

```typescript
const query: Query = {
  sql: `select nft_address, mint_price_eth, mint_price_usd from flipside_prod_db.ethereum_core.ez_nft_mints where nft_to_address = LOWER('${myAddress}')`,
  maxAgeMinutes: 30
};
```

Behind the scenes the Flipside API will hash the sql text and using that hash determine if results exist that were recorded within the last 30 minutes. If no results exist, or the results that exist are more than 30 minutes old the query will re-execute. 

If you would like to force a cache bust and re-execute the query. You have two options, either set `maxAgeMinutes` to 0 or pass in `cache=false`. Setting `cache` to false effectively sets `maxAgeMinutes` to 0.

```typescript
const query: Query = {
  sql: `select nft_address, mint_price_eth, mint_price_usd from flipside_prod_db.ethereum_core.ez_nft_mints where nft_to_address = LOWER('${myAddress}')`,
  maxAgeMinutes: 0
};

// or:
const query: Query = {
  sql: `select nft_address, mint_price_eth, mint_price_usd from flipside_prod_db.ethereum_core.ez_nft_mints where nft_to_address = LOWER('${myAddress}')`,
  maxAgeMinutes: 30,
  cache: false
};
```

### Understanding Query Seconds
You can determine how many execution seconds your query took by looking at the `runStats` object on the `QueryResultSet`.

```typescript
const runStats = result.runStats
```

There are a number of stats returned:
```typescript
type QueryRunStats = {
  startedAt: Date;
  endedAt: Date;
  elapsedSeconds: number;
  queryExecStartedAt: Date;
  queryExecEndedAt: Date;
  streamingStartedAt: Date;
  streamingEndedAt: Date;
  queuedSeconds: number;
  streamingSeconds: number;
  queryExecSeconds: number;
  bytes: number; // the number of bytes returned by the query
  recordCount: number;
};
```

Your account is only debited for `queryExecSeconds`. This is the number of computational seconds your query executes against Flipside's data warehouse.

```typescript
const execSeconds = runStats.queryExecSeconds
```

You are only debited when the query is executed. So if you set `maxAgeMinutes` to a value greater than 0, and the query does not re-execute then you will only be charged for the time it executes.

Flipside does NOT charge for the number of bytes/records returned. 

### Client Side Request Requirements

All API Keys correspond to a list of hostnames. Client-side requests that do not originate from the corresponding hostname will fail. You may configure hostnames [here](https://flipsidecrypto.xyz/account/api-keys). 
