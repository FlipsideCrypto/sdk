#' Get Query From Token
#'
#' Uses Flipside ShroomDK to access a Query Token. Query tokens are cached up to `ttl` minutes
#' for each `query`. This function is for pagination and multiple requests
#' while . Note: To reduce payload it returns
#' a list of outputs (separating column names from rows).
#'
#' @param query_token token from `create_query_token()`
#' @param api_key Flipside Crypto ShroomDK API Key
#' @param page_number Query tokens are cached and 100k rows max. Get up to 1M rows by going through pages.
#' @param page_size Default 100,000. Paginate via page_number.
#' @return returns a request of length 8: `results`, `columnLabels`,
#'  `columnTypes`, `startedAt`, `endedAt`, `pageNumber`, `pageSize`, `status`
#' @export
#'
#' @examples
#' \dontrun{
#' query = create_query_token("SELECT * FROM ETHEREUM.CORE.FACT_TRANSACTIONS LIMIT 10000", api_key)
#' get_query_from_token(query$token, api_key, 1, 10000)
#' }
get_query_from_token <- function(query_token, api_key, page_number = 1, page_size = 100000){

  headers = c(
    "Accept" = 'application/json',
    "Content-Type" = 'application/json',
    "x-api-key" = api_key
  )

  url = paste0(
    "https://node-api.flipsidecrypto.com/queries/",
    query_token,"?",
    "pageNumber=", page_number, "&",
    "pageSize=", format(page_size, scientific = FALSE) # just in case user's R settings force 100,000 -> 1e+05 which breaks API.
  )

  req <- httr::GET(
    url = url,
    config = httr::add_headers(.headers = headers)
  )

  request <- content(req, as = 'parsed')

  # if running give it a few seconds
  # this won't count as a re-request as long as cache intact
  if(request$status == 'running'){
    Sys.sleep(5)
    warning("Query is still running! Trying again shortly")
    return(
      get_query_from_token(query_token, api_key, page_number, page_size)
    )

    } else if(request$status == 'finished') {
        return(request)

    } else {
      return(
        paste0("Request not running nor finished, see status code: ",
               request$status))
    }

  return(request)

}
