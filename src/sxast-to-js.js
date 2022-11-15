import qouted from './quoted-string.js'

export default function sqrmToJs(sqrm) {

    function escape(s) {
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

    let out = ''

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

    out += 'let ln = 0\n'
    out += 'const lines = {}\n'
    for (let i=0 ; i<sqrm.length ; i++) {
        let ln = sqrm[i]
        if (ln.text !== undefined) {
            out += `lines[${ln.line}] = ${qouted(ln.text)}\n`
        }
    }
    out += 'try {\n'
    out += '\n'
    out += 'const request = arguments[0];\n'
    out += 'const response = arguments[1];\n'
    out += '\n'
    out += 'const docs = response.docs;\n';
    out += '\n'
    out += 'const h = response.libs.h;\n'
    out += 'const t = response.libs.t;\n'
    out += 'const matches = response.libs.matches;\n'
    out += 'const select = response.libs.select;\n'
    out += 'const selectAll = response.libs.selectAll;\n'
    out += 'const processHast = response.libs.processHast;\n'

    out += 'let json = response.json;\n'
//    out += 'const root = response.root;\n'
//    out += 'const j = response.libs.j;\n'

    out += 'const maybeYaml = response.libs.maybeYaml\n'
    out += 'const inlineTag = response.libs.inlineTag\n'
    out += 'const addTask = response.libs.addTask\n'
    out += 'const appendToHtml = response.libs.appendToHtml\n'
    out += 'const include = response.libs.include;\n'

//    out += 'const append = response.libs.append;\n'

    for (let i=0 ; i<sqrm.length ; i++) {
        let ln = sqrm[i]
        out += 'ln=' + ln.line + ';'
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

    out += '\n} catch (e) {\n'
    // TODO: create own exception class
    out += '  e.lineNum = ln\n'
    out += '  e.lineStr = lines[ln]\n'
    out += '  throw e;\n'
    out += '}\n'      
    
    return out
}

