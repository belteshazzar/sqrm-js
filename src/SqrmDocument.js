
import {sxastToJs,sxastToDebugJs,sxastToTextJs} from './sxast-to-js.js'
import SqrmRequest from './SqrmRequest.js'
import SqrmResponse from './SqrmResponse.js'
import * as acorn from 'acorn'

export default class SqrmDocument {
    
    constructor(collection,name,sxast,db) {
        this.collection = collection
        this.name = name
        this.db = db;

        const js = sxastToJs(collection,name,sxast)

        this.fn = null
        try {
            this.fn = new Function(js);

            if (this.db.settings.log_code) {
                console.log('= js =============')
                console.log(js)
            }
    
        } catch (e) {

            // an error occured compiling the template
            //
            // the information from this js runtime isn't very
            // useful for the user as it exposes the call stack
            // of this code, rather than the users template code
            //
            // so we parse with acorn and get that error, but ...
            // it can be a different error but in the same 
            // location so its so useful
            //
            // do we throw an error or return the raw text?
            //
            // in the spirit of markdown where every document is
            // a valid document we return the raw text

            // which this isn't doing at the moment!

            try {
                const debugJs = sxastToDebugJs(sxast)
                const node = acorn.parse(debugJs, {ecmaVersion: 2020})
            } catch (e) {
                const errorMessage = e.message.replace(/\([0-9]+:[[0-9]+\)/,'')
                // -1 for 1 based line number in error
                // -21 for number of extra lines in function
                const errorLine = e.loc.line// - 14// TODO: magic number
                // -1 for 1 based column number in error
                const errorColumn = e.loc.column// - 1

                const errJs = sxastToTextJs(collection,name,sxast,{errorMessage,errorLine,errorColumn})

                try {
                    this.fn = new Function(errJs);            

                    if (this.db.settings.log_code) {
                        console.log('= js =============')
                        console.log(errJs)
                    }

                } catch (e) {
                    // this should NOT occur, something really went wrong
                    throw e
                }
            }
        }
    }

    execute(request,response) {
        if (this.fn == null) return

        if (arguments.length == 0) {
            request = new SqrmRequest();
            response = new SqrmResponse(this.db);
        }

        try {
            this.fn(request,response)
        } catch (e) {
            // this is handled in the doc scripts try/catch
            // it is re-thrown so includes can handle it
            // this can be ignored
        }

        return response
    }

    getIndexedJson() {
        const doc = this.db.db[this.collection].findOne({ _id: this._id })
        const res = Object.assign({},doc)
        delete res._id
        delete res._text
        return res
    }

    getIndexedText() {
        const doc = this.db.db[this.collection].findOne({ _id: this._id })
        return doc._text
    }
}
