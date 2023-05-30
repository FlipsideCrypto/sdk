library(jsonlite)
library(httr)

#' Auto Paginate Queries
#'
#' @description Intelligently grab up to 1 Gigabyte of data from a SQL query including automatic pagination and cleaning.
#'
#' @param query The SQL query to pass to ShroomDK
#' @param api_key ShroomDK API key.
#' @param page_size Default 25,000. May return error if `page_size` is too large (if page exceeds 30MB or entire query >1GB). Ignored if results fit on 1 page of < 15 Mb of data.
#' @param page_count How many pages, of page_size rows each, to read. Default NULL calculates the ceiling (# rows in results / page_size). Ignored if results fit on 1 page of < 15 Mb of data.
#' @param data_source Where data is sourced, including specific computation warehouse. Default `"snowflake-default"`. Non default data sources may require registration of api_key to allowlist.
#' @param data_provider Who provides data, Default `"flipside"`. Non default data providers may require registration of api_key to allowlist.
#' @param api_url default to https://api-v2.flipsidecrypto.xyz/json-rpc but upgradeable for user.
#' @return data frame of up to `page_size * page_count` rows, see ?clean_query for more details on column classes.
#' @import jsonlite httr
#' @export
#' @examples
#' \dontrun{
#' pull_data <- auto_paginate_query("
#' SELECT * FROM ETHEREUM.CORE.FACT_TRANSACTIONS LIMIT 10001",
#' api_key = readLines("api_key.txt"),
#' page_size = 9000, # ends up ignored because results fit on 1 page.
#' page_count = NULL)
#' }
auto_paginate_query <- function(query, api_key,
                                page_size = 25000,
                                page_count = NULL,
                                data_source = "snowflake-default",
                                data_provider = "flipside",
                                api_url = "https://api-v2.flipsidecrypto.xyz/json-rpc"){

  qtoken <- create_query_token(query = query,
                               api_key = api_key,
                               ttl = 1,
                               mam = 10,
                               data_source = data_source,
                               data_provider = data_provider,
                               api_url = api_url)

  query_run_id <- qtoken$result$queryRequest$queryRunId
  status_check_done <- FALSE
  warn_flag <- FALSE

 while (!status_check_done) {
   query_status <- get_query_status(query_run_id = query_run_id, api_key = api_key, api_url = api_url)
   query_state <- query_status$result$queryRun$state

   if(query_state == "QUERY_STATE_SUCCESS"){
     status_check_done <- TRUE
     result_num_rows <- query_status$result$queryRun$rowCount
     result_file_size <- as.numeric(query_status$result$queryRun$totalSize)
     next()
   } else if(query_state == "QUERY_STATE_FAILED"){
     status_check_done <- TRUE
     stop(query_status$result$queryRun$errorMessage)
   } else if(query_state == "QUERY_STATE_CANCELED"){
     status_check_done <- TRUE
     stop("This query was canceled, typically by cancel_query()")
   } else if(query_state != "QUERY_STATE_SUCCESS"){
     warning("Query in process, checking again in 5 seconds, use cancel_query() if needed.")
     Sys.sleep(5)
   }
 }

if(is.null(page_count)){
page_count <- ceiling(result_num_rows / page_size)
}

# if the result is large (estimated at 15+ Mb) paginate
# otherwise grab it all at once.
if(result_file_size > 15000000){
   res <- lapply(1:page_count, function(i){
    temp_page <- get_query_from_token(qtoken$result$queryRequest$queryRunId,
                                api_key = api_key,
                                page_number = i,
                                page_size = page_size,
                                result_format = "csv",
                                api_url = api_url)

    if(length(temp_page$result$rows) < 1){
      df <- data.frame()
    } else {
    df <- clean_query(temp_page)
      }
    return(df)
  })

   # drop empty pages if they accidentally appear
   res <- res[unlist(lapply(res, nrow)) > 0]
   df <- do.call(rbind.data.frame, res)

} else {
    temp_page <- get_query_from_token(qtoken$result$queryRequest$queryRunId,
                                      api_key = api_key,
                                      page_number = 1,
                                      page_size = result_num_rows,
                                      result_format = "csv",
                                      api_url = api_url)


     df <- clean_query(temp_page)
    }

   return(df)
}
