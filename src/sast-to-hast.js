
import {h} from 'hastscript'
import {visit} from 'unist-util-visit'
import {t} from './hastscript-tools.js'

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

        function raw() {
            const lines = [t('\n')];
    
            while (peek()!=null) {
                if (peek().type == 'blank') {
                    next()
                    lines.push(t('\n'))
                } else if (peek().indent > indent) {
                    let n = next()
                    lines.push(t(n.text))
                    lines.push(t('\n'))
                } else {
                    break;
                }
            }
    
            return lines
    
        }

        function pre(indent) {
            const lines = [t('\n')];
    
            while (peek()!=null) {
                if (peek().type == 'blank') {
                    next()
                    lines.push(t('\n'))
                } else if (peek().indent > indent) {
                    let n = next()
                    if (n.type == 'div') {

                        let props = {}
                        Object.keys(n.properties).forEach(k => {
                            props[k] = n.properties[k].value
                        })
            
                        let div = h(`${n.tag}`,props)
                        div.children = div.children.concat(pre(n.indent))
                        lines.push(div)
                        lines.push(t('\n'))
                    } else {
                        lines.push(t(n.text))
                        lines.push(t('\n'))
                    }
                } else {
                    break;
                }
            }
    
            return lines
    
        }

        function blockOf(language,lines) {
            switch(language) {
                case "info":
                case "tip":
                case "note":
                case "warning":
                    {
                        const div = h('div',{class: 'alert-' + language})
                        for (let i=0 ; i<lines.length ; i++) {
                            if (lines[i].type != 'blank') {
                                if (div.children.length > 0) div.children.push(t('\n'))
                                div.children.push(t(lines[i].text.substring((indent+1)*2))) // TODO: hard coded
                            }
                        }
                        return div
            
                    }
                default:
                    {
                        const code = h('code',{class: 'language-' + (language==""?'text':language)})
                        code.children.push(t('\n'))
                        for (let i=0 ; i<lines.length ; i++) {
                            if (lines[i].type != 'blank') {
                                code.children.push(t(lines[i].text.substring((indent+1)*2))) // TODO: hard coded
                            }
                            code.children.push(t('\n'))
                        }
                        return h('pre',{},[code])
            
                    }
            }
        }
        
        function div() {
            let n = next()

            let props = {}
            Object.keys(n.properties).forEach(k => {
                props[k] = n.properties[k].value
            })

            if (n.tag == '!DOCTYPE') {
                let doctype = { type: 'doctype', properties: props }
                doctype.children = processIndentation(indent+1)
                return doctype
            } else if (n.tag == '!--') {
                let comment = { type: 'comment' }
                comment.children = raw()
                return comment
            } else if (n.tag == 'script' || n.tag == 'style') {
                let el = h(n.tag)
                el.children = raw()
                return el
            } else if (n.tag == 'pre') {
                let el = h('pre')
                el.children = pre(n.indent)
                return el
            } else {
                // n.properties.forEach(p => {
                //     props[p.name] = p.value
                // })
                let div = h(`${n.tag}`,props)
                div.children = processIndentation(indent+1)
                return div
            }
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
                        list.children = list.children.concat(processIndentation(indent+1))
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
            const p = h('div',{ class: 'p' }, n.children)
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

        function codeBlock() {
            let n = next()
            if (n==null || n.type != 'code-block') {
                throw new Error('expected code-block but found ' + n.type)
            }
            const language = n.language
            let lines = []
            n = peek()
            while (n!=null && (n.type == "blank" || n.indent >= indent + 1)) {
                lines.push(next())
                n = peek()
            }
            return blockOf(language,lines)
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
    
        function yaml() {
            let n = next()
            return h('p',{}, n.children)
        }

        function processLine() {
            let ln = peek()

            if (ln.indent == undefined) {
                return blank()
            }
    
            if (ln.indent < indent) {
                // reduced indentation, exit indented scope
                return -1
            }
    
            if (ln.indent > indent) {
                let div = h('div')
                const divIndent = indent + 1
                div.children = processIndentation(divIndent)
                return div
            }
    
            switch (ln.type) {
                case 'code-block':
                    return codeBlock()
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
                case "yaml":
                    return yaml()
                default:
                    throw new Error('un-handled type: ' + ln.type)                
            }
    
        }

        const lines = [];

        while (peek()!=null) {
            let child = processLine()
            if (child == -1) break
            if (child) lines.push(child)
        }

        return lines

    }

    doc.children = processIndentation(0)

    // http://www.java2s.com/example/html-css/css-widget/adding-parentheses-in-html-ordered-list.html
    if (footnotes.length>0) {
        let footnotesLookup = {}
        const ol = h('ol')
        doc.children.push(h('section',{ class: 'footnotes'},[ol]))
        for (let i=0 ; i<footnotes.length ; i++) {
            footnotesLookup[footnotes[i].id] = i+1

            ol.children.push(h('li',{},[ h('a',{name:`footnote-${footnotes[i].id}`}
            )].concat([t(' ')]).concat(footnotes[i].children)))
        }

        visit(doc, (node) => {
            return node.type=='element' && node.tagName=='a' && node.properties['footnote-u'] !== undefined
        }, (node) => {
            const id = node.properties['footnote-u']
            let num = footnotesLookup[node.properties['footnote-u']]
            if (num===undefined) {
                // used but not defined
                num = Object.keys(footnotesLookup).length + 1
                footnotesLookup[id] = num
                ol.children.push(h('li',{},[ h('a',{name:`footnote-${id}`}) ]))
            }
            node.children[0].value = `[${num}]`
        })
    }

    return doc
}
