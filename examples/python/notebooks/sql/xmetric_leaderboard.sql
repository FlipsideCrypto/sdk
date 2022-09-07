WITH sent_tokens AS (
  SELECT 
    to_address as Participant,
    sum(raw_amount/pow(10,18)) as xMETRIC
  FROM polygon.core.fact_token_transfers
  WHERE
    block_timestamp::date > '2022-07-10'::date 
    AND contract_address = lower('0x15848C9672e99be386807b9101f83A16EB017bb5')
    AND to_address != lower('0x4b8923746a1D9943bbd408F477572762801efE4d')
  GROUP BY 1
),
burnt_tokens AS (
  SELECT
    to_address as Participant,
    sum(raw_amount/pow(10,18)) as xMETRIC
  FROM polygon.core.fact_token_transfers
  WHERE
    block_timestamp::date > '2022-07-10'::date 
    AND contract_address = lower('0x15848C9672e99be386807b9101f83A16EB017bb5')
    AND to_address = lower('0x0000000000000000000000000000000000000000')
  GROUP BY 1
)
SELECT
  sent_tokens.Participant as "participant_addr",
  coalesce(sent_tokens.xmetric,0) - coalesce(burnt_tokens.xMETRIC,0) as "balance"
FROM sent_tokens 
LEFT JOIN burnt_tokens ON sent_tokens.Participant = burnt_tokens.Participant
ORDER BY 2 DESC