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
    date_trunc('day', s.block_timestamp) AS date,
  	s.nft_address as addr,
  	s.project_name,
  	count(distinct s.seller_address) as uniq_sellers,
  	count(1) as num_sales,
  	sum(price_usd) as usd_volume
  FROM ethereum.core.ez_nft_sales s
  INNER JOIN moonbirds_minters mm ON mm.addr = s.seller_address
  WHERE
      block_timestamp >= GETDATE() - interval'30 days'
  GROUP BY 1,2,3
  ORDER BY 1 DESC
),
buyers as (
  SELECT
    date_trunc('day', s.block_timestamp) AS date,
  	s.nft_address as addr,
  	s.project_name,
  	count(distinct s.buyer_address) as uniq_buyers,
  	count(1) as num_sales,
  	sum(price_usd) as usd_volume
  FROM ethereum.core.ez_nft_sales s
  INNER JOIN moonbirds_minters mm ON mm.addr = s.buyer_address
  WHERE
      block_timestamp >= GETDATE() - interval'30 days'
  GROUP BY 1,2,3
  ORDER BY 1 DESC
),
addresses as (
  SELECT
    coalesce(sellers.date, buyers.date) as date,
  	coalesce(sellers.addr, buyers.addr) as addr,
  	coalesce(sellers.project_name, buyers.project_name) as project_name
  FROM sellers
  LEFT OUTER JOIN buyers ON buyers.addr = sellers.addr AND buyers.date = sellers.date
)
SELECT
    dd.date_day,
	-- addresses.date,
    addresses.addr as project_addr,
  	addresses.project_name,
  	s.uniq_sellers,
    b.uniq_buyers,
  	s.num_sales as sale_count,
  	b.num_sales as buy_count,
  	s.usd_volume as sale_vol_usd,
  	b.usd_volume as buy_vol_usd
FROM addresses 
LEFT OUTER JOIN buyers b ON b.addr = addresses.addr AND b.date = addresses.date
LEFT OUTER JOIN sellers s ON s.addr = addresses.addr AND s.date = addresses.date
LEFT OUTER JOIN ethereum.core.dim_dates dd ON dd.date_day = addresses.date
order by 4 desc