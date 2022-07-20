
import Line from './Line.js'

export default class NonEmptyLine extends Line {

    constructor(ln,indent,text) {
        super(ln);
        this.indent = indent;
        this.text = text;
    }

}
