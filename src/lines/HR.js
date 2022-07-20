
import NonEmptyLine from "./NonEmptyLine.js";
import Paragraph from "./Paragraph.js";

export default class HR extends NonEmptyLine {
    constructor(ln,re) {
        super(ln,re[1].length,re.input);
    }

    process(is,os) {
        os.div(this.indent,'hr');
    }

}

HR.re = /^(\s*)--+\s*$/
