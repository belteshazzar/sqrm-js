
import NonEmptyLine from "./NonEmptyLine.js";
import ListItemTag from "./ListItemTag.js";
import ListItemNoValueTag from "./ListItemNoValueTag.js";
import EmptyLine from "./EmptyLine.js";
import Tag from './Tag.js'

export default class ListItem extends NonEmptyLine {
    constructor(ln,match) { //indent,text,marker,number,item) {
        super(ln,match[1].length,match[0]);
        this.marker = match[2];
        this.number = match[3];
        this.item = match[4];
    }

    asTag() {
        let m = this.item.match(Tag.re);
        if (m) {
            return new ListItemTag(this.line,this.indent, this.text, m[3], m[4])
        } else {
            return new ListItemNoValueTag(this.line,this.indent, this.text, this.item)
        }
    }

    process(is,os) {

//        os.write(os.indent(this.indent) + (this.marker ? '<ul>' : '<ol>'));

        while (is.nextLine !== false 
                && !(is.nextLine instanceof EmptyLine) 
                && !(is.nextLine instanceof ListItem)) {
            this.item += ' ' + is.nextLine.text;
            is.next();
        }

        const isTask = this.text.match(ListItem.taskRE);

        if (this.marker) {
            if (isTask) {
                os.ut(this.ln,this.indent, isTask[1]!='', os.format(isTask[2],0,'').str)
            } else {
                os.ul(this.ln,this.indent, os.format(this.item,0,'').str);
            }
        } else {
            if (isTask) {
                os.ot(this.ln,this.indent, isTask[1]!='', os.format(isTask[2],0,'').str)
            } else {
                os.ol(this.ln,this.indent, os.format(this.item,0,'').str);
            }
        }

        // while (is.nextLine !== false
        //         && !(is.nextLine instanceof EmptyLine) 
        //         && is.nextLine.indent >= this.indent
        //         && is.nextLine instanceof ListItem) {
        //     is.next();
        //     if (is.line.indent > this.indent) {
        //         is.line.process(is,os)
        //     } else {
        //         let ln = is.line;
        //         while (is.nextLine !== false 
        //                 && !(is.nextLine instanceof EmptyLine) 
        //                 && !(is.nextLine instanceof ListItem)) {
        //             ln.item += ' ' + is.nextLine.text;
        //             is.next();
        //         }

        //         if (this.marker) {
        //             os.ul(ln.indent, os.format(ln.item,0,'').str);
        //         } else {
        //             os.ol(this.indent, os.format(ln.item,0,'').str);
        //         }

        //     }
        // }

        // os.write(os.indent(this.indent) + (this.marker ? '</ul>' : '</ol>'));
    }

}

ListItem.re = /^((?:  )*) ?(?:(?:([-*+])|(\d+[\.)]))\s+(\S.*?))\s*$/ // indent, marker, text
ListItem.taskRE = /^(?:(?:  )*) ?(?:(?:[-*+])|(?:\d+[\.)]))\s+\[ *([xX]?) *\]\s+(.*?)\s*$/