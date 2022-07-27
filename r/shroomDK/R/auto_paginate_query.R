
#' Auto Paginate Queries
#'
#' @description Grabs up to maxrows in a query by going through each page 100k rows at a time.
#'
#' @param query The SQL query to pass to ShroomDK
#' @param api_key ShroomDK API key.
#' @param maxrows Max rows allowed in ShroomDK, 1M at time of writing.
#'
#' @return data frame of up to 1M rows, see ?clean_query for more details on column classes.
#' @export
#'
auto_paginate_query <- function(query, api_key, maxrows = 1000000){

  qtoken <- shroomDK::create_query_token(query = query, api_key = api_key)
  res <- shroomDK::get_query_from_token(qtoken$token, api_key = api_key)
 df <- shroomDK::clean_query(res)

  # Handle Pagination via ShroomDK
  # up to 1M rows max
  # get 100,000 rows at a time
  # stop when the most recent page < 100,000 items.
  # otherwise stop at 1M total rows.
  # NOTE: in the future, if we allow > 1M rows, will need to update this.

 maxpages = ceiling(maxrows/100000)

  if(nrow(df) == 100000){
    warning("Checking for additional pages of data...")
    for(i in 2:maxpages){
      temp_page <- clean_query(
        shroomDK::get_query_from_token(qtoken$token,
                                       api_key = api_key,
                                       page_number = i)
      )

     df <- rbind.data.frame(df, temp_page)

      if(nrow(temp_page) < 100000 | i == maxpages){
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
