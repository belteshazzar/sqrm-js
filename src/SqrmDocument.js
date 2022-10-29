
// import fs from 'fs'


// import Line from './lines/Line.js'
// import BlankLine from './lines/BlankLine.js'
// import NonEmptyLine from './lines/NonEmptyLine.js'
// import Heading from './lines/Heading.js'
// import Paragraph from './lines/Paragraph.js';
// import JavaScriptOutputStream from './JavaScriptOutputStream.js';
// import ListItemNoValueTag from './lines/ListItemNoValueTag.js';
//import InputStream from './_InputStream.js';


import sqrmToLines from './sqrm-to-lines.js';
import linesToSxast from './lines-to-sxast.js'
import sxastToJs from './sxast-to-js.js'
import util from 'node:util'

export default class SqrmDocument {
    constructor(collection, id,rev) {
        this.collection = collection;
        this.id = id;
        this.rev = rev;
        this.src = null;
        this.fn = null;
    }

    load() {
        if (this.src!=null) return;
        this.collection.load(this)
    }

    compile() {
        if (this.fn != null) return;
        if (this.src == null) return;

        // const re_doc = /^---$/
        // const re_inline_tag = /^([a-zA-Z_$][a-zA-Z\d_$]*)/

        if (process.env.npm_config_src) {
            console.log('= src ================')
            console.log(this.src)
        }

        let lines = sqrmToLines(this.src)

        if (process.env.npm_config_lines) {
            console.log('= lines =============')
            console.log(util.inspect(lines,false,null,true));
        }

        let sxast = linesToSxast(lines)

        if (process.env.npm_config_sxast) {
            console.log('= sxast =============')
            console.log(util.inspect(sxast,false,null,true));
        }

        const js = sxastToJs(sxast)

        if (process.env.npm_config_code) {
            console.log('= js =============')
            console.log(js)
        }

        try {
            this.fn = new Function(js);

        } catch (e) {
            console.log(e.stack)
            throw e
        }

        // const is = new InputStream(this.src);
        // const os = new JavaScriptOutputStream();

        // while (is.line !== false) {
        //     is.line.process(is,os);
        //     is.next();
        // }

        // const js = os.build();

        // // console.log('---------------------')
        // // console.log(js);
        // // console.log('---------------------')

        // try {
        //     this.fn = new Function(js);
        // } catch (e) {
        //     throw new Error(e,js);
        // }
    }

    execute(request,response) {
        if (this.fn == null) return;
        this.fn(request,response)
    }
}
