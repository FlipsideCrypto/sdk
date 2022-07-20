# shroomDK 

ShroomDK is an R package for simplifying access to the Flipside Crypto ShroomDK REST API. More details available at [sdk.flipsidecrypto.xyz/shroomdk](https://sdk.flipsidecrypto.xyz/shroomdk)

## How to get your own ShroomDK API Key

ShroomDK API Keys are NFTs on the Ethereum blockchain. They are free to mint (not counting Ethereum gas) and new mints are available each day. Alternatively you can buy the NFT on any NFT Marketplace where listed (e.g., OpenSea). 

## How to Install 

```
library(devtools) # install if you haven't already
devtools::install_github(repo = 'FlipsideCrypto/sdk', subdir = 'r/shroomDK')
library(shroomDK)
```

## 3 Main Functions

### create_query_token()

Documentation can be viewed within RStudio with ```?create_query_token``` for new packages you may need to restart R to get to the documentation. It is summarized here: 

Description
Uses Flipside ShroomDK to create a Query Token to access Flipside Crypto data. The query token is cached up to ttl minutes allowing for pagination and multiple requests before expending more daily request uses.

Usage
create_query_token(query, api_key, ttl = 10, cache = TRUE)
Arguments
query	
Flipside Crypto Snowflake SQL compatible query as a string.

api_key	
Flipside Crypto ShroomDK API Key

ttl	
time (in minutes) to keep query in cache.

cache	
Use cached results; set as FALSE to re-execute.

Value
list of'token' and 'cached' use 'token' in 'get_query_from_token()'

Examples
Run examples

## Not run: 
create_query_token(
query = "SELECT * FROM ethereum.core.fact_transactions LIMIT 1",
api_key = readLines("api_key.txt"),
ttl = 15,
cache = TRUE)

### get_query_from_token()

### clean_query()

