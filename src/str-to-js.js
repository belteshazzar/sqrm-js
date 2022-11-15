

//import * as acorn from 'acorn'
import JSON5 from 'json5'
//import { parse } from 'node:path'
import util from 'node:util'

import * as acorn from 'acorn'

import * as walk from "acorn-walk"

// Could be in ticks so that we can have \n's but we dont want template
// replacements so using double quotes (escape double quotes and new lines)
// https://gist.github.com/getify/3667624
function escape(str) {
	str = str.replace(/\\([\s\S])|(")/g,"\\$1$2");
	str = str.replace(/\\([\s\S])|(\n)/g,"\\$1$2");
    return `"${str}"`
}

export default function strToJs(str,throwOnInvalid = false) {

    try {
        const node = acorn.parse('[' + str + ']', {ecmaVersion: 2020})

        // this is the simplest case that doesn't need to be wrapped
        // TODO: detect more cases
        if (node.body[0].expression.elements[0].type == 'Literal') {
            return `[${str}]`
        } else {
            return `(()=>{try{return [${str}]}catch(e){return [${escape(str)}]}})()`
        }
    } catch (e) {
        if (throwOnInvalid) {
            throw e
        } else {
            return `[${escape(str)}]`
        }
    }
}
