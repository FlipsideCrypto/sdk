library(jsonlite)
library(httr)

#' Cancel Query
#'
#' Uses Flipside ShroomDK to CANCEL a query run id from `create_query_token()`, as the new API uses warehouse-seconds to charge users above the free tier,
#' the ability to cancel is critical for cost management.
#' @param query_run_id queryRunId from `create_query_token()`, for token stored as `x`, use `x$result$queryRequest$queryRunId`
#' @param api_key Flipside Crypto ShroomDK API Key
#' @param api_url default to https://api-v2.flipsidecrypto.xyz/json-rpc but upgradeable for user.
#' @return returns a list of the status_canceled (TRUE or FALSE) and the cancel object (which includes related details).
#' @import jsonlite httr
#' @export
#'
#' @examples
#' \dontrun{
#' query <- create_query_token("SELECT * FROM ETHEREUM.CORE.FACT_TRANSACTIONS LIMIT 1000000", api_key)
#' query_status <- get_query_status(query$result$queryRequest$queryRunId, api_key)
#' canceled <- cancel_query(query$result$queryRequest$queryRunId, api_key)
#' }
cancel_query <- function(query_run_id, api_key,
                             api_url = "https://api-v2.flipsidecrypto.xyz/json-rpc"){

  headers = c(
    "Content-Type" = 'application/json',
    "x-api-key" = api_key
  )

  # get status of a run id
  request_cancel_body <- as.character(
    jsonlite::toJSON(pretty = TRUE,
                     list(
                       "jsonrpc" = "2.0",
                       "method" = "cancelQueryRun",
                       "params" = list(
                         list(         "queryRunId" = query_run_id
                         )
                       ),
                       "id" = 1
                     ),
                     auto_unbox = TRUE
    )
  )

  canceled <- content(
    httr::POST(
      api_url,
      config = httr::add_headers(.headers = headers),
      body = request_cancel_body)
  )

  statecheck = canceled$result$canceledQueryRun$state == "QUERY_STATE_CANCELED"

  return(
    list(
      status_canceled = statecheck,
      cancellation_details = canceled
    )
  )
}
