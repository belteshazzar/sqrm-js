
import { unified } from 'unified';
import * as fs from 'fs'
import parseIndentedLines from '../src/unified/parse-indented-lines.js'
import indentedLinesToSxast from '../src/unified/plugin-ilines-to-sast.js';
// import sqrmLinesToSxast from '../../src/unified/plugin-sxlines-to-sxast.js'
import resqrmToEsast from '../src/unified/plugin-sast-to-esast.js'
import compileEcma from '../src/unified/compile-ecma.js'
// import sastToHast from '../src/unified/plugin-sast-to-hast.js'
import {visit} from 'unist-util-visit'
import { inspect } from "unist-util-inspect";
import util from 'node:util'
import rehypeStringify from 'rehype-stringify'
import rehypeParse from 'rehype-parse'
import SqrmContext from '../src/sqrm-context.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import {toHtml} from 'hast-util-to-html'
import {h} from 'hastscript'

import {t} from '../src/util/hastscript-tools.js'
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
            .processSync(sqrm)

        expect(file).not.toBeNull()


        const hastResult = h('div',{class: 'sqrm-docs'})
        const jsonResult = []

        for (let i=0 ; i<file.result.length ; i++) {

            if (logjs) console.log('js -------------\n',file.result[i].value)

            let f = null
            try {
                f = new Function(file.result[i].value)
            } catch (e) {
                hastResult.children.push(h('div',{
                    class: 'sqrm-error'
                },[h('pre',{},[h('code',{class: 'language-sqrm'},[t(sqrm)])])]))
                jsonResult.push({ error: e.message})
                continue
            }

            const self = new SqrmContext()
            const req = {};

            try {
                f.call(self,req)
            } catch (e) {
                hastResult.children.push(h('div',{
                    class: 'sqrm-error'
                },[h('pre',{},[h('code',{class: 'language-sqrm'},[t(sqrm)])])]))
                jsonResult.push({ error: e.message})
                continue
            }

            self.processFootnotes()

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

            hastResult.children.push(self.hast)
            jsonResult.push(self.json.toJSON())
        }

        if (hastResult.children.length == 1) {

            const html = unified()
                .use(rehypeStringify,{
                    closeEmptyElements: true,
                    closeSelfClosing: true,
                    tightSelfClosing: true,
                    upperDoctype: true
                })
                .stringify(hastResult.children[0])

            if (loghtml) console.log(html)

            expect(html).toBe(expectedHtml)
            expect(jsonResult[0]).toEqual(expectedJson || {})
        } else {

            const html = unified()
                .use(rehypeStringify,{
                    closeEmptyElements: true,
                    closeSelfClosing: true,
                    tightSelfClosing: true,
                    upperDoctype: true
                })
                .stringify(hastResult)

            if (loghtml) console.log(html)

            expect(html).toBe(expectedHtml)
            expect(jsonResult).toEqual(expectedJson || {})

        }
    })
    }
  })
}