

//import * as acorn from 'acorn'
import JSON5 from 'json5'
//import { parse } from 'node:path'
import util from 'node:util'
import * as acorn from 'acorn'
import * as walk from "acorn-walk"


export default function strToJson(str,throwOnInvalid) {

    try {

        let args = []
        const node = acorn.parse(str, {ecmaVersion: 2020, locations: true})

        if (node.type != 'Program') {
            console.log('strToJson',str,node)
            throw new Error('no program node')
        }
        const program = node
        if (program.body[0].type != 'ExpressionStatement') {
            console.log('strToJson',str,node)
            throw new Error('no expression statement node')
        }
        const es = program.body[0]
        if (es.expression.type != 'SequenceExpression') {
            console.log('strToJson',str,node)
            throw new Error('no sequence expression')
        }
        const se = es.expression

        se.expressions.forEach((n,i) => {
            if (n.type == 'Literal') {
                args.push({ type: 'literal', value: `${n.raw}` })
            } else if (n.type == 'TemplateLiteral') {
                args.push({ type: 'template-literal', value: str.substr(n.start,n.end - n.start) })
            } else {
                args.push({ type: 'non-literal', value: str.substr(n.start,n.end - n.start) })
            }
        })

        return args
    } catch (e) {
        if (throwOnInvalid) {
            throw e
        } else {
            return [ str ]
        }
    }
}


// export default function strToJson(str,throwOnInvalid) {
//     let jsonStr = '{value:[' + str + ']}'
//
//     try {
//         return JSON5.parse(jsonStr).value
//     } catch (e) {
//         console.log('  = invalid')
//         if (throwOnInvalid) {
//             throw new Error(`failed to parse "${jsonStr}"`)
//         } else {
//             return [ str ]
//         }
//     }
// }