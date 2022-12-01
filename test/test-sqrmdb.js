
import fs from 'fs'
import {expect} from 'chai';
import SqrmDB from '../src/SqrmDB.js';

describe("sqrmdb tests", function() {

    describe("sqrmdb - basic", function() {

        it("sqrmdb - basic tests", function() {

            const options = {
                log_src: process.env.npm_config_src == 'true',
                log_lines: process.env.npm_config_lines == 'true',
                log_sxast: process.env.npm_config_sxast == 'true',
                log_code: process.env.npm_config_code == 'true',
        
                log_sast: process.env.npm_config_sast == 'true',
                log_hast: process.env.npm_config_hast == 'true',
                log_html: process.env.npm_config_html == 'true',
                log_jast: process.env.npm_config_jast == 'true',
                log_json: process.env.npm_config_json == 'true'
            };

            const db = new SqrmDB(options)
            expect(db).to.not.be.null

            const src = fs.readFileSync('./test/sqrmdb/example.sqrm').toString()
            expect(src).to.not.be.null

            const res = db.createDocument('default','document',src)
            expect(res).to.not.be.null
            expect(res.error).to.be.undefined
            expect(res.docs).to.not.be.null
            expect(res.docs.length).to.equal(5)

            const collectionNames = db.getCollectionNames()
            expect(collectionNames).to.not.be.null
            expect(collectionNames).to.deep.equal(['default'])

            const all = db.find('default')
            expect(all).to.not.be.null
            expect(all.length).to.equal(5)

            const doc5 = db.find('default','document-5')
            expect(doc5).to.not.be.undefined
            expect(doc5.collection).to.equal('default')
            expect(doc5.name).to.equal('document-5')

            expect(doc5.getIndexedJson()).to.deep.equal({})
            expect(doc5.getIndexedText()).to.equal('This is an example of multiple docs in a single file.\nList of people younger than 70:\nbob = 56\nsteve = 42\n')
        })
    })
})
    