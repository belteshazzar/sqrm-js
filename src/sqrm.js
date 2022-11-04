

import {toHtml} from 'hast-util-to-html'

import SqrmDocument from './SqrmDocument.js';
import SqrmRequest from './SqrmRequest.js';
import SqrmResponse from './SqrmResponse.js';
import sastToHast from './sast-to-hast.js';
import toJson from './jast-to-json.js'
import SqrmCollection from './SqrmCollection.js'
import sxastParser from './sxast-parser.js';

export default function sqrm(src, _options = {}) {

    const defaults = {
        collection: new SqrmCollection(),
        id: 'doc',
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
    const options = Object.assign({}, defaults, _options);

    const sxasts = sxastParser(src,options)

    let result = []

    for (let i=0 ; i<sxasts.length ; i++) {

        let sxast = sxasts[i]

        let doc = new SqrmDocument(options.collection,`${options.id}-${i+1}`,sxast,options);

        let request = new SqrmRequest([]);
        let response = new SqrmResponse(options.collection);

        doc.execute(request,response);

        let sast = response.root
        
        if (options.log_sast) {
            console.log('= sast =================')
            console.log(sast);
        }

        let hast = sastToHast(sast)
        response.hastCallbacks.forEach((cb) => {
            cb.call(null,hast)
        })

        if (options.log_hast) {
            console.log('= hast =================')
            console.log(hast);
        }

        let html = toHtml(hast)

        if (options.log_html) {
            console.log('= html =================')
            console.log(html)
        }

        let jast = response.jsonTree

        if (options.log_jast) {
            console.log('= jast =================')
            console.log(jast);
        }

        let json = toJson(jast)
        if (json==null) json = {}

        if (options.log_json) {
            console.log('= json =================')
            console.log(json);
        }

        result.push({ html: html, json: json })
    }

    if (result.length==1) {
        return result[0]
    } else {
        return result
    }
}