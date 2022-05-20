import { QueryResultSet } from "flipside";

type Props = {
  queryResultSet: QueryResultSet | null;
};

export function ErrorMsg({ queryResultSet }: Props) {
  if (!queryResultSet) {
    return <></>;
  }

  if (!queryResultSet.error) {
    return <></>;
  }
  return (
    <div>
      <h1>Error</h1>
      <pre>{queryResultSet?.error.message}</pre>
    </div>
  );
}
