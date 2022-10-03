
import {h} from 'hastscript'
import {toHtml} from 'hast-util-to-html'
import {visit} from 'unist-util-visit'
import {t} from './hastscript-tools.js'
import util from 'node:util'
import LineParser from './LineParser.js'
import { table } from 'node:console'

const RE_BlankLine = /^\s*$/
const RE_Tag = /^(([a-zA-Z_$][a-zA-Z\d_$]*)\s*:(?:\s+(.*?))?)\s*$/
const RE_Script = /^<%.*$/
const RE_Footnote = /^\[ *\^ *(\S+) *\] *: *(.+?) *$/
const RE_CodeBlock = /^```(([a-zA-Z]+)?)\s*$/
const RE_Div = /^(<\s*((\!html)|([a-z]+))((?:\s+[a-z]+(="[^"]*")?)*)\s*>?\s*)$/i
const RE_Heading = /^((=+)\s*(\S.*?)\s*[-=]*)\s*$/
const RE_HR = /^[=-\s]+$/
const RE_ListItem = /^(?:(?:([-*+])|(\d+[\.)]))\s+(\S.*?))\s*$/
const RE_ListItemTask = /^\s*\[ *([xX]?) *\]\s+(.*?)\s*$/
const RE_Table = /^(\|(.+?)\|?)\s*$/
const RE_TableHeader = /^[-| ]+$/


export default function linesToSxast(lines) {
    let doc = []
    let inScript = false

    for (let i=0 ; i<lines.length ; i++) {
        let ln = lines[i]
        if (inScript) {
            if (ln.text.trim().slice(-2) == '%>') {
                doc.push({ type: 'script', text: ln.text.trim().slice(0,-2) })
                inScript = false
            } else {
                doc.push({ type: 'script', text: ln.text })
            }
        } else {
            const s = lineToSqrm(ln)

            if (s.type == 'script') {
                if (s.text.trim().slice(-2) == '%>') {
                    s.text = s.text.trim().slice(0,-2)
                } else {
                    inScript = true
                }
            }        
                
            doc.push(s)
        }
    }

    return doc
}

function textToCells(text) {

    function splitText(text) {
        let cells = text.split('|')

        for (let c = cells.length-1 ; c>0 ; c--) {
            if (cells[c-1].charAt(cells[c-1].length-1) == '\\') {
                cells[c-1] = cells[c-1].slice(0,-1) + '|' + cells[c];
                cells.splice(c,1);
            }
        }
    
        return cells;
    }

    function pragmasToAttributes(pragmas) {
        let attr = {}
        
        for (let i=0 ; i<pragmas.length ; i++) {
            switch (pragmas[i]) {
                case '!' :
                    attr.header = true;
                    break;
                case 'r':
                    attr.align='right';
                    break;
                case 'l':
                    attr.align='left';
                    break;
                case 'c':
                    attr.align='center';
                    break;
                case 'v':
                    if (i+1<pragmas.length) {
                        let c = pragmas[i+1]
                        if (c >= '3' && c <= '9') {
                            attr.rowspan=c*1
                            i++
                        } else {
                            attr.rowspan=2
                        }
                    } else {
                        attr.rowspan=2
                    }
                    break;
                case '>':
                    if (i+1<pragmas.length) {
                        let c = pragmas[i+1]
                        if (c >= '3' && c <= '9') {
                            attr.colspan=c*1
                            i++
                        } else {
                            attr.colspan=2
                        }
                    } else {
                        attr.colspan=2
                    }

                    break;

            }
        }
        return attr
    }

    function tableCellFormatting(s) {
        for (let i=0; i<s.length ; i++) {
            if (s[i]==' ') {
                if (i==0 || i==s.length-1) return ['',s.trim()];
                return [s.substring(0,i),s.substring(i).trim()]
            }
        }
        return ["",s.trim()];
    }
        
    let cells = splitText(text)
    for (let i=0 ; i<cells.length ; i++) {
        let [f,t] = tableCellFormatting(cells[i])
        cells[i] = { children: textToHast(t), formatting: pragmasToAttributes(f) }
    }
    return cells;
}

function textToHast(text) {
    return new LineParser(text).root.children
}

function lineToSqrm(ln) {

    if (ln.text.length==0) {
        return {type:'blank', line:ln.line}
    }

    const ch = ln.text[0]
    let m;

    m = ln.text.match(RE_Heading)
    if (m) {
        return {type:'heading',text: ln.text, level:m[2].length,indent:ln.indent,children:textToHast(m[3]),line:ln.line}
    }

    m = ln.text.match(RE_ListItem)
    if (m) {

        if (m[1]!==undefined) {
            let t = m[3].match(RE_ListItemTask)
            if (t) {
                let task = { line: ln.line, done: t[1]!='', text: t[2] }
                return {type:'unordered-list-item',text: ln.text, indent:ln.indent,marker:m[1],children:textToHast(t[2]),line:ln.line, task: task}
            } else {
                return {type:'unordered-list-item',text: ln.text, indent:ln.indent,marker:m[1],children:textToHast(m[3]),line:ln.line}
            }
        } else if (m[2]!==undefined) {
            let t = m[3].match(RE_ListItemTask)
            if (t) {
                let task = { line: ln.line, done: t[1]!='', text: t[2] }
                return {type:'ordered-list-item',text: ln.text, indent:ln.indent,number:m[2],children:textToHast(t[2]),line:ln.line, task : task}
            } else {
                return {type:'ordered-list-item',text: ln.text, indent:ln.indent,number:m[2],children:textToHast(m[3]),line:ln.line}
            }
        }
    }

    if (ch=='<') {
        if (ln.text.length>1 && ln.text[1]=='%') {
            return {type:'script',indent:ln.indent,text: ln.text, code: ln.text.slice(2),line:ln.line}
        } else {
            m = ln.text.match(RE_Div)
            if (m) {
                return {type:'div',indent:ln.indent,tag:(m[2]?m[2]:'div'), text: ln.text, line:ln.line}
            }
        }
    }

    if (ch=='|') {
        m = ln.text.match(RE_Table)
        if (m) {
            const divider = ln.text.match(RE_TableHeader) !== null
            return { type: 'table-row', indent: ln.indent, divider: divider, text: ln.text, cells: textToCells(m[2]), line: ln.line }
        }
    }

    m = ln.text.match(RE_BlankLine) 
    if (m) {
        return {type:'blank', line:ln.line}
    }

    m = ln.text.match(RE_Tag);
    if (m) {
        return {type:'tag',indent:ln.indent, name:m[2], value: m[3],line:ln.line, text: ln.text}
    }

    m = ln.text.match(RE_Footnote);
    if (m) {
        return { type: 'footnote', indent: ln.indent, id: m[1], children: textToHast(m[2]), text: ln.text }
    }

    m = ln.text.match(RE_CodeBlock);
    if (m) {
        return {type:'code-block',indent:ln.indent,language: m[1],line:ln.line}
    }

    m = ln.text.match(RE_HR);
    if (m) {
        return {type:'hr',indent:ln.indent,line:ln.line, text: ln.text}
    }

    
    return {type:'text',indent:ln.indent,children:textToHast(ln.text),line:ln.line, text: ln.text}

}
