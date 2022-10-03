import { QueryResultSet } from "@flipsidecrypto/sdk";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Props = {
  queryResultSet: QueryResultSet;
  pageNumber: number;
  onNextPage(): void;
  onPrevPage(): void;
  paginationEnabled?: boolean;
};

export function QueryResultTable({
  queryResultSet,
  pageNumber,
  onNextPage,
  onPrevPage,
  paginationEnabled = true,
}: Props) {
  if (!queryResultSet) {
    return <></>;
  }

  if (queryResultSet.error) {
    return <></>;
  }

  function onClickNextPage() {
    onNextPage();
  }

  function onClickPrevPage() {
    onPrevPage();
  }

  return (
    <>
      <table className="table-auto">
        <thead>
          <tr>
            {queryResultSet &&
              queryResultSet?.columns?.map((column, i) => {
                return (
                  <th key={i} className="text-xs text-left text-bold p-2">
                    {column.replaceAll("_", " ")}
                  </th>
                );
              })}
          </tr>
        </thead>
        <tbody>
          {queryResultSet &&
            queryResultSet?.rows?.map((row, i) => {
              return (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="text-s p-2">
                      {`${cell}`.indexOf("0x") !== -1 ? (
                        <a
                          href={`https://etherscan.io/address/${cell}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          {cell}
                        </a>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>
        {paginationEnabled && (
          <tfoot>
            <tr className="flex my-8 flex-row justify-between w-full items-center">
              <td colSpan={3}>
                <button
                  onClick={onClickPrevPage}
                  disabled={pageNumber === 1 ? true : false}
                >
                  <FiChevronLeft
                    className={`font-bold ${
                      pageNumber === 1 ? "text-gray-400" : ""
                    }`}
                  />
                </button>
              </td>
              <td className="font-bold">Page: {pageNumber}</td>
              <td>
                <button onClick={onClickNextPage}>
                  <FiChevronRight className="font-bold" />
                </button>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </>
  );
}
