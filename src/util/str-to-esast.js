

import * as acorn from 'acorn'
import quoted from './quoted-string.js'
import util from 'node:util'

export function templateOrString(str) {

    try {
        console.log(str)
        let ast = acorn.parse("`" + str + "`", {ecmaVersion: 2020})
        console.log(ast.body[0].expression)
        return ast.body[0].expression
    } catch (e) {
        return {
            type: "Literal",
            start: -1,
            end: -1,
            value: quoted(str),
            raw: quoted(str)
        }
    }
}


export function yamlToEsast(str,throwOnInvalid = false) {

    // console.log(str)

    const src = '(() => { try { return ' + str + '; } catch (e) { return `' + str + '`; } })()'

    try {
        const rawNode = acorn.parse(str, {ecmaVersion: 2020})
        if (rawNode.body[0].type == "ExpressionStatement") {
            if (rawNode.body[0].expression.type == "TemplateLiteral"
                    || rawNode.body[0].expression.type == "Literal") {
                return rawNode.body[0].expression
            } else {
                // console.log(util.inspect(rawNode,false,null,true))
                const srcNode = acorn.parse(src, {ecmaVersion: 2020})
                // console.log(util.inspect(srcNode,false,null,true))
                return srcNode.body[0].expression
            }
        } else {
            // console.log(util.inspect(rawNode,false,null,true))
        }
    } catch (e) {
        // console.log(e)
    }

    return {
        type: "Literal",
        start: -1,
        end: -1,
        value: quoted(str),
        raw: quoted(str)
    }
}

//   Node {
//     type: 'Program',
//     start: 0,
//     end: 9,
//     body: [
//       Node {
//         type: 'ExpressionStatement',
//         start: 0,
//         end: 9,
//         expression: Node {
//           type: 'SequenceExpression',
//           start: 0,
//           end: 9,
//           expressions: [
//             Node {
//               type: 'Literal',
//               start: 0,
//               end: 1,
//               value: 1,
//               raw: '1'
//             },
//             Node {
//               type: 'MemberExpression',
//               start: 2,
//               end: 9,
//               object: Node { type: 'Identifier', start: 2, end: 6, name: 'Math' },
//               property: Node { type: 'Identifier', start: 7, end: 9, name: 'PI' },
//               computed: false,
//               optional: false
//             }
//           ]
//         }
//       }
//     ],
//     sourceType: 'script'
//   }


//   Node {
//     type: 'Program',
//     start: 0,
//     end: 1,
//     body: [
//       Node {
//         type: 'ExpressionStatement',
//         start: 0,
//         end: 1,
//         expression: Node { type: 'Literal', start: 0, end: 1, value: 1, raw: '1' }
//       }
//     ],
//     sourceType: 'script'
//   }

export function functionParamsToEsast(str,throwOnInvalid = false) {

    console.log(str)
    try {
        const node = acorn.parse(str, {ecmaVersion: 2020})
        console.log(util.inspect(node,false,null,true))

        if (node.body[0].type == "ExpressionStatement") {
            if (node.body[0].expression.type == 'SequenceExpression') {
                return {
                    type: 'ArrayExpression',
                    elements: node.body[0].expression.expressions
                }
            } else {
                return {
                    type: 'ArrayExpression',
                    elements: [ node.body[0].expression ]
                }
            }          
        } else {
            console.log(util.inspect(node,false,null,true))
        }
    } catch (e) {
        console.log(e)
    }

    return {
        type: "Literal",
        start: -1,
        end: -1,
        value: quoted(str),
        raw: quoted(str)
    }
}