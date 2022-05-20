import { useEffect, useState } from "react";
import { Flipside, QueryResultSet, Query } from "@flipsidecrypto/sdk";
import { Button } from "~/components/button";
import { ErrorMsg } from "~/components/error-msg";
import { Input } from "~/components/input";
import { Loader } from "~/components/loader";
import { PageTitle } from "~/components/page-title";
import { QueryPreview } from "~/components/query-preview";
import { QueryResultTable } from "~/components/query-result-table";
import { QueryStats } from "~/components/query-stats";
import { useLoaderData } from "@remix-run/react";
import { AppFooter } from "~/components/app-footer";
import {
  thorchainTxImLoss,
  thorchainTxImLossHtml,
} from "~/components/queries/thorchain-tx-im-loss";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const txId = url.searchParams.get("tx_id");
  return {
    FLIPSIDE_API_KEY: process.env.FLIPSIDE_API_KEY,
    FLIPSIDE_BASE_URL: process.env.FLIPSIDE_BASE_URL,
    urlTxId:
      txId ||
      "FB7127F67C55F786D196CD92A0E451675F669046BED92C0BADEB33B36286A7C3",
  };
}

export default function Index() {
  const { FLIPSIDE_API_KEY, FLIPSIDE_BASE_URL, urlTxId } = useLoaderData();
  let [queryResult, setQueryResult] = useState<QueryResultSet>();
  let [txId, setTxId] = useState<string>(urlTxId);
  let [loading, setLoading] = useState<boolean>(false);

  const flipside = new Flipside(FLIPSIDE_API_KEY, FLIPSIDE_BASE_URL);

  const onQuery = async (txId: string) => {
    const nextTxId = txId;
    setLoading(true);
    const query: Query = {
      sql: thorchainTxImLoss(nextTxId),
      ttlMinutes: 120,
    };

    const result = await flipside.query.run(query);

    setLoading(false);
    setTxId(nextTxId);
    setQueryResult(result);
  };

  useEffect(() => {
    async function onPageLoad() {
      if (txId) {
        await onQuery(txId);
      }
    }
    onPageLoad();
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // @ts-ignore
    const nextTxId = e.currentTarget.elements.tx_id.value;
    await onQuery(nextTxId);
  };

  return (
    <>
      <div className="p-6 bg-[#F9FAFB] min-h-screen w-screen">
        <PageTitle title="Thorchain Impermanent Loss Calculator" />
        <QueryPreview>{thorchainTxImLossHtml(txId)}</QueryPreview>
        <div className="mt-6">
          <form onSubmit={onSubmit}>
            <Input
              placeholder="TX ID"
              name="tx_id"
              defaultValue={txId}
              onChange={(val) => {
                let searchParams = new URLSearchParams(window.location.search);
                searchParams.set("tx_id", val);
                let newRelativePathQuery =
                  window.location.pathname + "?" + searchParams.toString();
                history.pushState(null, "", newRelativePathQuery);
                setTxId(val);
              }}
            />
            <Button cta="Run Query" />
          </form>
        </div>
        <Loader isLoading={loading}>
          <div className="mt-6 p-4">
            <QueryStats queryResultSet={queryResult} />
          </div>
          <ErrorMsg queryResultSet={queryResult} />
          <div className="mt-6 p-4">
            <QueryResultTable queryResultSet={queryResult} />
          </div>
        </Loader>
      </div>
      <AppFooter />
    </>
  );
}
