export class Tx {
    public id: string;
    public type: string;
    public owner: string;
    public bet: number;
    public parents: string[];

    constructor(id: string, type: string, owner: string, bet: number, parents: string[]) {
        this.id = id;
        this.type = type;
        this.owner = owner;
        this.bet = bet;
        this.parents = parents;
    }
}

export function getSeqData(height: number): Tx[] {
    return [
        {
            id: '0x1',
            type: 's',
            owner: '0xDDCCBBAA',
            bet: 500,
            parents: [],
        },
        {
            id: '0x2',
            type: 'tx',
            owner: '0xDDCCBBAA',
            bet: 500,
            parents: ['0x1'],
        },
        {
            id: '0x3',
            type: 'tx',
            owner: '0xDDCCBBAA',
            bet: 500,
            parents: ['0x1', '0x2'],
        },
        {
            id: '0x4',
            type: 's',
            owner: '0xDDCCBBAA',
            bet: 500,
            parents: ['0x2', '0x3'],
        },
    ];
}
