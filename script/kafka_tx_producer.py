import json
import time

from tx_generator import iter_tx

if __name__ == '__main__':
    from kafka import KafkaConsumer, KafkaProducer

    producer = KafkaProducer(bootstrap_servers=['47.100.222.11:30000'])

    for tx in iter_tx(1, False, False):
        ss = json.dumps(tx)
        # ss += '\0'
        # producer.send('tech-tech-anlink-web-gateway-201907101551', bytes(ss, 'utf-8'))
        producer.send('hack-final-test', bytes(ss, 'utf-8'))
        producer.flush()
        print(ss)
        time.sleep(1)
