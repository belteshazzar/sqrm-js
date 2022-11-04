

export default function sqrmToJs(sqrm) {

    let out = ''

    function stringify(obj) {
        if (obj.type !== undefined) {
            if (obj.type == 'tag') {
                delete obj.type
                return `inlineTag(${stringifyO(obj)})`
            } else if (obj.type == 'include') {
                delete obj.type
                return `include(${stringifyO(obj)})`
            }
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

    out += 'const maybeYaml = function(params) { let r = response.libs.maybeYaml(params); json = response.json; return r }\n'
    out += 'const inlineTag = function(params) { let r = response.libs.inlineTag(params); json = response.json; return r }\n'
    out += 'const addTask = function(params) { let r = response.libs.addTask(params); json = response.json; return r }\n'
    out += 'const appendToHtml = response.libs.appendToHtml\n'
    out += 'const include = response.libs.include\n'
//    out += 'const append = response.libs.append;\n'
    out += '\n'

    for (let i=0 ; i<sqrm.length ; i++) {
        let ln = sqrm[i]
//        out += '// ln:' + ln.line + '\n'
        if (ln.type == 'script') {
            out += ln.code + '\n'
        } else if (ln.type == 'yaml') {
            out += `maybeYaml(${ stringify(ln) })\n`
        } else if (ln.type == 'unordered-list-item' && ln.yaml !== undefined) {
            out += `maybeYaml(${ stringify(ln) })\n`
        } else {
            out += `appendToHtml(${ stringify(ln) })\n`

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

