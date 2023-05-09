import { ColumnMetadata } from "./column-metadata";
import { Tags } from "./tags";

export interface SqlStatement {
  id: string;
  statementHash: string;
  sql: string;
  columnMetadata: ColumnMetadata | null;
  userId: string;
  tags: Tags;
  createdAt: string;
  updatedAt: string;
}
