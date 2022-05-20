import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="h-screen w-screen bg-[#F9FAFB] flex flex-col items-center justify-center">
      <h1 className="text-md underline mt-[-50px]">Examples</h1>
      <ol className="list-decimal mt-2">
        <li>
          <Link to="/nft-mints" className="hover:underline text-xl">
            NFT Mints
          </Link>
        </li>
      </ol>
    </div>
  );
}
