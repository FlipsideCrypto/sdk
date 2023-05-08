library(jsonlite)
library(httr)

#' Get Query ID Status
#'
#' Uses Flipside ShroomDK to access the status of a query run id from `create_query_token()`
#' @param query_run_id queryRunId from `create_query_token()`, for token stored as `x`, use `x$result$queryRequest$queryRunId`
#' @param api_key Flipside Crypto ShroomDK API Key
#' @param api_url default to https://api-v2.flipsidecrypto.xyz/json-rpc but upgradeable for user.
#' @return returns a request object, you can use $status_code to check if it is a successful 200 code.
#' @import jsonlite httr
#' @export
#'
#' @examples
#' \dontrun{
#' query = create_query_token("SELECT * FROM ETHEREUM.CORE.FACT_TRANSACTIONS LIMIT 10000", api_key)
#' get_query_status(query$result$queryRequest$queryRunId, api_key)
#' }
get_query_status <- function(query_run_id, api_key,
                                 api_url = "https://api-v2.flipsidecrypto.xyz/json-rpc"){

  headers = c(
    "Content-Type" = 'application/json',
    "x-api-key" = api_key
  )

  # get status of a run id
  request_status_body <- as.character(
    jsonlite::toJSON(pretty = TRUE,
                     list(
                       "jsonrpc" = "2.0",
                       "method" = "getQueryRun",
                       "params" = list(
                         list(         "queryRunId" = query_run_id
                         )
                       ),
                       "id" = 1
                     ),
                     auto_unbox = TRUE
    )
  )

   return(
     content(
       httr::POST(
         api_url,
         config = httr::add_headers(.headers = headers),
         body = request_status_body)
     )
   )
}
