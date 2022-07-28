with moonbirds_minters as (
	SELECT
    	distinct nft_to_address as addr
	FROM ethereum.core.ez_nft_mints
	WHERE 
  		nft_address = lower('0x23581767a106ae21c074b2276D25e5C3e136a68b')
	ORDER BY 1 DESC
),
sellers as (
  SELECT
  	s.nft_address as addr,
  	s.project_name,
  	count(distinct s.seller_address) as uniq_sellers,
  	count(1) as num_sales,
  	sum(price_usd) as usd_volume
  FROM ethereum.core.ez_nft_sales s
  INNER JOIN moonbirds_minters mm ON mm.addr = s.seller_address
  WHERE
      block_timestamp >= GETDATE() - interval'30 days'
  GROUP BY 1,2
  ORDER BY 1 DESC
),
buyers as (
  SELECT
  	s.nft_address as addr,
  	s.project_name,
  	count(distinct s.buyer_address) as uniq_buyers,
  	count(1) as num_sales,
  	sum(price_usd) as usd_volume
  FROM ethereum.core.ez_nft_sales s
  INNER JOIN moonbirds_minters mm ON mm.addr = s.buyer_address
  WHERE
      block_timestamp >= GETDATE() - interval'30 days'
  GROUP BY 1,2
  ORDER BY 1 DESC
),
addresses as (
  SELECT
  	coalesce(sellers.addr, buyers.addr) as addr,
  	coalesce(sellers.project_name, buyers.project_name) as project_name
  FROM sellers
  LEFT OUTER JOIN buyers ON buyers.addr = sellers.addr
)
SELECT
    addresses.addr,
  	addresses.project_name,
	coalesce(addresses.project_name, addresses.addr) as project,
  	coalesce(s.uniq_sellers, 0) as uniq_sellers,
    coalesce(b.uniq_buyers, 0) as uniq_buyers,
  	coalesce(s.num_sales, 0) as sale_count,
  	coalesce(b.num_sales, 0) as buy_count,
	coalesce(s.num_sales, 0) + coalesce(b.num_sales, 0) as total_sale_count,
  	coalesce(s.usd_volume, 0) as sale_vol_usd,
  	coalesce(b.usd_volume, 0) as buy_vol_usd,
	coalesce(s.usd_volume, 0) + coalesce(b.usd_volume, 0) as total_vol_usd
FROM addresses 
LEFT OUTER JOIN buyers b ON b.addr = addresses.addr
LEFT OUTER JOIN sellers s ON s.addr = addresses.addr
order by 9 desc