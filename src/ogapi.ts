export class Tx {
    public id: string;
    public type: string;
    public owner: string;
    public bet: number;
    public parents: string[];
    public weight: number = 0;

    constructor(id: string, type: string, owner: string, bet: number, parents: string[], weight: number) {
        this.id = id;
        this.type = type;
        this.owner = owner;
        this.bet = bet;
        this.parents = parents;
        this.weight = weight;
    }

    static parse(data: string):Tx|null{
        let obj = JSON.parse(data);
        switch(obj['type']){
            case 0: // Tx
                return new Tx(obj['hash'], obj['type'], obj['from'], obj['guarantee'], obj['parent_hash'], obj['weight']);
            case 1: // Seq
                return new Tx(obj['hash'], obj['type'], "sequencer", obj['treasure'], obj['parent_hash'], obj['weight']);
        }
        return null;
    }
}

export function getSeqData(height: number): Tx[] {
    return [
        {
            id: '0x1',
            type: 's',
            owner: '0xAA',
            bet: 50,
            parents: [],
            weight: 0,
        },
        {
            id: '0x2',
            type: 'tx',
            owner: '0xBB',
            bet: 100,
            parents: ['0x1'],
            weight: 1,
        },
        {
            id: '0x3',
            type: 'tx',
            owner: '0xCC',
            bet: 150,
            parents: ['0x1', '0x2'],
            weight: 2,
        },
        {
            id: '0x4',
            type: 's',
            owner: '0xDD',
            bet: 200,
            parents: ['0x2', '0x3'],
            weight: 3,
        },
    ];
}
