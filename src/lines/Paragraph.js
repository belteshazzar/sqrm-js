
import NonEmptyLine from './NonEmptyLine.js'
//import EmptyLine from './EmptyLine.js';

export default class Paragraph extends NonEmptyLine {
    constructor(ln,indent,text) {
        super(ln,indent,text);
    }
    process(is,os) {
        
        while (is.nextLine !== false && is.nextLine instanceof Paragraph) {
            this.text += ' ' + is.nextLine.text;
            is.next();
        }
        
        os.h(this.indent, 'p' ,{}, this.text)

    }
}

Paragraph.re = /^([ \t]*)(.*?)\s*$/ // indent, text
