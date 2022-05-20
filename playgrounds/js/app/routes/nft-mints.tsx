import { useState } from "react";
import { Flipside, QueryResultSet, Query } from "@flipsidecrypto/velocity";
import { Button } from "~/components/button";
import { ErrorMsg } from "~/components/error-msg";
import { Input } from "~/components/input";
import { Loader } from "~/components/loader";
import { PageTitle } from "~/components/page-title";
import { QueryPreview } from "~/components/query-preview";
import { QueryResultTable } from "~/components/query-result-table";
import { QueryStats } from "~/components/query-stats";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: { request: Request }) {
  return {
    FLIPSIDE_API_KEY: process.env.FLIPSIDE_API_KEY,
    FLIPSIDE_BASE_URL: process.env.FLIPSIDE_BASE_URL,
  };
}

export default function Index() {
  const { FLIPSIDE_API_KEY, FLIPSIDE_BASE_URL } = useLoaderData();
  let [queryResult, setQueryResult] = useState<QueryResultSet>();
  let [address, setAddress] = useState<string>();
  let [loading, setLoading] = useState<boolean>(false);

  const flipside = new Flipside(FLIPSIDE_API_KEY, FLIPSIDE_BASE_URL);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // @ts-ignore
    const nextAddress = e.currentTarget.elements.address.value;

    const query: Query = {
      sql: `select nft_address, mint_price_eth, mint_price_usd from flipside_prod_db.ethereum_core.ez_nft_mints where nft_to_address = LOWER('${nextAddress}')`,
      ttlMinutes: 10,
    };

    const result = await flipside.query.run(query);

    setLoading(false);
    setAddress(nextAddress);
    setQueryResult(result);
  };

  return (
    <div className="p-6 bg-[#F9FAFB] h-screen w-screen">
      <PageTitle title="NFT Address Mint History" />
      <QueryPreview>
        SELECT
        <br /> nft_address,
        <br /> mint_price_eth,
        <br /> mint_price_usd
        <br />
        FROM
        <br /> flipside_prod_db.ethereum_core.ez_nft_mints
        <br />
        WHERE
        <br /> nft_to_address=
        <span style={{ color: "purple" }}>LOWER('{address}')</span>
      </QueryPreview>
      <div className="mt-6">
        <form onSubmit={onSubmit}>
          <Input
            placeholder="Wallet Address"
            name="address"
            onChange={setAddress}
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
  );
}
