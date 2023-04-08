from datetime import datetime
from typing import List, Union

from shroomdk.models import QueryResultSet, QueryRunStats
from shroomdk.models.api import QueryResultJson


class QueryResultSetBuilder(object):
    def __init__(self, data: QueryResultJson):
        self.query_id = data.queryId
        self.status = data.status
        self.columns = data.columnLabels
        self.column_types = data.columnTypes
        self.rows = data.results

        self.run_stats = self.compute_run_stats(data)
        self.records = self.create_records(data)

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

    def compute_run_stats(self, data: QueryResultJson) -> QueryRunStats:
        if not data.startedAt or not data.endedAt:
            raise Exception("Query has no data ")
        start_time = datetime.strptime(data.startedAt, "%Y-%m-%dT%H:%M:%S.%fZ")
        end_time = datetime.strptime(data.endedAt, "%Y-%m-%dT%H:%M:%S.%fZ")
        return QueryRunStats(
            started_at=start_time,
            ended_at=end_time,
            elapsed_seconds=(end_time - start_time).seconds,
            record_count=data.recordCount if data.recordCount else 0,
        )

    def create_records(self, data: QueryResultJson) -> Union[List[dict], None]:
        if not data or not data.results:
            return None

        column_labels = data.columnLabels
        if not column_labels:
            return None

        records: List[dict] = []
        for row in data.results:
            if not row:
                continue

            record = {}
            for i, col in enumerate(column_labels):
                record[col.lower()] = row[i]

            records.append(record)

        return records
