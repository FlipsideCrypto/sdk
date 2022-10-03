

#' Clean Query
#'
#' @description converts query response to data frame while attempting to coerce classes
#' intelligently.
#'
#' @param request The request output from get_query_from_token()
#' @param try_simplify because requests can return JSON and may not have the same length
#' across values, they may not be data frame compliant (all columns having the same number of rows).
#' A key example would be TX_JSON in EVM FACT_TRANSACTION tables which include 50+
#' extra details from transaction logs. But other examples like NULLs TO_ADDRESS can have similar
#' issues. Default TRUE.
#'
#' @return A data frame. If `try_simplify` is FALSE OR if `try_simplify` TRUE fails:
#' the data frame is comprised of lists, where each column must be coerced
#' to a desired class (e.g., with `as.numeric()`).
#'
#' @export
#'
#' @examples
#' \dontrun{
#' query = create_query_token("SELECT * FROM ETHEREUM.CORE.FACT_TRANSACTIONS LIMIT 10000", api_key)
#' request = get_query_from_token(query$token, api_key, 1, 10000)
#' clean_query(request, try_simplify = FALSE)
#' }
clean_query <- function(request, try_simplify = TRUE){

   # Functions NOT exported
   fill_null <- function(columnlist){
    # NULL values must be replaced with NA to avoid getting dropped in list coercions
  null_index <- which(unlist(lapply(columnlist, is.null)))
  columnlist[null_index] <- NA
  return(columnlist)
  }
   error <- function(request){
    warning("Attempts to simplify result in different number of rows per column. Likely
              due to the request including JSON. Returned is a data frame of lists, coerce them
              to numeric/character/date one by one. See: request$columnTypes")

    clean_query(request, try_simplify = FALSE)
    }


   # start data reformat
     # this is a matrix/array
    data <- t(list2DF(request$results))
    colnames(data) <- request$columnLabels
    rownames(data) <- NULL

    # Protects NULL values
  for(i in 1:ncol(data)){
    data[, i] <- fill_null(data[, i])
  }

   # data frame of Lists
    data <- as.data.frame(data)

    if(try_simplify == FALSE){
      # user must manually coerce each column as needed, e.g., as.numeric(data$BLOCK_NUMBER)
      return(data)

    } else {

      # check if all columns of lists are same length
      test_lengths <- unlist(lapply(data, function(x){length(unlist(x))}))

      # if NOT return data frame of lists for user coercion w/ error
      if( min(test_lengths) != max(test_lengths) ){
        error(request)
      } else { # if YES coerce data frame
        return( as.data.frame(lapply(data, unlist)) )
      }

    }
}

