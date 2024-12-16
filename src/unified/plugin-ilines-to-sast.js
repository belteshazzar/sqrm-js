
import lineToSxast from '../util/parse-text.js'
//import {yamlToEsast} from '../util/str-to-esast.js'
import link from '../util/str-to-link.js'
import parseTableRow from '../util/parse-table-row.js'
// import {esastValue} from '../util/str-to-esast.js'

const RE_DocumentSeparator = /^---$/d

const RE_BlankLine = /^\s*$/d
const RE_Tag = /^\s*(([a-zA-Z_$][a-zA-Z\d_$]*)\s*:(\s+(.*?))?)\s*$/d
const RE_ListItemTag = /^\s*-\s+([a-zA-Z_$][a-zA-Z\d_$]*)(\s*:(\s+(.*?))?)?\s*$/d
const RE_Script = /^(\s*)<%(.*?)\s*(%>\s*)?$/d
const RE_Footnote = /^\s*\[ *\^ *(\S+) *\] *: *(.+?) *$/d
const RE_LinkDefinition = /^\s*\[ *([^\]]+) *\] *: *(.+?) *$/d
const RE_CodeBlock = /^\s*``` *(([a-zA-Z]+)?)\s*$/d
const RE_Element = /^\s*(<\s*((\!doctype)|([a-z]+([a-z0-9]+)?))((?:\s+[a-z]+(="[^"]*")?)*)\s*>?\s*)$/id
const RE_Heading = /^\s*((=+)\s*(\S.*?)\s*[-=]*)\s*$/d
const RE_HR = /^\s*[-=_\*]+\s*$/d
const RE_ListItem = /^\s*(?:(?:([-*+])|(\d+[\.)]))\s+(\S.*?))\s*$/d
const RE_ListItemTask = /^\s*\[ *([xX]?) *\]\s+(.*?)\s*$/d
const RE_Table = /^\s*(\|(.+?)\|?)\s*$/d
const RE_TableHeader = /^[-| ]+$/d

const RE_ScriptEnd = /^(.*?)\s*%>\s*$/d

function lineToSqrm(lineNumber,ln) {

    if (ln.value.length==0) {
        return {
            type:'blank-line',
            // position: ln.position
        }
    }

    let m;

    m = ln.value.match(RE_DocumentSeparator);
    if (ln.indent==0 && m) {
        return {
            type:'document-separator-line',
            // position: ln.position
        }
    }

    m = ln.value.match(RE_HR);
    if (m) {
        return {
            type:'hr-line',
            indent: ln.indent,
            // position: ln.position,
        }
    }

    m = ln.value.match(RE_Heading)
    if (m) {
        // let textPos = {
        //     start: Object.assign({},ln.position.start),
        //     end: Object.assign({},ln.position.end)
        // }
        // textPos.start.column = m.indices[3][0]
        // textPos.start.offset += m.indices[3][0]
        // textPos.end.column = m.indices[3][1]

        return {
            type:'heading-line',
            indent: ln.indent,
            level: m[2].length,
            children: lineToSxast(m[3]),
            // position: textPos,
        }
    }

    m = ln.value.match(RE_ListItem)
    if (m) {

        if (m[1]!==undefined) {
            let t = m[3].match(RE_ListItemTask)
            if (t) {
                let task = { line: lineNumber, done: t[1]!='', text: t[2] }
                // children = text and is converted to hast in post-process
                return {
                    type: 'unordered-list-item-line',
                    indent: ln.indent, 
                    marker: m[1],
                    children: lineToSxast(t[2]),
                    line: lineNumber,
                    task: task
                }
            } else {
                // children = text and is converted to hast in post-process
                let uli = {
                    type: 'unordered-list-item-line',
                    indent: ln.indent,
                    marker: m[1],
                    children: lineToSxast(m[3]),
                    line: lineNumber
                }

                let yaml = ln.value.match(RE_ListItemTag)
                if (yaml) {
                    uli.yaml = { type: 'yaml', indent: ln.indent, isArrayElement: true }
                    if (yaml[4]) {
                        uli.yaml.name = yaml[1]
                        uli.yaml.value = yaml[4]// = yamlToEsast(yaml[4],false)
                        uli.yaml.colon = true
                    } else if (yaml[2]) {
                        uli.yaml.name = yaml[1]
                        uli.yaml.colon = true
                    } else {
                        uli.yaml.value = yaml[1]//yamlToEsast(yaml[1],false)
                        uli.yaml.colon = false
                    }
                }

                return uli
            }
        } else if (m[2]!==undefined) {
            let t = m[3].match(RE_ListItemTask)
            if (t) {
                let task = {
                    line: lineNumber, 
                    done: t[1]!='', 
                    text: t[2]
                }
                // children = text and is converted to hast in post-process
                return {
                    type: 'ordered-list-item-line',
                    indent: ln.indent,
                    number: m[2],
                    children: lineToSxast(t[2]),
                    line: lineNumber,
                    task: task
                }
            } else {
                // children = text and is converted to hast in post-process
                return {
                    type: 'ordered-list-item-line',
                    indent: ln.indent,
                    number: m[2],
                    children: lineToSxast(m[3]),
                    line: lineNumber
                }
            }
        }
    }

    m = ln.value.match(RE_Script)
    if (m) {
//        console.log(m)
        return {
            type: 'script-line',
            indent: ln.indent,
            code: m[1] + '  ' + m[2],
            line: lineNumber,
            endScript: m[3] != undefined
        }
    }

    m = ln.value.match(RE_Element)
    if (m) {
        let properties = {}
        if (m[6]) {
            let props =  [... m[6].matchAll(/([^\s=]+)(=["]([^"]*)["])?/g) ]
            for (let prop of props) {
                if (prop[3]) {
                    properties[prop[1]] = prop[3]
                } else {
                    properties[prop[1]] = true
                }
            }
        }
        return {
            type: 'element-line',
            indent: ln.indent,
            tag: (m[2]?m[2].toLowerCase():'div'),
            properties: properties,
            line:lineNumber,
            text: ln.value
        }
    }

    m = ln.value.match(RE_Table)
    if (m) {
        if (ln.value.match(RE_TableHeader) !== null) {
            return {
                type: 'table-divider-line',
                indent: ln.indent,
                text: ln.value
            }
        } else {
            return {
                type: 'table-row-line',
                indent: ln.indent,
                children: parseTableRow(m[2]),
                text: ln.value
             }
        }
    }

    m = ln.value.match(RE_BlankLine) 
    if (m) {
        return {
            type:'blank-line',
            // position: ln.position
        }
    }

    m = ln.value.match(RE_Footnote);
    if (m) {
        return {
            type: 'footnote-line',
            indent: ln.indent,
            id: m[1],
            children: lineToSxast(m[2])
        }
    }

    m = ln.value.match(RE_LinkDefinition);
    if (m) {
        return {
            type: 'link-definition-line',
            indent: ln.indent, 
            id: m[1].trim().toLowerCase(), 
            link: link(m[2]) 
        }
    }

    m = ln.value.match(RE_CodeBlock);
    if (m) {
        return {
            type:'code-block-line',
            indent: ln.indent, 
            language: m[1],
            line:lineNumber
        }
    }

    // children = text and is converted to hast in post-process
    let text = {
        type: 'text-line',
        indent: ln.indent,
        // position: ln.position,
        children: lineToSxast(ln.value),
        text: ln.value
    }

    m = ln.value.match(RE_Tag);
    if (m) {
        text.yaml = {
            type: 'yaml',
            indent: ln.indent, 
            name: m[2], 
            colon: true, 
            isArrayElement: false, 
        }
        if (m[4]) {
            text.yaml.value = m[4]
        }
    }

    return text

}

export default function indentedLinesToSxast(options = {}) {
    return (tree,file) => {

        const root = {
            type: 'sast-root',
            children: [],
        };

        for (let i=0 ; i<tree.children.length ; i++) {
            let iline = tree.children[i]
            let sast = lineToSqrm(i+1,iline)
            root.children.push(sast)
            if (sast.type == 'script-line' && !sast.endScript) {
                for (i++ ; i<tree.children.length ; i++) {
                    iline = tree.children[i]
                    sast = {
                        type: 'script-line',
                        indent: iline.indent,
                        line: iline.line
                    }
                    root.children.push(sast)
                    let m = iline.value.match(RE_ScriptEnd)
                    if (m) {
                        sast.code = m[1]
                        break;
                    } else {
                        sast.code = iline.value
                    }
                }
            }
        }

        return root
    }
}

