
import sxastToJs from './sxast-to-js.js'
import SqrmRequest from './SqrmRequest.js'
import SqrmResponse from './SqrmResponse.js'

export default class SqrmDocument {
    
    constructor(collection,id,sxast,options) {
        this.collection = collection
        this.id = id
        this.options = options;

        const js = sxastToJs(sxast)
    
        if (options.log_code) {
            console.log('= js =============')
            console.log(js)
        }

        this.fn = null
        try {
            this.fn = new Function(js);
        } catch (e) {
            throw e
        }
    }

    execute(request,response) {
        if (this.fn == null) return

        if (arguments.length == 0) {
            request = new SqrmRequest();
            response = new SqrmResponse(this.collection);
        }

        this.fn(request,response)

        return response
    }
}
