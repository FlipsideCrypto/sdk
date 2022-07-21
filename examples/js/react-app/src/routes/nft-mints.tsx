import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { QueryResultSet } from "@flipsidecrypto/sdk";
import { Input } from "../components/input";
import { RetroButton } from "../components/retro-buttons";
import RetroLoader from "../components/retro-loader";
import { QueryStats } from "../components/query-stats";
import { ErrorMsg } from "../components/error-msg";
import { QueryResultTable } from "../components/query-result-table";
import { getEnsAddr } from "../queries/ens-queries";
import { getNFTMints } from "../queries/nft-queries";

export function NftMints() {
  let [queryResult, setQueryResult] = useState<QueryResultSet>();
  let [address, setAddress] = useState<string>();
  let [loading, setLoading] = useState<boolean>(false);
  let [pageNumber, setPageNumber] = useState<number>(1);

  const onQuery = async (addr: string, pageNumber: number) => {
    setLoading(true);

    // Do an ENS Lookup if an ENS was provided
    let nextAddress = addr.toLowerCase().replace(".eth", "");
    if (nextAddress.indexOf(".eth") === -1) {
      const [result, err] = await getEnsAddr(nextAddress);
      if (err || !result) {
        toast.error("ENS Registration Not Found: " + addr);
      }

      if (err || !result) {
        setLoading(false);
        setQueryResult(undefined);
        return;
      }
      nextAddress = result;
    }

    // Get the mints
    //
    const pageSize = 5;
    const [mintResults, err] = await getNFTMints(
      nextAddress,
      pageSize,
      pageNumber
    );

    if (err || !mintResults) {
      if (err) {
        toast.error("Could not retrieve mints, err: " + err.message);
      } else {
        toast.error("No mints found");
      }
      setLoading(false);
      setAddress(addr);
      setQueryResult(undefined);
      return;
    }

    setLoading(false);
    setAddress(addr);
    setQueryResult(mintResults);
  };

  useEffect(() => {
    async function onPageLoad() {
      const url = new URL(window.location.href);
      const address = url.searchParams.get("address");

      if (address) {
        setAddress(address);
        await onQuery(address, pageNumber);
      }
    }
    onPageLoad();
  }, []);

  useEffect(() => {
    if (address) {
      onQuery(address, pageNumber);
    }
  }, [address, pageNumber]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("here!");
    e.preventDefault();
    setLoading(true);
    // @ts-ignore
    const nextAddress = e.currentTarget.elements.address.value;
    setAddress(nextAddress);
    setPageNumber(1);
    // await onQuery(nextAddress, 1);
  };

  return (
    <>
      <div className="p-6 bg-[#F9FAFB] min-h-screen w-screen">
        <h1 className="text-2xl mb-4 font-mono">NFT Address Mint History</h1>
        <div className="mt-6">
          <form onSubmit={onSubmit}>
            <Input
              placeholder="ENS or Wallet Address"
              name="address"
              defaultValue={address}
              onChange={(val) => {
                let searchParams = new URLSearchParams(window.location.search);
                searchParams.set("address", val);
                let newRelativePathQuery =
                  window.location.pathname + "?" + searchParams.toString();
                window.history.pushState(null, "", newRelativePathQuery);
                setAddress(val);
              }}
            />
            <RetroButton color={"green"} size={"sm"}>
              Get Mints
            </RetroButton>
          </form>
        </div>
        {loading && <RetroLoader />}
        {!loading && queryResult && (
          <>
            <div className="mt-6 p-4">
              <QueryStats queryResultSet={queryResult} />
            </div>
            {/* <ErrorMsg queryResultSet={queryResult} /> */}
            <div className="mt-6 p-4">
              <QueryResultTable
                queryResultSet={queryResult}
                pageNumber={pageNumber}
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
