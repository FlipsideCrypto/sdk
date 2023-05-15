import { ColumnMetadata } from "./column-metadata.type";
import { Tags } from "./tags.type";

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
