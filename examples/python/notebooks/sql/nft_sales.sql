SELECT
    date_trunc('day', block_timestamp) AS date,
    avg(price) as avg_eth_price,
    count(1) as num_sales
FROM ethereum.core.ez_nft_sales 
WHERE 
    nft_address = LOWER('0x23581767a106ae21c074b2276d25e5c3e136a68b')
    AND block_timestamp >= GETDATE() - interval'120 days'
GROUP BY 1
ORDER BY 1 ASC