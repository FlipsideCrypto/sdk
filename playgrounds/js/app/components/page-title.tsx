import { Link } from "@remix-run/react";

type Props = {
  title: string;
};

export function PageTitle({ title }: Props) {
  return (
    <div>
      <Link to="/" className="text-xs text-emerald-500">
        [back]
      </Link>
      <h1 className="text-2xl mb-4">NFT Address Mint History</h1>
    </div>
  );
}
