
import { unified } from 'unified';

import parseIndentedLines from '../src/unified/parse-indented-lines.js'
import indentedLinesToSxast from '../src/unified/plugin-ilines-to-sast.js';
// import sqrmLinesToSxast from '../original/plugin-sxlines-to-sxast.js'
import resqrmToEsast from '../src/unified/plugin-sast-to-esast.js'
import compileEcma from '../src/unified/compile-ecma.js'
// import sastToHast from '../src/unified/plugin-sast-to-hast.js'
import {visit} from 'unist-util-visit'
import rehypeStringify from 'rehype-stringify'
// import rehypeParse from 'rehype-parse'
import SqrmContext from '../src/sqrm-context.js';
import {h} from 'hastscript'
import {t} from '../src/util/hastscript-tools.js'

export default function(src) {

    const file = unified()
        .use(parseIndentedLines)
        .use(indentedLinesToSxast)
        .use(resqrmToEsast)
        .use(compileEcma)
        .processSync(src)

    const hast = h('div',{class: 'sqrm-docs'})
    const json = []

    for (let i=0 ; i<file.result.length ; i++) {

        let f = null
        try {
            f = new Function(file.result[i].value)
        } catch (e) {
            hast.children.push(h('div',{
                class: 'sqrm-error'
            },[h('pre',{},[h('code',{class: 'language-sqrm'},[t(src)])])]))
            json.push({ error: e.message})
            continue
        }

        const self = new SqrmContext()
        const req = {};

        try {
            f.call(self,req)
        } catch (e) {
            hast.children.push(h('div',{
                class: 'sqrm-error'
            },[h('pre',{},[h('code',{class: 'language-sqrm'},[t(src)])])]))
            json.push({ error: e.message})
            continue
        }

        self.processFootnotes()

        visit(self.hast, (node) => {
            delete node.sqrm
        })

        hast.children.push(self.hast)
        json.push(self.json.toJSON())

    }

    if (file.result.length == 1) {
        const html = unified()
            .use(rehypeStringify)
            .stringify(hast.children[0])

        return {html,json: json[0]}
    } else {
        const html = unified()
            .use(rehypeStringify)
            .stringify(hast)

        return {html,json}
    }
}