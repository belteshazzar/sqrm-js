
import {h} from 'hastscript'
import sastTextToHast from './sast-text-to-hast.js';

export default function sastTableToHast(rows,context) {
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
            for (let j=0 ; j<head[i].children.length ; j++) {
                if (head[i].children[j].formatting.align) {
                    colAlignment[j] = head[i].children[j].formatting.align
                }
            }
        }
    }

    function cell(row,cellNumber,forceHeader) {
        let el = h((forceHeader || row.children[cellNumber].formatting.header ? 'th' : 'td'))

        if (row.children[cellNumber].formatting.colspan !== undefined) {
            el.properties.colspan = row.children[cellNumber].formatting.colspan
        }

        if (row.children[cellNumber].formatting.rowspan !== undefined) {
            el.properties.rowspan = row.children[cellNumber].formatting.rowspan
        }

        if (row.children[cellNumber].formatting.align !== undefined) {
            el.properties.style = `text-align: ${row.children[cellNumber].formatting.align};`
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
            for (let j=0 ; j<head[i].children.length ; j++) {
                const th = cell(head[i],j,true)
                tr.children.push(th)
                th.children = sastTextToHast(head[i].children[j].children,context)
            }
        }
    }

    const tbody = h('tbody')
    table.children.push(tbody)
    for (let i=0 ; i<body.length ; i++) {
        const tr = h('tr')
        tbody.children.push(tr)
        for (let j=0 ; j<body[i].children.length ; j++) {
            const td = cell(body[i],j)
            tr.children.push(td)
            td.children = sastTextToHast(body[i].children[j].children,context)
        }
    }

    if (foot.length>0) {
        const tfoot = h('tfoot')
        table.children.push(tfoot)
        for (let i=0 ; i<foot.length ; i++) {
            const tr = h('tr')
            tfoot.children.push(tr)
            for (let j=0 ; j<foot[i].children.length ; j++) {
                const td = cell(foot[i],j)
                tr.children.push(td)
                td.children = sastTextToHast(foot[i].children[j].children,context)
            }
        }
    }

    return table;
}
