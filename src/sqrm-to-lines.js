
import {h} from 'hastscript'
import {toHtml} from 'hast-util-to-html'
import {visit} from 'unist-util-visit'
import {t} from './hastscript-tools.js'
import util from 'node:util'
import LineParser from './LineParser.js'
import { table } from 'node:console'


/*

    1. string             -> lines              (stringToLines)

    2. lines              -> flat-sqrm-w-script (linesToSqrm)

    3. flat-sqrm-w-script -> javascript         (sqrmToCode)

    4. javascript         -> flat-sqrm          (fn response)

    5. flat-sqrm          -> sqrm-tree          (sqrmToSqrmTree)

    6. sqrm-tree          -> hast               (sqrmToHast)

    7. hast               -> html               (hastToHtml)

*/

export default function sqrmToLines(str, indentation = 2) {

    const l = str.length
    let lines = []
    let i = 0;
    let j = 0;
    let n = 1;

    let atLineStart = true
    let indent = 0

    function addLine(split) {
        lines.push({line: n, indent: Math.floor(indent/indentation), text: str.substring(i,j).trim()})
        ++n
        atLineStart = true
        indent = 0
        i = j + split;
        j = i
    }

    while (j<l) {

        const s = str[j]
        if (atLineStart) {
            if (s==' ') {
                ++indent
                ++i
            } else {
                atLineStart = false
            }
        }
        if (s=='\r') {
            if (j+1<l && str[j+1]=='\n') {
                addLine(2)
            } else {
                j++
            }
        } else if (s=='\n') {
            addLine(1)
        } else {
            ++j
        }
    }
    addLine(0)
    return lines;

}
