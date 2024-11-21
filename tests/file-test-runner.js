
import { unified } from 'unified';
import * as fs from 'fs'
import parseIndentedLines from '../src/unified/parse-indented-lines.js'
import indentedLinesToSxast from '../src/unified/plugin-ilines-to-sast.js';
// import sqrmLinesToSxast from '../../src/unified/plugin-sxlines-to-sxast.js'
import resqrmToEsast from '../src/unified/plugin-sxast-to-esast.js'
import compileEcma from '../src/unified/compile-ecma.js'
import sastToHast from '../src/unified/plugin-sast-to-hast.js'
import {visit} from 'unist-util-visit'
import { inspect } from "unist-util-inspect";
import util from 'node:util'
import rehypeStringify from 'rehype-stringify'
import rehypeParse from 'rehype-parse'
import SqrmContext from '../src/sqrm-context.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import {toHtml} from 'hast-util-to-html'

const logilines = process.env.ILINES
const logsast = process.env.SAST
const logecma = process.env.ECMA
const logjs = process.env.JS
const loghast = process.env.HAST
const logjson = process.env.JSON
const loghtml = process.env.HTML

const logSqrm = process.env.SQRM || logilines
      || logsast || logecma 
      || logjs
      || loghast || logjson || loghtml
      
const __dirname = dirname(fileURLToPath(import.meta.url));

export default function(testName,folder) {


    const filenames = fs.readdirSync(folder)
        .filter(s => s.endsWith('.sqrm'))
        .map(s => folder+s.replace('.sqrm',''))

  describe(`suite ${testName}`, () => {

    for (let filename of filenames) {

    const sqrm = fs.readFileSync(`${filename}.sqrm`, 'utf-8').toString()
    const expectedHtml = (
        fs.existsSync(`${filename}.html`)
        ? fs.readFileSync(`${filename}.html`, 'utf-8').toString()//.replaceAll(/\r/g,'')
        : '' )
    const expectedJson = (
        fs.existsSync(`${filename}.json`)
        ? JSON.parse(fs.readFileSync(`${filename}.json`, 'utf-8').toString())
        : {} )

    test(`test ${testName} - ${filename}`,() => {

        if (logSqrm) console.log(sqrm)

        const file = unified()
            .use(parseIndentedLines)
            .use((options = {}) => {
                return (tree, file) => {
                    expect(tree).not.toBeNull()
                    if (logilines) console.log("=== indented lines (ilines) ===\n" + inspect(tree))
                    expect(tree.children).not.toBeNull()
                };
            })
            .use(indentedLinesToSxast)
            .use((options = {}) => {
                return (tree, file) => {
                    expect(tree).not.toBeNull()
                    if (logsast) console.log("=== sqrm ast (sast) ===\n" + inspect(tree))
                    expect(tree.children).not.toBeNull()
                };
            })
            // .use(sqrmLinesToSxast)
            // .use((options = {}) => {
            //     return (tree, file) => {
            //         expect(tree).not.toBeNull()
            //         if (logsxast) console.log(inspect(tree))
            //         expect(tree.children).not.toBeNull()
            //     };
            // })
            .use(resqrmToEsast)
            .use((options = {}) => {
                return (program, file) => {
                    expect(program).not.toBeNull()
                    if (logecma) console.log(inspect(program))
                    expect(program.body).not.toBeNull()
                };
            })
            .use(compileEcma)
            .processSync(sqrm)

        expect(file).not.toBeNull()

        if (logjs) console.log(file.result.value)

        const f = new Function(file.result.value)

        const self = new SqrmContext()
        const req = {};

        try {
            f.call(self,req)
        } catch (e) {
            console.error(e)
        }



        expect(self.hast).not.toBeNull()
        expect(self.json).not.toBeNull()

        visit(self.hast, (node) => {
            delete node.sqrm
          })
          
        if (loghast) console.log('hast -------------\n',inspect(self.hast,false,null,true))

        if (logjson) console.log('json -------------\n',util.inspect(json,false,null,true))

        // const hast = self.hast //unified()
//             .use(sastToHast)
// //            .use(rehypeStringify)
//             .runSync(self.doc)

//        console.log(toHtml(hast))

        // if (loghast) console.log('hast -------------\n',inspect(hast))

        const html = unified()
            .use(rehypeStringify,{
                closeEmptyElements: true,
                closeSelfClosing: true,
                tightSelfClosing: true,
                upperDoctype: true
            })
            .stringify(self.hast)

        if (loghtml) console.log(html)

        expect(html).toBe(expectedHtml)
        expect(self.json.toJSON()).toEqual(expectedJson || {})
    })
    }
  })
}