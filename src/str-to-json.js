

import * as acorn from 'acorn'
import JSON5 from 'json5'
import util from 'node:util'

export default function strToJson(str) {

    let jsonStr = '{value:[' + str + ']}'
    try {
        let obj = JSON5.parse(jsonStr);
        let v = true

        // if (obj !== null) {
            if (obj.value.length==0) {
                v = true;
            } else if (obj.value.length==1) {
                v = obj.value[0]
            } else {
                v = tagValue.obj;
            }
        // }

        // console.log('---')
        // console.log(`strToJson("${str}") = ${util.inspect(v,false,null,true)}`)
        return v
    } catch (e) {
        // console.log('---')
        // console.log(`strToJson("${str}") = :(`)
        throw e;
    }

}