import { Link } from "@remix-run/react";
import { FlipsideLogo } from "~/components/logo";
import { AppFooter } from "~/components/app-footer";
import { GiPartyPopper } from "react-icons/gi";
import { AiFillGithub } from "react-icons/ai";

export default function Index() {
  return (
    <>
      <div className="min-h-screen w-screen bg-[#F9FAFB] flex flex-col items-center justify-center min-h-screen">
        <FlipsideLogo width={60} height={60} className="mb-4" />
        <h1 className="text-2xl flex flex-row font-mono text-emerald-500">
          FlipsideCrypto SDK
        </h1>
        <div className="flex flex-row items-center">
          <code className="font-mono text-sm bg-gray-200 rounded-lg p-4 my-2 flex flex-row items-center">
            yarn add @flipsidecrypto/sdk
            <a
              href="https://github.com/FlipsideCrypto/sdk/blob/main/js/README.md"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-500"
            >
              <AiFillGithub className="text-lg ml-3" />
            </a>
          </code>
        </div>
        <h3 className="italic mt-2 text-md">
          <a
            href="https://forms.gle/F8LXyvw74SBgwDZB6"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-500 hover:underline flex flex-row items-center"
          >
            <GiPartyPopper className="text-2xl mr-2" />
            Blockchain Data Where You Want It -- Join the Alpha
          </a>
        </h3>

        <h3 className="text-md underline "></h3>
        <ol className="list-decimal mt-8 font-mono">
          <li style={{ borderTop: "1px dotted #aaa" }} className="py-6">
            <Link to="/nft-mints" className="hover:underline text-xl">
              NFT Mints
              <p className="text-sm italic">
                what NFTs have been minted at an address?
              </p>
            </Link>
          </li>
          <li style={{ borderTop: "1px dotted #aaa" }} className="py-6">
            <Link to="/top-contracts" className="hover:underline text-xl">
              Top Contracts
              <p className="text-sm italic">
                what contract does a particular address interact with the most?
              </p>
            </Link>
          </li>
        </ol>
      </div>
      <AppFooter />
    </>
  );
}
