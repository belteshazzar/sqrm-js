
import Line from './Line.js'

export default class EmptyLine extends Line {
    constructor(ln) {
        super(ln);
    }

    process() {}
}

EmptyLine.re = /^\s*$/
