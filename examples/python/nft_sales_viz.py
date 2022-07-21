import os
import argparse

from pick import pick
import matplotlib.pyplot as plt

from shroomdk import ShroomDK


API_KEY = os.environ.get("SHROOMDK_API_KEY")
BASE_URL = "https://api.flipsidecrypto.com"


def get_nft_collection(name: str):
    sdk = ShroomDK(API_KEY, BASE_URL)
    sql = f"""
    select 
        distinct project_name, nft_address 
    from ethereum.core.ez_nft_sales 
    where lower(project_name) like '%{name.lower()}%' and block_timestamp >= getdate() - interval'48 hours'
    order by project_name ASC
    """
    results = sdk.query(sql)
    if len(results.rows) == 0:
        return None

    choice = pick(
        [f'{row[0]} ({row[1]})' for row in results.rows], 
        'Choose a collection: ', 
        indicator='=>', 
        default_index=0
    )
    return results.records[choice[0][1]]


def get_nft_sale_history(nft_address: str):
    sdk = ShroomDK(API_KEY, BASE_URL)
    sql = f"""
    SELECT
        date_trunc('day', block_timestamp) AS date,
        avg(price) as avg_hourly_eth_price,
        
        count(1) as num_sales
    FROM ethereum.core.ez_nft_sales 
    WHERE 
        nft_address = LOWER('{nft_address}')
        AND block_timestamp >= GETDATE() - interval'90 days'
    GROUP BY 1
    ORDER BY 1 ASC
    """
    results = sdk.query(sql)
    print(f"retrieved {results.run_stats.record_count} rows in {results.run_stats.elapsed_seconds} seconds")
    return results


def plot(query_result_set, collection):
    import plotly.graph_objects as go

    z = []
    for row in query_result_set.rows:
        zr = []
        for row2 in query_result_set.rows:
            if row[0] == row2[0]:
                zr.append(row2[2])
            else:
                zr.append(0)
        z.append(zr)

    fig = go.Figure(go.Surface(
        x = [row[0].replace("2022-", "")[:-7] for row in query_result_set.rows],
        y = [row[1] for row in query_result_set.rows],
        z = z))

    fig.update_layout(
            scene = {
                "xaxis": {"nticks": 20},
                "zaxis": {"nticks": 5},
                'camera_eye': {"x": 0, "y": -1, "z": 0.5},
                "aspectratio": {"x": 1, "y": 1, "z": 0.2}
            })

    fig.show()


def run(lookup_id: str):
    # If the user provides a name for the collection
    # search for the nft address
    if '0x' not in lookup_id:
        collection = get_nft_collection(lookup_id)
        if not collection:
            print("No collection found. Try a different name.")
            return
    else:
        collection = {"project_name": "unknown", "nft_address": lookup_id}

    print(f"fetching nft sales data for `{collection.get('project_name')}` @ `{collection.get('nft_address')}`")

    # Get the nft sale history
    results = get_nft_sale_history(collection.get('nft_address'))

    # Plot the results
    if results.rows and len(results.rows) > 0:
        plot(results, collection)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Retrieve NFT Sales.')
    parser.add_argument('collection_name', type=str,  help='NFT Collection Name')
    args = parser.parse_args()
    run(args.collection_name)
