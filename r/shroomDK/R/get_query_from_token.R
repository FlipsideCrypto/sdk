library(jsonlite)
library(httr)

#' Get Query From Token
#'
#' Uses Flipside ShroomDK to access a Query Token (Run ID). This function is for pagination and multiple requests.
#' Note: To reduce payload it returns a list of outputs (separating column names from rows). Use `clean_query()` to
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


  query_status <- get_query_status(query_run_id = query_run_id, api_key = api_key, api_url = api_url)
  query_state <- query_status$result$queryRun$state

# implicit else for "QUERY_STATUS_SUCCESS"
  if(query_state == "QUERY_STATE_FAILED"){
  stop(query_status$result$queryRun$errorMessage)
  } else if(query_state == "QUERY_STATE_CANCELED"){
    stop("This query was canceled, typically by cancel_query()")
  } else if(query_state != "QUERY_STATE_SUCCESS"){
    warning("Query in process, checking again in 5 seconds")
    Sys.sleep(5)
    # run it back
    return(
      get_query_from_token(query_run_id = query_run_id,
                           api_key = api_key,
                           page_number = page_number,
                           page_size = page_size,
                           result_format = result_format,
                           api_url = api_url
      )
    )
  } else {

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
