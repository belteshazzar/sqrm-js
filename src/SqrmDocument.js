
import fs from 'fs'


import Line from './lines/Line.js'
import EmptyLine from './lines/EmptyLine.js'
import NonEmptyLine from './lines/NonEmptyLine.js'
import Heading from './lines/Heading.js'
import Paragraph from './lines/Paragraph.js';
import JavaScriptOutputStream from './JavaScriptOutputStream.js';
import ListItemNoValueTag from './lines/ListItemNoValueTag.js';
import InputStream from './InputStream.js';


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

        const is = new InputStream(this.src);
        const os = new JavaScriptOutputStream();

        while (is.line !== false) {
            is.line.process(is,os);
            is.next();
        }

        const js = os.build();

        try {
            this.fn = new Function(js);
        } catch (e) {
            throw new Error(e,js);
        }
    }

    execute(request,response) {
        if (this.fn == null) return;
        this.fn(request,response)
    }
}
