
import * as mongo from 'mongo-local-db'

import SqrmDocument from './SqrmDocument.js'
import SqrmRequest from './SqrmRequest.js'
import SqrmResponse from './SqrmResponse.js'
import sxastParser from './sxast-parser.js';
import responseToResult from './response-to-result.js';

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
    }
  
    createCollection(name) {
        this.db.createCollection(name)
        let info = { name: name, docs: new Map(), docsBy_id: new Map() }
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

            let doc = new SqrmDocument(collection,docName,sxasts[0],this)
            col.docs.set(docName,doc)

            const createdDoc = { collection: collection, document: docName }

            let request = new SqrmRequest();
            let response = new SqrmResponse(this);

            // generate output
            doc.execute(request,response);
            const res = responseToResult(response,this.settings)
            const mongoDoc = Object.assign({},res.json)
            mongoDoc._text = res.text

            // add to mongo
            this.db[doc.collection].insertOne(mongoDoc)
            doc._id = mongoDoc._id
            this.collections.get(doc.collection).docsBy_id.set(mongoDoc._id,doc)

            createdDoc.html = res.html
            createdDoc.json = res.json

            return createdDoc

        } else {
            const createdDocs = { docs: [] }

            for (let i=0 ; i<sxasts.length ; i++) {
                let sxast = sxasts[i]
    
                const dn = `${docName}-${i+1}`

                let doc = new SqrmDocument(collection,dn,sxast,this)
                col.docs.set(dn,doc)
                const createdDoc = { collection: collection, document: dn }

                let request = new SqrmRequest();
                let response = new SqrmResponse(this);

                // generate output
                doc.execute(request,response);
                const res = responseToResult(response,this.settings)
                const mongoDoc = Object.assign({},res.json)
                mongoDoc._text = res.text

                // add to mongo
                this.db[doc.collection].insertOne(mongoDoc)
                doc._id = mongoDoc._id
                this.collections.get(doc.collection).docsBy_id.set(mongoDoc._id,doc)

                createdDoc.html = res.html
                createdDoc.json = res.json

                createdDocs.docs.push(createdDoc)
            }

            return createdDocs
        }

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