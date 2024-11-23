
import {h} from 'hastscript'
import {visit} from 'unist-util-visit'
import {t} from '../util/hastscript-tools.js'

export default function(hast,footnotes) {

    // http://www.java2s.com/example/html-css/css-widget/adding-parentheses-in-html-ordered-list.html

    if (footnotes.length>0) {
        let footnotesLookup = {}
        const ol = h('ol')
        hast.children.push(h('section',{ class: 'footnotes'},[ol]))
        for (let i=0 ; i<footnotes.length ; i++) {
            footnotesLookup[footnotes[i].id] = i+1

            ol.children.push(h('li',{},[ h('a',{name:`footnote-${footnotes[i].id}`}
            )].concat([t(' ')]).concat(footnotes[i].children)))
        }

        visit(hast, (node) => {
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

}