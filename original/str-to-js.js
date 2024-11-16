

import * as acorn from 'acorn'
import quote from '../original/quoted-string.js'

export default function strToJs(str,throwOnInvalid = false) {

    try {
        const node = acorn.parse('[' + str + ']', {ecmaVersion: 2020})

        // this is the simplest case that doesn't need to be wrapped
        // TODO: detect more cases
        if (node.body[0].expression.elements[0].type == 'Literal') {
            return `[${str}]`
        } else {
            return `(()=>{try{return [${str}]}catch(e){return [${quote(str)}]}})()`
        }
    } catch (e) {
        if (throwOnInvalid) {
            throw e
        } else {
            return `[${quote(str)}]`
        }
    }
}
