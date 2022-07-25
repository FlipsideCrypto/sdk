# Python SDK for ShroomDK, by Flipside Crypto

Programmatic access to the most comprehensive blockchain data in Web3, for free. More details on ShroomDK [here](https://sdk.flipsidecrypto.xyz).🥳

[![Python Continuous Testing](https://github.com/FlipsideCrypto/sdk/actions/workflows/ci_python.yml/badge.svg)](https://github.com/FlipsideCrypto/sdk/actions/workflows/ci_python.yml)
<br>
<br>
GM frens, you've found yourself at the Python SDK for ShroomDK by Flipside Crypto.
<br>
<br>

## 📖 Official Docs
[https://docs.flipsidecrypto.com/shroomdk-sdk/getting-started](https://docs.flipsidecrypto.com/shroomdk-sdk/getting-started)

## 💾 Install the SDK
<em>If you don't already have an API Key mint one [here](https://sdk.flipsidecrypto.xyz).</em>
```bash
pip install shroomdk
```

## 🦾 Getting Started
```python
from shroomdk import ShroomDK

# Initialize `ShroomDK` with your API Key
sdk = ShroomDK(
    "<YOUR_API_KEY>",
    "https://api.flipsidecrypto.com"
)

# Parameters can be passed into SQL statements 
# via native string interpolation
my_address = "0x...."
sql = f"""
    SELECT 
        nft_address, 
        mint_price_eth, 
        mint_price_usd 
    FROM ethereum.core.ez_nft_mints 
    WHERE nft_to_address = LOWER('{my_address}')
"""

# Run the query against Flipside's query engine 
# and await the results
query_result_set = sdk.query(sql)

# Iterate over the results
for record in query_result_set.records:
    nft_address = record['nft_address']
    mint_price_eth = record['mint_price_eth']
    mint_price_usd = record['mint_price_usd']
    print(f"${nft_address} minted for {mint_price_eth}ETH (${mint_price_usd})")
```

## The Data
Flipside Crypto's analytics team has curated dozens of blockchain data sets with more being added each week. All tables available to query in Flipside's (Visual Query Editor/Dashboard Builder)[https://flipside.new] product can be queried programmatically with ShroomDK. 

![blockchains](https://sdk.flipsidecrypto.xyz/media/shroomdk/blockchains.png)

## The Details

### Executing a Query
When executing a query the following parameters can be passed in / overriden to the `query` method on the `ShroomDK` object:

| Argument               | Description                                                                        | Default Value   |
|------------------------|------------------------------------------------------------------------------------|-----------------|
| sql                    | The sql string to execute                                                          | None (required) |
| ttl_minutes            | The number of minutes to cache the query results                                   | 60              |
| cached                 | An override on the query result cache. A value of false will re-execute the query. | True            |
| timeout_minutes        | The number of minutes until your query run times out                               | 20              |
| retry_interval_seconds | The number of seconds to wait between polls to the server                           | 1               |
| page_size              | The number of rows/records to return                                               | 100,000         |
| page_number            | The page number to return (starts at 1)                                            | 1               |

Let's create a query to retrieve all NFTs minted by an address:

```python
my_address = "0x...."
sql = f"""
    SELECT 
        nft_address, 
        mint_price_eth, 
        mint_price_usd 
    FROM ethereum.core.ez_nft_mints 
    WHERE nft_to_address = LOWER('{my_address}')
    LIMIT 100
"""
```

Now let's execute the query and retrieve the first 5 rows of the result set. Note we will set `page_size` to 5 and `page_number` to 1 to retrieve just the first 5 rows. 

```python
query_result_set = sdk.query(
    sql,
    ttl_minutes=60,
    cached=True,
    timeout_minutes=20,
    retry_interval_seconds=1,
    page_size=5,
    page_number=1
)
```

#### Caching
The results of this query will be cached for 60 minutes, given the `ttl_minutes` parameter is set to 60. 

#### Pagination 
If we wanted to retrieve the next 5 rows of the query result set simply increment the `page_number` to 2 and run:
```python
query_result_set = sdk.query(
    sql,
    ttl_minutes=60,
    cached=True,
    timeout_minutes=20,
    retry_interval_seconds=1,
    page_size=5,
    page_number=2
)
```
<em>Note! This will not use up your daily query quota since the query results are cached (in accordance with the TTL) and we're not re-running the SQL just retrieving a slice of the overall result set.</em>

All query runs can return a maximum of 1,000,000 rows and a maximum of 100k records can returned in a single page. 

Now let's examine the query result object that's returned.

### The `QueryResultSet` Object
After executing a query the results are stored in a `QueryResultSet` object:

```python
class QueryResultSet(BaseModel):
    query_id: Union[str, None] = Field(None, description="The server id of the query")
    status: str = Field(False, description="The status of the query (`PENDING`, `FINISHED`, `ERROR`)")
    columns: Union[List[str], None] = Field(None, description="The names of the columns in the result set")
    column_types: Union[List[str], None] = Field(None, description="The type of the columns in the result set")
    rows: Union[List[Any], None] = Field(None, description="The results of the query")
    run_stats: Union[QueryRunStats, None] = Field(
        None,
        description="Summary stats on the query run (i.e. the number of rows returned, the elapsed time, etc)",
    )
    records: Union[List[Any], None] = Field(None, description="The results of the query transformed as an array of objects")
    error: Any
```
Let's iterate over the results from our query above.
<br>
<br>
Our query selected `nft_address`, `mint_price_eth`, and `mint_price_usd`. We can access the returned data via the `records` parameter. The column names in our query are assigned as keys in each record object.

```python
for record in query_result_set.records:
    nft_address = record['nft_address']
    mint_price_eth = record['mint_price_eth']
    mint_price_usd = record['mint_price_usd']
    print(f"${nft_address} minted for {mint_price_eth}E ({mint_price_usd})USD")
```

Other useful information can be accessed on the query result set object such as run stats, i.e. how long the query took to execute:

```python
started_at = query_result_set.run_stats.started_at
ended_at = query_result_set.run_stats.ended_at
elapsed_seconds = query_result_set.run_stats.elapsed_seconds
record_count = query_result_set.run_stats.record_count

print(f"This query took ${elapsed_seconds} seconds to run and returned {record_count} records from the database.")
```

### Rate Limits

Every API key is subject to a rate limit over a moving 5 minute window, as well as an aggregate daily limit.
<br>
<br>
If the limit is reached in a 5 minute period, the sdk will exponentially backoff and retry the query up to the `timeoutMinutes` parameter set on the `Query` object.

