
import { unified } from 'unified';

import parseIndentedLines from '../src/unified/parse-indented-lines.js'
import indentedLinesToSxast from '../src/unified/plugin-ilines-to-sast.js';
// import sqrmLinesToSxast from '../original/plugin-sxlines-to-sxast.js'
import resqrmToEsast from '../src/unified/plugin-sast-to-esast.js'
import compileEcma from '../src/unified/compile-ecma.js'
// import sastToHast from '../src/unified/plugin-sast-to-hast.js'
import {visit} from 'unist-util-visit'
import { inspect } from "unist-util-inspect";
import util from 'node:util'
import rehypeStringify from 'rehype-stringify'
// import rehypeParse from 'rehype-parse'
import SqrmContext from '../src/sqrm-context.js';

const logilines = process.env.ILINES
const logsast = process.env.SAST
const logecma = process.env.ECMA
const logjs = process.env.JS
// const logsast = process.env.SAST
const loghast = process.env.HAST
const logjson = process.env.JSON
const loghtml = process.env.HTML

const logSqrm = process.env.SQRM || logilines
      || logecma || logjs || logsast 
      || loghast || logjson || loghtml

export default function(testName,testData) {

  const jestTestData = testData.map(d => [d.name,d])

  describe(testName, () => {

    it.each(jestTestData)("when '%s'",(name,data) => {

      if (logSqrm) console.log(data.sqrm)

      const file = unified()
        .use(parseIndentedLines)
        .use((options = {}) => {
          return (tree, file) => {
            expect(tree).not.toBeNull()
            if (logilines) console.log(inspect(tree))
            expect(tree.children).not.toBeNull()
            expect(tree.children.length).toBe(data.ilines)
          };
        })
        .use(indentedLinesToSxast)
        .use((options = {}) => {
          return (docs, file) => {
            // assuming single document
            expect(docs).not.toBeNull()
            if (logsast) console.log(inspect(docs))
            expect(docs.children).not.toBeNull()
            expect(docs.children.length).toBe(1)
            const doc = docs.children[0]
            expect(doc).not.toBeNull()
            expect(doc.children.length).toBe(data.slines)
          };
        })
        // .use(sqrmLinesToSxast)
        // .use((options = {}) => {
        //   return (tree, file) => {
        //     expect(tree).not.toBeNull()
        //     if (logsxast) console.log(inspect(tree))
        //     expect(tree.children).not.toBeNull()
        //     expect(tree.children.length).toBe(data['sxast-children'])
        //   };
        // })
        .use(resqrmToEsast)
        .use((options = {}) => {
          return (programs, file) => {
            expect(programs).not.toBeNull()
            if (logecma) console.log(inspect(programs))
            expect(programs.children).not.toBeNull()
            programs.children.forEach(program => {
              expect(program.body).not.toBeNull();
            });
          };
        })
        .use(compileEcma)
        .processSync(data.sqrm)

        expect(file).not.toBeNull()

        // multiple docs not supported
        expect(file.result.length).toBe(1)

        if (logjs) console.log(file.result[0].value)

        const f = new Function(file.result[0].value)

        const self = new SqrmContext()
        const req = {};

        try {
          f.call(self,req)
        } catch (e) {
          console.error(e)
        }

        self.processFootnotes()
        
        expect(self.hast).not.toBeNull()
        expect(self.json).not.toBeNull()

        visit(self.hast, (node) => {
          delete node.sqrm
        })

        // if (logsast) console.log(inspect(self.doc))

        if (logjson) console.log(util.inspect(json,false,null,true))

        // const hast = self.hast//unified()
          // .use(sastToHast)
          // .use(rehypeStringify)
          // .runSync(self.doc)

        if (loghast) {
          try {
            console.log(inspect(self.hast))
          } catch(e) {
            console.error(e)
            console.log(util.inspect(self.hast,false,null,true))
          }
        }
        
        const html = unified()
          .use(rehypeStringify)
          .stringify(self.hast)

        if (loghtml) console.log(html)

        expect(html).toBe(data.html)
        // console.log(util.inspect(self.jsonTree,false,null,true))
        // console.log(util.inspect(self.jsonTree.json,false,null,true))
        // console.log(JSON.stringify(self.jsonTree.json))
        expect(self.json.toJSON()).toEqual(data.json)
    })
  })
}