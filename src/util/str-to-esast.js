

import * as acorn from 'acorn'
import quoted from './quoted-string.js'
import qouted from './quoted-string.js'

export function sastYaml(yaml) {

    // check if it can be parsed

    try {
        acorn.parse(`let x = ${yaml.value}`, {ecmaVersion: 2020})

        const src = `() => {
            return {
                indent: ${yaml.indent},
                name: "${yaml.name}",
                colon: ${yaml.colon},
                isArrayElement: ${yaml.isArrayElement},
                value: (() => {
                    try {
                        return ${yaml.value};
                    } catch (e) {
                        return ${qouted(yaml.value)};
                    }
                })()
            }
        }`
        const ast = acorn.parse(src, {ecmaVersion: 2020})
        return ast.body[0].expression
    } catch (e) {
    }

    // check if it can be parsed as a template

    try {

        acorn.parse(`let x = \`${yaml.value}\``, {ecmaVersion: 2020})

        const src = `() => {
            return {
                indent: ${yaml.indent},
                name: "${yaml.name}",
                colon: ${yaml.colon},
                isArrayElement: ${yaml.isArrayElement},
                value: (() => {
                    try {
                        return \`${yaml.value}\`;
                    } catch (e) {
                        return ${qouted(yaml.value)};
                    }
                })()
            }
        }`
        const ast = acorn.parse(src, {ecmaVersion: 2020})
        return ast.body[0].expression
    } catch(e) {
    }

    // not valid as raw or a template, treat as a string

    const src = `() => {
        return {
            indent: ${yaml.indent},
            name: "${yaml.name}",
            colon: ${yaml.colon},
            isArrayElement: ${yaml.isArrayElement},
            value: ${qouted(yaml.value)}
        }
    }`
    const ast = acorn.parse(src, {ecmaVersion: 2020})
    return ast.body[0].expression
}

export function sastIncludeFunction(inc) {

    inc.collection = inc.collection || 'default'

    try {
        const src = `() => {
            return this.inlineInclude({
                collection: "${inc.collection}",
                name: "${inc.name}",
                args: (() => {
                    try {
                        return [${inc.args}];
                    } catch (e) {
                        return [\`${inc.args}\`];
                    }
                })(),
                text: ${quoted(inc.text)}
            })
        }`
        const node = acorn.parse(src, {ecmaVersion: 2020})
        return node.body[0].expression
    } catch (e) {
        const src = `() => {
            return this.inlineInclude({
                collection: "${inc.collection}",
                name: "${inc.name}",
                args: [${quoted(inc.args)}],
                text: ${quoted(inc.text)}
            })
        }`
        const node = acorn.parse(src, {ecmaVersion: 2020})
        return node.body[0].expression
    }
}


export function sastTagFunction(tag) {

    try {
        const src = `() => {
            return this.inlineTag({
                name: "${tag.name}",
                args: (() => {
                    try {
                        return [${tag.args}];
                    } catch (e) {
                        return [\`${tag.args}\`];
                    }
                })(),
                text: ${quoted(tag.text)}
            })
        }`
        const node = acorn.parse(src, {ecmaVersion: 2020})
        return node.body[0].expression
    } catch (e) {
        const src = `() => {
            return this.inlineTag({
                name: "${tag.name}",
                args: [${quoted(tag.args)}],
                text: ${quoted(tag.text)}
            })
        }`
        const node = acorn.parse(src, {ecmaVersion: 2020})
        return node.body[0].expression
    }
}

export function sastFormatFunction(format) {

    const src = `() => {
        return {
            type: "${format.type}",
            style: "${format.style}"
        }
    }`
    const node = acorn.parse(src, {ecmaVersion: 2020})
    return node.body[0].expression
}

export function sastToHastTextFunction(o) {

    // try as template
    // if its not a valid template acorn will throw an exception
    // then return as a plain string
    try {
        const src = `() => {
            return {
                type: "text",
                value: (() => {
                    try {
                        return \`${o.value}\`;
                    } catch (e) {
                        return ${quoted(o.value)};
                    }
                })()
            }
        }`

        let ast = acorn.parse(src, {ecmaVersion: 2020})
        return ast.body[0].expression
    } catch (e) {
        const src = `() => {
            return {
                type: "text",
                value: ${quoted(o.value)}
            }
        }`

        let ast = acorn.parse(src, {ecmaVersion: 2020})
        return ast.body[0].expression
    }

}

export function esastStr(str) {

    // try as template
    try {
        const src = `() => try { return \`${str}\`; } catch (e) { return ${quoted(str)}; }`
        // console.log(src)
        let ast = acorn.parse(src, {ecmaVersion: 2020})
        return ast.body[0].expression
    } catch (e) {
    }

    // fallback as plain string
    return {
        type: "Literal",
        start: -1,
        end: -1,
        value: quoted(str),
        raw: quoted(str)
    }
}

export function esastValue(str) {

    // try as raw
    try {
        const src = `() => { try { return ${str}; } catch (e) { return ${quoted(str)}; }}`
        // console.log(src)
        let ast = acorn.parse(src, {ecmaVersion: 2020})
        return ast.body[0].expression
    } catch (e) {
    }

    return esastStr(str)
}

export function yamlToEsast(str,throwOnInvalid = false) {

    // console.log('yamlToEsast',str)

    const src = '() => { try { return ' + str + '; } catch (e) { return `' + str + '`; } }'

    try {
        const node = acorn.parse(src, {ecmaVersion: 2020})
        return node.body[0].expression
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

export function yamlToEsastArray(str) {

//    console.log('yamlToEsastArray',str)

    const src = '() => { try { return [' + str + ']; } catch (e) { return [`' + str + '`]; } }'

    try {
        const node = acorn.parse(src, {ecmaVersion: 2020})
        return node.body[0].expression
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
            console.log(node)
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