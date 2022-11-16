
import fs from 'node:fs'

import SqrmDocument from './SqrmDocument.js'
import SqrmRequest from './SqrmRequest.js'
import SqrmResponse from './SqrmResponse.js'
import SqrmDB from './SqrmDB.js'
import sxastParser from './sxast-parser.js';
import responseToResult from './response-to-result.js';

export default class SqrmFolderDB extends SqrmDB {

     constructor(settings) {
        super(settings)

        const collectionNames = fs.readdirSync(this.settings.folder,{ withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)

        collectionNames.forEach(collectionName => {
            let {docs,docsBy_id} = this.createCollection(collectionName)
    
            const docNames = fs.readdirSync(`${this.settings.folder}/${collectionName}`).map((f) => f.split('.'))
                .filter((el) => {
                    return el[1] == "sqrm"
                })
                .map((el) => {
                    return el[0]
                })
                .sort((a,b) => {
                    a[0].localeCompare(b[0])
                });

            docNames.forEach((docName) => {

                const src = fs.readFileSync(`${this.settings.folder}/${collectionName}/${docName}.sqrm`).toString()
                const sxasts = sxastParser(src,settings)
            
                if (sxasts.length==1) {
                    try {
                        let doc = new SqrmDocument(collectionName,docName,sxasts[0],this)
                        docs.set(docName,doc)
                    } catch (e) {
                        console.log('failed to create doc',e)
                    }
                } else {
                    for (let i=0 ; i<sxasts.length ; i++) {
                        let sxast = sxasts[i]
            
                        try {
                            let doc = new SqrmDocument(collectionName,`${docName}-${i+1}`,sxast,this)
                            docs.set(docName,doc)
                        } catch (e) {
                            console.log('failed to create multi doc',e)
                        }
                    }
                }
            });

            docs.forEach((doc,docName) => {

                let request = new SqrmRequest();
                let response = new SqrmResponse(this);

                try {
                    doc.execute(request,response);
                    const res = responseToResult(response,this.settings)
                    this.db[collectionName].insertOne(res.json)
                    docsBy_id.set(res.json._id,doc)
                } catch (e) {
                    console.log(`!!! ERROR: failed to execute: ${docName}`)
                    console.log('!!! line:  ',e.lineNum)
                    console.log('!!! line:  ',e.lineStr)
                    console.log('!!! error: ',e.stack.split('\n')[0]);
                    console.log(e)
                }

            })
        })
    }

    call(collectionName,docName,args) {
        let request = new SqrmRequest(args);
        let response = new SqrmResponse(this);
        let doc = this.find(collectionName,docName)
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

    find(collectionName,select,sort,skip,limit) {

        if (typeof collectionName != "string") {
            throw new Error('collection parameter should be string name of collection')
        }

        const collection = this.collections.get(collectionName)
        if (collection == null) {
            throw new Error(`collection "${collectionName}" doesn't exist`)
        }

        if (typeof select == "string") {

            return collection.docs.get(select)

        } else if (typeof select == 'object' && select == Object(select)) {

            let c = this.db[collectionName].find(select)

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
                res.push(collection.docsBy_id.get(doc._id))
            })

            return res
        } else {

            return []
        }
    }
}