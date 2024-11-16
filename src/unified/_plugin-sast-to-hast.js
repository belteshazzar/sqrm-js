
import {h} from 'hastscript'
import {visit} from 'unist-util-visit'
import {t} from '../util/hastscript-tools.js'
import lineToSxast from '../util/parse-text.js'
import util from 'util'

function tableOf(rows) {
    let head = []
    let body = []
    let foot = []
    let colAlignment = {}

    // console.log(util.inspect(rows,false,null,true))

    let r = 0

    // put all lines in body until end or there is a divider
    while ( r<rows.length && rows[r].type != 'table-divider-line') {
        body.push(rows[r++])
    }

    // got a divider, put rows so far in header and start filling body
    if (r<rows.length) {
        r++
        head = body
        body = []

        // put all lines in body until end or there is a divider
        while ( r<rows.length && rows[r].type != 'table-divider-line') {
            body.push(rows[r++])
        }

        // found a second divider, put all remaining rows in foot
        if (r<rows.length) {
            r++

            while ( r<rows.length ) {
                if (rows[r].type == 'table-row-line') {
                    foot.push(rows[r])
                }
                r++
            }
        
        }
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
                th.children = head[i].cells[j].content
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
            td.children = body[i].cells[j].content
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
                td.children = foot[i].cells[j].content
            }
        }
    }

    return table;
}

function tagForStyle(s) {
    switch (s) {
        case 'bold': return h('b');
        case 'italic': return h('i');
        case 'underline': return h('u');
        case 'strike-through': return h('s')
        case 'superscript': return h('sup')
        case 'subscript': return h('sub')
        case 'code': return h('code')
        case 'kbd': return h('kbd')
        default: return h('div',{'data-style':s})
    }
}

function sastTextToHast(sast) {

    let hast = sast
    let children = sast.children
    hast.children = []
    let stack = [{ children: hast.children }]

    function openStyle(s) {
        let n = tagForStyle(s)
        stack[stack.length-1].children.push(n)
        stack.push({ style: s, children: n.children })
    }

    function closedOpenStyle(s) {

//        console.log(util.inspect(stack,false,null,true))
        let i = stack.length - 1
        while (i>0 && stack[i].style != s) {
            i--
        }
        if (i>0) {
            // console.log('currently in style: ' + s + ' at stack i=' + i)

            while (stack.length>i) {
                stack.pop()
            }

            return true
        } else {
            return false
        }
    }

    // console.log('init stack',util.inspect(stack,false,null,true))
    // console.log('init hast',util.inspect(hast,false,null,true))

    for (let i=0 ; i<children.length ; i++) {

        // console.log('next child: ',util.inspect(children[i],false,null,true))

        switch (children[i].type) {
            case 'text':
            case 'element':
                stack[stack.length-1].children.push(children[i])
                // console.log('text, stack now',util.inspect(stack,false,null,true))
                break;
            case 'format':
                if (!closedOpenStyle(children[i].style)) {
                    openStyle(children[i].style)
                }
                break;
            default:
                throw new Error('not implemented: ' + JSON.stringify(children[i]))
        }

        // console.log('stack',util.inspect(stack,false,null,true))
        // console.log('hast',util.inspect(hast,false,null,true))

    }

    return hast
}

export default function sastToHast(options = {}) {

    return (root,file) => {

        const sqrm = root.children

        const doc = { type: "root", children: [] }
        let footnotes = []
        let linkDefinitions = []
        let i = 0

        function next() {
            if (i==sqrm.length) return null
            return sqrm[i++]
        }

        function peek() {
            if (i==sqrm.length) return null
            return sqrm[i]
        }

        // function footnoteNum(id,text) {
        //     for (let i=0 ; i<footnotes.length ; i++) {
        //         if (footnotes[i].id == id) {
        //             if (text != undefined) {
        //                 footnotes[i].text = text;
        //             }
        //             return i+1
        //         }
        //     }
        //     footnotes.push({ id: id, text: text });
        //     return footnotes.length;
        // }

        function processIndentation(indent) {
console.log(`process indentation: `,indent)
//            const indent = line.indent;

            function raw() {
                const lines = [t('\n')];
        
                while (peek()!=null) {
                    console.log('peek',peek())
                    if (peek().type == 'blank-line') {
                        next()
                        lines.push(t('\n'))
                    } else if (peek().indent > indent) {
                        let n = next()
                        lines.push(t(n.text.substring((indent+1)*2))) // TODO: hard coded indenting
                        lines.push(t('\n'))
                    } else {
                        break;
                    }
                }
        
                return lines
        
            }

            function pre(preIndent) {
                const lines = [t('\n')];
        
                while (peek()!=null) {
                    if (peek().type == 'blank-line') {
                        next()
                        lines.push(t('\n'))
                    } else if (peek().indent > preIndent) {
                        let n = next()
//console.log(n)
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
                            // lines.push(t(n.text))
                            // lines.push(t('\n'))
                            const ss = n.text.split('\n')
                            for (let j=0 ; j<ss.length ; j++) {
 //                               lines.push(t(ss[j].substring((preIndent+1)*2))) // TODO: hard coded indenting
                                lines.push(t(ss[j])) // TODO: hard coded indenting
                                lines.push(t('\n'))
                            }
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
                            const div = h('div',{class: 'alert-' + language},[])
                            let text = ""
                            for (let i=0 ; i<lines.length ; i++) {
                                // if (lines[i].type != 'blank') {
                                //     if (div.children.length > 0) div.children.push(t('\n'))
                                //     div.children.push(t(lines[i].text.substring((indent+1)*2)))
                                // }
                                if (lines[i].type == 'blank') {
                                    if (text!="") {
                                        div.children.push(...lineToSxast(text))
                                        text = ""
                                    }
                                } else {
                                    const ss = lines[i].text.split('\n')
                                    for (let j=0 ; j<ss.length ; j++) {
                                        if (text != "") text += '\n'
                                        text += ss[j].substring((indent+1)*2) // TODO: hard coded indenting
                                    }
                                }
                            }
                            if (text!="") {
                                div.children.push(...lineToSxast(text))
                            }

                            return div            
                        }
                    default:
                        {
                            const code = h('code',{class: 'language-' + (language==""?'text':language)})
                            let text = '\n'
                            for (let i=0 ; i<lines.length ; i++) {
                                if (lines[i].type == 'blank') {
                                    text += '\n'
                                } else {
                                    const ss = lines[i].text.split('\n')
                                    for (let j=0 ; j<ss.length ; j++) {
                                        text += ss[j].substring((indent+1)*2) + '\n' // TODO: hard coded indenting
                                    }
                                }
                            }
                            code.children = [t(text)]
                            return h('pre',{},[code])
                
                        }
                }
            }
            
            function div() {
                let n = next()

                let props = {}
                if (n.properties) {
                    Object.keys(n.properties).forEach(k => {
                        props[k] = n.properties[k].value
                    })
                }

                if (n.tag == '!DOCTYPE') {
                    let doctype = { type: 'doctype', properties: props }
                    doctype.children = processIndentation(n)
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
                    el.children = pre(n)
                    return el
                } else {
                    // n.properties.forEach(p => {
                    //     props[p.name] = p.value
                    // })
                    let div = h(`${n.tag}`,props)
                    div.children = processIndentation(n)
                    return div
                }
            }
        
            function heading() {
                let n = next()
                if (n==null || n.type != 'heading-line') {
                    throw new Error('expected heading but found ' + n.type)
                }
//                console.log('heading with children: ',n.children)
                return h(`h${Math.min(n.level,6)}`,{}, n.children)
            }
        
            function xList(tagName,type) {
                return function() {
                    const list = h(tagName,{}, [listItem()] )
                    let n = peek()
                    while (n!=null) {
                        if (n.indent == indent && n.type == type) {
                            list.children.push(listItem())
                        } else if (n.type == 'blank-line') {
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

            let orderedList = xList('ol','ordered-list-item-line')
            let unorderedList = xList('ul','unordered-list-item-line')

            function listItem() {
                let n = next()
                if (n==null || (n.type != 'unordered-list-item-line' && n.type != 'ordered-list-item-line')) {
                    throw new Error('expected list-item but found ' + n.type)
                }
                const li = h('li',{ class: 'task-list-item' }, n.children )
                // let el = li
                if (n.task) {
                    li.children = []
                    const form = h('form', {})
                    li.children.push(form)
                    const checkbox = h('input',{id:'todo'+n.task.line,name:'v2',type:'checkbox',onChange:'sqrmCB("task",'+n.task.line+',this.checked)'})
                    if (n.task.done) checkbox.properties.checked = 'checked'
                    form.children.push(checkbox)
                    const label = h('label',{for:'todo'+n.task.line},n.children)
                    form.children.push(label)
                    // el = checkbox
                }
                // n = peek()
                // while (n != null && n.indent == indent + 1 && n.type == 'text') {
                //     n = next()
                //     el.children = el.children.concat(t('\n')).concat(n.children)
                //     n = peek()
                // }
                return li
            }

            function blank() {
                let n = next()
                if (n==null || n.type != 'blank-line') {
                    throw new Error('expected blank but found ' + JSON.stringify(n))
                }
                return null
            }

            function scriptError() {
                let n = next()
                if (n==null || n.type != 'script-error') {
                    throw new Error('expected script-error but found ' + n.type);
                }
                return h('pre',{class:'script-error'},[t(n.text)])
            }
        
            function paragraph(n) {
                // let n = next()
                const p = h('div',{ class: 'p' }, n.children)
                // n = peek()
                // while (n != null && n.type == 'text-line' && n.indent == indent) {
                //     n = next()
                //     p.children = p.children.concat(t('\n')).concat(n.children)
                //     n = peek()
                // }

                sastTextToHast(p)
                // console.log(util.inspect(p))
                return p
            }

            function hr() {
                let n = next()
                return h('hr')
            }

            function codeBlock() {
                let n = next()
                if (n==null || n.type != 'code-block-line') {
                    throw new Error('expected code-block but found ' + n.type)
                }
                const language = n.language
                let lines = []
                n = peek()
                while (n!=null && (n.type == "blank-line" || n.indent >= indent + 1)) {
                    lines.push(next())
                    n = peek()
                }
                return blockOf(language,lines)
            }
        
            function table() {
                let n = next()
                if (n==null || ( n.type != 'table-row-line' && n.type != 'table-divider-line')) {
                    throw new Error('expected table-row but found ' + n.type)
                }
                let rows = [n]
                n = peek()
                while (n!=null && (n.type == 'table-row-line' || n.type == 'table-divider-line') && n.indent == indent) {
                    rows.push(next())
                    n = peek()
                }
                return tableOf(rows)
            }
        
            function yaml() {
                let n = next()
                return h('p',{}, n.children)
            }

            function processLine(ln) {
                // let ln = peek()

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
                    case 'blank-line':
                        return blank(ln);
                    case 'code-block-line':
                        return codeBlock(ln)
                    case "div-line":
                        return div(ln)
                    case "footnote-line":
                        footnotes.push(ln)
                        return null
                    case "heading-line":
                        return heading(ln)
                    case 'hr-line':
                        return hr(ln)
                    case "ordered-list-item-line":
                        return orderedList(ln)
                    case "unordered-list-item-line":
                        return unorderedList(ln)
                    case "text-line":
                        return paragraph(ln)
                    case "table-row-line":
                    case "table-divider-line":
                        return table(ln)
                    case "yaml-line":
                        return yaml(ln)
                    case "link-definition-line":
                        linkDefinitions.push()
                        return null
                    default:
                        throw new Error('un-handled type: ' + ln.type)                
                }
        
            }

            const lines = [];

            let cont = processLine(peek())
            while (cont) {
                lines.push(cont)
                cont = processLine(peek())
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

        if (linkDefinitions.length>0) {

            let lookup = {}

            for (let i=0 ; i<linkDefinitions.length ; i++) {
                lookup[linkDefinitions[i].id] = linkDefinitions[i]
            }

            visit(doc, (node) => {
                return node.type=='element' && node.tagName=='a' && node.properties['link-ref'] !== undefined
            }, (node) => {
                const id = node.properties['link-ref']
                let ld = lookup[id]
                if (ld) {
                    delete node.properties['link-ref']
                    const href = ld.link.properties.href
                    const txt = ld.link.children[0].value
                    node.properties['onClick'] = 'sqrmCB("href","'+ld.link.properties.href+'")'
                    if (href != txt) {
                        // if these are different the link definition contains link text
                        node.children = ld.link.children
                    }
                }
            })
        }

        return doc
    }
}
