import { QueryResultSet } from "@flipsidecrypto/sdk";

type Props = {
  queryResultSet: QueryResultSet | null;
};

export function QueryStats({ queryResultSet }: Props) {
  if (!queryResultSet) {
    return <></>;
  }

  if (queryResultSet.error) {
    return <></>;
  }

  return (
    <div className="w-[800px]">
      <h3 className="text-lg leading-6 font-medium text-gray-900">Query Stats</h3>
      <dl className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Stat
          name="Elapsed Time (seconds)"
          //@ts-ignore
          stat={queryResultSet.runStats.elapsedSeconds}
        />
        {/* @ts-ignore */}
        <Stat name="Result Count" stat={queryResultSet.runStats.recordCount} />
        {/* @ts-ignore */}
        <Stat name="Total Pages" stat={queryResultSet.page?.totalPages} />
      </dl>
    </div>
  );
}

type StatProps = {
  name: string;
  stat: string;
};

function Stat({ name, stat }: StatProps) {
  return (
    <div key={name} className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
      <dt className="text-sm font-medium text-gray-500 truncate">{name}</dt>
      <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat}</dd>
    </div>
  );
}
