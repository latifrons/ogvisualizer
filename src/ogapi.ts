import axios from 'axios'

export class Tx {
    public id: string;
    public type: number;
    public owner: string;
    public bet: number;
    public parents: string[];
    public weight: number = 0;
    public height: number = 0;

    constructor(id: string, type: number, owner: string, bet: number, parents: string[],
                weight: number, height: number) {
        this.id = id;
        this.type = type;
        this.owner = owner;
        this.bet = bet;
        this.parents = parents;
        this.weight = weight;
        this.height = height;
    }

    static parse(obj: any): Tx | null {
        switch (obj['type']) {
            case 0: // Tx
                return new Tx(obj['hash'], obj['type'], obj['from'], obj['guarantee'], obj['parents'], obj['weight'], 0);
            case 1: // Seq
                return new Tx(obj['hash'], obj['type'], "sequencer", obj['treasure'], obj['parents'], obj['weight'], obj['height']);
        }
        return null;
    }
}

type TxsCallback = (txs: Tx[]) => void;

export function getSeqData(ogHeight: number,token: string, callback: TxsCallback): Tx[] {
    let host = "http://47.100.122.212:30020";
    if (!host){
        console.warn("URL_API not found");
        return [];
    }

    axios.get(host + '/transactions?height=' + ogHeight + '&token=' + token).then(response => {
        let data = response.data.data;
        console.log(data);
        let txs: Tx[] = [];
        for (let txjson of data){
            let tx = Tx.parse(txjson);
            if (tx != null){
                txs.push(tx)
            }
        }
        callback(txs);
    });

    return []
    // return [
    //     {
    //         id: '0x1',
    //         type: 1,
    //         owner: '0xAA',
    //         bet: 50,
    //         parents: [],
    //         weight: 0,
    //         height: 0,
    //     },
    //     {
    //         id: '0x2',
    //         type: 0,
    //         owner: '0xBB',
    //         bet: 100,
    //         parents: ['0x1'],
    //         weight: 1,
    //         height: 0,
    //     },
    //     {
    //         id: '0x3',
    //         type: 0,
    //         owner: '0xCC',
    //         bet: 150,
    //         parents: ['0x1', '0x2'],
    //         weight: 2,
    //         height: 0,
    //     },
    //     {
    //         id: '0x4',
    //         type: 1,
    //         owner: '0xDD',
    //         bet: 200,
    //         parents: ['0x2', '0x3'],
    //         weight: 3,
    //         height: 0,
    //     },
    // ];
}
