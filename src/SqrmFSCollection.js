
import fs from 'node:fs'
import mongo from 'mongols'

import SqrmDocument from './SqrmDocument.js'
import SqrmRequest from './SqrmRequest.js'
import SqrmResponse from './SqrmResponse.js'
import SqrmCollection from './SqrmCollection.js'
import sxastParser from './sxast-parser.js';
import responseToResult from './response-to-result.js';

export default class SqrmFSCollection extends SqrmCollection {

     constructor(folder = '.',options) {
        super()
        this.folder = folder;
        this.options = options;
        this.docs = new Map()
        this.docsBy_id = new Map()

        this.db = new mongo.DB()
        this.db.createCollection("collection")

        const docNames = fs.readdirSync(folder).map((f) => f.split('.'))
            .filter((el) => {
                return el[1] == "sqrm"
            })
            .map((el) => {
                return el[0]
            })
            .sort((a,b) => {
                a[0].localeCompare(b[0])
            });

        docNames.forEach((name) => {

            const src = fs.readFileSync(`${this.folder}/${name}.sqrm`).toString()
            const sxasts = sxastParser(src,options)
        
            if (sxasts.length==1) {
                try {
                    let doc = new SqrmDocument(this,name,sxasts[0],options)
                    this.docs.set(name,doc)
                } catch (e) {
                    console.log('failed to create doc',e)
                }
            } else {
                for (let i=0 ; i<sxasts.length ; i++) {
                    let sxast = sxasts[i]
        
                    try {
                        let doc = new SqrmDocument(this,`${name}-${i+1}`,sxast,options)
                        this.docs.set(name,doc)
                    } catch (e) {
                        console.log('failed to create multi doc',e)
                    }
                }
            }
        });

        this.docs.forEach((doc,name) => {

            let request = new SqrmRequest();
            let response = new SqrmResponse(this);

            try {
                doc.execute(request,response);
                const res = responseToResult(response,this.options)
                this.db.collection.insertOne(res.json)
                this.docsBy_id.set(res.json._id,doc)
            } catch (e) {
                console.log(`!!! ERROR: failed to execute: ${name}`)
                console.log('!!! line:  ',e.lineNum)
                console.log('!!! line:  ',e.lineStr)
                console.log('!!! error: ',e.stack.split('\n')[0]);
            }

        })
    }

    call(name,args) {
        let request = new SqrmRequest(args);
        let response = new SqrmResponse(this);
        let doc = this.find(name)
        if (doc == null) {
            console.log(`-- failed to call ${name}(${args}) : not found --`)
            return
        }
        try {
            doc.execute(request,response);
        } catch (e) {
            console.log(`-- failed to call ${name}(${args}) : script error --`)
            console.log(e);
            console.log('---------------------------------------')
        }

        return responseToResult(response,this.options)

    }

    find(select,sort,skip,limit) {

        if (typeof select == "string") {

            return this.docs.get(select)

        } else if (typeof select == 'object' && select == Object(select)) {

            let c = this.db.collection.find(select)

            if (sort !== undefined) {
                c = c.sort(sort)

                if (skip !== undefined) {
                    c = c.skip(skip)

                    if (limit !== undefined) {
                        c = c.limit(limit)
                    }
                }
            }

            let res = [];

            c.forEach(doc => {
                res.push(this.docsBy_id.get(doc._id))
            })

            return res
        }
    }
}