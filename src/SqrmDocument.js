
import sxastToJs from './sxast-to-js.js'
import SqrmRequest from './SqrmRequest.js'
import SqrmResponse from './SqrmResponse.js'

export default class SqrmDocument {
    
    constructor(collection,name,sxast,db) {
        this.collection = collection
        this.name = name
        this.db = db;

        const js = sxastToJs(collection,name,sxast)
    
        if (this.db.settings.log_code) {
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
            response = new SqrmResponse(this.db);
        }

        this.fn(request,response)

        return response
    }
}
