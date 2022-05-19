# Flipside Crypto Core JS SDK

gm frens, you've found yourself at the Flipside Crypto core javascript/typescript sdk.
<br>
<br>
This SDK let's you access all the query awesomeness of [FlipsideCrypto's Velocity product](https://app.flipsidecrypto.com) programmatically. Any data found in [Velocity](https://app.flipsidecrypto.com) you can query with this SDK.
<br>
<br>
Prepare for a world of queryable fun 🥳
<br>
<br>

## 🗝 Grab an API Key

This product is currently in Alpha. We're accepting a limited number of users at this time.
<br>
<br>
Fill out this form. Tell us about something awesome you're going. Then we'll get you access.
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
import { Flipside, Query, QueryResultSet } from "flipside";

const flipside = new Flipside(
  "YOUR_API_KEY",
  "https://node-api.flipsidecrypto.com"
);

const myAddress = "0x....";
const query: Query = {
  sql: `select nft_address, mint_price_eth, mint_price_usd from flipside_prod_db.ethereum_core.ez_nft_mints where nft_to_address = LOWER('${myAddress}')`,
  ttlMinutes: 10,
};

const result = await flipside.query.run(query);
```
