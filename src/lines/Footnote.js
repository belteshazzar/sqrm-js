
import NonEmptyLine from "./NonEmptyLine.js";
import Paragraph from "./Paragraph.js";

export default class Footnote extends NonEmptyLine {
    constructor(ln,m) {
        super(ln,m[1].length,m[3]);
        this.ref = m[2];
    }

    process(is,os) {

        while (is.nextLine !== false && is.nextLine instanceof Paragraph) {
            this.text += ' ' + is.nextLine.text;
            is.next();
        }

        os.footnote(this.indent, this.ref, os.format(this.text,0,'').str);
    }

}

Footnote.re = /^((?:  )*) ?\[ *\^ *(\S+) *\] *: *(.+?) *$/
