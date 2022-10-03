
import {h} from 'hastscript'
import {toHtml} from 'hast-util-to-html'
import {visit} from 'unist-util-visit'
import {t} from './hastscript-tools.js'
import util from 'node:util'
import LineParser from './LineParser.js'
import { table } from 'node:console'


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
            if (key=='text' || key=='value') {
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

    
    out += 'try {'
    out += 'const request = arguments[0];\n'
    out += 'const h = request.libs.h;\n'
    out += 'const t = request.libs.t;\n'
    out += 'const i = request.libs.i;\n'
    // out += 'let tree = request.libs.tree;\n'
    // out += 'let util = request.libs.util;\n'
    out += 'const docs = request.docs;\n';
    out += 'const response = arguments[1];\n'
//    out += 'const html = response.html;\n';
    out += 'const json = response.json;\n'
    out += 'const root = response.root;\n'
    out += '\n'
    out += 'const j = request.libs.j.bind(json);\n'
    out += '\n'
    out += 'const append = request.libs.append;\n'
    out += '\n'

    for (let i=0 ; i<sqrm.length ; i++) {
        let ln = sqrm[i]
//        out += '// ln:' + ln.line + '\n'
        if (ln.type == 'script') {
            out += ln.text + '\n'
        } else if (ln.type == 'tag') {
            out += `j('${ln.name}',${ln.value})\n`
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
    out += '  console.log(e);\n'
    out += '  throw e;\n'
    out += '}\n'      
    
    return out
}

