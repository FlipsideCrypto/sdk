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
#' SELECT * FROM ETHEREUM.CORE.FACT_TRANSACTIONS LIMIT 10001",
#' api_key = readLines("api_key.txt"),
#' page_count = 10)
#' }
auto_paginate_query <- function(query, api_key, page_size = 1000,
                                page_count = 1,
                                api_url = "https://api-v2.flipsidecrypto.xyz/json-rpc"){

  qtoken <- create_query_token(query = query,
                               api_key = api_key,
                               ttl = 1,
                               mam = 10,
                               api_url = api_url)

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

   res <- res[unlist(lapply(res, nrow)) > 0]

   df <- do.call(rbind.data.frame, res)

   return(df)

}
