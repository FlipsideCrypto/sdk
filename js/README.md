# Flipside Crypto Velocity JS SDK

gm frens, you've found yourself at the Flipside Crypto Velocity javascript/typescript sdk.
<br>
<br>
This SDK let's you access all the query awesomeness of [FlipsideCrypto's Velocity product](https://app.flipsidecrypto.com) programmatically. Any data found in [Velocity](https://app.flipsidecrypto.com) you can query with this SDK.
<br>
<br>
Prepare for a world of queryable fun 🥳
<br>
<br>

## 🗝 Want early access? Grab an API Key

Our [JS/Typescript SDK](./js/) is currently in Alpha. We're accepting a limited number of users.
<br>
<br>
Fill out this [form](https://forms.gle/Hii64SznA9B9dhLJ8). Tell us about something awesome you're going to build.
<br>

## 💾 Install the SDK

```bash
yarn add @flipsidecrypto/core
```

or if using npm

```bash
npm install @flipsidecrypto/core
```

## 🦾 Getting Started

```typescript
import { Flipside, Query, QueryResultSet } from "@flipsidecrypto/velocity";

# Initiate the API with your API key
const flipside = new Flipside(
  "YOUR_API_KEY",
  "https://node-api.flipsidecrypto.com"
);

# Parameter can be passed into SQL statements via simple string interpolation
const myAddress = "0x....";

# Create a query object for the query.run function to execute
const query: Query = {
  sql: `select nft_address, mint_price_eth, mint_price_usd from flipside_prod_db.ethereum_core.ez_nft_mints where nft_to_address = LOWER('${myAddress}')`,
  ttlMinutes: 10,
};

# Send query to Flipside's query engine and await the results
const result: QueryResultSet = await flipside.query.run(query);

# Iterate over the results
result.records.map((record) => {
  const nftAddress = record.nft_address
  const mintPriceEth = record.mint_price_eth
  const mintPriceUSD = = record.mint_price_usd
  console.log(`address ${nftAddress} minted at a price of ${mintPrice} ETH or $${mintPriceUSD} USD`);
});
```
