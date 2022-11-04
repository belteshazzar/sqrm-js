
import {expect} from 'chai';


import {h} from 'hastscript'
import {t} from '../src/hastscript-tools.js'
import sqrm from '../src/sqrm.js'
import SqrmFSCollection from '../src/SqrmFSCollection.js';


describe("file system collection tests", function() {

    describe("single folder", function() {

        it("file system collection", function() {

            const c = new SqrmFSCollection('./collection')

            // const result = sqrm(source,{
            //     collection: new SqrmFSCollection('./collection'),
                
            //     log_src: process.env.npm_config_src,
            //     log_lines: process.env.npm_config_lines,
            //     log_sxast: process.env.npm_config_sxast,
            //     log_code: process.env.npm_config_code,
    
            //     log_sast: process.env.npm_config_sast,
            //     log_hast: process.env.npm_config_hast,
            //     log_html: process.env.npm_config_html,
            //     log_jast: process.env.npm_config_jast,
            //     log_json: process.env.npm_config_json,
            // })
    
            // let html,json
    
            // if (Array.isArray(result)) {
    
            //     html = ''
            //     json = []
    
            //     result.forEach((el) => {
            //         html += el.html
            //         json.push(el.json)
            //     })
    
            // } else {
            //     html = result.html
            //     json = result.json
            // }
    
            // expect(json).to.eql(expectedJson)
            // expect(html).to.eql(expectedHtml);
        })
    })
})
    