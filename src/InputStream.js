import Heading from './lines/Heading.js'
import Tag from './lines/Tag.js'
import ListItem from './lines/ListItem.js'
import Table from './lines/Table.js';
import Div from './lines/Div.js';
import EmptyLine from './lines/EmptyLine.js';
import Paragraph from './lines/Paragraph.js';
import Script from './lines/Script.js';
import CodeBlock from './lines/CodeBlock.js';
import Footnote from './lines/Footnote.js';
import HR from './lines/HR.js';


export default class InputStream {

    constructor(str) {
        this.str = str;
        this.i = 0;
        this.ln = 1;
        this.l = str.length;


        this.handlers = [
            Div,
            Script
        ];

        this.line = this.readline();
        this.nextLine = this.readline();

    }


    next() {
        this.line = this.nextLine;
        this.nextLine = this.readline();
    }


    readline() {
        if (this.i==this.l+1) {
            return false;
        }
        let ii = this.i;
        let nxt = this.l+1;
        while (ii<this.l) {
            if (this.str[ii]=='\r') {
                if (ii+1<this.l && this.str[ii+1]=='\n') {
                    nxt = ii + 2;
                    break;
                }
            } else if (this.str[ii]=='\n') {
                nxt = ii + 1;
                break;
            }
            ii++
        }
        const res = this.str.substring(this.i,ii)
        this.i = nxt;



        let m;
        m = res.match(Heading.re);
        if (m) {
            return new Heading(this.ln++,m[1].length,m[2], m[3].length, m[4]);
        }
        m = res.match(Tag.re);
        if (m) {
//            console.log(m);
            return new Tag(this.ln++,m[1].length, m[2], m[3], m[4])
        }
        // m = res.match(Task.re)
        // if (m) {
        //     return new Task(this.ln++,m);
        // }
        m = res.match(ListItem.re);
        if (m) {
//            console.log(m);
            return new ListItem(this.ln++, m)
        }
        m = res.match(Table.re);
        if (m) {
            return new Table(this.ln++,m[1].length, m[2],m[3]);
        }

        // this.handlers.forEach(h => {
        //     let m = res.match(h.re);
        //     if (m) return new h(this.ln++,m);
        // })

        m = res.match(Div.re)
        if (m) {
            return new Div(this.ln++, m)
        }
        m = res.match(Script.re);
        if (m) {
            return new Script(this.ln++,m);
        }
        m = res.match(Footnote.re);
        if (m) {
            return new Footnote(this.ln++,m);
        }
        m = res.match(EmptyLine.re);
        if (m) {
            return new EmptyLine(this.ln++);
        }
        m = res.match(CodeBlock.re);
        if (m) {
            return new CodeBlock(this.ln++, m);
        }
        m = res.match(HR.re)
        if (m) {
            return new HR(this.ln++,m);
        }
        m = res.match(Paragraph.re);
        if (m) {
            return new Paragraph(this.ln++, m[1].length, m[2] );
        }
        
        throw new Error('line is not matched: \"' + res + '\"')
    }


}