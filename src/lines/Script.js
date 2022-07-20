
import NonEmptyLine from './NonEmptyLine.js'
//import EmptyLine from './EmptyLine.js';

export default class Script extends NonEmptyLine {
    constructor(ln,m) {
        super(ln,-1,m.input.trim().substring(2));
    }
    process(is,os) {

        if (this.text.trim().slice(-2) == '%>') {
//            os.code('// start and end')
            os.code(this.text.substring(0,this.text.length-2))
        } else {
//            os.code('// start')
            os.code(this.text);
            while (is.nextLine !== false) {
                if (is.nextLine instanceof NonEmptyLine 
                        && is.nextLine.text.trim().slice(-2) == '%>') {
//                    os.code('// end')
                    os.code(is.nextLine.text.trim().substring(0,is.nextLine.text.trim().length - 2));
                    is.next();
                    break
                } else {
//                    os.code('// ...')
                    os.code(is.nextLine.text);
                    is.next();
                }
            }
        }        
    }
}

Script.re = /^\s*(<%.*?)\s*$/ // indent, text
