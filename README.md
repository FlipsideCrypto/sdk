# Flipside SDKs

The Flipside SDK repo

## Javascript SDK

### Setup

```
yarn build

```

### Example Usage

```javascript
import type { QueryResult, QueryRun } from "flipside";
import { Flipside } from "flipside";

const flipside = new Flipside(
  "YOUR_API_KEY",
  "https://node-api.flipsidecrypto.com"
);

const queryRun: QueryRun = {
  sql: `select * from flipside_prod_db.ethereum_core.ez_nft_mints where nft_to_address = LOWER('0x4a9318f375937b56045e5a548e7e66aea61dd610')`,
  ttlMinutes: 10,
};

const result = await flipside.query.run(queryRun);
```
