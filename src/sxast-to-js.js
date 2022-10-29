
import {h} from 'hastscript'
import {toHtml} from 'hast-util-to-html'
import {visit} from 'unist-util-visit'
import {t} from './hastscript-tools.js'
import util from 'node:util'
import LineParser from './LineParser.js'
import { table } from 'node:console'

import JSON5 from 'json5'

export default function sqrmToJs(sqrm) {

    let out = ''

    function stringify(obj) {
        if (obj.type !== undefined && obj.type == 'tag') {
            return `inlineTag(${stringifyO(obj)})`
        }
        return stringifyO(obj)
    }

    function stringifyO(obj) {
        let s = '{'
        let first = true
        for (const [key, value] of Object.entries(obj)) {
            if (first) {
                first = false
            } else {
                s += ','
            }
            if (key=='value') {
                if (value==undefined) {
                    s += `"${key}":undefined`
                } else {
                    s += `"${key}": \`${value}\``
                }
            } else if (key=='children' || key=='cells') {
                s += `"${key}":${stringifyA(value)}`
            } else {
                s += `"${key}":${JSON.stringify(value)}`
            }
        }
        s += '}'
        return s
    }
    
    function stringifyA(arr) {
        let s = '['
        for (let i=0 ; i<arr.length ; i++) {
            if (i>0) {
                s += ','
            }
            s += stringify(arr[i])
        }
        s += ']'
        return s
    
    }

    
    out += 'try {\n'
    out += '\n'
    out += 'const request = arguments[0];\n'
    out += 'const response = arguments[1];\n'
    out += '\n'
    out += 'const docs = request.docs;\n';
    out += '\n'
    out += 'const h = response.libs.h;\n'
    out += 'const t = response.libs.t;\n'
    out += 'const i = response.libs.i;\n'
    out += 'let json = response.json;\n'
    out += 'const root = response.root;\n'
//    out += 'const j = response.libs.j;\n'
    out += 'const maybeYaml = function(params) { let r = response.libs.maybeYaml(params); json = response.json; console.log(json); return r }\n'
    out += 'const inlineTag = function(params) { let r = response.libs.inlineTag(params); json = response.json; console.log(json); return r }\n'
    out += 'const addTask = function(params) { let r = response.libs.addTask(params); json = response.json; console.log(json); return r }\n'
//    out += 'const append = response.libs.append;\n'
    out += '\n'

    for (let i=0 ; i<sqrm.length ; i++) {
        let ln = sqrm[i]
//        out += '// ln:' + ln.line + '\n'
        if (ln.type == 'script') {
            out += ln.code + '\n'
        } else if (ln.type == 'yaml') {
            out += `root.push(maybeYaml(${ stringify(ln) }))\n`
        } else if (ln.type == 'unordered-list-item' && ln.yaml !== undefined) {
            out += `root.push(maybeYaml(${ stringify(ln) }))\n`
        } else {
            out += `root.push(${ stringify(ln) })\n`

            if ((ln.type == 'ordered-list-item' || ln.type == 'unordered-list-item') && ln.task) {
                out += `addTask(${stringify(ln.task)})\n`
            }
        }
    }

    out += '\n} catch (e) {\n'
    out += '  console.log(e.stack);\n'
    out += '  throw e;\n'
    out += '}\n'      
    
    return out
}

