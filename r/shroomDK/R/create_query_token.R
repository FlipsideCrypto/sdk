#' Create Query Token
#'
#' Uses Flipside ShroomDK to create a Query Token to access Flipside Crypto
#' data. The query token is cached up to ttl minutes
#' allowing for pagination and multiple requests before expending more daily request uses.
#'
#' @param query Flipside Crypto Snowflake SQL compatible query as a string.
#' @param api_key Flipside Crypto ShroomDK API Key
#' @param ttl time (in minutes) to keep query in cache.
#' @param cache Use cached results; set as FALSE to re-execute.
#' @return list of `token` and `cached` use `token` in `get_query_from_token()`
#' @import jsonlite, httr
#' @export
#'
#' @examples
#' \dontrun{
#' create_query_token(
#' query = "SELECT * FROM ethereum.core.fact_transactions LIMIT 1",
#' api_key = readLines("api_key.txt"),
#' ttl = 15,
#' cache = TRUE)
#'}
create_query_token <- function(query, api_key, ttl = 10, cache = TRUE){

  headers = c(
    "Accept" = 'application/json',
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

  # must use auto_unbox to ensure toJSON does not wrap string in an array
  res <- httr::POST(
    "https://node-api.flipsidecrypto.com/queries",
    config = httr::add_headers(.headers = headers),
    body = jsonlite::toJSON(
      list("sql" = query,
           "ttlMinutes" = ttl,
           cache = cache),
      auto_unbox = TRUE)
  )

  token <- content(res)

  return(token)

}
