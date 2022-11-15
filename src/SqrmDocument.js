
import sxastToJs from './sxast-to-js.js'

export default class SqrmDocument {
    
    // constructor(fn, _options) {
    constructor(collection,id,sxast,options) {
        this.collection = collection
        this.id = id
        this.options = options;

        this.js = sxastToJs(sxast)
    
        if (options.log_code) {
            console.log('= js =============')
            console.log(js)
        }

        this.fn = null
        try {
            this.fn = new Function(this.js);
        } catch (e) {
            console.log(`failed to create doc ${id}`)
            console.log(this.js.split('\n')[37])
            throw e
        }
    }

    execute(request,response) {
        if (this.fn == null) return
        this.fn(request,response)
    }
}
