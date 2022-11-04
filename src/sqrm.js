

import SqrmDocument from './SqrmDocument.js';
import SqrmRequest from './SqrmRequest.js';
import SqrmResponse from './SqrmResponse.js';
import SqrmCollection from './SqrmCollection.js'
import sxastParser from './sxast-parser.js';
import responseToResult from './response-to-result.js';

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

        result.push(responseToResult(response,options))
    }

    if (result.length==1) {
        return result[0]
    } else {
        return result
    }
}