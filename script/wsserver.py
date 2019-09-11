#!/usr/bin/env python

# WS server example

import asyncio
import json
import time
from random import Random

import websockets

teams = ['0xAA', '0xBB', '0xCC', '0xDD', '0xEE']
rando = Random()


async def hello(websocket, path):
    # name = await websocket.recv()
    # print(f"< {name}")
    #
    # greeting = f"Hello {name}!"
    #
    # await websocket.send(greeting)
    # print(f"> {greeting}")
    tx_hashes = []
    txs = {}
    # send sequencer first
    height = 1

    while True:
        if len(tx_hashes) != 0:
            parent_hash = [str(x) for x in set([rando.choice(tx_hashes) for c in range(2)])]
        else:
            parent_hash = []
        t = rando.random()
        if t < 0.05:
            parent_hash = tx_hashes
            tx = {
                'type': 1,  # seq
                'hash': str(rando.randint(0, 1000000)),
                'parent_hash': parent_hash,
                'nonce': 0,
                'treasure': rando.randint(0, 200000),
                'value': 0,
                'height': height,
                'weight': max([txs[x]['weight'] for x in parent_hash]) + 1 if len(parent_hash) != 0 else 0,
            }
            height += 1
            tx_hashes = []
            txs = {}
        else:
            tx = {
                'type': 0,  # tx
                'hash': str(rando.randint(0, 1000000)),
                'parent_hash': parent_hash,
                'from': rando.choice(teams),
                'to': rando.choice(teams),
                'guarantee': rando.randint(0, 200000),
                'nonce': 0,
                # 'height': height,
                'weight': max([txs[x]['weight'] for x in parent_hash]) + 1 if len(parent_hash) != 0 else 0,
            }

        tx_hashes.append(tx['hash'])
        txs[tx['hash']] = tx
        await websocket.send(json.dumps(tx))
        time.sleep(0.1)


if __name__ == '__main__':
    start_server = websockets.serve(hello, "localhost", 8765)

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
