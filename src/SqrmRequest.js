
import {h} from 'hastscript'
import {t} from './hastscript-tools.js'

export default class SqrmRequest {

    constructor(collection, args = []) {
        this.docs = collection
        this.args = args;
       this.libs = {
            h: h,
            t: t,
            include: this.include
        };//, tree: new Tree(), util: util };
    }

    include(doc,args) {
        console.error(arguments)
    }

}