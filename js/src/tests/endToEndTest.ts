import { Flipside } from "../flipside";
import { Query, QueryResultSet } from "../types";

const runIt = async (): Promise<void> => {
	// Initialize `Flipside` with your API key
	const flipside = new Flipside(
		"api-key-here",
		"https://api.flipsidecrypto.com",
	);

	// Create a query object for the `query.run` function to execute
	const query: Query = {
		sql: "select nft_address, mint_price_eth, mint_price_usd from flipside_prod_db.ethereum_core.ez_nft_mints limit 100",
		ttlMinutes: 10,
		pageSize: 100,
		pageNumber: 1
	};

	// Send the `Query` to Flipside's query engine and await the results
	const result: QueryResultSet = await flipside.query.run(query);

	if (!result || !result.records) throw "null result";

	console.log(result);
};

runIt();