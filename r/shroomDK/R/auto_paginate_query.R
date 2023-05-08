library(jsonlite)
library(httr)

#' Auto Paginate Queries
#'
#' @description Grabs up to maxrows in a query by going through each page to download one at a time.
#'
#' @param query The SQL query to pass to ShroomDK
#' @param api_key ShroomDK API key.
#' @param page_size Default 1000. May return error if page_size is tool large and data to exceed 30MB.
#' @param page_count Default 1. How many pages, of page_size rows each, to read.
#' @param api_url default to https://api-v2.flipsidecrypto.xyz/json-rpc but upgradeable for user.
#' @return data frame of up to `page_size * page_count` rows, see ?clean_query for more details on column classes.
#' @import jsonlite httr
#' @export
#' @examples
#' \dontrun{
#' pull_data <- auto_paginate_query("
#' SELECT * FROM ETHEREUM.CORE.FACT_TRANSACTIONS LIMIT 10000",
#' api_key = readLines("api_key.txt"),
#' page_count = 10)
#' }
auto_paginate_query <- function(query, api_key, page_size = 1000,
                                page_count = 1,
                                api_url = "https://api-v2.flipsidecrypto.xyz/json-rpc"){
browser()
  qtoken <- create_query_token(query = query,
                               api_key = api_key,
                               ttl = 1,
                               mam = 10,
                               api_url = api_url)

  # read the first page
  res <- get_query_from_token(qtoken$result$queryRequest$queryRunId,
                                        api_key = api_key,
                                        page_number = 1,
                                        page_size = page_size,
                                        result_format = "csv",
                                        api_url = api_url)
  df <- clean_query(res)

  # Handle Pagination via ShroomDK
  # if you got a full page immediately, keep going
  if(nrow(df) == page_size){
    warning("Checking for additional pages of data...")
    for(i in 2:page_count){
      temp_page <- get_query_from_token(qtoken$result$queryRequest$queryRunId,
                                       api_key = api_key,
                                       page_number = i,
                                       page_size = page_size,
                                       result_format = "csv",
                                       api_url = api_url)

      if(length(temp_page$result$rows) > 0){
        temp_page <- clean_query(temp_page)
      } else {
        temp_page <- data.frame()
      }

      df <- rbind.data.frame(df, temp_page)

      if(nrow(temp_page) < page_size | i == page_count){
        # done
        return(df)

      } else {
        # continue
      }
    }
  } else {
    return(df)
  }
}
