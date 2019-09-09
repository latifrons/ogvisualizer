import {Tx} from "@/ogapi";

class TxSorter{
    static Sort(txs: Tx[]){
        let children : Record<string, Tx[]> = {};
        for (let tx of txs){
            for (let parent of tx.parents){
                let cr = children[parent];
                if (cr === undefined){
                    cr = [];
                }
                cr.push(tx);
                children[parent] = cr;
            }
        }

        let sorted : Tx[] = [];
        while (txs.length != sorted.length){
            return
        }
    }
}
