library(jsonlite)
library(httr)

#' Create Query Token
#'
#' Uses Flipside ShroomDK to create a Query Token to access Flipside Crypto
#' data. The query token is cached up to ttl minutes
#' allowing for pagination and multiple requests before expending more daily request uses.
#'
#' @param query Flipside Crypto Snowflake SQL compatible query as a string.
#' @param api_key Flipside Crypto ShroomDK API Key
#' @param ttl time-to-live (in hours) to keep query results available. Default 1 hour.
#' @param mam max-age-minutes, lifespan of cache. set to 0 to always re-execute. Default 10 minutes.
#' @param api_url default to https://api-v2.flipsidecrypto.xyz/json-rpc but upgradeable for user.
#' @return list of `token` and `cached` use `token` in `get_query_from_token()`
#' @import jsonlite httr
#' @export
#'
#' @examples
#' \dontrun{
#' create_query_token(
#' query = "SELECT * FROM ethereum.core.fact_transactions LIMIT 1",
#' api_key = readLines("api_key.txt"),
#' ttl = 1,
#' mam = 5)
#'}
create_query_token <- function(query, api_key,
                               ttl = 1,
                               mam = 10,
                               api_url = "https://api-v2.flipsidecrypto.xyz/json-rpc"){

  headers = c(
    "Content-Type" = 'application/json',
    "x-api-key" = api_key
  )

  # Small default query to validate connection & api key
  if(is.null(query)){
    query = 'SELECT * FROM ethereum.core.fact_transactions LIMIT 1'
  }

  # warn if no order by
  if( !grepl("ORDER BY", query, ignore.case = TRUE) ){
    warning("No ORDER BY found in query. Unordered queries may return different
            results over time and not be reproducible. They may also be harder to paginate.")
  }

  # this exact structure including pretty is required
  # new RPC API cannot take direct JSON
 request_body <- as.character(
    jsonlite::toJSON(pretty = TRUE,
                     list(
                       "jsonrpc" = "2.0",
                       "method" = "createQueryRun",
                       "params" = list(
                         list(         "resultTTLHours" = ttl,
                                       "maxAgeMinutes" = mam,
                                       "sql" = query,
                                       "tags" = list(
                                         "sdk_package" = "R",
                                         "sdk_version" = "0.2.0",
                                         "sdk_language" = "R"
                                       ),
                                       "dataSource" = "snowflake-default",
                                       "dataProvider" = "flipside"
                         )
                       ),
                       "id" = 1
                     ),
                     auto_unbox = TRUE
    )
  )



  # must use auto_unbox to ensure toJSON does not wrap string in an array
  res <- httr::POST(
    api_url,
    config = httr::add_headers(.headers = headers),
    body = request_body)

  token <- content(res)

  return(token)

}
