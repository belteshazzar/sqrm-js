
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
    let js = ''

    function stringify(obj) {
        if (obj.type !== undefined && obj.type == 'json') {
            js += `j("${obj.name}",${obj.value})\n`
            return ''
        }
        let s = '{'
        let first = true
        for (const [key, value] of Object.entries(obj)) {
            if (first) {
                first = false
            } else {
                s += ','
            }
            if (key=='value') {
                s += `"${key}":\`${value}\``
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
    out += 'const json = response.json;\n'
    out += 'const root = response.root;\n'
    out += 'const j = response.libs.j;\n'
//    out += 'const append = response.libs.append;\n'
    out += '\n'

    for (let i=0 ; i<sqrm.length ; i++) {
        let ln = sqrm[i]
//        out += '// ln:' + ln.line + '\n'
        if (ln.type == 'script') {
            out += ln.code + '\n'
        } else if (ln.type == 'tag') {
            out += `j(${ stringify({ indent: ln.indent, isArrayElement: false, name: ln.name, value: ln.value, canHaveChildren: ln.canHaveChildren } )})\n`
        } else if (ln.type == 'unordered-list-item' && ln.tag !== undefined) {
            out += `j(${ stringify({ indent: ln.indent, isArrayElement: true, name: ln.tag.name, value: ln.tag.value, canHaveChildren: ln.tag.canHaveChildren })})\n`
        } else {
            out += `root.push(${stringify(ln)})\n`

            if ((ln.type == 'ordered-list-item' || ln.type == 'unordered-list-item') && ln.task) {
                out += `j('tasks',${stringify(ln.task)})\n`
            }

            if (js.length>0) {
                out += js
                js = ''
            }
        }
    }

    out += '\n} catch (e) {\n'
    out += '  console.log(e.stack);\n'
    out += '  throw e;\n'
    out += '}\n'      
    
    return out
}

