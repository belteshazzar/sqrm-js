
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

export default function(src) {

    const file = unified()
        .use(parseIndentedLines)
        .use(indentedLinesToSxast)
        .use(resqrmToEsast)
        .use(compileEcma)
        .processSync(src)

    const f = new Function(file.result.value)

    const self = new SqrmContext()
    const req = {};

    try {
        f.call(self,req)
    } catch (e) {
        console.error(e)
    }

    self.processFootnotes()

    visit(self.hast, (node) => {
        delete node.sqrm
    })

    const html = unified()
        .use(rehypeStringify)
        .stringify(self.hast)

    const json = self.json.toJSON()

    return {html,json}

}