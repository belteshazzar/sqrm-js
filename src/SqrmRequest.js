
import {h} from 'hastscript'
import {t} from './hastscript-tools.js'

export default class SqrmRequest {

    constructor(collection, args = []) {
        this.docs = collection
        this.args = args;
        this.lines = [];
        this.root = [];
        this.libs = {
            h: h,
            t: t,
            i: this.include,
            j: this.json,
            set: this.set,
            append: this.append.bind(this),
        };//, tree: new Tree(), util: util };
    }

    include(doc,args) {
        console.error(arguments)
    }

    json(name,value) {

        function set(obj,name,value) {
            if (obj[name] === undefined) {
                obj[name] = value
            } else if (Array.isArray(obj[name])) {
                obj[name].push(value)
            } else {
                obj[name] = [obj[name],value]
            }
            return obj[name]
        }

        let obj = this
        const ns = name.split('.')
        for (let i=0 ; i<ns.length-1 ; i++) {
            obj = obj[ns[i]]
        }
        set(obj,ns[ns.length-1],value)
    }

    append(ln) {
        this.lines.push(ln)
    }

    json(name,value) {

        function set(obj,name,value) {
            if (obj[name] === undefined) {
                obj[name] = value
            } else if (Array.isArray(obj[name])) {
                obj[name].push(value)
            } else {
                obj[name] = [obj[name],value]
            }
            return obj[name]
        }

        let obj = this
        const ns = name.split('.')
        for (let i=0 ; i<ns.length-1 ; i++) {
            obj = obj[ns[i]]
        }
        set(obj,ns[ns.length-1],value)
    }

}