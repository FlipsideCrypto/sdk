import { Link } from "@remix-run/react";
import { FlipsideLogo } from "./logo";

type Props = {
  title: string;
};

export function PageTitle({ title }: Props) {
  return (
    <div className="flex flex-row justify-start">
      <Link to="/">
        <FlipsideLogo width={60} height={60} className="mr-4 mb-4" />
      </Link>
      <div>
        <Link to="/" className="text-xs text-emerald-500 hover:text-blue-500">
          [back]
        </Link>
        <h1 className="text-2xl mb-4 font-mono">{title}</h1>
      </div>
    </div>
  );
}
