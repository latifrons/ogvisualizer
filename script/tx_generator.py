from random import Random

teams = ['0xAA', '0xBB', '0xCC', '0xDD', '0xEE']
rando = Random()
bet = [rando.randint(0, 10) for x in range(30)] + \
      [rando.randint(10, 100) for x in range(30)] + \
      [rando.randint(100, 1000) for x in range(30)] + \
      [rando.randint(1000, 10000) for x in range(30)] + \
      [rando.randint(10000, 100000) for x in range(30)] + \
      [rando.randint(100000, 1000000) for x in range(30)]


def iter_tx(start_height=1, start_with_seq=False, end_with_seq=False):
    tx_hashes = []
    txs = {}
    # send sequencer first
    height = start_height

    started = True
    if start_with_seq:
        started = False
    ended = False

    while not ended:
        if len(tx_hashes) != 0:
            parent_hash = [str(x) for x in set([rando.choice(tx_hashes) for c in range(2)])]
        else:
            parent_hash = []
        t = rando.random()
        if t < 0.05 or not started:
            if started and end_with_seq:
                ended = True
            started = True

            parent_hash = tx_hashes
            tx = {
                'type': 1,  # seq
                'hash': str(rando.randint(0, 1000000)),
                'parent_hash': parent_hash,
                'nonce': 0,
                'treasure': rando.choice(bet),
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
                'guarantee': rando.choice(bet),
                'nonce': 0,
                # 'height': height,
                'weight': max([txs[x]['weight'] for x in parent_hash]) + 1 if len(parent_hash) != 0 else 0,
            }
        tx_hashes.append(tx['hash'])
        txs[tx['hash']] = tx
        yield tx
