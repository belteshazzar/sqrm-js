
import fs from 'node:fs'

import SqrmDB from './SqrmDB.js'

export default class SqrmFolderDB extends SqrmDB {

     constructor(settings) {
        super(settings)

        const collectionNames = fs.readdirSync(this.settings.folder,{ withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)

        collectionNames.forEach(collection => {
            let {docs,docsBy_id} = this.createCollection(collection)
    
            const docNames = fs.readdirSync(`${this.settings.folder}/${collection}`).map((f) => f.split('.'))
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
                const src = fs.readFileSync(`${this.settings.folder}/${collection}/${docName}.sqrm`).toString()
                this.createDocument(collection,docName,src)
            });
        })
    }
}