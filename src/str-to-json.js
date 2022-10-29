

import * as acorn from 'acorn'
import JSON5 from 'json5'
import util from 'node:util'

const TEST = false

export default function strToJson(str) {

    let jsonStr = '{value:[' + str + ']}'

    try {
        const node = acorn.parse(jsonStr, {ecmaVersion: 2020})
         if (TEST) {
            console.log(`strToJson - acorn ("${str}") = yes`)
            let ok = true
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
                                    console.log(`strToJson - acorn ... actually identifier`)
                                    ok = false
                                }
                            }
                        }
                    }
                }
            }
            console.log(ok)
        }
    } catch (e) {
        if (TEST) {
            console.log(`strToJson - acorn ("${str}") = no`)
        }
    }

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

        if (TEST) {
            console.log(`strToJson("${str}") = ${util.inspect(v,false,null,true)}`)
        }
        return v
    } catch (e) {
        if (TEST) {
            console.log(`strToJson("${str}") = :(`)
        }
        throw e;
    }

}