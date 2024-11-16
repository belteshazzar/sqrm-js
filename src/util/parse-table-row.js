

import lineToSxast from './parse-text.js'
import {yamlToEsast} from './str-to-esast.js'
import link from './str-to-link.js'
import util from 'node:util'

const RE_ScriptEnd = /%>\s*$/


export default function parseTableRow(text) {

    function splitText(text) {
        let cells = text.split('|')

        for (let c = cells.length-1 ; c>0 ; c--) {
            if (cells[c-1].charAt(cells[c-1].length-1) == '\\') {
                cells[c-1] = cells[c-1].slice(0,-1) + '|' + cells[c];
                cells.splice(c,1);
            }
        }
    
        return cells;
    }

    function pragmasToAttributes(pragmas) {
        let attr = {}
        
        for (let i=0 ; i<pragmas.length ; i++) {
            switch (pragmas[i]) {
                case '!' :
                    attr.header = true;
                    break;
                case 'r':
                    attr.align='right';
                    break;
                case 'l':
                    attr.align='left';
                    break;
                case 'c':
                    attr.align='center';
                    break;
                case 'v':
                    if (i+1<pragmas.length) {
                        let c = pragmas[i+1]
                        if (c >= '3' && c <= '9') {
                            attr.rowspan=c*1
                            i++
                        } else {
                            attr.rowspan=2
                        }
                    } else {
                        attr.rowspan=2
                    }
                    break;
                case '>':
                    if (i+1<pragmas.length) {
                        let c = pragmas[i+1]
                        if (c >= '3' && c <= '9') {
                            attr.colspan=c*1
                            i++
                        } else {
                            attr.colspan=2
                        }
                    } else {
                        attr.colspan=2
                    }

                    break;
            }
        }
        return attr
    }

    function tableCellFormatting(s) {
        for (let i=0; i<s.length ; i++) {
            if (s[i]==' ') {
                if (i==0 || i==s.length-1) return ['',s.trim()];
                return [s.substring(0,i),s.substring(i).trim()]
            }
        }
        return ["",s.trim()];
    }
        
    let cells = splitText(text)
    for (let i=0 ; i<cells.length ; i++) {
        let [f,t] = tableCellFormatting(cells[i])
        cells[i] = { type: 'table-cell', children: lineToSxast(t), formatting: pragmasToAttributes(f) }
    }
    return cells;
}
