
import SqrmDocument from './SqrmDocument.js';
import SqrmRequest from './SqrmRequest.js';
import SqrmResponse from './SqrmResponse.js';
import SqrmDB from './SqrmDB.js'
import sxastParser from './sxast-parser.js';
import responseToResult from './response-to-result.js';

export default function sqrm(src, db = new SqrmDB()) {


    const sxasts = sxastParser(src,db.settings)

    let result = []

    for (let i=0 ; i<sxasts.length ; i++) {

        let sxast = sxasts[i]

        let doc = new SqrmDocument(db.settings.collection,`${db.settings.name}-${i+1}`,sxast,db);

        let request = new SqrmRequest([]);
        let response = new SqrmResponse(db);

        doc.execute(request,response);

        result.push(responseToResult(response,db.settings))
    }

    if (result.length==1) {
        return result[0]
    } else {
        return result
    }
}