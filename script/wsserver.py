#!/usr/bin/env python

# WS server example

import asyncio
import json
import time
import websockets

from tx_generator import iter_tx


async def hello(websocket, path):
    for tx in iter_tx():
        await websocket.send(json.dumps(tx))
        time.sleep(0.3)


if __name__ == '__main__':
    start_server = websockets.serve(hello, "localhost", 8765)

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
