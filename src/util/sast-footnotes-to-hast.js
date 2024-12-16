
import {h} from 'hastscript'
import {visit} from 'unist-util-visit'
import {t} from '../util/hastscript-tools.js'
import sastTextToHast from './sast-text-to-hast.js';

export default function(context) {

    const hast = context.hast
    const footnotes = context.footnotes
    const linkDefinitions = context.linkDefinitions

    // http://www.java2s.com/example/html-css/css-widget/adding-parentheses-in-html-ordered-list.html

    if (footnotes.length>0) {
        let footnotesLookup = {}
        const ol = h('ol')
        hast.children.push(h('section',{ class: 'footnotes'},[ol]))
        for (let i=0 ; i<footnotes.length ; i++) {
            footnotesLookup[footnotes[i].id] = i+1

            ol.children.push(h('li',{},[ h('a',{id:`footnote-${footnotes[i].id}`}
            )].concat([t(' ')]).concat(sastTextToHast(footnotes[i].children,context))))
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
                ol.children.push(h('li',{},[ h('a',{id:`footnote-${id}`}) ]))
            }
            node.children[0].value = `[${num}]`
        })
    }

    if (linkDefinitions.length>0) {

        let lookup = {}

        for (let i=0 ; i<linkDefinitions.length ; i++) {
            lookup[linkDefinitions[i].id] = linkDefinitions[i]
        }

        visit(hast, (node) => {
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

}