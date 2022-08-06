
import {h} from 'hastscript'
import {t} from './hastscript-tools.js'

export default class SqrmRequest {

    constructor(collection, args = []) {
        this.docs = collection
        this.args = args;
       this.libs = {
            h: h,
            t: t
        };//, tree: new Tree(), util: util };
    }

}