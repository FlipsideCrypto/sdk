from datetime import datetime
from typing import List, Union

from ...models import QueryResultSet, QueryRunStats
from ...models.compass.core.query_run import QueryRun
from ...models.compass.get_query_run_results import GetQueryRunResultsRpcResult


class QueryResultSetBuilder(object):
    def __init__(self, query_run: QueryRun, query_result: GetQueryRunResultsRpcResult):
        self.query_id = query_run.id
        self.status = query_run.state
        self.columns = query_result.columnNames
        self.column_types = query_result.columnTypes
        self.rows = query_result.rows
        self.tags = query_run.tags
        self.sqlStatementId = query_run.sqlStatementId
        self.dataSourceId = query_run.dataSourceId
        self.errorName = query_run.errorName
        self.errorMessage = query_run.errorMessage
        self.errorData = query_run.errorData
        self.dataSourceQueryId = query_run.dataSourceQueryId
        self.dataSourceSessionId = query_run.dataSourceSessionId
        self.path = query_run.path

        self.run_stats = self.compute_run_stats(query_run)
        self.records = self.create_records()

    def build(self) -> QueryResultSet:
        return QueryResultSet(
            query_id=self.query_id,
            status=self.status,
            columns=self.columns,
            column_types=self.column_types,
            rows=self.rows,
            run_stats=self.run_stats,
            records=self.records,
            error=None,
        )

    def compute_run_stats(self, query_run: QueryRun) -> QueryRunStats:
        if (
            not query_run.startedAt
            or not query_run.endedAt
            or not query_run.createdAt
            or not query_run.queryStreamingEndedAt
            or not query_run.queryRunningEndedAt
        ):
            raise Exception("Query has no data ")

        created_at = datetime.strptime(query_run.createdAt, "%Y-%m-%dT%H:%M:%S.%fZ")
        start_time = datetime.strptime(query_run.startedAt, "%Y-%m-%dT%H:%M:%S.%fZ")
        end_time = datetime.strptime(query_run.endedAt, "%Y-%m-%dT%H:%M:%S.%fZ")
        streaming_end_time = datetime.strptime(
            query_run.queryStreamingEndedAt, "%Y-%m-%dT%H:%M:%S.%fZ"
        )
        query_exec_end_at = datetime.strptime(
            query_run.queryRunningEndedAt, "%Y-%m-%dT%H:%M:%S.%fZ"
        )

        return QueryRunStats(
            started_at=start_time,
            ended_at=end_time,
            streaming_started_at=query_exec_end_at,
            streaming_ended_at=streaming_end_time,
            query_exec_started_at=start_time,
            query_exec_ended_at=query_exec_end_at,
            elapsed_seconds=(end_time - start_time).seconds,
            queued_seconds=(start_time - created_at).seconds,
            streaming_seconds=(streaming_end_time - query_exec_end_at).seconds,
            query_exec_seconds=(query_exec_end_at - start_time).seconds,
            record_count=query_run.rowCount if query_run.rowCount else 0,
            bytes=query_run.totalSize if query_run.totalSize else 0,
        )

    def create_records(self) -> Union[List[dict], None]:
        if not self.rows:
            return None

        column_labels = self.columns
        if not column_labels:
            return None

        records: List[dict] = []
        for row in self.rows:
            if not row:
                continue

            record = {}
            for i, col in enumerate(column_labels):
                record[col.lower()] = row[i]

            records.append(record)

        return records
