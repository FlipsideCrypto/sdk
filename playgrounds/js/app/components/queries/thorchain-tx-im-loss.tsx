export function thorchainTxImLoss(txId: string) {
  return `
        WITH tx_info AS (
            SELECT 
                block_timestamp,
                pool_name,
                rune_amount,
                rune_amount_usd,
                asset_amount,
                asset_amount_usd
            FROM thorchain.liquidity_actions
            WHERE tx_id = '${txId}'
        ),

        current_prices AS (
            SELECT
                pool_name,
                asset_usd AS current_asset_price,
                rune_usd AS current_rune_price
            FROM thorchain.prices
            WHERE block_id = (SELECT max(block_id) 
            FROM thorchain.prices WHERE pool_name = (SELECT pool_name FROM tx_info))
        ),

        il_profit AS (
            SELECT
                tx_info.pool_name,
                rune_amount AS initial_rune_amount,
                rune_amount_usd AS initial_rune_usd,
                rune_amount_usd/rune_amount AS intial_rune_price,
                asset_amount AS initial_asset_amount,
                asset_amount_usd AS initial_asset_usd,
                asset_amount_usd/asset_amount AS initial_asset_price,
                rune_amount_usd + asset_amount_usd AS initial_total_usd,
                sqrt(rune_amount * asset_amount * (current_asset_price / current_rune_price)) AS current_rune_amt,
                sqrt(rune_amount * asset_amount * (current_asset_price / current_rune_price)) * current_rune_price AS current_rune_usd,
                current_rune_price,
                sqrt(rune_amount * asset_amount / (current_asset_price / current_rune_price)) AS current_asset_amt,
                sqrt(rune_amount * asset_amount / (current_asset_price / current_rune_price)) * current_asset_price AS current_asset_usd,
                current_asset_price,
                current_rune_usd + current_asset_usd AS current_total_usd,
                current_total_usd - initial_total_usd AS il_or_profit
            FROM tx_info
            JOIN current_prices ON tx_info.pool_name = current_prices.pool_name
        )
        SELECT 
            il_profit.pool_name as pool_name,
            il_profit.il_or_profit as il_or_profit
        FROM il_profit
    `;
}

export function thorchainTxImLossHtml(txId: string) {
  return (
    <>
      WITH tx_info AS (
      <br /> SELECT
      <br /> block_timestamp,
      <br /> pool_name,
      <br /> rune_amount,
      <br /> rune_amount_usd,
      <br /> asset_amount,
      <br /> asset_amount_usd
      <br />
      FROM thorchain.liquidity_actions
      <br />
      WHERE tx_id = '{txId}'
      <br />
      ),
      <br />
      current_prices AS (
      <br />
      SELECT
      <br />
      pool_name,
      <br />
      asset_usd AS current_asset_price,
      <br />
      rune_usd AS current_rune_price
      <br />
      FROM thorchain.prices
      <br />
      WHERE block_id = (SELECT max(block_id)
      <br /> FROM thorchain.prices WHERE pool_name = (SELECT pool_name FROM
      tx_info))
      <br />
      ),
      <br />
      il_profit AS (
      <br />
      SELECT
      <br />
      tx_info.pool_name,
      <br />
      rune_amount AS initial_rune_amount,
      <br />
      rune_amount_usd AS initial_rune_usd,
      <br />
      rune_amount_usd/rune_amount AS intial_rune_price,
      <br />
      asset_amount AS initial_asset_amount,
      <br />
      asset_amount_usd AS initial_asset_usd,
      <br />
      asset_amount_usd/asset_amount AS initial_asset_price,
      <br />
      rune_amount_usd + asset_amount_usd AS initial_total_usd,
      <br />
      sqrt(rune_amount * asset_amount * (current_asset_price /
      current_rune_price)) AS current_rune_amt,
      <br />
      sqrt(rune_amount * asset_amount * (current_asset_price /
      current_rune_price)) * current_rune_price AS current_rune_usd,
      <br />
      current_rune_price,
      <br />
      sqrt(rune_amount * asset_amount / (current_asset_price /
      current_rune_price)) AS current_asset_amt,
      <br />
      sqrt(rune_amount * asset_amount / (current_asset_price /
      current_rune_price)) * current_asset_price AS current_asset_usd,
      <br />
      current_asset_price,
      <br />
      current_rune_usd + current_asset_usd AS current_total_usd,
      <br />
      current_total_usd - initial_total_usd AS il_or_profit
      <br />
      FROM tx_info
      <br />
      JOIN current_prices ON tx_info.pool_name = current_prices.pool_name
      <br />)
      <br />
      SELECT
      <br />
      il_profit.pool_name as pool_name,
      <br />
      il_profit.il_or_profit as il_or_profit
      <br />
      FROM il_profit
    </>
  );
}
