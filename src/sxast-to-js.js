
import qouted from './quoted-string.js'

function escape(s) {
    if (s===undefined) return ''
    return s.replaceAll('\\','\\\\').replaceAll('\`','\\\`').replaceAll('\\\\$','\\$')
}

function stringifyArgsObj(obj) {

    let s = '{'
    let first = true
    for (const [key, value] of Object.entries(obj)) {

        if (first) {
            first = false
        } else {
            s += ','
        }

        if (key == 'args') {
            s += `"${key}":${value}`
        } else if (value === undefined) {
            s += `"${key}":undefined`
        } else if (value == null) {
            s += `"${key}":null`
        } else if (Array.isArray(value)) {
            s += `"${key}":${stringifyA(value)}`
        } else if (typeof value === 'object') {
            s += `"${key}":${stringifyO(value)}`
        } else if (typeof value === 'string') {
            s += `"${key}":${'`'+escape(value)+'`'}`
        } else {
            s += `"${key}":${JSON.stringify(value)}`
        }
    }
    s += '}'
    return s
}

function stringifyInclude(obj) {
    return `include(${stringifyArgsObj(obj)})`
}

function stringifyInlineTag(obj) {
    return `inlineTag(${stringifyArgsObj(obj)})`
}

function stringifyYaml(obj) {
    let s = '{'
    let first = true
    for (const [key, value] of Object.entries(obj)) {

        if (first) {
            first = false
        } else {
            s += ','
        }

        if (key == 'value') {
            s += `"${key}":${value}`
        } else if (value === undefined) {
            s += `"${key}":undefined`
        } else if (value == null) {
            s += `"${key}":null`
        } else if (Array.isArray(value)) {
            s += `"${key}":${stringifyA(value)}`
        } else if (typeof value === 'object') {
            s += `"${key}":${stringifyO(value)}`
        } else if (typeof value === 'string') {
            s += `"${key}":${'`'+escape(value)+'`'}`
        } else {
            s += `"${key}":${JSON.stringify(value)}`
        }
    }
    s += '}'
    return s
}

function stringifyYamlLine(obj) {

    let s = '{'
    let first = true
    for (const [key, value] of Object.entries(obj)) {

        if (first) {
            first = false
        } else {
            s += ','
        }

        if (key == 'type' || key == 'name') {
            s += `"${key}":"${value}"`
        } else if (key == 'yaml') {
            s += `"${key}":${stringifyYaml(value)}`
        } else if (key == 'value') {
            s += `"${key}":${value}`
        } else if (value === undefined) {
            s += `"${key}":undefined`
        } else if (value == null) {
            s += `"${key}":null`
        } else if (Array.isArray(value)) {
            s += `"${key}":${stringifyA(value)}`
        } else if (typeof value === 'object') {
            s += `"${key}":${stringifyO(value)}`
        } else if (typeof value === 'string') {
            s += `"${key}":${'`'+escape(value)+'`'}`
        } else {
            s += `"${key}":${JSON.stringify(value)}`
        }
    }
    s += '}'
    return s
}

function stringifyMaybeYaml(obj) {
    return `maybeYaml(${stringifyYamlLine(obj)})\n`
}

function stringify(obj) {

    if (obj === undefined) {
        return 'undefined'
    } else if (obj == null) {
        return 'null'
    }

    if (obj.type !== undefined) {
        if (obj.type == 'tag') {
            delete obj.type
            return stringifyInlineTag(obj)
        } else if (obj.type == 'include') {
            delete obj.type
            return stringifyInclude(obj)
        }
    }

    if (Array.isArray(obj)) {
        return stringifyA(obj)
    } else if (typeof obj === 'object') {
        return stringifyO(obj)
    } else if (typeof obj === 'string') {
        return `\`${escape(obj)}\``
    } else {
        return JSON.stringify(obj)
    }

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

        if (value === undefined) {
            s += `"${key}":undefined`
        } else if (value == null) {
            s += `"${key}":null`
        } else if (Array.isArray(value)) {
            s += `"${key}":${stringifyA(value)}`
        } else if (typeof value === 'object') {
            s += `"${key}":${stringifyO(value)}`
        } else if (typeof value === 'string' && key == 'value') {
            s += `"${key}":${'`'+escape(value)+'`'}`
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

function jsPreCode() {
    return `
const request = arguments[0]
const response = arguments[1]

const db = response.db

const h = response.libs.h
const t = response.libs.t
const matches = response.libs.matches
const select = response.libs.select
const selectAll = response.libs.selectAll
const processHast = response.libs.processHast

let json = response.json

const maybeYaml = response.libs.maybeYaml
const inlineTag = response.libs.inlineTag
const addTask = response.libs.addTask
const appendToHtml = response.libs.appendToHtml
const include = response.libs.include

`
}

export function sxastToJs(collection,name,sxast) {

    let out = jsPreCode()

    out += 'try {\n'
    out += '\n'

    for (let i=0 ; i<sxast.length ; i++) {
        let ln = sxast[i]
        if (ln.type == 'script') {
            out += ln.code + '\n'
        } else if (ln.type == 'yaml') {
            out += stringifyMaybeYaml(ln) // `maybeYaml(${ stringify(ln) })\n`
        } else if (ln.type == 'unordered-list-item' && ln.yaml !== undefined) {
            out += stringifyMaybeYaml(ln) // `maybeYaml(${ stringify(ln) })\n`
        } else {
            out += `appendToHtml(${ stringify(ln) })\n`

            if ((ln.type == 'ordered-list-item' || ln.type == 'unordered-list-item') && ln.task) {
                out += `addTask(${stringify(ln.task)})\n`
            }
        }
    }

    out += '\n'
    out += '} catch (e) {\n'

    out += '  let m = e.stack.match(/<anonymous>:([0-9]+):([0-9]+)/)\n'
    out += '  const errLine = m[1] - 26\n'
    out += '  const errColumn = m[2] - 1\n'
    out += `  const errMsg = e.stack.split('\\n')[0]\n`

    out += `  let uline = ''\n`
    out += `  for (let i=0 ; i<errColumn ; i++) uline += ' ';\n`
    out += '  const lines = []\n'

    for (let i=0 ; i<sxast.length ; i++) {
        let ln = sxast[i]
        out += `  lines.push( () => appendToHtml({type: 'paragraph', indent: 1, text: ${qouted('  '+ln.text)} }) )\n`
    }

    out += `  appendToHtml({type: 'div', indent: 0, tag: 'pre' })\n`

    out += `  for (let i=0 ; i<lines.length ; i++) {\n`
    out += '    lines[i]()\n'
    out += '    if (i==errLine) {\n'
    out += `      appendToHtml({ type: 'paragraph', indent: 1, text: '  '+uline+'^' })\n`
    out += `      appendToHtml({ type: 'paragraph', indent: 1, text: '  '+uline+errMsg })\n`
    out += '    }\n'
    out += '  }\n'

    out += '  throw e\n'

    out += '}\n'      
    
    return out
}

export function sxastToTextJs(collection,name,sxast,error) {

    let out = jsPreCode()

    out += `appendToHtml({type: 'div', indent: 0, tag: 'pre' })\n`
    for (let i=0 ; i<sxast.length ; i++) {
        let ln = sxast[i]

        out += `appendToHtml({type: 'paragraph', indent: 1, text: ${qouted('  '+ln.text)}})\n`
        if (i == error.errorLine - 2) {
            let uline = ''
            for (let i=0 ; i<error.errorColumn ; i++) uline += ' ';

            out += `appendToHtml({type: 'paragraph', indent: 1, text: ${qouted('  '+uline+'^')} })\n`
            out += `appendToHtml({type: 'paragraph', indent: 1, text: ${qouted('  '+uline+error.errorMessage)} })\n`
        }
    }

    return out
}