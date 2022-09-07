import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { QueryResultSet } from "@flipsidecrypto/sdk";
import { Input } from "../components/input";
import { RetroButton } from "../components/retro-buttons";
import RetroLoader from "../components/retro-loader";
import { QueryStats } from "../components/query-stats";
import { QueryResultTable } from "../components/query-result-table";
import { getXMetricHolders } from "../queries/xmetric-queries";

export function XMetric() {
  let [queryResult, setQueryResult] = useState<QueryResultSet>();
  let [loading, setLoading] = useState<boolean>(false);
  let [pageNumber, setPageNumber] = useState<number>(1);
  let [pageSize, setPageSize] = useState<number>(10);

  const onQuery = async (pageSize: number, pageNumber: number) => {
    setLoading(true);
    // Get the mints
    //
    const [holderResults, err] = await getXMetricHolders(pageSize, pageNumber);

    if (err || !holderResults) {
      if (err) {
        toast.error("Could not retrieve mints, err: " + err.message);
      } else {
        toast.error("No mints found");
      }
      setLoading(false);
      setQueryResult(undefined);
      return;
    }

    setLoading(false);
    setQueryResult(holderResults);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onQuery(pageSize, pageNumber);
  };

  return (
    <>
      <div className="p-6 bg-[#F9FAFB] min-h-screen w-screen">
        <h1 className="text-2xl mb-4 font-mono">xMETRIC Holders</h1>
        <div className="mt-6 mb-4">
          <form onSubmit={onSubmit}>
            <div className="mt-6 mb-4 flex flex-row">
              <Input
                placeholder="Page Size"
                name="page_size"
                label="Page Size"
                defaultValue={pageSize}
                onChange={(val) => {
                  setPageSize(parseInt(val));
                }}
              />

              <Input
                placeholder="Page Number"
                name="page_number"
                label="Page Number"
                defaultValue={pageNumber}
                onChange={(val) => {
                  setPageNumber(parseInt(val));
                }}
              />
            </div>
            <RetroButton color={"green"} size={"sm"}>
              Get Holders
            </RetroButton>
          </form>
        </div>
        {loading && <RetroLoader />}
        {!loading && queryResult && (
          <>
            <div className="mt-6 p-4">
              <QueryStats queryResultSet={queryResult} />
            </div>
            <div className="mt-6 p-4">
              <QueryResultTable
                queryResultSet={queryResult}
                pageNumber={pageNumber}
                paginationEnabled={false}
                onNextPage={() => {
                  if (
                    queryResult?.records &&
                    queryResult?.records?.length > 0
                  ) {
                    setPageNumber(pageNumber + 1);
                  }
                }}
                onPrevPage={() => {
                  if (pageNumber - 1 > 0) {
                    setPageNumber(pageNumber - 1);
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
