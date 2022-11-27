
import SqrmDocument from './SqrmDocument.js';
import SqrmRequest from './SqrmRequest.js';
import SqrmResponse from './SqrmResponse.js';
import SqrmDB from './SqrmDB.js'
import sxastParser from './sxast-parser.js';
import responseToResult from './response-to-result.js';

export default function sqrm(src, db = new SqrmDB()) {

    return db.createDocument('default','document',src)
    // console.log('sqrm.res',res)
    
    // let result = []

    // const f = db.find('default')

    // if (Array.isArray(f)) {

    //     f.forEach((doc) => {
    //         let request = new SqrmRequest([]);
    //         let response = new SqrmResponse(db);
    //         doc.execute(request,response)
    //         result.push(responseToResult(response,db.settings))    
    //     })

    // } else {
    //     console.log(f)
    //     let request = new SqrmRequest([]);
    //     let response = new SqrmResponse(db);
    //     f.execute(request,response)
    //     result.push(responseToResult(response,db.settings))
    // }

    // if (result.length==1) {
    //     return result[0]
    // } else {
    //     return result
    // }
}