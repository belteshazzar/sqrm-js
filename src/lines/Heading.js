
import NonEmptyLine from './NonEmptyLine.js'
import Paragraph from './Paragraph.js';

export default class Heading extends NonEmptyLine {
        constructor(ln,indent,text,level,heading) {
            super(ln,indent,text);
            this.level = level;
            this.heading = heading;
        }

        process(is,os) {
            // while (is.nextLine !== false && is.nextLine instanceof Paragraph) {
            //     this.heading += ' ' + is.nextLine.text;
            //     is.next();
            // }
    

            os.h(this.indent, `h${Math.min(this.level,6)}`,{}, this.heading)

            // switch (this.level) {
            //     case 1:
            //         os.h1(this.indent,os.format(this.heading,0,'').str);
            //         break;
            //     case 2:
            //         os.h2(this.indent,os.format(this.heading,0,'').str);
            //         break;
            //     case 3:
            //         os.h3(this.indent,os.format(this.heading,0,'').str);
            //         break;
            //     case 4:
            //         os.h4(this.indent,os.format(this.heading,0,'').str);
            //         break;
            //     case 5:
            //         os.h5(this.indent,os.format(this.heading,0,'').str);
            //         break;
            //     default:
            //         os.h6(this.indent,os.format(this.heading,0,'').str);
            //         break;
            // }

            // if (nextLine && nextLine instanceof EmptyLine) {
            //     out.write('<h'+this.level+'>'+this.heading+'</h'+this.level+'>\n');
            // } else {
            //     super.process();
            // }
        }
    }

Heading.re = /^([ \t]*)((=+)\s*(\S.*?)\s*[-=]*)\s*$/ // indent,level,text
