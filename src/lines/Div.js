
import NonEmptyLine from './NonEmptyLine.js'
import EmptyLine from './EmptyLine.js'

export default class Div extends NonEmptyLine {
        constructor(ln,re) { //indent,text,tag,attributes) {
//            console.log(re);
            super(ln,re[1].length,re[2]);
            this.tag = re[3];
            this.attributes = re[6];
        }

        process(is,os) {
            // while (nextLine !== false && !(nextLine instanceof EmptyLine)) {
            //     this.quote += ' ' + nextLine.text;
            //     next();
            // }

            os.div(this.indent, this.tag, (this.attributes?' ' + this.attributes.trim().replace(/"/g, '\\"'):''));

            if (this.tag=='style' || this.tag=='script') {

                while (is.nextLine !== false
                    && (is.nextLine instanceof EmptyLine
                        || is.nextLine.indent > this.indent)) {

                    if (is.nextLine instanceof EmptyLine) {
                        os.raw(this.indent,'')
                    } else {
                        os.raw(is.nextLine.indent,is.nextLine.text)
                    }
                    is.next();
                }

            } else if (this.tag=='pre') {

                while (is.nextLine !== false
                    && (is.nextLine instanceof EmptyLine
                        || is.nextLine.indent > this.indent)) {

                    if (is.nextLine instanceof EmptyLine) {
                        os.raw(this.indent,'')
                    } else if (is.nextLine instanceof Div) {
                        let l = is.nextLine
                        os.div(l.indent, l.tag, (l.attributes?' ' + l.attributes.trim().replace(/"/g, '\\"'):''));
                    } else {
                        os.raw(is.nextLine.indent,is.nextLine.text)
                    }
                    is.next();
                }

            }

            // while (is.nextLine !== false
            //     && (is.nextLine instanceof EmptyLine || is.nextLine.indent > this.indent)) {
            //     is.next();
            //     is.line.process(is,os);
            // }

        }
    }

Div.re = /^([ \t]*)(<\s*((\!html)|([a-z]+))((?:\s+[a-z]+(="[^"]*")?)*)\s*>?\s*)$/i
