
import { emojiMap } from 'smile2emoji';
import NonEmptyLine from './NonEmptyLine.js'

export default class Table extends NonEmptyLine {
        constructor(ln,indent,text,row) {
            super(ln,indent,text);
            this.row = row;
            this.colAlignment = {};
        }

        splitRow() {
            let row = { cells: this.row.split('|') }

            for (let c = row.cells.length-1 ; c>0 ; c--) {
                if (row.cells[c-1].charAt(row.cells[c-1].length-1) == '\\') {
                    row.cells[c-1] += '|' + row.cells[c];
                    row.cells.splice(c,1);
                }
            }

            return row;
        }

        process(is,os) {
            let rows = [];
            let headerRow = -1;

            rows.push(this.splitRow());
    
            while (is.nextLine !== false
                    && is.nextLine instanceof Table 
                    && is.nextLine.indent == this.indent) {
                is.next()
                if (headerRow == -1 && is.line.text.match(Table.headerRE)) {
                    headerRow = rows.length
                }
                rows.push(is.line.splitRow());
            }

            // for (let r=0 ; r<rows.length ; r++) {
            //     if (rows[r].match(Table.headerRE)) {
            //         headerRow = r;
            //         break;
            //     }
            // }

//            console.log("founder header row @ ",rows[headerRow])

//            os.table(this.indent)
//            os.el(this.indent,'table')
            os.h(this.indent,"table")

            if (headerRow>0) {
//                os.thead(this.indent+2)
//                os.el(this.indent+2,'thead')
                os.h(this.indent + 2, "thead")
                for (let r = 0 ; r<headerRow ; r++) {
                    const row = rows[r];
//                    os.tr(this.indent+4)
//                    os.el(this.indent+4,'tr')
                    os.h(this.indent + 4, "tr")
                    for (let c=0 ; c<row.cells.length ; c++) {
                        let {isHeading,attrs,str} = this.tableFormatting(c,row.cells[c])
//                        os.th(this.indent+6,os.format(str,0,'').str,attrs);
                        os.h(this.indent + 6, "th", attrs, str)
  //                      os._h();
                    }
                    // os._el();
//                    os._h()
                }
//                os._el();
//                os._h()
            }

//            os.el(this.indent+2,'tbody');
            os.h(this.indent + 2, 'tbody')
            for (let r = headerRow + 1 ; r<rows.length ; r++) {
                const row = rows[r];
//                os.el(this.indent+4,'tr')
                os.h(this.indent + 4, 'tr')
                for (let c=0 ; c<row.cells.length ; c++) {
                    let {isHeading,attrs,str} = this.tableFormatting(c,row.cells[c])
                    if (isHeading) {
//                        os.th(this.indent+6,os.format(str,0,'').str,attrs);
                        os.h(this.indent + 6, 'th',attrs,str)
//                        os._h();
                    } else {
//                        os.td(this.indent+6,os.format(str,0,'').str,attrs);
                        os.h(this.indent + 6, 'td',attrs,str);
//                        os._h();
                    }
                }
//                os._el();
//                os._h();
            };
//            os._el(); // /tbody
//            os._h();

//            os._el(); // /table
//            os._h()
        }

        splitFormatting(s) {
            for (let i=0; i<s.length ; i++) {
                if (s[i]==' ') {
                    if (i==0 || i==s.length-1) return s;
                    return [s.substring(0,i),s.substring(i).trim()]
                }
            }
            return s;
        }

        colAttributes(c) {
            if (this.colAlignment[c] != undefined) {
                return { align :this.colAlignment[c] }
            } else {
                return {};
            }
        }

        tableFormatting(c,s) {

            let isHeading = false;
            let align = null;
            let rowspan = null;
            let colspan = null;
            
            let ss = this.splitFormatting(s);
            
            if (ss.length!=2) {
                return { isHeading: false, attrs: this.colAttributes(c), str: s.trim() };
            }

            let pragmas = ss[0];
            let str = ss[1];
            
            for (let i=0 ; i<pragmas.length ; i++) {
                switch (pragmas[i]) {
                    case '!' :
                        isHeading = true;
                        break;
                    case 'r':
                        align='right';
                        break;
                    case 'l':
                        align='left';
                        break;
                    case 'c':
                        align='center';
                        break;
                    case 'v':
                        if (i+1<pragmas.length) {
                            let c = pragmas[i+1]
                            if (c >= '3' && c <= '9') {
                                rowspan=c*1
                                i++
                            } else {
                                rowspan=2
                            }
                        } else {
                            rowspan=2
                        }
                        break;
                    case '>':
                        if (i+1<pragmas.length) {
                            let c = pragmas[i+1]
                            if (c >= '3' && c <= '9') {
                                colspan=c*1
                                i++
                            } else {
                                colspan=2
                            }
                        } else {
                            colspan=2
                        }

                        break;
                    default:
                        return { isHeading: false, attrs: this.colAttributes(c), str: s.trim() };

                }
            }

            let attrs = {}

            if (isHeading && align!=null) {
                this.colAlignment[c] = align;
            }

            if (align!=null || this.colAlignment[c] != undefined || rowspan!=null || colspan!=null) {
                if (align != null) {
                    attrs.align = align
                } else if (this.colAlignment[c] != undefined) {
                    attrs.align = this.colAlignment[c]
                }

                if (rowspan != null) {
                    attrs.rowspan = rowspan
                }

                if (colspan != null) {
                    attrs.colspan = colspan
                }
            }

            return {isHeading: isHeading, attrs: attrs, str: str };
        }
    }

Table.re = /^([ \t]*)(\|(.+?)\|?)\s*$/
Table.headerRE = /^[-| ]+$/