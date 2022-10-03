WITH xmetric_holders AS (
    SELECT to_address as holder_addr
    FROM polygon.core.fact_token_transfers
    WHERE block_timestamp > '2022-07-10T00:00:00'
        AND contract_address = lower('0x15848C9672e99be386807b9101f83A16EB017bb5')
        AND to_address != lower('0x4b8923746a1D9943bbd408F477572762801efE4d')
)
SELECT
    token_name,
    symbol,
    count(distinct user_address) as num_holders,
    median(usd_value_now) as median_usd_holdings
FROM ethereum.core.ez_current_balances
INNER JOIN xmetric_holders 
    ON ethereum.core.ez_current_balances.user_address = xmetric_holders.holder_addr
WHERE ethereum.core.ez_current_balances.usd_value_now > 0
GROUP BY 1, 2
ORDER BY 3 DESC
LIMIT 25