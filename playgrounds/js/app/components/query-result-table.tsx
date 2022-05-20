import { QueryResultSet } from "flipside";

type Props = {
  queryResultSet: QueryResultSet;
};

export function QueryResultTable({ queryResultSet }: Props) {
  if (!queryResultSet) {
    return <></>;
  }

  if (queryResultSet.error) {
    return <></>;
  }

  return (
    <table className="table-auto">
      <thead>
        <tr>
          {queryResultSet.columns.map((column, i) => {
            return (
              <th key={i} className="text-xs text-left text-bold p-2">
                {column}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {queryResultSet.rows.map((row, i) => {
          return (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="text-s p-2">
                  {cell}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
