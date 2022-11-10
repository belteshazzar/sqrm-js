

//import * as acorn from 'acorn'
import JSON5 from 'json5'
//import { parse } from 'node:path'
import util from 'node:util'
import * as acorn from 'acorn'
import * as walk from "acorn-walk"


function parse(str) {

    console.log('parse: ',str)
    try {
        const node = acorn.parse(str, {ecmaVersion: 2020})
        console.log('  - parsed')

        console.log(util.inspect(node,false,null,true))

        if (node.type=='Program') {
            const program = node
            if (program.body[0].type == 'BlockStatement') {
                const bs = program.body[0]
                if (bs.body[0].type == 'LabeledStatement') {
                    const ls = bs.body[0]
                    if (ls.body.type == 'ExpressionStatement') {
                        const es = ls.body
                        if (es.expression.type == 'ArrayExpression') {
                            const as = es.expression
                            if (as.elements[0].type == 'Identifier') {
                                const id = as.elements[0]
                                return false
                            }
                        }
                    }
                }
            }
        }
        return true
    } catch (e) {

        console.log('  - failed to parse')

        return false
    }

}


export default function strToJson(str,throwOnInvalid) {
    parse(str)

    let jsonStr = '{value:[' + str + ']}'

    try {

        console.log('strToJson',util.inspect(jsonStr,false,null,true))
        const res = JSON5.parse(jsonStr).value
        console.log('  = valid')
        return res
    } catch (e) {
        console.log('  = invalid')
        if (throwOnInvalid) {
            throw new Error(`failed to parse "${jsonStr}"`)
        } else {
            return [ str ]
        }
    }

}