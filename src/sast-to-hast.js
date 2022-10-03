
import {h} from 'hastscript'
// import {toHtml} from 'hast-util-to-html'
import {visit} from 'unist-util-visit'
import {t} from './hastscript-tools.js'
import util from 'node:util'
import { hrtime } from 'node:process'
// import LineParser from './LineParser.js'
// import { table } from 'node:console'
//import BlankLine from './lines/BlankLine.js'


/*

    1. string             -> lines              (stringToLines)  sqrm-to-last (intermeddiatry lines)

    2. lines              -> flat-sqrm-w-script (linesToSqrm)    last-to-sxast (sqrm-scripted ast)

    3. flat-sqrm-w-script -> javascript         (sqrmToCode)     sxast-to-js

    4. javascript         -> flat-sqrm          (fn response)    produces sqrm ast (no script elements)

    5. flat-sqrm          -> sqrm-tree          (sqrmToSqrmNested)

    6. sqrm-tree          -> hast               (sqrmToHast)

    7. hast               -> html               (hastToHtml)

*/

function tableOf(rows) {
    let head = []
    let body = []
    let foot = []
    let colAlignment = {}

    for (let i=0 ; i<rows.length ; i++) {
        if (rows[i].divider) {
            head = body
            body = []
            for (let j=i+1 ; j<rows.length ; j++) {
                if (rows[j].divider) {
                    for (let k=j+1 ; k<rows.length ; k++) {
                        if (rows[k].divider) continue
                        foot.push(rows[k])
                    }
                    break
                }
                body.push(rows[j])
            }
            break
        }
        body.push(rows[i])
    }

    if (head.length>0) {
        for (let i=0 ; i<head.length ; i++) {
            for (let j=0 ; j<head[i].cells.length ; j++) {
                if (head[i].cells[j].formatting.align) {
                    colAlignment[j] = head[i].cells[j].formatting.align
                }
            }
        }
    }

    function cell(row,cellNumber,forceHeader) {
        let el = h((forceHeader || row.cells[cellNumber].formatting.header ? 'th' : 'td'))

        if (row.cells[cellNumber].formatting.colspan !== undefined) {
            el.properties.colspan = row.cells[cellNumber].formatting.colspan
        }

        if (row.cells[cellNumber].formatting.rowspan !== undefined) {
            el.properties.rowspan = row.cells[cellNumber].formatting.rowspan
        }

        if (row.cells[cellNumber].formatting.align !== undefined) {
            el.properties.style = `text-align: ${row.cells[cellNumber].formatting.align};`
        } else if (colAlignment[cellNumber] !== undefined) {
            el.properties.style = `text-align: ${colAlignment[cellNumber]};`
        }

        return el
    }

    console.log('table +++++++++++++++++++++++++++++++')
    console.log(util.inspect(head,false,null,false))
    console.log(util.inspect(body,false,null,false))
    console.log(util.inspect(foot,false,null,false))
    const table = h('table')

    if (head.length>0) {
        const thead = h('thead')
        table.children.push(thead)
        for (let i=0 ; i<head.length ; i++) {
            const tr = h('tr')
            thead.children.push(tr)
            for (let j=0 ; j<head[i].cells.length ; j++) {
                const th = cell(head[i],j,true)
                tr.children.push(th)
                th.children = head[i].cells[j].children
            }
        }
    }

    const tbody = h('tbody')
    table.children.push(tbody)
    for (let i=0 ; i<body.length ; i++) {
        const tr = h('tr')
        tbody.children.push(tr)
        for (let j=0 ; j<body[i].cells.length ; j++) {
            const td = cell(body[i],j)
            tr.children.push(td)
            td.children = body[i].cells[j].children
        }
    }

    if (foot.length>0) {
        const tfoot = h('tfoot')
        table.children.push(tfoot)
        for (let i=0 ; i<foot.length ; i++) {
            const tr = h('tr')
            tfoot.children.push(tr)
            for (let j=0 ; j<foot[i].cells.length ; j++) {
                const td = cell(foot[i],j)
                tr.children.push(td)
                td.children = foot[i].cells[j].children
            }
        }
    }

    return table;
}

export default function sastToHast(sqrm) {

    const doc = { type: "root", children: [] }
    let footnotes = []
    let i = 0

    function next() {
        if (i==sqrm.length) return null
        return sqrm[i++]
    }

    function peek() {
        if (i==sqrm.length) return null
        return sqrm[i]
    }

    function footnoteNum(id,text) {
        for (let i=0 ; i<footnotes.length ; i++) {
            if (footnotes[i].id == id) {
                if (text != undefined) {
                    footnotes[i].text = text;
                }
                return i+1
            }
        }
        footnotes.push({ id: id, text: text });
        return footnotes.length;
    }

    function processIndentation(indent) {

        function div() {
            let n = next()
            let div = h(`${n.tag}`)
            div.children.push(processIndentation(indent+1))
            return div
        }
    
        function heading() {
            let n = next()
            if (n==null || n.type != 'heading') {
                throw new Error('expected heading but found ' + n.type)
            }
            return h(`h${Math.min(n.level,6)}`,{}, n.children)
        }
    
        function xList(tagName,type) {
            return function() {
                const list = h(tagName,{}, [listItem()] )
                let n = peek()
                while (n!=null) {
                    if (n.indent == indent && n.type == type) {
                        list.children.push(listItem())
                    } else if (n.type == 'blank') {
                        blank()
                    } else if (n.indent >= indent + 1 ) {
                        list.children.push(processIndentation(indent+1))
                    } else {
                        break
                    }
                    n = peek()
                }
                return list
            }
        }

        let orderedList = xList('ol','ordered-list-item')
        let unorderedList = xList('ul','unordered-list-item')

        function listItem() {
            let n = next()
            if (n==null || (n.type != 'unordered-list-item' && n.type != 'ordered-list-item')) {
                throw new Error('expected list-item but found ' + n.type)
            }
            const li = h('li',{}, n.children )
            let el = li
            if (n.task) {
                const form = h('form', {method: 'PUT'})
                li.children.push(form)
                const hidden = h('input',{type:'hidden',value:n.task.line})
                form.children.push(hidden)
                const checkbox = h('input',{type:'checkbox',onchange:'this.form.submit()'})
                if (n.task.done) checkbox.properties.checked = 'checked'
                form.children.push(checkbox)
                el = checkbox
            }
            n = peek()
            while (n != null && n.indent == indent + 1 && n.type == 'text') {
                n = next()
                el.children = el.children.concat(t('\n')).concat(n.children)
                n = peek()
            }
            return li
        }

        function blank() {
            let n = next()
            if (n==null || n.type != 'blank') {
                throw new Error('expected blank but found ' + n.type)
            }
            return null
        }
        
        function paragraph() {
            let n = next()
            const p = h('p',{}, n.children)
            n = peek()
            while (n != null && n.type == 'text' && n.indent == indent) {
                n = next()
                p.children = p.children.concat(t('\n')).concat(n.children)
                n = peek()
            }
            return p
        }

        function hr() {
            let n = next()
            return h('hr')
        }
    
        function table() {
            let n = next()
            if (n==null || n.type != 'table-row') {
                throw new Error('expected table-row but found ' + n.type)
            }
            let rows = [n]
            n = peek()
            while (n!=null && n.type == 'table-row' && n.indent == indent) {
                rows.push(next())
                n = peek()
            }
            return tableOf(rows)
        }
    
        function tag() {
            let n = next()   
        }
    
        const ln = peek()
//        console.log('processIndentation',indent, ln)

        if (ln.indent == undefined) {
            return blank()
        }

        if (ln.indent < indent) {
            // reduced indentation, exit indented scope
            return null
        }

        if (ln.indent > indent) {
            let div = h('div')
            const divIndent = indent + 1
            let n = peek()
            while (n!=null && (n.indent == undefined || n.indent >= divIndent)) {
                if (n.indent == undefined) {
                    blank()
                } else {
                    let child = processIndentation(divIndent)
                    if (child) div.children.push(child)
                }
                n = peek()
            }
            return div
        }

        switch (ln.type) {
            case "div":
                return div()
            case "footnote":
                footnotes.push(next())
                return null
            case "heading":
                return heading()
            case 'hr':
                return hr()
            case "ordered-list-item":
                return orderedList()
            case "unordered-list-item":
                return unorderedList()
            case "text":
                return paragraph()
            case "table-row":
                return table()
            case "tag":
                return tag()
            default:
                console.error(util.inspect(ln,false,null,false));
                throw new Error('un-handled type: ' + ln.type)                
        }
    }

    while (peek()!=null) {
        let child = processIndentation(0)
        if (child) doc.children.push(child)
    }

    // http://www.java2s.com/example/html-css/css-widget/adding-parentheses-in-html-ordered-list.html
    if (footnotes.length>0) {
        let footnotesLookup = {}
        const ol = h('ol')
        doc.children.push(h('section',{ class: 'footnotes'},[ol]))
        for (let i=0 ; i<footnotes.length ; i++) {
            footnotesLookup[footnotes[i].id] = i+1
//             console.log('footnote ========================')
// console.log(util.inspect(footnotes[i],false,null,false))
// console.log(util.inspect([t(`[${i+1}]`)].concat(footnotes[i].hast),false,null,false))

            ol.children.push(h('li',{},[ h('a',{name:`footnote-${footnotes[i].id}`}
            )].concat([t(' ')]).concat(footnotes[i].hast)))
        }

        visit(doc, (node) => {
            return node.type=='element' && node.tagName=='a' && node.properties['footnote-u'] !== undefined
        }, (node) => {
            // console.log('reference to footnote ========================')
            // console.log(node)
            const id = node.properties['footnote-u']
            // console.log('id',id)
            let num = footnotesLookup[node.properties['footnote-u']]
            // console.log('num',num)
            if (num===undefined) {
                // used but not defined
                num = Object.keys(footnotesLookup).length + 1
                // console.log('num => ',num)
                footnotesLookup[id] = num
                ol.children.push(h('li',{},[ h('a',{name:`footnote-${id}`}) ]))
            }
            node.children[0].value = `[${num}]`
        })
    }


    return doc

}
