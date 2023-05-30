# shroomDK 

ShroomDK is an R package for simplifying access to the Flipside Crypto Compass RPC API. More details available at [docs.flipsidecrypto.com/flipside-api/rest-api](https://docs.flipsidecrypto.com/flipside-api/rest-api). 

## How to get your own ShroomDK API Key

ShroomDK API Keys were originally NFTs on the Ethereum blockchain. They are now standard API keys available in your [flipsidecrypto user profile](https://flipsidecrypto.xyz/account/api-keys). Every user gets 5,000 query seconds as a free Community tier. Additional query seconds can be purchased via the Builder tier. Enterprises seeking [Snowflake Data Shares](https://docs.flipsidecrypto.com/data-shares/snowflake-data-shares) or scaled pricing can purchase access directly via the [Snowflake Marketplace](https://app.snowflake.com/marketplace/listings/Flipside%20Crypto) or reach out via email to `data-shares@flipsidecrypto.com`.

The [Data Studio](https://flipsidecrypto.xyz/) remains free for analysts analyzing data ad-hoc, creating dashboards, and testing queries. It is recommended you test queries in the studio prior to using them to pull data via the API.

## Install from CRAN

Current Version: 0.2.1

```
install.packages("shroomDK")
library(shroomDK)
```

## How to Install Latest from Github 

```
library(devtools) # install if you haven't already
devtools::install_github(repo = 'FlipsideCrypto/sdk', subdir = 'r/shroomDK')
library(shroomDK)
```

## 1 Main Wrapper Function

Intelligently grab up to 1 Gigabyte of data from a SQL query including automatic pagination and cleaning.

### auto_paginate_query()

Documentation can be viewed within RStudio with ```?auto_paginate_query``` for new packages you may need to restart R to get to the documentation. It is summarized here: 

| Parameter       | Description                                                                                                                                                                     |
|-----------------|-------------------------|
| query           | The SQL query to pass to ShroomDK|
| api_key         | Your ShroomDK API key|
| page_size       | Default 25,000. May return error if page_size is too large (specifically if data exceeds 30MB or entire query >1GB). Ignored if results fit on 1 page of < 15 Mb of data|
| page_count      | How many pages, of page_size rows each, to read. Default NULL calculates the ceiling (# rows in results / page_size). Ignored if results fit on 1 page of < 15 Mb of data|
| data_source     | Where data is sourced, including specific computation warehouse. Default `"snowflake-default"`. Non-default data sources may require registration of api_key to allowlist|
| data_provider   | Who provides data, Default `"flipside"`. Non-default data providers may require registration of api_key to allowlist|       |
| api_url         | Default to `https://api-v2.flipsidecrypto.xyz/json-rpc` but upgradeable for user|

Returns a data frame of up to `page_size * page_count` rows, see `?clean_query` for more details on column classes.

## 5 Component Function

### create_query_token()

Uses Flipside ShroomDK to create a Query Token to access Flipside Crypto
data. The query token is kept `ttl` hours and available for no-additional cost reads up to `mam` minutes (i.e., cached to the same exact result).
allowing for pagination and multiple requests before expending more daily request uses.

Documentation can be viewed within RStudio with ```?create_query_token``` for new packages you may need to restart R to get to the documentation. It is summarized here: 

| Parameter       | Description|
|-----------------|-------------------------|
| query           | Flipside Crypto Snowflake SQL compatible query as a string|
| api_key         | Flipside Crypto ShroomDK API Key|
| ttl             | Time-to-live (in hours) to keep query results available. Default 1 hour|
| mam             | Max-age-minutes, lifespan of cache. Set to 0 to always re-execute. Default 10 minutes|
| data_source     | Where data is sourced, including specific computation warehouse. Default `"snowflake-default"`. Non-default data sources may require registration of api_key to allowlist|
| data_provider   | Who provides data, Default `"flipside"`. Non-default data providers may require registration of api_key to allowlist|
| api_url         | Default to https://api-v2.flipsidecrypto.xyz/json-rpc but upgradeable for user|

Returns a list of `token` and `cached`. Use `token` in `get_query_from_token()`|

```
# example
api_key = readLines("api_key.txt") # always gitignore your API keys!
create_query_token(
query = "SELECT * FROM ethereum.core.fact_transactions LIMIT 1",
api_key = api_key,
ttl = 1,
mam = 5)
```

### get_query_status()

Access the status of a query run id from `create_query_token()`.

Documentation can be viewed within RStudio with ```?get_query_status``` for new packages you may need to restart R to get to the documentation. It is summarized here: 

| Parameter       | Description|
|-----------------|-------------------------|
| query_run_id    | queryRunId from `create_query_token()`, for token stored as `x`, use `x$result$queryRequest$queryRunId`|
| api_key         | Flipside Crypto ShroomDK API Key|
| api_url         | Default to `https://api-v2.flipsidecrypto.xyz/json-rpc` but upgradeable for user|

Returns request content; for content `x`, use `x$result$queryRun$state` and `x$result$queryRun$errorMessage`. Expect one of `QUERY_STATE_READY`, `QUERY_STATE_RUNNING`, `QUERY_STATE_STREAMING_RESULTS`, `QUERY_STATE_SUCCESS`, `QUERY_STATE_FAILED`, `QUERY_STATE_CANCELED`.


```
api_key = readLines("api_key.txt") # always gitignore your API keys!
query = create_query_token("SELECT * FROM ETHEREUM.CORE.FACT_TRANSACTIONS LIMIT 10000", api_key)
get_query_status(query$result$queryRequest$queryRunId, api_key)
```

### get_query_from_token()

Access results of a Query Token (Run ID). This function is for pagination and multiple requests.
It is best suited for debugging and testing new queries. Consider `auto_paginate_query()` for queries already known to work as expected.

Note: To reduce payload it returns a list of outputs (separating column names from rows). See `clean_query()` for converting result to a data frame.

Documentation can be viewed within RStudio with ```?get_query_from_token``` for new packages you may need to restart R to get to the documentation. It is summarized here: 

| Parameter           | Description|
|---------------------|-------------|
| query_run_id        | queryRunId from `create_query_token()`, for token stored as `x`, use `x$result$queryRequest$queryRunId`|
| api_key             | Flipside Crypto ShroomDK API Key|
| page_number         | Results are cached, max 30MB of data per page|
| page_size           | Default 1000. Paginate via page_number. May return error if page_size causes data to exceed 30MB|
| result_format       | Default to csv. Options: csv and json|
| api_url             | Default to https://api-v2.flipsidecrypto.xyz/json-rpc but upgradeable for user|

Returns a list of jsonrpc, id, and result. Within result are: columnNames, columnTypes, rows, page, sql, format, originalQueryRun, redirectedToQueryRun. Use `clean_query()` to transform this into a data frame. If a query exactly matches another recently run query, the run will be redirected to the results of the earlier query run ID to reduce costs.

```
# example
api_key = readLines("api_key.txt") # always gitignore your API keys!
query <- create_query_token("SELECT * FROM ETHEREUM.CORE.FACT_TRANSACTIONS LIMIT 1000", api_key)
fact_transactions <- get_query_from_token(query$result$queryRequest$queryRunId, api_key, 1, 1000)
```

### cancel_query()

CANCEL a query run id from `create_query_token()`. As the new API uses warehouse-seconds to charge users above the free tier, the ability to cancel is critical for cost management.

Documentation can be viewed within RStudio with ```?cancel_query``` for new packages you may need to restart R to get to the documentation. It is summarized here: 

| Parameter       | Description|
|-----------------|-------------|
| query_run_id    | queryRunId from `create_query_token()`, for token stored as `x`, use `x$result$queryRequest$queryRunId`|
| api_key         | Flipside Crypto ShroomDK API Key|
| api_url         | Default to https://api-v2.flipsidecrypto.xyz/json-rpc but upgradeable for user|

Returns a list of the status_canceled (TRUE or FALSE) and the cancel object (which includes related details)

### clean_query()

Converts query response to data frame while attempting to coerce classes intelligently.

Documentation can be viewed within RStudio with ```?clean_query``` for new packages you may need to restart R to get to the documentation. It is summarized here: 

| Parameter       | Description|
|-----------------|--------------|
| request         | The request output from `get_query_from_token()`|
| try_simplify    | Because requests can return JSON and may not have the same length across values, they may not be data frame compliant (all columns having the same number of rows). A key example would be TX_JSON in EVM FACT_TRANSACTION tables which include 50+ extra details from transaction logs. But other examples like NULLs in TO_ADDRESS can have similar issues. Default TRUE |

Returns a data frame. If `try_simplify` is FALSE OR if `try_simplify` TRUE fails: the data frame is comprised of lists, where each column must be coerced to a desired class (e.g., with `as.numeric()`).

Note: The vast majority (95%+) of queries will return a simple data frame with the classes coerced intelligently (e.g., Block_Number being numeric). But check the warnings and check your column classes, if the class is a list then try_simplify failed (i.e., not all columns have the same number of rows when coerced).

```
#example
api_key = readLines("api_key.txt") # always gitignore your API keys!
query <- create_query_token("SELECT * FROM ETHEREUM.CORE.FACT_TRANSACTIONS LIMIT 1000", api_key)
request <- get_query_from_token(query$result$queryRequest$queryRunId, api_key)
df <- clean_query(request, try_simplify = TRUE)
```
