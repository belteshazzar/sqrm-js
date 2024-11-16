

import lineToSxast from '../src/util/parse-text.js'
import {yamlToEsast} from '../src/util/str-to-esast.js'
import link from '../src/util/str-to-link.js'
import util from 'node:util'

const RE_ScriptEnd = /%>\s*$/


export default function sqrmLinesToSxast(options = {}) {

    return (root,file) => {

        let sxast = {
            type: "sxast",
            children: []
        };

        let i = 0

        function next() {
            if (i==root.children.length) return null
            return root.children[i++]
        }

        function peek() {
            if (i==root.children.length) return null
            return root.children[i]
        }

        function script() {
            while (peek()!=null) {
                let ln = next()
                let m = ln.value.match(RE_ScriptEnd)
                if (m) {
                    doc.children.push({
                        type: 'script',
                        code: ln.text.replace(RE_ScriptEnd,''),
                    })
                    break
                } else {
                    doc.children.push({
                        type: 'script',
                        code: ln.text,
                    })
                }
            }
        }

        while (peek()!=null) {
            let ln = next()

            sxast.children.push(ln)

            if (ln.type == 'script') {
                let m = ln.value.match(RE_ScriptEnd)
                if (m) {
                    ln.code = ln.code.replace(RE_ScriptEnd,'')
                } else {
                    script()
                }
            }
        }

        // // TODO: put this logic inline rather than post
        // // at this point text lines and unordered/ordered-list-item lines 
        // // do not have have .children set

        // let docsX = []

        // // console.log(util.inspect(docs,false,null,true))

        // for (const doc of docs.children) {
        //     const docX = []
        //     docsX.push(docX)

        //     let paragraph = null
        //     let listItem = null

        //     for (let i=0 ; i<doc.children.length ; i++) {
        //         const line = doc.children[i]

        //         if (line.type == 'text') {
        //             if (paragraph && line.indent == paragraph.indent) {
        //                 // append text to current paragraph
        //                 paragraph.value += '\n' + line.value
        //             } else if (listItem && line.indent == listItem.indent + 1) {
        //                 // append to text to current list item
        //                 listItem.value += '\n' + line.value
        //             } else {
        //                 // new paragraph
        //                 paragraph = {
        //                     type: 'paragraph',
        //                     indent: line.indent,
        //                     value: line.value
        //                 }
        //                 docX.push(paragraph)
        //             }
        //         } else if (line.type == 'unordered-list-item' || line.type == 'ordered-list-item') {
        //             // new list item
        //             listItem = {
        //                 type: line.type,
        //                 indent: line.indent,
        //                 value: line.value
        //             }
        //             docX.push(listItem)
        //         } else {
        //             docX.push(line)
        //         }
        //     }

        //     for (let i=0 ; i<docX.length ; i++) {
        //         let child = docX[i]

        //         if (child.type == 'paragraph' || child.type == 'unordered-list-item' || child.type == 'ordered-list-item') {
        //             child.children = lineToSxast(child.value)
        //             delete child.value
        //         }
        //     }
        // }

        return sxast
    }
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
        cells[i] = { children: lineToSxast(t), formatting: pragmasToAttributes(f) }
    }
    return cells;
}
