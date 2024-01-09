library(jsonlite)
library(httr)

#' Get Query From Token
#'
#' Uses Flipside ShroomDK to access a Query Token (Run ID). This function is for pagination and multiple requests.
#' It is best suited for debugging and testing new queries. Consider `auto_paginate_query()` for queries already known to work as expected.
#' Note: To reduce payload it returns a list of outputs (separating column names from rows). See `clean_query()` for converting result to a data frame.
#'
#' @param query_run_id queryRunId from `create_query_token()`, for token stored as `x`, use `x$result$queryRequest$queryRunId`
#' @param api_key Flipside Crypto ShroomDK API Key
#' @param page_number Results are cached, max 30MB of data per page.
#' @param page_size Default 1000. Paginate via page_number.  May return error if page_size causes data to exceed 30MB.
#' @param result_format Default to csv. Options: csv and json.
#' @param api_url default to https://api-v2.flipsidecrypto.xyz/json-rpc but upgradeable for user.
#' @return returns a list of jsonrpc, id, and result. Within result are:
#' columnNames, columnTypes, rows, page, sql, format, originalQueryRun, redirectedToQueryRun
#' use `clean_query()` to transform this into a data frame.
#' @import jsonlite httr
#' @export
#'
#' @examples
#' \dontrun{
#' query <- create_query_token("SELECT * FROM ETHEREUM.CORE.FACT_TRANSACTIONS LIMIT 1000", api_key)
#' fact_transactions <- get_query_from_token(query$result$queryRequest$queryRunId, api_key, 1, 1000)
#' }
get_query_from_token <- function(query_run_id, api_key,
                                 page_number = 1,
                                 page_size = 1000,
                                 result_format = "csv",
                                 api_url = "https://api-v2.flipsidecrypto.xyz/json-rpc"){

  status_check_done <- FALSE
  warn_flag <- FALSE

  while (!status_check_done) {
    query_status <- get_query_status(query_run_id = query_run_id, api_key = api_key, api_url = api_url)
    query_state <- query_status$result$queryRun$state
    failed_to_get_a_state = 0

    if(failed_to_get_a_state > 2){
      warning("Query has failed state more than twice, consider cancel_query(), exiting now")
      stop("Exited due to 3+ Failed States")
    }

    if(length(query_state) == 0){
      warning("Query failed to return a state, trying again")
      Sys.sleep(5)
      failed_to_get_a_state = failed_to_get_a_state + 1
    } else {
      if(query_state == "QUERY_STATE_SUCCESS"){
      status_check_done <- TRUE
      next()
    } else if(query_state == "QUERY_STATE_FAILED"){
      status_check_done <- TRUE
      stop(query_status$result$queryRun$errorMessage)
    } else if(query_state == "QUERY_STATE_CANCELED"){
      status_check_done <- TRUE
      stop("This query was canceled, typically by cancel_query()")
    } else if(query_state != "QUERY_STATE_SUCCESS"){
      warning(
     paste0("Query in process, checking again in 10 seconds.",
     "To cancel use: cancel_query() with your ID: \n", query_run_id)
     )
      Sys.sleep(5)
    } else if(query_state != "QUERY_STATE_SUCCESS"){
      warning(
        paste0("Query in process, checking again in 10 seconds.",
               "To cancel use: cancel_query() with your ID: \n", query_run_id)
      )
      Sys.sleep(10)
    }
  }
    }

  headers = c(
      "Content-Type" = 'application/json',
      "x-api-key" = api_key
    )

  request_data <- as.character(
    jsonlite::toJSON(pretty = TRUE,
                     list(
                       "jsonrpc" = "2.0",
                       "method" = "getQueryRunResults",
                       "params" = list(
                         list(
                           "queryRunId" = query_run_id,
                           "format" = result_format,
                           "page"  = list(
                             "number" = page_number,
                             "size" = page_size
                           )
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
        body = request_data)
    )
  )

}
