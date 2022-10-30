

//import * as acorn from 'acorn'
import JSON5 from 'json5'
//import util from 'node:util'

export default function strToJson(str,throwOnInvalid) {

    let jsonStr = '{value:[' + str + ']}'

    try {
        return JSON5.parse(jsonStr).value
    } catch (e) {
        if (throwOnInvalid) {
            throw new Error(`failed to parse "${jsonStr}"`)
        } else {
            return [ str ]
        }
    }

    // try {
    //     const node = acorn.parse(jsonStr, {ecmaVersion: 2020})

    //     console.log(util.inspect(node,false,null,true))

    //     if (node.type=='Program') {
    //         const program = node
    //         if (program.body[0].type == 'BlockStatement') {
    //             const bs = program.body[0]
    //             if (bs.body[0].type == 'LabeledStatement') {
    //                 const ls = bs.body[0]
    //                 if (ls.body.type == 'ExpressionStatement') {
    //                     const es = ls.body
    //                     if (es.expression.type == 'ArrayExpression') {
    //                         const as = es.expression
    //                         if (as.elements[0].type == 'Identifier') {
    //                             const id = as.elements[0]
    //                             return false
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     return true
    // } catch (e) {
    //     return false
    // }
}