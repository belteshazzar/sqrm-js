
import mongo from 'mongols'


import SqrmDocument from './SqrmDocument.js'
import SqrmRequest from './SqrmRequest.js'
import SqrmResponse from './SqrmResponse.js'
import sxastParser from './sxast-parser.js';
import responseToResult from './response-to-result.js';

import flexsearch from "flexsearch";

const { Index, Document, Worker } = flexsearch
const options = {}

const defaults = {
    collection: 'default',
    name: 'doc',

    log_src: false,
    log_lines: false,
    log_sxast: false,
    log_code: false,

    log_sast: false,
    log_hast: false,
    log_html: false,
    log_jast: false,
    log_json: false
};

export default class SqrmDB {

    constructor(settings = {}) {
        this.settings = Object.assign({}, defaults, settings);
        this.settings.db = this
        this.collections = new Map()
        this.db = new mongo.DB()
        this.createCollection('default')
        this.docsToIndex = []
    }
  
    createCollection(name) {
        this.db.createCollection(name)
        let info = { name: name, docs: new Map(), docsBy_id: new Map(), textIndex: new Index(options) }
        this.collections.set(name,info)
        return info
    }

    getCollectionNames() {
        return this.db.getCollectionNames()
    }

    createDocument(collection,docName,src) {
        const col = this.collections.get(collection)
        const sxasts = sxastParser(src,this.settings)
        
        if (sxasts.length==1) {
            try {
                let doc = new SqrmDocument(collection,docName,sxasts[0],this)
                col.docs.set(docName,doc)
                this.docsToIndex.push(doc)
                return { collection: collection, document: docName }
            } catch (e) {
                return { error: `failed to create document: ${e.getMessage()}` }
            }
        } else {
            const res = { docs: [] }
            let errors = 0
            for (let i=0 ; i<sxasts.length ; i++) {
                let sxast = sxasts[i]
    
                try {
                    const dn = `${docName}-${i+1}`
                    let doc = new SqrmDocument(collection,dn,sxast,this)
                    col.docs.set(dn,doc)
                    this.docsToIndex.push(doc)
                    res.docs.push({ collection: collection, document: dn })
                } catch (e) {
                    res.docs.push({ error: `failed to create ${collection}/${dn}: ${e.getMessage()}` })
                    errors++
                }
            }
            if (errors>0) {
                res.error = `error occured creating ${errors} of ${sxasts.length} documents`
            }
            return res
        }

    }

    updateIndex() {
        this.docsToIndex.forEach((doc) => {
            let request = new SqrmRequest();
            let response = new SqrmResponse(this);
            try {
                // generate output
                doc.execute(request,response);
                const res = responseToResult(response,this.settings)

                // add to mongo
                this.db[doc.collection].insertOne(res.json)
                doc._id = res.json._id
                this.collections.get(doc.collection).docsBy_id.set(res.json._id,doc)

                // add to flex search index for collection
                this.collections.get(doc.collection).add(doc._id, res.html);
            } catch (e) {
                console.log(`!!! ERROR: failed to index: ${doc.collection}.${doc.name}`)
                console.log('!!! line:  ',e.lineNum)
                console.log('!!! line:  ',e.lineStr)
                if (e.stack) console.log('!!! error: ',e.stack.split('\n')[0]);
                else if (e['$err']) {
                    console.log(e)
                    console.log('!!! ',e['$err'])
                }
            }

        })
        this.docsToIndex = []
    }

    call(collection,docName,args) {
        let request = new SqrmRequest(args);
        let response = new SqrmResponse(this);
        let doc = this.find(collection,docName)
        if (doc == null) {
            console.log(`-- failed to call ${docName}(${args}) : not found --`)
            return
        }
        try {
            doc.execute(request,response);
        } catch (e) {
            console.log(`-- failed to call ${docName}(${args}) : script error --`)
            console.log(e);
            console.log('---------------------------------------')
        }

        return responseToResult(response,this.settings)

    }

    find(collection,select,sort,skip,limit) {

        function cursorToDocs(c) {
            let res = [];

            c.forEach(doc => {
                res.push(col.docsBy_id.get(doc._id))
            })

            return res
        }

        if (typeof collection != "string") {
            throw new Error('collection parameter should be string name of collection')
        }

        const col = this.collections.get(collection)

        if (col == null) {
            throw new Error(`collection "${collection}" doesn't exist`)
        }

        if (select == undefined) {
            return cursorToDocs(this.db[collection].find())
        } else if (typeof select == "string") {

            console.log(col.docs)
            return col.docs.get(select)
        } else if (typeof select == 'object' && select == Object(select)) {

            let c = this.db[collection].find(select)

            if (sort !== undefined) {
                c = c.sort(sort)

                if (skip !== undefined) {
                    c = c.skip(skip)

                    if (limit !== undefined) {
                        c = c.limit(limit)
                    }
                }
            }

            return cursorToDocs(c)
        } else {
            return []
        }
    } 
}