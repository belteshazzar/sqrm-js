

//import * as acorn from 'acorn'
import JSON5 from 'json5'
//import { parse } from 'node:path'
import util from 'node:util'

import * as acorn from 'acorn'

import * as walk from "acorn-walk"


export default function strToJs(str,throwOnInvalid) {

    function parse() {
        try {
            const node = acorn.parse('[' + str + ']', {ecmaVersion: 2020})
            return str
        } catch (e) {
            if (throwOnInvalid) {
                throw e
            } else {
                return `"${str}"`
            }
        }
    }

    const args = parse()
    // Could be in ticks so that we can have \n's but we dont want template
    // replacements so using double quotes (escape double quotes and new lines)
    const escapedArgs = args.replaceAll('"','\\"').replaceAll('\n','\\n')
    return '(()=>{try{return ['+args+']}catch(e){return ["'+escapedArgs+'"]}})()'
}
