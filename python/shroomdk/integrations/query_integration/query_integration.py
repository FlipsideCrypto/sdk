from shroomdk.api import API
from shroomdk.models import (
    QueryDefaults,
    Query,
    QueryResultSet,
    QueryStatus,
    SleepConfig
)
from shroomdk.models.api import (
    QueryResultJson
)
from shroomdk.errors import (
    UserError, 
    QueryRunExecutionError, 
    QueryRunTimeoutError, 
    SDKError
)
from shroomdk.utils.sleep import (
    get_elapsed_linear_seconds, 
    linear_backoff
)
from .query_result_set_builder import QueryResultSetBuilder


DEFAULTS: QueryDefaults = QueryDefaults(
  ttl_minutes=60,
  cached=True,
  timeout_minutes=20,
  retry_interval_seconds=0.5,
  page_size=100000,
  page_number=1,
)


class QueryIntegration(object):
    
    def __init__(self, api: API, defaults: QueryDefaults = DEFAULTS):
        self.api = api
        self.defaults = defaults
    
    def _set_query_defaults(self, query: Query) -> Query:
        query_default_dict = self.defaults.dict()
        query_dict = query.dict()
        query_default_dict.update(query_dict)
        return Query(**query_default_dict)
    
    def run(self, query: Query) -> QueryResultSet:
        query = self._set_query_defaults(query)

        created_query = self.api.create_query(query)
        if created_query.status_code > 299:
            raise Exception(created_query.error_msg)

        query_run = created_query.data
        if not query_run:
            raise SDKError( "expected `created_query.data` from server but got `None`")

        query_results = self.get_query_results(
            query_run.token, 
            page_number=query.page_number, 
            page_size=query.page_size
        )

        return QueryResultSetBuilder(query_results).build()

    def get_query_results(self, query_run_id: str, page_number: int = 1, page_size: int = 100000, attempts: int = 0) -> QueryResultJson:
        query_run = self.api.get_query_result(query_run_id, page_number, page_size)
        status_code = query_run.status_code

        if status_code > 299:
            if status_code >= 400 and status_code <= 499:
                error_msg = query_run.status_msg if query_run.status_msg else "user input error"
                if query_run.error_msg:
                    error_msg = query_run.error_msg
                raise UserError(status_code, error_msg)
        
        if not query_run.data:
            raise Exception("valid status msg returned from server but no data exists in the response")

        query_status = query_run.data.status

        if query_status == QueryStatus.Finished:
            return query_run.data
        
        if query_status == QueryStatus.Error:
            raise QueryRunExecutionError()
        
        should_continue = linear_backoff(
            SleepConfig(
                attempts=attempts, 
                timeout_minutes=self.defaults.timeout_minutes, 
                interval_seconds=self.defaults.retry_interval_seconds
            )
        )

        if not should_continue:
            elapsed_seconds = get_elapsed_linear_seconds(
                SleepConfig(
                    attempts=attempts, 
                    timeout_minutes=self.defaults.timeout_minutes, 
                    interval_seconds=self.defaults.retry_interval_seconds
                )
            )
            
            raise QueryRunTimeoutError(elapsed_seconds)

        return self.get_query_results(query_run_id, page_number, page_size, attempts + 1)


# import {
#   Query,
#   QueryDefaults,
#   QueryStatusFinished,
#   QueryStatusError,
#   QueryResultJson,
#   CreateQueryJson,
#   ApiClient,
#   QueryResultSet,
# } from "../../types";
# import {
#   expBackOff,
#   getElapsedLinearSeconds,
#   linearBackOff,
# } from "../../utils/sleep";
# import {
#   QueryRunExecutionError,
#   QueryRunRateLimitError,
#   QueryRunTimeoutError,
#   ServerError,
#   UserError,
#   UnexpectedSDKError,
# } from "../../errors";
# import { QueryResultSetBuilder } from "./query-result-set-builder";

# const DEFAULTS: QueryDefaults = {
#   ttlMinutes: 60,
#   cached: true,
#   timeoutMinutes: 20,
#   retryIntervalSeconds: 0.5,
#   pageSize: 100000,
#   pageNumber: 1,
# };

# export class QueryIntegration {
#   #api: ApiClient;
#   #defaults: QueryDefaults;

#   constructor(api: ApiClient, defaults: QueryDefaults = DEFAULTS) {
#     this.#api = api;
#     this.#defaults = defaults;
#   }

#   #setQueryDefaults(query: Query): Query {
#     return { ...this.#defaults, ...query };
#   }

#   async run(query: Query): Promise<QueryResultSet> {
#     query = this.#setQueryDefaults(query);

#     const [createQueryJson, createQueryErr] = await this.#createQuery(query);
#     if (createQueryErr) {
#       return new QueryResultSetBuilder({
#         queryResultJson: null,
#         error: createQueryErr,
#       });
#     }

#     if (!createQueryJson) {
#       return new QueryResultSetBuilder({
#         queryResultJson: null,
#         error: new UnexpectedSDKError(
#           "expected a `createQueryJson` but got null"
#         ),
#       });
#     }

#     const [getQueryResultJson, getQueryErr] = await this.#getQueryResult(
#       createQueryJson.token,
#       query.pageNumber || 1,
#       query.pageSize || 100000,
#     );

#     if (getQueryErr) {
#       return new QueryResultSetBuilder({
#         queryResultJson: null,
#         error: getQueryErr,
#       });
#     }


#     if (!getQueryResultJson) {
#       return new QueryResultSetBuilder({
#         queryResultJson: null,
#         error: new UnexpectedSDKError(
#           "expected a `getQueryResultJson` but got null"
#         ),
#       });
#     }

#     return new QueryResultSetBuilder({
#       queryResultJson: getQueryResultJson,
#       error: null,
#     });
#   }

#   async #createQuery(
#     query: Query,
#     attempts: number = 0
#   ): Promise<
#     [
#       CreateQueryJson | null,
#       QueryRunRateLimitError | ServerError | UserError | null
#     ]
#   > {
#     const resp = await this.#api.createQuery(query);
#     if (resp.statusCode <= 299) {
#       return [resp.data, null];
#     }

#     if (resp.statusCode !== 429) {
#       if (resp.statusCode >= 400 && resp.statusCode <= 499) {
#         let errorMsg = resp.statusMsg || "user error";
#         if (resp.errorMsg) {
#           errorMsg = resp.errorMsg;
#         }
#         return [null, new UserError(resp.statusCode, errorMsg)];
#       }
#       return [
#         null,
#         new ServerError(resp.statusCode, resp.statusMsg || "server error"),
#       ];
#     }

#     let shouldContinue = await expBackOff({
#       attempts,
#       timeoutMinutes: this.#defaults.timeoutMinutes,
#       intervalSeconds: this.#defaults.retryIntervalSeconds,
#     });

#     if (!shouldContinue) {
#       return [null, new QueryRunRateLimitError()];
#     }

#     return this.#createQuery(query, attempts + 1);
#   }

#   async #getQueryResult(
#     queryID: string,
#     pageNumber: number,
#     pageSize: number,
#     attempts: number = 0
#   ): Promise<
#     [
#       QueryResultJson | null,
#       QueryRunTimeoutError | ServerError | UserError | null
#     ]
#   > {
#     const resp = await this.#api.getQueryResult(queryID, pageNumber, pageSize);
#     if (resp.statusCode > 299) {
#       if (resp.statusCode >= 400 && resp.statusCode <= 499) {
#         let errorMsg = resp.statusMsg || "user input error";
#         if (resp.errorMsg) {
#           errorMsg = resp.errorMsg;
#         }
#         return [null, new UserError(resp.statusCode, errorMsg)];
#       }
#       return [
#         null,
#         new ServerError(resp.statusCode, resp.statusMsg || "server error"),
#       ];
#     }

#     if (!resp.data) {
#       throw new Error(
#         "valid status msg returned from server but no data exists in the response"
#       );
#     }

#     if (resp.data.status === QueryStatusFinished) {
#       return [resp.data, null];
#     }

#     if (resp.data.status === QueryStatusError) {
#       return [null, new QueryRunExecutionError()];
#     }

#     let shouldContinue = await linearBackOff({
#       attempts,
#       timeoutMinutes: this.#defaults.timeoutMinutes,
#       intervalSeconds: this.#defaults.retryIntervalSeconds,
#     });

#     if (!shouldContinue) {
#       const elapsedSeconds = getElapsedLinearSeconds({
#         attempts,
#         timeoutMinutes: this.#defaults.timeoutMinutes,
#         intervalSeconds: this.#defaults.retryIntervalSeconds,
#       });
#       return [null, new QueryRunTimeoutError(elapsedSeconds * 60)];
#     }

#     return this.#getQueryResult(queryID, pageNumber, pageSize, attempts + 1);
#   }
# }
