

//import * as acorn from 'acorn'
import JSON5 from 'json5'
//import { parse } from 'node:path'
import util from 'node:util'

import * as acorn from 'acorn'

import * as walk from "acorn-walk"
import quote from './quoted-string.js'

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
