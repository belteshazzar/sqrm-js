var sqrm = (function () {
    'use strict';

    function _mergeNamespaces(n, m) {
        m.forEach(function (e) {
            e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
                if (k !== 'default' && !(k in n)) {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        });
        return Object.freeze(n);
    }

    class Line {
        constructor(ln) {
            this.ln = ln;
        }

        process() {
            throw 'this class is abstract'
        }
    }

    class EmptyLine extends Line {
        constructor(ln) {
            super(ln);
        }

        process() {}
    }

    EmptyLine.re = /^\s*$/;

    class NonEmptyLine extends Line {

        constructor(ln,indent,text) {
            super(ln);
            this.indent = indent;
            this.text = text;
        }

    }

    //import EmptyLine from './EmptyLine.js';

    class Paragraph extends NonEmptyLine {
        constructor(ln,indent,text) {
            super(ln,indent,text);
        }
        process(is,os) {
            
            while (is.nextLine !== false && is.nextLine instanceof Paragraph) {
                this.text += ' ' + is.nextLine.text;
                is.next();
            }
            
            os.p(this.indent,os.format(this.text,0,'').str);
        }
    }

    Paragraph.re = /^([ \t]*)(.*?)\s*$/; // indent, text

    class Heading extends NonEmptyLine {
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
        
                switch (this.level) {
                    case 1:
                        os.h1(this.indent,os.format(this.heading,0,'').str);
                        break;
                    case 2:
                        os.h2(this.indent,os.format(this.heading,0,'').str);
                        break;
                    case 3:
                        os.h3(this.indent,os.format(this.heading,0,'').str);
                        break;
                    case 4:
                        os.h4(this.indent,os.format(this.heading,0,'').str);
                        break;
                    case 5:
                        os.h5(this.indent,os.format(this.heading,0,'').str);
                        break;
                    default:
                        os.h6(this.indent,os.format(this.heading,0,'').str);
                        break;
                }

                // if (nextLine && nextLine instanceof EmptyLine) {
                //     out.write('<h'+this.level+'>'+this.heading+'</h'+this.level+'>\n');
                // } else {
                //     super.process();
                // }
            }
        }

    Heading.re = /^([ \t]*)((=+)\s*(\S.*?)\s*[-=]*)\s*$/; // indent,level,text

    // This is a generated file. Do not edit.
    var Space_Separator = /[\u1680\u2000-\u200A\u202F\u205F\u3000]/;
    var ID_Start = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/;
    var ID_Continue = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/;

    var unicode = {
    	Space_Separator: Space_Separator,
    	ID_Start: ID_Start,
    	ID_Continue: ID_Continue
    };

    var util = {
        isSpaceSeparator (c) {
            return typeof c === 'string' && unicode.Space_Separator.test(c)
        },

        isIdStartChar (c) {
            return typeof c === 'string' && (
                (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c === '$') || (c === '_') ||
            unicode.ID_Start.test(c)
            )
        },

        isIdContinueChar (c) {
            return typeof c === 'string' && (
                (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c >= '0' && c <= '9') ||
            (c === '$') || (c === '_') ||
            (c === '\u200C') || (c === '\u200D') ||
            unicode.ID_Continue.test(c)
            )
        },

        isDigit (c) {
            return typeof c === 'string' && /[0-9]/.test(c)
        },

        isHexDigit (c) {
            return typeof c === 'string' && /[0-9A-Fa-f]/.test(c)
        },
    };

    let source;
    let parseState;
    let stack;
    let pos;
    let line;
    let column;
    let token;
    let key;
    let root;

    var parse = function parse (text, reviver) {
        source = String(text);
        parseState = 'start';
        stack = [];
        pos = 0;
        line = 1;
        column = 0;
        token = undefined;
        key = undefined;
        root = undefined;

        do {
            token = lex();

            // This code is unreachable.
            // if (!parseStates[parseState]) {
            //     throw invalidParseState()
            // }

            parseStates[parseState]();
        } while (token.type !== 'eof')

        if (typeof reviver === 'function') {
            return internalize({'': root}, '', reviver)
        }

        return root
    };

    function internalize (holder, name, reviver) {
        const value = holder[name];
        if (value != null && typeof value === 'object') {
            for (const key in value) {
                const replacement = internalize(value, key, reviver);
                if (replacement === undefined) {
                    delete value[key];
                } else {
                    value[key] = replacement;
                }
            }
        }

        return reviver.call(holder, name, value)
    }

    let lexState;
    let buffer;
    let doubleQuote;
    let sign;
    let c;

    function lex () {
        lexState = 'default';
        buffer = '';
        doubleQuote = false;
        sign = 1;

        for (;;) {
            c = peek();

            // This code is unreachable.
            // if (!lexStates[lexState]) {
            //     throw invalidLexState(lexState)
            // }

            const token = lexStates[lexState]();
            if (token) {
                return token
            }
        }
    }

    function peek () {
        if (source[pos]) {
            return String.fromCodePoint(source.codePointAt(pos))
        }
    }

    function read () {
        const c = peek();

        if (c === '\n') {
            line++;
            column = 0;
        } else if (c) {
            column += c.length;
        } else {
            column++;
        }

        if (c) {
            pos += c.length;
        }

        return c
    }

    const lexStates = {
        default () {
            switch (c) {
            case '\t':
            case '\v':
            case '\f':
            case ' ':
            case '\u00A0':
            case '\uFEFF':
            case '\n':
            case '\r':
            case '\u2028':
            case '\u2029':
                read();
                return

            case '/':
                read();
                lexState = 'comment';
                return

            case undefined:
                read();
                return newToken('eof')
            }

            if (util.isSpaceSeparator(c)) {
                read();
                return
            }

            // This code is unreachable.
            // if (!lexStates[parseState]) {
            //     throw invalidLexState(parseState)
            // }

            return lexStates[parseState]()
        },

        comment () {
            switch (c) {
            case '*':
                read();
                lexState = 'multiLineComment';
                return

            case '/':
                read();
                lexState = 'singleLineComment';
                return
            }

            throw invalidChar(read())
        },

        multiLineComment () {
            switch (c) {
            case '*':
                read();
                lexState = 'multiLineCommentAsterisk';
                return

            case undefined:
                throw invalidChar(read())
            }

            read();
        },

        multiLineCommentAsterisk () {
            switch (c) {
            case '*':
                read();
                return

            case '/':
                read();
                lexState = 'default';
                return

            case undefined:
                throw invalidChar(read())
            }

            read();
            lexState = 'multiLineComment';
        },

        singleLineComment () {
            switch (c) {
            case '\n':
            case '\r':
            case '\u2028':
            case '\u2029':
                read();
                lexState = 'default';
                return

            case undefined:
                read();
                return newToken('eof')
            }

            read();
        },

        value () {
            switch (c) {
            case '{':
            case '[':
                return newToken('punctuator', read())

            case 'n':
                read();
                literal('ull');
                return newToken('null', null)

            case 't':
                read();
                literal('rue');
                return newToken('boolean', true)

            case 'f':
                read();
                literal('alse');
                return newToken('boolean', false)

            case '-':
            case '+':
                if (read() === '-') {
                    sign = -1;
                }

                lexState = 'sign';
                return

            case '.':
                buffer = read();
                lexState = 'decimalPointLeading';
                return

            case '0':
                buffer = read();
                lexState = 'zero';
                return

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                buffer = read();
                lexState = 'decimalInteger';
                return

            case 'I':
                read();
                literal('nfinity');
                return newToken('numeric', Infinity)

            case 'N':
                read();
                literal('aN');
                return newToken('numeric', NaN)

            case '"':
            case "'":
                doubleQuote = (read() === '"');
                buffer = '';
                lexState = 'string';
                return
            }

            throw invalidChar(read())
        },

        identifierNameStartEscape () {
            if (c !== 'u') {
                throw invalidChar(read())
            }

            read();
            const u = unicodeEscape();
            switch (u) {
            case '$':
            case '_':
                break

            default:
                if (!util.isIdStartChar(u)) {
                    throw invalidIdentifier()
                }

                break
            }

            buffer += u;
            lexState = 'identifierName';
        },

        identifierName () {
            switch (c) {
            case '$':
            case '_':
            case '\u200C':
            case '\u200D':
                buffer += read();
                return

            case '\\':
                read();
                lexState = 'identifierNameEscape';
                return
            }

            if (util.isIdContinueChar(c)) {
                buffer += read();
                return
            }

            return newToken('identifier', buffer)
        },

        identifierNameEscape () {
            if (c !== 'u') {
                throw invalidChar(read())
            }

            read();
            const u = unicodeEscape();
            switch (u) {
            case '$':
            case '_':
            case '\u200C':
            case '\u200D':
                break

            default:
                if (!util.isIdContinueChar(u)) {
                    throw invalidIdentifier()
                }

                break
            }

            buffer += u;
            lexState = 'identifierName';
        },

        sign () {
            switch (c) {
            case '.':
                buffer = read();
                lexState = 'decimalPointLeading';
                return

            case '0':
                buffer = read();
                lexState = 'zero';
                return

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                buffer = read();
                lexState = 'decimalInteger';
                return

            case 'I':
                read();
                literal('nfinity');
                return newToken('numeric', sign * Infinity)

            case 'N':
                read();
                literal('aN');
                return newToken('numeric', NaN)
            }

            throw invalidChar(read())
        },

        zero () {
            switch (c) {
            case '.':
                buffer += read();
                lexState = 'decimalPoint';
                return

            case 'e':
            case 'E':
                buffer += read();
                lexState = 'decimalExponent';
                return

            case 'x':
            case 'X':
                buffer += read();
                lexState = 'hexadecimal';
                return
            }

            return newToken('numeric', sign * 0)
        },

        decimalInteger () {
            switch (c) {
            case '.':
                buffer += read();
                lexState = 'decimalPoint';
                return

            case 'e':
            case 'E':
                buffer += read();
                lexState = 'decimalExponent';
                return
            }

            if (util.isDigit(c)) {
                buffer += read();
                return
            }

            return newToken('numeric', sign * Number(buffer))
        },

        decimalPointLeading () {
            if (util.isDigit(c)) {
                buffer += read();
                lexState = 'decimalFraction';
                return
            }

            throw invalidChar(read())
        },

        decimalPoint () {
            switch (c) {
            case 'e':
            case 'E':
                buffer += read();
                lexState = 'decimalExponent';
                return
            }

            if (util.isDigit(c)) {
                buffer += read();
                lexState = 'decimalFraction';
                return
            }

            return newToken('numeric', sign * Number(buffer))
        },

        decimalFraction () {
            switch (c) {
            case 'e':
            case 'E':
                buffer += read();
                lexState = 'decimalExponent';
                return
            }

            if (util.isDigit(c)) {
                buffer += read();
                return
            }

            return newToken('numeric', sign * Number(buffer))
        },

        decimalExponent () {
            switch (c) {
            case '+':
            case '-':
                buffer += read();
                lexState = 'decimalExponentSign';
                return
            }

            if (util.isDigit(c)) {
                buffer += read();
                lexState = 'decimalExponentInteger';
                return
            }

            throw invalidChar(read())
        },

        decimalExponentSign () {
            if (util.isDigit(c)) {
                buffer += read();
                lexState = 'decimalExponentInteger';
                return
            }

            throw invalidChar(read())
        },

        decimalExponentInteger () {
            if (util.isDigit(c)) {
                buffer += read();
                return
            }

            return newToken('numeric', sign * Number(buffer))
        },

        hexadecimal () {
            if (util.isHexDigit(c)) {
                buffer += read();
                lexState = 'hexadecimalInteger';
                return
            }

            throw invalidChar(read())
        },

        hexadecimalInteger () {
            if (util.isHexDigit(c)) {
                buffer += read();
                return
            }

            return newToken('numeric', sign * Number(buffer))
        },

        string () {
            switch (c) {
            case '\\':
                read();
                buffer += escape();
                return

            case '"':
                if (doubleQuote) {
                    read();
                    return newToken('string', buffer)
                }

                buffer += read();
                return

            case "'":
                if (!doubleQuote) {
                    read();
                    return newToken('string', buffer)
                }

                buffer += read();
                return

            case '\n':
            case '\r':
                throw invalidChar(read())

            case '\u2028':
            case '\u2029':
                separatorChar(c);
                break

            case undefined:
                throw invalidChar(read())
            }

            buffer += read();
        },

        start () {
            switch (c) {
            case '{':
            case '[':
                return newToken('punctuator', read())

            // This code is unreachable since the default lexState handles eof.
            // case undefined:
            //     return newToken('eof')
            }

            lexState = 'value';
        },

        beforePropertyName () {
            switch (c) {
            case '$':
            case '_':
                buffer = read();
                lexState = 'identifierName';
                return

            case '\\':
                read();
                lexState = 'identifierNameStartEscape';
                return

            case '}':
                return newToken('punctuator', read())

            case '"':
            case "'":
                doubleQuote = (read() === '"');
                lexState = 'string';
                return
            }

            if (util.isIdStartChar(c)) {
                buffer += read();
                lexState = 'identifierName';
                return
            }

            throw invalidChar(read())
        },

        afterPropertyName () {
            if (c === ':') {
                return newToken('punctuator', read())
            }

            throw invalidChar(read())
        },

        beforePropertyValue () {
            lexState = 'value';
        },

        afterPropertyValue () {
            switch (c) {
            case ',':
            case '}':
                return newToken('punctuator', read())
            }

            throw invalidChar(read())
        },

        beforeArrayValue () {
            if (c === ']') {
                return newToken('punctuator', read())
            }

            lexState = 'value';
        },

        afterArrayValue () {
            switch (c) {
            case ',':
            case ']':
                return newToken('punctuator', read())
            }

            throw invalidChar(read())
        },

        end () {
            // This code is unreachable since it's handled by the default lexState.
            // if (c === undefined) {
            //     read()
            //     return newToken('eof')
            // }

            throw invalidChar(read())
        },
    };

    function newToken (type, value) {
        return {
            type,
            value,
            line,
            column,
        }
    }

    function literal (s) {
        for (const c of s) {
            const p = peek();

            if (p !== c) {
                throw invalidChar(read())
            }

            read();
        }
    }

    function escape () {
        const c = peek();
        switch (c) {
        case 'b':
            read();
            return '\b'

        case 'f':
            read();
            return '\f'

        case 'n':
            read();
            return '\n'

        case 'r':
            read();
            return '\r'

        case 't':
            read();
            return '\t'

        case 'v':
            read();
            return '\v'

        case '0':
            read();
            if (util.isDigit(peek())) {
                throw invalidChar(read())
            }

            return '\0'

        case 'x':
            read();
            return hexEscape()

        case 'u':
            read();
            return unicodeEscape()

        case '\n':
        case '\u2028':
        case '\u2029':
            read();
            return ''

        case '\r':
            read();
            if (peek() === '\n') {
                read();
            }

            return ''

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            throw invalidChar(read())

        case undefined:
            throw invalidChar(read())
        }

        return read()
    }

    function hexEscape () {
        let buffer = '';
        let c = peek();

        if (!util.isHexDigit(c)) {
            throw invalidChar(read())
        }

        buffer += read();

        c = peek();
        if (!util.isHexDigit(c)) {
            throw invalidChar(read())
        }

        buffer += read();

        return String.fromCodePoint(parseInt(buffer, 16))
    }

    function unicodeEscape () {
        let buffer = '';
        let count = 4;

        while (count-- > 0) {
            const c = peek();
            if (!util.isHexDigit(c)) {
                throw invalidChar(read())
            }

            buffer += read();
        }

        return String.fromCodePoint(parseInt(buffer, 16))
    }

    const parseStates = {
        start () {
            if (token.type === 'eof') {
                throw invalidEOF()
            }

            push();
        },

        beforePropertyName () {
            switch (token.type) {
            case 'identifier':
            case 'string':
                key = token.value;
                parseState = 'afterPropertyName';
                return

            case 'punctuator':
                // This code is unreachable since it's handled by the lexState.
                // if (token.value !== '}') {
                //     throw invalidToken()
                // }

                pop();
                return

            case 'eof':
                throw invalidEOF()
            }

            // This code is unreachable since it's handled by the lexState.
            // throw invalidToken()
        },

        afterPropertyName () {
            // This code is unreachable since it's handled by the lexState.
            // if (token.type !== 'punctuator' || token.value !== ':') {
            //     throw invalidToken()
            // }

            if (token.type === 'eof') {
                throw invalidEOF()
            }

            parseState = 'beforePropertyValue';
        },

        beforePropertyValue () {
            if (token.type === 'eof') {
                throw invalidEOF()
            }

            push();
        },

        beforeArrayValue () {
            if (token.type === 'eof') {
                throw invalidEOF()
            }

            if (token.type === 'punctuator' && token.value === ']') {
                pop();
                return
            }

            push();
        },

        afterPropertyValue () {
            // This code is unreachable since it's handled by the lexState.
            // if (token.type !== 'punctuator') {
            //     throw invalidToken()
            // }

            if (token.type === 'eof') {
                throw invalidEOF()
            }

            switch (token.value) {
            case ',':
                parseState = 'beforePropertyName';
                return

            case '}':
                pop();
            }

            // This code is unreachable since it's handled by the lexState.
            // throw invalidToken()
        },

        afterArrayValue () {
            // This code is unreachable since it's handled by the lexState.
            // if (token.type !== 'punctuator') {
            //     throw invalidToken()
            // }

            if (token.type === 'eof') {
                throw invalidEOF()
            }

            switch (token.value) {
            case ',':
                parseState = 'beforeArrayValue';
                return

            case ']':
                pop();
            }

            // This code is unreachable since it's handled by the lexState.
            // throw invalidToken()
        },

        end () {
            // This code is unreachable since it's handled by the lexState.
            // if (token.type !== 'eof') {
            //     throw invalidToken()
            // }
        },
    };

    function push () {
        let value;

        switch (token.type) {
        case 'punctuator':
            switch (token.value) {
            case '{':
                value = {};
                break

            case '[':
                value = [];
                break
            }

            break

        case 'null':
        case 'boolean':
        case 'numeric':
        case 'string':
            value = token.value;
            break

        // This code is unreachable.
        // default:
        //     throw invalidToken()
        }

        if (root === undefined) {
            root = value;
        } else {
            const parent = stack[stack.length - 1];
            if (Array.isArray(parent)) {
                parent.push(value);
            } else {
                parent[key] = value;
            }
        }

        if (value !== null && typeof value === 'object') {
            stack.push(value);

            if (Array.isArray(value)) {
                parseState = 'beforeArrayValue';
            } else {
                parseState = 'beforePropertyName';
            }
        } else {
            const current = stack[stack.length - 1];
            if (current == null) {
                parseState = 'end';
            } else if (Array.isArray(current)) {
                parseState = 'afterArrayValue';
            } else {
                parseState = 'afterPropertyValue';
            }
        }
    }

    function pop () {
        stack.pop();

        const current = stack[stack.length - 1];
        if (current == null) {
            parseState = 'end';
        } else if (Array.isArray(current)) {
            parseState = 'afterArrayValue';
        } else {
            parseState = 'afterPropertyValue';
        }
    }

    // This code is unreachable.
    // function invalidParseState () {
    //     return new Error(`JSON5: invalid parse state '${parseState}'`)
    // }

    // This code is unreachable.
    // function invalidLexState (state) {
    //     return new Error(`JSON5: invalid lex state '${state}'`)
    // }

    function invalidChar (c) {
        if (c === undefined) {
            return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
        }

        return syntaxError(`JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`)
    }

    function invalidEOF () {
        return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
    }

    // This code is unreachable.
    // function invalidToken () {
    //     if (token.type === 'eof') {
    //         return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
    //     }

    //     const c = String.fromCodePoint(token.value.codePointAt(0))
    //     return syntaxError(`JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`)
    // }

    function invalidIdentifier () {
        column -= 5;
        return syntaxError(`JSON5: invalid identifier character at ${line}:${column}`)
    }

    function separatorChar (c) {
        console.warn(`JSON5: '${formatChar(c)}' in strings is not valid ECMAScript; consider escaping`);
    }

    function formatChar (c) {
        const replacements = {
            "'": "\\'",
            '"': '\\"',
            '\\': '\\\\',
            '\b': '\\b',
            '\f': '\\f',
            '\n': '\\n',
            '\r': '\\r',
            '\t': '\\t',
            '\v': '\\v',
            '\0': '\\0',
            '\u2028': '\\u2028',
            '\u2029': '\\u2029',
        };

        if (replacements[c]) {
            return replacements[c]
        }

        if (c < ' ') {
            const hexString = c.charCodeAt(0).toString(16);
            return '\\x' + ('00' + hexString).substring(hexString.length)
        }

        return c
    }

    function syntaxError (message) {
        const err = new SyntaxError(message);
        err.lineNumber = line;
        err.columnNumber = column;
        return err
    }

    var stringify = function stringify (value, replacer, space) {
        const stack = [];
        let indent = '';
        let propertyList;
        let replacerFunc;
        let gap = '';
        let quote;

        if (
            replacer != null &&
            typeof replacer === 'object' &&
            !Array.isArray(replacer)
        ) {
            space = replacer.space;
            quote = replacer.quote;
            replacer = replacer.replacer;
        }

        if (typeof replacer === 'function') {
            replacerFunc = replacer;
        } else if (Array.isArray(replacer)) {
            propertyList = [];
            for (const v of replacer) {
                let item;

                if (typeof v === 'string') {
                    item = v;
                } else if (
                    typeof v === 'number' ||
                    v instanceof String ||
                    v instanceof Number
                ) {
                    item = String(v);
                }

                if (item !== undefined && propertyList.indexOf(item) < 0) {
                    propertyList.push(item);
                }
            }
        }

        if (space instanceof Number) {
            space = Number(space);
        } else if (space instanceof String) {
            space = String(space);
        }

        if (typeof space === 'number') {
            if (space > 0) {
                space = Math.min(10, Math.floor(space));
                gap = '          '.substr(0, space);
            }
        } else if (typeof space === 'string') {
            gap = space.substr(0, 10);
        }

        return serializeProperty('', {'': value})

        function serializeProperty (key, holder) {
            let value = holder[key];
            if (value != null) {
                if (typeof value.toJSON5 === 'function') {
                    value = value.toJSON5(key);
                } else if (typeof value.toJSON === 'function') {
                    value = value.toJSON(key);
                }
            }

            if (replacerFunc) {
                value = replacerFunc.call(holder, key, value);
            }

            if (value instanceof Number) {
                value = Number(value);
            } else if (value instanceof String) {
                value = String(value);
            } else if (value instanceof Boolean) {
                value = value.valueOf();
            }

            switch (value) {
            case null: return 'null'
            case true: return 'true'
            case false: return 'false'
            }

            if (typeof value === 'string') {
                return quoteString(value)
            }

            if (typeof value === 'number') {
                return String(value)
            }

            if (typeof value === 'object') {
                return Array.isArray(value) ? serializeArray(value) : serializeObject(value)
            }

            return undefined
        }

        function quoteString (value) {
            const quotes = {
                "'": 0.1,
                '"': 0.2,
            };

            const replacements = {
                "'": "\\'",
                '"': '\\"',
                '\\': '\\\\',
                '\b': '\\b',
                '\f': '\\f',
                '\n': '\\n',
                '\r': '\\r',
                '\t': '\\t',
                '\v': '\\v',
                '\0': '\\0',
                '\u2028': '\\u2028',
                '\u2029': '\\u2029',
            };

            let product = '';

            for (let i = 0; i < value.length; i++) {
                const c = value[i];
                switch (c) {
                case "'":
                case '"':
                    quotes[c]++;
                    product += c;
                    continue

                case '\0':
                    if (util.isDigit(value[i + 1])) {
                        product += '\\x00';
                        continue
                    }
                }

                if (replacements[c]) {
                    product += replacements[c];
                    continue
                }

                if (c < ' ') {
                    let hexString = c.charCodeAt(0).toString(16);
                    product += '\\x' + ('00' + hexString).substring(hexString.length);
                    continue
                }

                product += c;
            }

            const quoteChar = quote || Object.keys(quotes).reduce((a, b) => (quotes[a] < quotes[b]) ? a : b);

            product = product.replace(new RegExp(quoteChar, 'g'), replacements[quoteChar]);

            return quoteChar + product + quoteChar
        }

        function serializeObject (value) {
            if (stack.indexOf(value) >= 0) {
                throw TypeError('Converting circular structure to JSON5')
            }

            stack.push(value);

            let stepback = indent;
            indent = indent + gap;

            let keys = propertyList || Object.keys(value);
            let partial = [];
            for (const key of keys) {
                const propertyString = serializeProperty(key, value);
                if (propertyString !== undefined) {
                    let member = serializeKey(key) + ':';
                    if (gap !== '') {
                        member += ' ';
                    }
                    member += propertyString;
                    partial.push(member);
                }
            }

            let final;
            if (partial.length === 0) {
                final = '{}';
            } else {
                let properties;
                if (gap === '') {
                    properties = partial.join(',');
                    final = '{' + properties + '}';
                } else {
                    let separator = ',\n' + indent;
                    properties = partial.join(separator);
                    final = '{\n' + indent + properties + ',\n' + stepback + '}';
                }
            }

            stack.pop();
            indent = stepback;
            return final
        }

        function serializeKey (key) {
            if (key.length === 0) {
                return quoteString(key)
            }

            const firstChar = String.fromCodePoint(key.codePointAt(0));
            if (!util.isIdStartChar(firstChar)) {
                return quoteString(key)
            }

            for (let i = firstChar.length; i < key.length; i++) {
                if (!util.isIdContinueChar(String.fromCodePoint(key.codePointAt(i)))) {
                    return quoteString(key)
                }
            }

            return key
        }

        function serializeArray (value) {
            if (stack.indexOf(value) >= 0) {
                throw TypeError('Converting circular structure to JSON5')
            }

            stack.push(value);

            let stepback = indent;
            indent = indent + gap;

            let partial = [];
            for (let i = 0; i < value.length; i++) {
                const propertyString = serializeProperty(String(i), value);
                partial.push((propertyString !== undefined) ? propertyString : 'null');
            }

            let final;
            if (partial.length === 0) {
                final = '[]';
            } else {
                if (gap === '') {
                    let properties = partial.join(',');
                    final = '[' + properties + ']';
                } else {
                    let separator = ',\n' + indent;
                    let properties = partial.join(separator);
                    final = '[\n' + indent + properties + ',\n' + stepback + ']';
                }
            }

            stack.pop();
            indent = stepback;
            return final
        }
    };

    const JSON5 = {
        parse,
        stringify,
    };

    var lib$1 = JSON5;

    /**
     * Finite State Machine generation utilities
     */

    /**
     * Define a basic state machine state. j is the list of character transitions,
     * jr is the list of regex-match transitions, jd is the default state to
     * transition to t is the accepting token type, if any. If this is the terminal
     * state, then it does not emit a token.
     * @param {string|class} token to emit
     */
    function State(token) {
      this.j = {}; // IMPLEMENTATION 1
      // this.j = []; // IMPLEMENTATION 2

      this.jr = [];
      this.jd = null;
      this.t = token;
    }
    /**
     * Take the transition from this state to the next one on the given input.
     * If this state does not exist deterministically, will create it.
     *
     * @param {string} input character or token to transition on
     * @param {string|class} [token] token or multi-token to emit when reaching
     * this state
     */

    State.prototype = {
      /**
       * @param {State} state
       */
      accepts: function accepts() {
        return !!this.t;
      },

      /**
       * Short for "take transition", this is a method for building/working with
       * state machines.
       *
       * If a state already exists for the given input, returns it.
       *
       * If a token is specified, that state will emit that token when reached by
       * the linkify engine.
       *
       * If no state exists, it will be initialized with some default transitions
       * that resemble existing default transitions.
       *
       * If a state is given for the second argument, that state will be
       * transitioned to on the given input regardless of what that input
       * previously did.
       *
       * @param {string} input character or token to transition on
       * @param {Token|State} tokenOrState transition to a matching state
       * @returns State taken after the given input
       */
      tt: function tt(input, tokenOrState) {
        if (tokenOrState && tokenOrState.j) {
          // State, default a basic transition
          this.j[input] = tokenOrState;
          return tokenOrState;
        } // See if there's a direct state transition (not regex or default)


        var token = tokenOrState;
        var nextState = this.j[input];

        if (nextState) {
          if (token) {
            nextState.t = token;
          } // overrwites previous token


          return nextState;
        } // Create a new state for this input


        nextState = makeState(); // Take the transition using the usual default mechanisms

        var templateState = takeT(this, input);

        if (templateState) {
          // Some default state transition, make a prime state based on this one
          Object.assign(nextState.j, templateState.j);
          nextState.jr.append(templateState.jr);
          nextState.jr = templateState.jd;
          nextState.t = token || templateState.t;
        } else {
          nextState.t = token;
        }

        this.j[input] = nextState;
        return nextState;
      }
    };
    /**
     * Utility function to create state without using new keyword (reduced file size
     * when minified)
     */

    var makeState = function makeState() {
      return new State();
    };
    /**
     * Similar to previous except it is an accepting state that emits a token
     * @param {Token} token
     */

    var makeAcceptingState = function makeAcceptingState(token) {
      return new State(token);
    };
    /**
     * Create a transition from startState to nextState via the given character
     * @param {State} startState transition from thie starting state
     * @param {Token} input via this input character or other concrete token type
     * @param {State} nextState to this next state
     */

    var makeT = function makeT(startState, input, nextState) {
      // IMPLEMENTATION 1: Add to object (fast)
      if (!startState.j[input]) {
        startState.j[input] = nextState;
      } // IMPLEMENTATION 2: Add to array (slower)
      // startState.j.push([input, nextState]);

    };
    /**
     *
     * @param {State} startState stransition from this starting state
     * @param {RegExp} regex Regular expression to match on input
     * @param {State} nextState transition to this next state if there's are regex match
     */

    var makeRegexT = function makeRegexT(startState, regex, nextState) {
      startState.jr.push([regex, nextState]);
    };
    /**
     * Follow the transition from the given character to the next state
     * @param {State} state
     * @param {Token} input character or other concrete token type to transition
     * @returns {?State} the next state, if any
     */

    var takeT = function takeT(state, input) {
      // IMPLEMENTATION 1: Object key lookup (faster)
      var nextState = state.j[input];

      if (nextState) {
        return nextState;
      } // IMPLEMENTATION 2: List lookup (slower)
      // Loop through all the state transitions and see if there's a match
      // for (let i = 0; i < state.j.length; i++) {
      //	const val = state.j[i][0];
      //	const nextState = state.j[i][1];
      // 	if (input === val) { return nextState; }
      // }


      for (var i = 0; i < state.jr.length; i++) {
        var regex = state.jr[i][0];
        var _nextState = state.jr[i][1];

        if (regex.test(input)) {
          return _nextState;
        }
      } // Nowhere left to jump! Return default, if any


      return state.jd;
    };
    /**
     * Similar to makeT, but takes a list of characters that all transition to the
     * same nextState startState
     * @param {State} startState
     * @param {Array} chars
     * @param {State} nextState
     */

    var makeMultiT = function makeMultiT(startState, chars, nextState) {
      for (var i = 0; i < chars.length; i++) {
        makeT(startState, chars[i], nextState);
      }
    };
    /**
     * Set up a list of multiple transitions at once. transitions is a list of
     * tuples, where the first element is the transitions character and the second
     * is the state to transition to
     * @param {State} startState
     * @param {Array} transitions
     */

    var makeBatchT = function makeBatchT(startState, transitions) {
      for (var i = 0; i < transitions.length; i++) {
        var input = transitions[i][0];
        var nextState = transitions[i][1];
        makeT(startState, input, nextState);
      }
    };
    /**
     * For state machines that transition on characters only; given a non-empty
     * target string, generates states (if required) for each consecutive substring
     * of characters starting from the beginning of the string. The final state will
     * have a special value, as specified in options. All other "in between"
     * substrings will have a default end state.
     *
     * This turns the state machine into a Trie-like data structure (rather than a
     * intelligently-designed DFA).
     * @param {State} state
     * @param {string} str
     * @param {Token} endStateFactory
     * @param {Token} defaultStateFactory
     */

    var makeChainT = function makeChainT(state, str, endState, defaultStateFactory) {
      var i = 0,
          len = str.length,
          nextState; // Find the next state without a jump to the next character

      while (i < len && (nextState = state.j[str[i]])) {
        state = nextState;
        i++;
      }

      if (i >= len) {
        return [];
      } // no new tokens were added


      while (i < len - 1) {
        nextState = defaultStateFactory();
        makeT(state, str[i], nextState);
        state = nextState;
        i++;
      }

      makeT(state, str[len - 1], endState);
    };

    /******************************************************************************
    	Text Tokens
    	Tokens composed of strings
    ******************************************************************************/
    // A valid web domain token
    var DOMAIN = 'DOMAIN';
    var LOCALHOST = 'LOCALHOST'; // special case of domain
    // Valid top-level domain (see tlds.js)

    var TLD = 'TLD'; // Any sequence of digits 0-9

    var NUM = 'NUM'; // A web URL protocol. Supported types include
    // - `http:`
    // - `https:`
    // - `ftp:`
    // - `ftps:`
    // - user-defined custom protocols

    var PROTOCOL = 'PROTOCOL'; // Start of the email URI protocol

    var MAILTO = 'MAILTO'; // mailto:
    // Any number of consecutive whitespace characters that are not newline

    var WS = 'WS'; // New line (unix style)

    var NL = 'NL'; // \n
    // Opening/closing bracket classes

    var OPENBRACE = 'OPENBRACE'; // {

    var OPENBRACKET = 'OPENBRACKET'; // [

    var OPENANGLEBRACKET = 'OPENANGLEBRACKET'; // <

    var OPENPAREN = 'OPENPAREN'; // (

    var CLOSEBRACE = 'CLOSEBRACE'; // }

    var CLOSEBRACKET = 'CLOSEBRACKET'; // ]

    var CLOSEANGLEBRACKET = 'CLOSEANGLEBRACKET'; // >

    var CLOSEPAREN = 'CLOSEPAREN'; // )
    // Various symbols

    var AMPERSAND = 'AMPERSAND'; // &

    var APOSTROPHE = 'APOSTROPHE'; // '

    var ASTERISK = 'ASTERISK'; // *

    var AT = 'AT'; // @

    var BACKSLASH = 'BACKSLASH'; // \

    var BACKTICK = 'BACKTICK'; // `

    var CARET = 'CARET'; // ^

    var COLON = 'COLON'; // :

    var COMMA = 'COMMA'; // ,

    var DOLLAR = 'DOLLAR'; // $

    var DOT = 'DOT'; // .

    var EQUALS = 'EQUALS'; // =

    var EXCLAMATION = 'EXCLAMATION'; // !

    var HYPHEN = 'HYPHEN'; // -

    var PERCENT = 'PERCENT'; // %

    var PIPE = 'PIPE'; // |

    var PLUS = 'PLUS'; // +

    var POUND = 'POUND'; // #

    var QUERY = 'QUERY'; // ?

    var QUOTE = 'QUOTE'; // "

    var SEMI = 'SEMI'; // ;

    var SLASH = 'SLASH'; // /

    var TILDE = 'TILDE'; // ~

    var UNDERSCORE = 'UNDERSCORE'; // _
    // Default token - anything that is not one of the above

    var SYM = 'SYM';

    var text = /*#__PURE__*/Object.freeze({
    	__proto__: null,
    	DOMAIN: DOMAIN,
    	LOCALHOST: LOCALHOST,
    	TLD: TLD,
    	NUM: NUM,
    	PROTOCOL: PROTOCOL,
    	MAILTO: MAILTO,
    	WS: WS,
    	NL: NL,
    	OPENBRACE: OPENBRACE,
    	OPENBRACKET: OPENBRACKET,
    	OPENANGLEBRACKET: OPENANGLEBRACKET,
    	OPENPAREN: OPENPAREN,
    	CLOSEBRACE: CLOSEBRACE,
    	CLOSEBRACKET: CLOSEBRACKET,
    	CLOSEANGLEBRACKET: CLOSEANGLEBRACKET,
    	CLOSEPAREN: CLOSEPAREN,
    	AMPERSAND: AMPERSAND,
    	APOSTROPHE: APOSTROPHE,
    	ASTERISK: ASTERISK,
    	AT: AT,
    	BACKSLASH: BACKSLASH,
    	BACKTICK: BACKTICK,
    	CARET: CARET,
    	COLON: COLON,
    	COMMA: COMMA,
    	DOLLAR: DOLLAR,
    	DOT: DOT,
    	EQUALS: EQUALS,
    	EXCLAMATION: EXCLAMATION,
    	HYPHEN: HYPHEN,
    	PERCENT: PERCENT,
    	PIPE: PIPE,
    	PLUS: PLUS,
    	POUND: POUND,
    	QUERY: QUERY,
    	QUOTE: QUOTE,
    	SEMI: SEMI,
    	SLASH: SLASH,
    	TILDE: TILDE,
    	UNDERSCORE: UNDERSCORE,
    	SYM: SYM
    });

    // NOTE: punycode versions of IDNs are not included here because these will not
    // be as commonly used without the http prefix anyway and linkify will already
    // force-encode those.
    // To be updated with the values in this list
    // http://data.iana.org/TLD/tlds-alpha-by-domain.txt
    // Version 2021022800, Last Updated Sun Feb 28 07:07:01 2021 UTC
    var tlds = 'aaa \
aarp \
abarth \
abb \
abbott \
abbvie \
abc \
able \
abogado \
abudhabi \
ac \
academy \
accenture \
accountant \
accountants \
aco \
actor \
ad \
adac \
ads \
adult \
ae \
aeg \
aero \
aetna \
af \
afamilycompany \
afl \
africa \
ag \
agakhan \
agency \
ai \
aig \
airbus \
airforce \
airtel \
akdn \
al \
alfaromeo \
alibaba \
alipay \
allfinanz \
allstate \
ally \
alsace \
alstom \
am \
amazon \
americanexpress \
americanfamily \
amex \
amfam \
amica \
amsterdam \
analytics \
android \
anquan \
anz \
ao \
aol \
apartments \
app \
apple \
aq \
aquarelle \
ar \
arab \
aramco \
archi \
army \
arpa \
art \
arte \
as \
asda \
asia \
associates \
at \
athleta \
attorney \
au \
auction \
audi \
audible \
audio \
auspost \
author \
auto \
autos \
avianca \
aw \
aws \
ax \
axa \
az \
azure \
ba \
baby \
baidu \
banamex \
bananarepublic \
band \
bank \
bar \
barcelona \
barclaycard \
barclays \
barefoot \
bargains \
baseball \
basketball \
bauhaus \
bayern \
bb \
bbc \
bbt \
bbva \
bcg \
bcn \
bd \
be \
beats \
beauty \
beer \
bentley \
berlin \
best \
bestbuy \
bet \
bf \
bg \
bh \
bharti \
bi \
bible \
bid \
bike \
bing \
bingo \
bio \
biz \
bj \
black \
blackfriday \
blockbuster \
blog \
bloomberg \
blue \
bm \
bms \
bmw \
bn \
bnpparibas \
bo \
boats \
boehringer \
bofa \
bom \
bond \
boo \
book \
booking \
bosch \
bostik \
boston \
bot \
boutique \
box \
br \
bradesco \
bridgestone \
broadway \
broker \
brother \
brussels \
bs \
bt \
budapest \
bugatti \
build \
builders \
business \
buy \
buzz \
bv \
bw \
by \
bz \
bzh \
ca \
cab \
cafe \
cal \
call \
calvinklein \
cam \
camera \
camp \
cancerresearch \
canon \
capetown \
capital \
capitalone \
car \
caravan \
cards \
care \
career \
careers \
cars \
casa \
case \
cash \
casino \
cat \
catering \
catholic \
cba \
cbn \
cbre \
cbs \
cc \
cd \
center \
ceo \
cern \
cf \
cfa \
cfd \
cg \
ch \
chanel \
channel \
charity \
chase \
chat \
cheap \
chintai \
christmas \
chrome \
church \
ci \
cipriani \
circle \
cisco \
citadel \
citi \
citic \
city \
cityeats \
ck \
cl \
claims \
cleaning \
click \
clinic \
clinique \
clothing \
cloud \
club \
clubmed \
cm \
cn \
co \
coach \
codes \
coffee \
college \
cologne \
com \
comcast \
commbank \
community \
company \
compare \
computer \
comsec \
condos \
construction \
consulting \
contact \
contractors \
cooking \
cookingchannel \
cool \
coop \
corsica \
country \
coupon \
coupons \
courses \
cpa \
cr \
credit \
creditcard \
creditunion \
cricket \
crown \
crs \
cruise \
cruises \
csc \
cu \
cuisinella \
cv \
cw \
cx \
cy \
cymru \
cyou \
cz \
dabur \
dad \
dance \
data \
date \
dating \
datsun \
day \
dclk \
dds \
de \
deal \
dealer \
deals \
degree \
delivery \
dell \
deloitte \
delta \
democrat \
dental \
dentist \
desi \
design \
dev \
dhl \
diamonds \
diet \
digital \
direct \
directory \
discount \
discover \
dish \
diy \
dj \
dk \
dm \
dnp \
do \
docs \
doctor \
dog \
domains \
dot \
download \
drive \
dtv \
dubai \
duck \
dunlop \
dupont \
durban \
dvag \
dvr \
dz \
earth \
eat \
ec \
eco \
edeka \
edu \
education \
ee \
eg \
email \
emerck \
energy \
engineer \
engineering \
enterprises \
epson \
equipment \
er \
ericsson \
erni \
es \
esq \
estate \
et \
etisalat \
eu \
eurovision \
eus \
events \
exchange \
expert \
exposed \
express \
extraspace \
fage \
fail \
fairwinds \
faith \
family \
fan \
fans \
farm \
farmers \
fashion \
fast \
fedex \
feedback \
ferrari \
ferrero \
fi \
fiat \
fidelity \
fido \
film \
final \
finance \
financial \
fire \
firestone \
firmdale \
fish \
fishing \
fit \
fitness \
fj \
fk \
flickr \
flights \
flir \
florist \
flowers \
fly \
fm \
fo \
foo \
food \
foodnetwork \
football \
ford \
forex \
forsale \
forum \
foundation \
fox \
fr \
free \
fresenius \
frl \
frogans \
frontdoor \
frontier \
ftr \
fujitsu \
fujixerox \
fun \
fund \
furniture \
futbol \
fyi \
ga \
gal \
gallery \
gallo \
gallup \
game \
games \
gap \
garden \
gay \
gb \
gbiz \
gd \
gdn \
ge \
gea \
gent \
genting \
george \
gf \
gg \
ggee \
gh \
gi \
gift \
gifts \
gives \
giving \
gl \
glade \
glass \
gle \
global \
globo \
gm \
gmail \
gmbh \
gmo \
gmx \
gn \
godaddy \
gold \
goldpoint \
golf \
goo \
goodyear \
goog \
google \
gop \
got \
gov \
gp \
gq \
gr \
grainger \
graphics \
gratis \
green \
gripe \
grocery \
group \
gs \
gt \
gu \
guardian \
gucci \
guge \
guide \
guitars \
guru \
gw \
gy \
hair \
hamburg \
hangout \
haus \
hbo \
hdfc \
hdfcbank \
health \
healthcare \
help \
helsinki \
here \
hermes \
hgtv \
hiphop \
hisamitsu \
hitachi \
hiv \
hk \
hkt \
hm \
hn \
hockey \
holdings \
holiday \
homedepot \
homegoods \
homes \
homesense \
honda \
horse \
hospital \
host \
hosting \
hot \
hoteles \
hotels \
hotmail \
house \
how \
hr \
hsbc \
ht \
hu \
hughes \
hyatt \
hyundai \
ibm \
icbc \
ice \
icu \
id \
ie \
ieee \
ifm \
ikano \
il \
im \
imamat \
imdb \
immo \
immobilien \
in \
inc \
industries \
infiniti \
info \
ing \
ink \
institute \
insurance \
insure \
int \
international \
intuit \
investments \
io \
ipiranga \
iq \
ir \
irish \
is \
ismaili \
ist \
istanbul \
it \
itau \
itv \
iveco \
jaguar \
java \
jcb \
je \
jeep \
jetzt \
jewelry \
jio \
jll \
jm \
jmp \
jnj \
jo \
jobs \
joburg \
jot \
joy \
jp \
jpmorgan \
jprs \
juegos \
juniper \
kaufen \
kddi \
ke \
kerryhotels \
kerrylogistics \
kerryproperties \
kfh \
kg \
kh \
ki \
kia \
kim \
kinder \
kindle \
kitchen \
kiwi \
km \
kn \
koeln \
komatsu \
kosher \
kp \
kpmg \
kpn \
kr \
krd \
kred \
kuokgroup \
kw \
ky \
kyoto \
kz \
la \
lacaixa \
lamborghini \
lamer \
lancaster \
lancia \
land \
landrover \
lanxess \
lasalle \
lat \
latino \
latrobe \
law \
lawyer \
lb \
lc \
lds \
lease \
leclerc \
lefrak \
legal \
lego \
lexus \
lgbt \
li \
lidl \
life \
lifeinsurance \
lifestyle \
lighting \
like \
lilly \
limited \
limo \
lincoln \
linde \
link \
lipsy \
live \
living \
lixil \
lk \
llc \
llp \
loan \
loans \
locker \
locus \
loft \
lol \
london \
lotte \
lotto \
love \
lpl \
lplfinancial \
lr \
ls \
lt \
ltd \
ltda \
lu \
lundbeck \
luxe \
luxury \
lv \
ly \
ma \
macys \
madrid \
maif \
maison \
makeup \
man \
management \
mango \
map \
market \
marketing \
markets \
marriott \
marshalls \
maserati \
mattel \
mba \
mc \
mckinsey \
md \
me \
med \
media \
meet \
melbourne \
meme \
memorial \
men \
menu \
merckmsd \
mg \
mh \
miami \
microsoft \
mil \
mini \
mint \
mit \
mitsubishi \
mk \
ml \
mlb \
mls \
mm \
mma \
mn \
mo \
mobi \
mobile \
moda \
moe \
moi \
mom \
monash \
money \
monster \
mormon \
mortgage \
moscow \
moto \
motorcycles \
mov \
movie \
mp \
mq \
mr \
ms \
msd \
mt \
mtn \
mtr \
mu \
museum \
mutual \
mv \
mw \
mx \
my \
mz \
na \
nab \
nagoya \
name \
nationwide \
natura \
navy \
nba \
nc \
ne \
nec \
net \
netbank \
netflix \
network \
neustar \
new \
news \
next \
nextdirect \
nexus \
nf \
nfl \
ng \
ngo \
nhk \
ni \
nico \
nike \
nikon \
ninja \
nissan \
nissay \
nl \
no \
nokia \
northwesternmutual \
norton \
now \
nowruz \
nowtv \
np \
nr \
nra \
nrw \
ntt \
nu \
nyc \
nz \
obi \
observer \
off \
office \
okinawa \
olayan \
olayangroup \
oldnavy \
ollo \
om \
omega \
one \
ong \
onl \
online \
onyourside \
ooo \
open \
oracle \
orange \
org \
organic \
origins \
osaka \
otsuka \
ott \
ovh \
pa \
page \
panasonic \
paris \
pars \
partners \
parts \
party \
passagens \
pay \
pccw \
pe \
pet \
pf \
pfizer \
pg \
ph \
pharmacy \
phd \
philips \
phone \
photo \
photography \
photos \
physio \
pics \
pictet \
pictures \
pid \
pin \
ping \
pink \
pioneer \
pizza \
pk \
pl \
place \
play \
playstation \
plumbing \
plus \
pm \
pn \
pnc \
pohl \
poker \
politie \
porn \
post \
pr \
pramerica \
praxi \
press \
prime \
pro \
prod \
productions \
prof \
progressive \
promo \
properties \
property \
protection \
pru \
prudential \
ps \
pt \
pub \
pw \
pwc \
py \
qa \
qpon \
quebec \
quest \
qvc \
racing \
radio \
raid \
re \
read \
realestate \
realtor \
realty \
recipes \
red \
redstone \
redumbrella \
rehab \
reise \
reisen \
reit \
reliance \
ren \
rent \
rentals \
repair \
report \
republican \
rest \
restaurant \
review \
reviews \
rexroth \
rich \
richardli \
ricoh \
ril \
rio \
rip \
rmit \
ro \
rocher \
rocks \
rodeo \
rogers \
room \
rs \
rsvp \
ru \
rugby \
ruhr \
run \
rw \
rwe \
ryukyu \
sa \
saarland \
safe \
safety \
sakura \
sale \
salon \
samsclub \
samsung \
sandvik \
sandvikcoromant \
sanofi \
sap \
sarl \
sas \
save \
saxo \
sb \
sbi \
sbs \
sc \
sca \
scb \
schaeffler \
schmidt \
scholarships \
school \
schule \
schwarz \
science \
scjohnson \
scot \
sd \
se \
search \
seat \
secure \
security \
seek \
select \
sener \
services \
ses \
seven \
sew \
sex \
sexy \
sfr \
sg \
sh \
shangrila \
sharp \
shaw \
shell \
shia \
shiksha \
shoes \
shop \
shopping \
shouji \
show \
showtime \
si \
silk \
sina \
singles \
site \
sj \
sk \
ski \
skin \
sky \
skype \
sl \
sling \
sm \
smart \
smile \
sn \
sncf \
so \
soccer \
social \
softbank \
software \
sohu \
solar \
solutions \
song \
sony \
soy \
spa \
space \
sport \
spot \
spreadbetting \
sr \
srl \
ss \
st \
stada \
staples \
star \
statebank \
statefarm \
stc \
stcgroup \
stockholm \
storage \
store \
stream \
studio \
study \
style \
su \
sucks \
supplies \
supply \
support \
surf \
surgery \
suzuki \
sv \
swatch \
swiftcover \
swiss \
sx \
sy \
sydney \
systems \
sz \
tab \
taipei \
talk \
taobao \
target \
tatamotors \
tatar \
tattoo \
tax \
taxi \
tc \
tci \
td \
tdk \
team \
tech \
technology \
tel \
temasek \
tennis \
teva \
tf \
tg \
th \
thd \
theater \
theatre \
tiaa \
tickets \
tienda \
tiffany \
tips \
tires \
tirol \
tj \
tjmaxx \
tjx \
tk \
tkmaxx \
tl \
tm \
tmall \
tn \
to \
today \
tokyo \
tools \
top \
toray \
toshiba \
total \
tours \
town \
toyota \
toys \
tr \
trade \
trading \
training \
travel \
travelchannel \
travelers \
travelersinsurance \
trust \
trv \
tt \
tube \
tui \
tunes \
tushu \
tv \
tvs \
tw \
tz \
ua \
ubank \
ubs \
ug \
uk \
unicom \
university \
uno \
uol \
ups \
us \
uy \
uz \
va \
vacations \
vana \
vanguard \
vc \
ve \
vegas \
ventures \
verisign \
versicherung \
vet \
vg \
vi \
viajes \
video \
vig \
viking \
villas \
vin \
vip \
virgin \
visa \
vision \
viva \
vivo \
vlaanderen \
vn \
vodka \
volkswagen \
volvo \
vote \
voting \
voto \
voyage \
vu \
vuelos \
wales \
walmart \
walter \
wang \
wanggou \
watch \
watches \
weather \
weatherchannel \
webcam \
weber \
website \
wed \
wedding \
weibo \
weir \
wf \
whoswho \
wien \
wiki \
williamhill \
win \
windows \
wine \
winners \
wme \
wolterskluwer \
woodside \
work \
works \
world \
wow \
ws \
wtc \
wtf \
xbox \
xerox \
xfinity \
xihuan \
xin \
xxx \
xyz \
yachts \
yahoo \
yamaxun \
yandex \
ye \
yodobashi \
yoga \
yokohama \
you \
youtube \
yt \
yun \
za \
zappos \
zara \
zero \
zip \
zm \
zone \
zuerich \
zw \
vermögensberater-ctb \
vermögensberatung-pwb \
ελ \
ευ \
бг \
бел \
дети \
ею \
католик \
ком \
қаз \
мкд \
мон \
москва \
онлайн \
орг \
рус \
рф \
сайт \
срб \
укр \
გე \
հայ \
ישראל \
קום \
ابوظبي \
اتصالات \
ارامكو \
الاردن \
البحرين \
الجزائر \
السعودية \
العليان \
المغرب \
امارات \
ایران \
بارت \
بازار \
بھارت \
بيتك \
پاکستان \
ڀارت \
تونس \
سودان \
سورية \
شبكة \
عراق \
عرب \
عمان \
فلسطين \
قطر \
كاثوليك \
كوم \
مصر \
مليسيا \
موريتانيا \
موقع \
همراه \
कॉम \
नेट \
भारत \
भारतम् \
भारोत \
संगठन \
বাংলা \
ভারত \
ভাৰত \
ਭਾਰਤ \
ભારત \
ଭାରତ \
இந்தியா \
இலங்கை \
சிங்கப்பூர் \
భారత్ \
ಭಾರತ \
ഭാരതം \
ලංකා \
คอม \
ไทย \
ລາວ \
닷넷 \
닷컴 \
삼성 \
한국 \
アマゾン \
グーグル \
クラウド \
コム \
ストア \
セール \
ファッション \
ポイント \
みんな \
世界 \
中信 \
中国 \
中國 \
中文网 \
亚马逊 \
企业 \
佛山 \
信息 \
健康 \
八卦 \
公司 \
公益 \
台湾 \
台灣 \
商城 \
商店 \
商标 \
嘉里 \
嘉里大酒店 \
在线 \
大众汽车 \
大拿 \
天主教 \
娱乐 \
家電 \
广东 \
微博 \
慈善 \
我爱你 \
手机 \
招聘 \
政务 \
政府 \
新加坡 \
新闻 \
时尚 \
書籍 \
机构 \
淡马锡 \
游戏 \
澳門 \
点看 \
移动 \
组织机构 \
网址 \
网店 \
网站 \
网络 \
联通 \
诺基亚 \
谷歌 \
购物 \
通販 \
集团 \
電訊盈科 \
飞利浦 \
食品 \
餐厅 \
香格里拉 \
香港'.split(' ');

    /**
    	The scanner provides an interface that takes a string of text as input, and
    	outputs an array of tokens instances that can be used for easy URL parsing.

    	@module linkify
    	@submodule scanner
    	@main scanner
    */

    var LETTER = /(?:[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF38\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])/; // Any Unicode character with letter data type

    var EMOJI = /(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEDD-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDDFF\uDE70-\uDE74\uDE78-\uDE7C\uDE80-\uDE86\uDE90-\uDEAC\uDEB0-\uDEBA\uDEC0-\uDEC5\uDED0-\uDED9\uDEE0-\uDEE7\uDEF0-\uDEF6])/; // Any Unicode emoji character

    var EMOJI_VARIATION = /\uFE0F/; // Variation selector, follows heart and others

    var DIGIT = /\d/;
    var SPACE = /\s/;
    /**
     * Initialize the scanner character-based state machine for the given start state
     * @return {State} scanner starting state
     */

    function init$2() {
      var customProtocols = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      // Frequently used states
      var S_START = makeState();
      var S_NUM = makeAcceptingState(NUM);
      var S_DOMAIN = makeAcceptingState(DOMAIN);
      var S_DOMAIN_HYPHEN = makeState(); // domain followed by 1 or more hyphen characters

      var S_WS = makeAcceptingState(WS);
      var DOMAIN_REGEX_TRANSITIONS = [[DIGIT, S_DOMAIN], [LETTER, S_DOMAIN], [EMOJI, S_DOMAIN], [EMOJI_VARIATION, S_DOMAIN]]; // Create a state which emits a domain token

      var makeDomainState = function makeDomainState() {
        var state = makeAcceptingState(DOMAIN);
        state.j = {
          '-': S_DOMAIN_HYPHEN
        };
        state.jr = [].concat(DOMAIN_REGEX_TRANSITIONS);
        return state;
      }; // Create a state which does not emit a domain state but the usual alphanumeric
      // transitions are domains


      var makeNearDomainState = function makeNearDomainState(token) {
        var state = makeDomainState();
        state.t = token;
        return state;
      }; // States for special URL symbols that accept immediately after start


      makeBatchT(S_START, [["'", makeAcceptingState(APOSTROPHE)], ['{', makeAcceptingState(OPENBRACE)], ['[', makeAcceptingState(OPENBRACKET)], ['<', makeAcceptingState(OPENANGLEBRACKET)], ['(', makeAcceptingState(OPENPAREN)], ['}', makeAcceptingState(CLOSEBRACE)], [']', makeAcceptingState(CLOSEBRACKET)], ['>', makeAcceptingState(CLOSEANGLEBRACKET)], [')', makeAcceptingState(CLOSEPAREN)], ['&', makeAcceptingState(AMPERSAND)], ['*', makeAcceptingState(ASTERISK)], ['@', makeAcceptingState(AT)], ['`', makeAcceptingState(BACKTICK)], ['^', makeAcceptingState(CARET)], [':', makeAcceptingState(COLON)], [',', makeAcceptingState(COMMA)], ['$', makeAcceptingState(DOLLAR)], ['.', makeAcceptingState(DOT)], ['=', makeAcceptingState(EQUALS)], ['!', makeAcceptingState(EXCLAMATION)], ['-', makeAcceptingState(HYPHEN)], ['%', makeAcceptingState(PERCENT)], ['|', makeAcceptingState(PIPE)], ['+', makeAcceptingState(PLUS)], ['#', makeAcceptingState(POUND)], ['?', makeAcceptingState(QUERY)], ['"', makeAcceptingState(QUOTE)], ['/', makeAcceptingState(SLASH)], [';', makeAcceptingState(SEMI)], ['~', makeAcceptingState(TILDE)], ['_', makeAcceptingState(UNDERSCORE)], ['\\', makeAcceptingState(BACKSLASH)]]); // Whitespace jumps
      // Tokens of only non-newline whitespace are arbitrarily long

      makeT(S_START, '\n', makeAcceptingState(NL));
      makeRegexT(S_START, SPACE, S_WS); // If any whitespace except newline, more whitespace!

      makeT(S_WS, '\n', makeState()); // non-accepting state

      makeRegexT(S_WS, SPACE, S_WS); // Generates states for top-level domains
      // Note that this is most accurate when tlds are in alphabetical order

      for (var i = 0; i < tlds.length; i++) {
        makeChainT(S_START, tlds[i], makeNearDomainState(TLD), makeDomainState);
      } // Collect the states generated by different protocls


      var S_PROTOCOL_FILE = makeDomainState();
      var S_PROTOCOL_FTP = makeDomainState();
      var S_PROTOCOL_HTTP = makeDomainState();
      var S_MAILTO = makeDomainState();
      makeChainT(S_START, 'file', S_PROTOCOL_FILE, makeDomainState);
      makeChainT(S_START, 'ftp', S_PROTOCOL_FTP, makeDomainState);
      makeChainT(S_START, 'http', S_PROTOCOL_HTTP, makeDomainState);
      makeChainT(S_START, 'mailto', S_MAILTO, makeDomainState); // Protocol states

      var S_PROTOCOL_SECURE = makeDomainState();
      var S_FULL_PROTOCOL = makeAcceptingState(PROTOCOL); // Full protocol ends with COLON

      var S_FULL_MAILTO = makeAcceptingState(MAILTO); // Mailto ends with COLON
      // Secure protocols (end with 's')

      makeT(S_PROTOCOL_FTP, 's', S_PROTOCOL_SECURE);
      makeT(S_PROTOCOL_FTP, ':', S_FULL_PROTOCOL);
      makeT(S_PROTOCOL_HTTP, 's', S_PROTOCOL_SECURE);
      makeT(S_PROTOCOL_HTTP, ':', S_FULL_PROTOCOL); // Become protocol tokens after a COLON

      makeT(S_PROTOCOL_FILE, ':', S_FULL_PROTOCOL);
      makeT(S_PROTOCOL_SECURE, ':', S_FULL_PROTOCOL);
      makeT(S_MAILTO, ':', S_FULL_MAILTO); // Register custom protocols

      var S_CUSTOM_PROTOCOL = makeDomainState();

      for (var _i = 0; _i < customProtocols.length; _i++) {
        makeChainT(S_START, customProtocols[_i], S_CUSTOM_PROTOCOL, makeDomainState);
      }

      makeT(S_CUSTOM_PROTOCOL, ':', S_FULL_PROTOCOL); // Localhost

      makeChainT(S_START, 'localhost', makeNearDomainState(LOCALHOST), makeDomainState); // Everything else
      // DOMAINs make more DOMAINs
      // Number and character transitions

      makeRegexT(S_START, DIGIT, S_NUM);
      makeRegexT(S_START, LETTER, S_DOMAIN);
      makeRegexT(S_START, EMOJI, S_DOMAIN);
      makeRegexT(S_START, EMOJI_VARIATION, S_DOMAIN);
      makeRegexT(S_NUM, DIGIT, S_NUM);
      makeRegexT(S_NUM, LETTER, S_DOMAIN); // number becomes DOMAIN

      makeRegexT(S_NUM, EMOJI, S_DOMAIN); // number becomes DOMAIN

      makeRegexT(S_NUM, EMOJI_VARIATION, S_DOMAIN); // number becomes DOMAIN

      makeT(S_NUM, '-', S_DOMAIN_HYPHEN); // Default domain transitions

      makeT(S_DOMAIN, '-', S_DOMAIN_HYPHEN);
      makeT(S_DOMAIN_HYPHEN, '-', S_DOMAIN_HYPHEN);
      makeRegexT(S_DOMAIN, DIGIT, S_DOMAIN);
      makeRegexT(S_DOMAIN, LETTER, S_DOMAIN);
      makeRegexT(S_DOMAIN, EMOJI, S_DOMAIN);
      makeRegexT(S_DOMAIN, EMOJI_VARIATION, S_DOMAIN);
      makeRegexT(S_DOMAIN_HYPHEN, DIGIT, S_DOMAIN);
      makeRegexT(S_DOMAIN_HYPHEN, LETTER, S_DOMAIN);
      makeRegexT(S_DOMAIN_HYPHEN, EMOJI, S_DOMAIN);
      makeRegexT(S_DOMAIN_HYPHEN, EMOJI_VARIATION, S_DOMAIN); // Set default transition for start state (some symbol)

      S_START.jd = makeAcceptingState(SYM);
      return S_START;
    }
    /**
    	Given a string, returns an array of TOKEN instances representing the
    	composition of that string.

    	@method run
    	@param {State} start scanner starting state
    	@param {string} str input string to scan
    	@return {{t: string, v: string, s: number, l: number}[]} list of tokens, each with a type and value
    */

    function run$1(start, str) {
      // State machine is not case sensitive, so input is tokenized in lowercased
      // form (still returns the regular case though) Uses selective `toLowerCase`
      // is used because lowercasing the entire string causes the length and
      // character position to vary in some non-English strings with V8-based
      // runtimes.
      var iterable = stringToArray(str.replace(/[A-Z]/g, function (c) {
        return c.toLowerCase();
      }));
      var charCount = iterable.length; // <= len if there are emojis, etc

      var tokens = []; // return value
      // cursor through the string itself, accounting for characters that have
      // width with length 2 such as emojis

      var cursor = 0; // Cursor through the array-representation of the string

      var charCursor = 0; // Tokenize the string

      while (charCursor < charCount) {
        var state = start;
        var nextState = null;
        var tokenLength = 0;
        var latestAccepting = null;
        var sinceAccepts = -1;
        var charsSinceAccepts = -1;

        while (charCursor < charCount && (nextState = takeT(state, iterable[charCursor]))) {
          state = nextState; // Keep track of the latest accepting state

          if (state.accepts()) {
            sinceAccepts = 0;
            charsSinceAccepts = 0;
            latestAccepting = state;
          } else if (sinceAccepts >= 0) {
            sinceAccepts += iterable[charCursor].length;
            charsSinceAccepts++;
          }

          tokenLength += iterable[charCursor].length;
          cursor += iterable[charCursor].length;
          charCursor++;
        } // Roll back to the latest accepting state


        cursor -= sinceAccepts;
        charCursor -= charsSinceAccepts;
        tokenLength -= sinceAccepts; // No more jumps, just make a new token from the last accepting one
        // TODO: If possible, don't output v, instead output range where values ocur

        tokens.push({
          t: latestAccepting.t,
          // token type/name
          v: str.substr(cursor - tokenLength, tokenLength),
          // string value
          s: cursor - tokenLength,
          // start index
          e: cursor // end index (excluding)

        });
      }

      return tokens;
    }
    /**
     * Convert a String to an Array of characters, taking into account that some
     * characters like emojis take up two string indexes.
     *
     * Adapted from core-js (MIT license)
     * https://github.com/zloirock/core-js/blob/2d69cf5f99ab3ea3463c395df81e5a15b68f49d9/packages/core-js/internals/string-multibyte.js
     *
     * @function stringToArray
     * @param {string} str
     * @returns {string[]}
     */

    function stringToArray(str) {
      var result = [];
      var len = str.length;
      var index = 0;

      while (index < len) {
        var first = str.charCodeAt(index);
        var second = void 0;
        var char = first < 0xd800 || first > 0xdbff || index + 1 === len || (second = str.charCodeAt(index + 1)) < 0xdc00 || second > 0xdfff ? str[index] // single character
        : str.slice(index, index + 2); // two-index characters

        result.push(char);
        index += char.length;
      }

      return result;
    }

    function _typeof(obj) {
      "@babel/helpers - typeof";

      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function (obj) {
          return typeof obj;
        };
      } else {
        _typeof = function (obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }

      return _typeof(obj);
    }

    /**
     * @property {string} defaultProtocol
     * @property {{[string]: (event) => void}]} [events]
     */
    var defaults = {
      defaultProtocol: 'http',
      events: null,
      format: noop,
      formatHref: noop,
      nl2br: false,
      tagName: 'a',
      target: null,
      rel: null,
      validate: true,
      truncate: 0,
      className: null,
      attributes: null,
      ignoreTags: []
    };
    /**
     * @class Options
     * @param {Object} [opts] Set option properties besides the defaults
     */

    function Options(opts) {
      opts = opts || {};
      this.defaultProtocol = 'defaultProtocol' in opts ? opts.defaultProtocol : defaults.defaultProtocol;
      this.events = 'events' in opts ? opts.events : defaults.events;
      this.format = 'format' in opts ? opts.format : defaults.format;
      this.formatHref = 'formatHref' in opts ? opts.formatHref : defaults.formatHref;
      this.nl2br = 'nl2br' in opts ? opts.nl2br : defaults.nl2br;
      this.tagName = 'tagName' in opts ? opts.tagName : defaults.tagName;
      this.target = 'target' in opts ? opts.target : defaults.target;
      this.rel = 'rel' in opts ? opts.rel : defaults.rel;
      this.validate = 'validate' in opts ? opts.validate : defaults.validate;
      this.truncate = 'truncate' in opts ? opts.truncate : defaults.truncate;
      this.className = 'className' in opts ? opts.className : defaults.className;
      this.attributes = opts.attributes || defaults.attributes;
      this.ignoreTags = []; // Make all tags names upper case

      var ignoredTags = 'ignoreTags' in opts ? opts.ignoreTags : defaults.ignoreTags;

      for (var i = 0; i < ignoredTags.length; i++) {
        this.ignoreTags.push(ignoredTags[i].toUpperCase());
      }
    }
    Options.prototype = {
      /**
       * Given the token, return all options for how it should be displayed
       */
      resolve: function resolve(token) {
        var href = token.toHref(this.defaultProtocol);
        return {
          formatted: this.get('format', token.toString(), token),
          formattedHref: this.get('formatHref', href, token),
          tagName: this.get('tagName', href, token),
          className: this.get('className', href, token),
          target: this.get('target', href, token),
          rel: this.get('rel', href, token),
          events: this.getObject('events', href, token),
          attributes: this.getObject('attributes', href, token),
          truncate: this.get('truncate', href, token)
        };
      },

      /**
       * Returns true or false based on whether a token should be displayed as a
       * link based on the user options. By default,
       */
      check: function check(token) {
        return this.get('validate', token.toString(), token);
      },
      // Private methods

      /**
       * Resolve an option's value based on the value of the option and the given
       * params.
       * @param {string} key Name of option to use
       * @param operator will be passed to the target option if it's method
       * @param {MultiToken} token The token from linkify.tokenize
       */
      get: function get(key, operator, token) {
        var option = this[key];

        if (!option) {
          return option;
        }

        var optionValue;

        switch (_typeof(option)) {
          case 'function':
            return option(operator, token.t);

          case 'object':
            optionValue = token.t in option ? option[token.t] : defaults[key];
            return typeof optionValue === 'function' ? optionValue(operator, token.t) : optionValue;
        }

        return option;
      },
      getObject: function getObject(key, operator, token) {
        var option = this[key];
        return typeof option === 'function' ? option(operator, token.t) : option;
      }
    };

    function noop(val) {
      return val;
    }

    /******************************************************************************
    	Multi-Tokens
    	Tokens composed of arrays of TextTokens
    ******************************************************************************/

    function inherits(parent, child) {
      var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var extended = Object.create(parent.prototype);

      for (var p in props) {
        extended[p] = props[p];
      }

      extended.constructor = child;
      child.prototype = extended;
      return child;
    }
    /**
    	Abstract class used for manufacturing tokens of text tokens. That is rather
    	than the value for a token being a small string of text, it's value an array
    	of text tokens.

    	Used for grouping together URLs, emails, hashtags, and other potential
    	creations.

    	@class MultiToken
    	@param {string} value
    	@param {{t: string, v: string, s: number, e: number}[]} tokens
    	@abstract
    */


    function MultiToken() {}
    MultiToken.prototype = {
      /**
      	String representing the type for this token
      	@property t
      	@default 'token'
      */
      t: 'token',

      /**
      	Is this multitoken a link?
      	@property isLink
      	@default false
      */
      isLink: false,

      /**
      	Return the string this token represents.
      	@method toString
      	@return {string}
      */
      toString: function toString() {
        return this.v;
      },

      /**
      	What should the value for this token be in the `href` HTML attribute?
      	Returns the `.toString` value by default.
      		@method toHref
      	@return {string}
      */
      toHref: function toHref() {
        return this.toString();
      },

      /**
       * The start index of this token in the original input string
       * @returns {number}
       */
      startIndex: function startIndex() {
        return this.tk[0].s;
      },

      /**
       * The end index of this token in the original input string (up to this
       * index but not including it)
       * @returns {number}
       */
      endIndex: function endIndex() {
        return this.tk[this.tk.length - 1].e;
      },

      /**
      	Returns a hash of relevant values for this token, which includes keys
      	* type - Kind of token ('url', 'email', etc.)
      	* value - Original text
      	* href - The value that should be added to the anchor tag's href
      		attribute
      		@method toObject
      	@param {string} [protocol] `'http'` by default
      */
      toObject: function toObject() {
        var protocol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaults.defaultProtocol;
        return {
          type: this.t,
          value: this.v,
          isLink: this.isLink,
          href: this.toHref(protocol),
          start: this.startIndex(),
          end: this.endIndex()
        };
      }
    }; // Base token
    /**
     * Create a new token that can be emitted by the parser state machine
     * @param {string} type readable type of the token
     * @param {object} props properties to assign or override, including isLink = true or false
     * @returns {(value: string, tokens: {t: string, v: string, s: number, e: number}) => MultiToken} new token class
     */

    function createTokenClass(type, props) {
      function Token(value, tokens) {
        this.t = type;
        this.v = value;
        this.tk = tokens;
      }

      inherits(MultiToken, Token, props);
      return Token;
    }
    /**
    	Represents an arbitrarily mailto email address with the prefix included
    	@class MailtoEmail
    	@extends MultiToken
    */

    var MailtoEmail = createTokenClass('email', {
      isLink: true
    });
    /**
    	Represents a list of tokens making up a valid email address
    	@class Email
    	@extends MultiToken
    */

    var Email = createTokenClass('email', {
      isLink: true,
      toHref: function toHref() {
        return 'mailto:' + this.toString();
      }
    });
    /**
    	Represents some plain text
    	@class Text
    	@extends MultiToken
    */

    var Text = createTokenClass('text');
    /**
    	Multi-linebreak token - represents a line break
    	@class Nl
    	@extends MultiToken
    */

    var Nl = createTokenClass('nl');
    /**
    	Represents a list of text tokens making up a valid URL
    	@class Url
    	@extends MultiToken
    */

    var Url = createTokenClass('url', {
      isLink: true,

      /**
      	Lowercases relevant parts of the domain and adds the protocol if
      	required. Note that this will not escape unsafe HTML characters in the
      	URL.
      		@method href
      	@param {string} protocol
      	@return {string}
      */
      toHref: function toHref() {
        var protocol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaults.defaultProtocol;
        var tokens = this.tk;
        var hasProtocol = false;
        var hasSlashSlash = false;
        var result = [];
        var i = 0; // Make the first part of the domain lowercase
        // Lowercase protocol

        while (tokens[i].t === PROTOCOL) {
          hasProtocol = true;
          result.push(tokens[i].v);
          i++;
        } // Skip slash-slash


        while (tokens[i].t === SLASH) {
          hasSlashSlash = true;
          result.push(tokens[i].v);
          i++;
        } // Continue pushing characters


        for (; i < tokens.length; i++) {
          result.push(tokens[i].v);
        }

        result = result.join('');

        if (!(hasProtocol || hasSlashSlash)) {
          result = "".concat(protocol, "://").concat(result);
        }

        return result;
      },
      hasProtocol: function hasProtocol() {
        return this.tk[0].t === PROTOCOL;
      }
    });

    var multi = /*#__PURE__*/Object.freeze({
    	__proto__: null,
    	MultiToken: MultiToken,
    	Base: MultiToken,
    	createTokenClass: createTokenClass,
    	MailtoEmail: MailtoEmail,
    	Email: Email,
    	Text: Text,
    	Nl: Nl,
    	Url: Url
    });

    /**
    	Not exactly parser, more like the second-stage scanner (although we can
    	theoretically hotswap the code here with a real parser in the future... but
    	for a little URL-finding utility abstract syntax trees may be a little
    	overkill).

    	URL format: http://en.wikipedia.org/wiki/URI_scheme
    	Email format: http://en.wikipedia.org/wiki/Email_address (links to RFC in
    	reference)

    	@module linkify
    	@submodule parser
    	@main run
    */
    /**
     * Generate the parser multi token-based state machine
     * @returns {State} the starting state
     */

    function init$1() {
      // The universal starting state.
      var S_START = makeState(); // Intermediate states for URLs. Note that domains that begin with a protocol
      // are treated slighly differently from those that don't.

      var S_PROTOCOL = makeState(); // e.g., 'http:'

      var S_MAILTO = makeState(); // 'mailto:'

      var S_PROTOCOL_SLASH = makeState(); // e.g., 'http:/''

      var S_PROTOCOL_SLASH_SLASH = makeState(); // e.g.,'http://'

      var S_DOMAIN = makeState(); // parsed string ends with a potential domain name (A)

      var S_DOMAIN_DOT = makeState(); // (A) domain followed by DOT

      var S_TLD = makeAcceptingState(Url); // (A) Simplest possible URL with no query string

      var S_TLD_COLON = makeState(); // (A) URL followed by colon (potential port number here)

      var S_TLD_PORT = makeAcceptingState(Url); // TLD followed by a port number

      var S_URL = makeAcceptingState(Url); // Long URL with optional port and maybe query string

      var S_URL_NON_ACCEPTING = makeState(); // URL followed by some symbols (will not be part of the final URL)

      var S_URL_OPENBRACE = makeState(); // URL followed by {

      var S_URL_OPENBRACKET = makeState(); // URL followed by [

      var S_URL_OPENANGLEBRACKET = makeState(); // URL followed by <

      var S_URL_OPENPAREN = makeState(); // URL followed by (

      var S_URL_OPENBRACE_Q = makeAcceptingState(Url); // URL followed by { and some symbols that the URL can end it

      var S_URL_OPENBRACKET_Q = makeAcceptingState(Url); // URL followed by [ and some symbols that the URL can end it

      var S_URL_OPENANGLEBRACKET_Q = makeAcceptingState(Url); // URL followed by < and some symbols that the URL can end it

      var S_URL_OPENPAREN_Q = makeAcceptingState(Url); // URL followed by ( and some symbols that the URL can end it

      var S_URL_OPENBRACE_SYMS = makeState(); // S_URL_OPENBRACE_Q followed by some symbols it cannot end it

      var S_URL_OPENBRACKET_SYMS = makeState(); // S_URL_OPENBRACKET_Q followed by some symbols it cannot end it

      var S_URL_OPENANGLEBRACKET_SYMS = makeState(); // S_URL_OPENANGLEBRACKET_Q followed by some symbols it cannot end it

      var S_URL_OPENPAREN_SYMS = makeState(); // S_URL_OPENPAREN_Q followed by some symbols it cannot end it

      var S_EMAIL_DOMAIN = makeState(); // parsed string starts with local email info + @ with a potential domain name (C)

      var S_EMAIL_DOMAIN_DOT = makeState(); // (C) domain followed by DOT

      var S_EMAIL = makeAcceptingState(Email); // (C) Possible email address (could have more tlds)

      var S_EMAIL_COLON = makeState(); // (C) URL followed by colon (potential port number here)

      var S_EMAIL_PORT = makeAcceptingState(Email); // (C) Email address with a port

      var S_MAILTO_EMAIL = makeAcceptingState(MailtoEmail); // Email that begins with the mailto prefix (D)

      var S_MAILTO_EMAIL_NON_ACCEPTING = makeState(); // (D) Followed by some non-query string chars

      var S_LOCALPART = makeState(); // Local part of the email address

      var S_LOCALPART_AT = makeState(); // Local part of the email address plus @

      var S_LOCALPART_DOT = makeState(); // Local part of the email address plus '.' (localpart cannot end in .)

      var S_NL = makeAcceptingState(Nl); // single new line
      // Make path from start to protocol (with '//')

      makeT(S_START, NL, S_NL);
      makeT(S_START, PROTOCOL, S_PROTOCOL);
      makeT(S_START, MAILTO, S_MAILTO);
      makeT(S_PROTOCOL, SLASH, S_PROTOCOL_SLASH);
      makeT(S_PROTOCOL_SLASH, SLASH, S_PROTOCOL_SLASH_SLASH); // The very first potential domain name

      makeT(S_START, TLD, S_DOMAIN);
      makeT(S_START, DOMAIN, S_DOMAIN);
      makeT(S_START, LOCALHOST, S_TLD);
      makeT(S_START, NUM, S_DOMAIN); // Force URL for protocol followed by anything sane

      makeT(S_PROTOCOL_SLASH_SLASH, TLD, S_URL);
      makeT(S_PROTOCOL_SLASH_SLASH, DOMAIN, S_URL);
      makeT(S_PROTOCOL_SLASH_SLASH, NUM, S_URL);
      makeT(S_PROTOCOL_SLASH_SLASH, LOCALHOST, S_URL); // Account for dots and hyphens
      // hyphens are usually parts of domain names

      makeT(S_DOMAIN, DOT, S_DOMAIN_DOT);
      makeT(S_EMAIL_DOMAIN, DOT, S_EMAIL_DOMAIN_DOT); // Hyphen can jump back to a domain name
      // After the first domain and a dot, we can find either a URL or another domain

      makeT(S_DOMAIN_DOT, TLD, S_TLD);
      makeT(S_DOMAIN_DOT, DOMAIN, S_DOMAIN);
      makeT(S_DOMAIN_DOT, NUM, S_DOMAIN);
      makeT(S_DOMAIN_DOT, LOCALHOST, S_DOMAIN);
      makeT(S_EMAIL_DOMAIN_DOT, TLD, S_EMAIL);
      makeT(S_EMAIL_DOMAIN_DOT, DOMAIN, S_EMAIL_DOMAIN);
      makeT(S_EMAIL_DOMAIN_DOT, NUM, S_EMAIL_DOMAIN);
      makeT(S_EMAIL_DOMAIN_DOT, LOCALHOST, S_EMAIL_DOMAIN); // S_TLD accepts! But the URL could be longer, try to find a match greedily
      // The `run` function should be able to "rollback" to the accepting state

      makeT(S_TLD, DOT, S_DOMAIN_DOT);
      makeT(S_EMAIL, DOT, S_EMAIL_DOMAIN_DOT); // Become real URLs after `SLASH` or `COLON NUM SLASH`
      // Here PSS and non-PSS converge

      makeT(S_TLD, COLON, S_TLD_COLON);
      makeT(S_TLD, SLASH, S_URL);
      makeT(S_TLD_COLON, NUM, S_TLD_PORT);
      makeT(S_TLD_PORT, SLASH, S_URL);
      makeT(S_EMAIL, COLON, S_EMAIL_COLON);
      makeT(S_EMAIL_COLON, NUM, S_EMAIL_PORT); // Types of characters the URL can definitely end in

      var qsAccepting = [AMPERSAND, ASTERISK, AT, BACKSLASH, BACKTICK, CARET, DOLLAR, DOMAIN, EQUALS, HYPHEN, LOCALHOST, NUM, PERCENT, PIPE, PLUS, POUND, PROTOCOL, SLASH, SYM, TILDE, TLD, UNDERSCORE]; // Types of tokens that can follow a URL and be part of the query string
      // but cannot be the very last characters
      // Characters that cannot appear in the URL at all should be excluded

      var qsNonAccepting = [APOSTROPHE, CLOSEANGLEBRACKET, CLOSEBRACE, CLOSEBRACKET, CLOSEPAREN, COLON, COMMA, DOT, EXCLAMATION, OPENANGLEBRACKET, OPENBRACE, OPENBRACKET, OPENPAREN, QUERY, QUOTE, SEMI]; // These states are responsible primarily for determining whether or not to
      // include the final round bracket.
      // URL, followed by an opening bracket

      makeT(S_URL, OPENBRACE, S_URL_OPENBRACE);
      makeT(S_URL, OPENBRACKET, S_URL_OPENBRACKET);
      makeT(S_URL, OPENANGLEBRACKET, S_URL_OPENANGLEBRACKET);
      makeT(S_URL, OPENPAREN, S_URL_OPENPAREN); // URL with extra symbols at the end, followed by an opening bracket

      makeT(S_URL_NON_ACCEPTING, OPENBRACE, S_URL_OPENBRACE);
      makeT(S_URL_NON_ACCEPTING, OPENBRACKET, S_URL_OPENBRACKET);
      makeT(S_URL_NON_ACCEPTING, OPENANGLEBRACKET, S_URL_OPENANGLEBRACKET);
      makeT(S_URL_NON_ACCEPTING, OPENPAREN, S_URL_OPENPAREN); // Closing bracket component. This character WILL be included in the URL

      makeT(S_URL_OPENBRACE, CLOSEBRACE, S_URL);
      makeT(S_URL_OPENBRACKET, CLOSEBRACKET, S_URL);
      makeT(S_URL_OPENANGLEBRACKET, CLOSEANGLEBRACKET, S_URL);
      makeT(S_URL_OPENPAREN, CLOSEPAREN, S_URL);
      makeT(S_URL_OPENBRACE_Q, CLOSEBRACE, S_URL);
      makeT(S_URL_OPENBRACKET_Q, CLOSEBRACKET, S_URL);
      makeT(S_URL_OPENANGLEBRACKET_Q, CLOSEANGLEBRACKET, S_URL);
      makeT(S_URL_OPENPAREN_Q, CLOSEPAREN, S_URL);
      makeT(S_URL_OPENBRACE_SYMS, CLOSEBRACE, S_URL);
      makeT(S_URL_OPENBRACKET_SYMS, CLOSEBRACKET, S_URL);
      makeT(S_URL_OPENANGLEBRACKET_SYMS, CLOSEANGLEBRACKET, S_URL);
      makeT(S_URL_OPENPAREN_SYMS, CLOSEPAREN, S_URL); // URL that beings with an opening bracket, followed by a symbols.
      // Note that the final state can still be `S_URL_OPENBRACE_Q` (if the URL only
      // has a single opening bracket for some reason).

      makeMultiT(S_URL_OPENBRACE, qsAccepting, S_URL_OPENBRACE_Q);
      makeMultiT(S_URL_OPENBRACKET, qsAccepting, S_URL_OPENBRACKET_Q);
      makeMultiT(S_URL_OPENANGLEBRACKET, qsAccepting, S_URL_OPENANGLEBRACKET_Q);
      makeMultiT(S_URL_OPENPAREN, qsAccepting, S_URL_OPENPAREN_Q);
      makeMultiT(S_URL_OPENBRACE, qsNonAccepting, S_URL_OPENBRACE_SYMS);
      makeMultiT(S_URL_OPENBRACKET, qsNonAccepting, S_URL_OPENBRACKET_SYMS);
      makeMultiT(S_URL_OPENANGLEBRACKET, qsNonAccepting, S_URL_OPENANGLEBRACKET_SYMS);
      makeMultiT(S_URL_OPENPAREN, qsNonAccepting, S_URL_OPENPAREN_SYMS); // URL that begins with an opening bracket, followed by some symbols

      makeMultiT(S_URL_OPENBRACE_Q, qsAccepting, S_URL_OPENBRACE_Q);
      makeMultiT(S_URL_OPENBRACKET_Q, qsAccepting, S_URL_OPENBRACKET_Q);
      makeMultiT(S_URL_OPENANGLEBRACKET_Q, qsAccepting, S_URL_OPENANGLEBRACKET_Q);
      makeMultiT(S_URL_OPENPAREN_Q, qsAccepting, S_URL_OPENPAREN_Q);
      makeMultiT(S_URL_OPENBRACE_Q, qsNonAccepting, S_URL_OPENBRACE_Q);
      makeMultiT(S_URL_OPENBRACKET_Q, qsNonAccepting, S_URL_OPENBRACKET_Q);
      makeMultiT(S_URL_OPENANGLEBRACKET_Q, qsNonAccepting, S_URL_OPENANGLEBRACKET_Q);
      makeMultiT(S_URL_OPENPAREN_Q, qsNonAccepting, S_URL_OPENPAREN_Q);
      makeMultiT(S_URL_OPENBRACE_SYMS, qsAccepting, S_URL_OPENBRACE_Q);
      makeMultiT(S_URL_OPENBRACKET_SYMS, qsAccepting, S_URL_OPENBRACKET_Q);
      makeMultiT(S_URL_OPENANGLEBRACKET_SYMS, qsAccepting, S_URL_OPENANGLEBRACKET_Q);
      makeMultiT(S_URL_OPENPAREN_SYMS, qsAccepting, S_URL_OPENPAREN_Q);
      makeMultiT(S_URL_OPENBRACE_SYMS, qsNonAccepting, S_URL_OPENBRACE_SYMS);
      makeMultiT(S_URL_OPENBRACKET_SYMS, qsNonAccepting, S_URL_OPENBRACKET_SYMS);
      makeMultiT(S_URL_OPENANGLEBRACKET_SYMS, qsNonAccepting, S_URL_OPENANGLEBRACKET_SYMS);
      makeMultiT(S_URL_OPENPAREN_SYMS, qsNonAccepting, S_URL_OPENPAREN_SYMS); // Account for the query string

      makeMultiT(S_URL, qsAccepting, S_URL);
      makeMultiT(S_URL_NON_ACCEPTING, qsAccepting, S_URL);
      makeMultiT(S_URL, qsNonAccepting, S_URL_NON_ACCEPTING);
      makeMultiT(S_URL_NON_ACCEPTING, qsNonAccepting, S_URL_NON_ACCEPTING); // Email address-specific state definitions
      // Note: We are not allowing '/' in email addresses since this would interfere
      // with real URLs
      // For addresses with the mailto prefix
      // 'mailto:' followed by anything sane is a valid email

      makeT(S_MAILTO, TLD, S_MAILTO_EMAIL);
      makeT(S_MAILTO, DOMAIN, S_MAILTO_EMAIL);
      makeT(S_MAILTO, NUM, S_MAILTO_EMAIL);
      makeT(S_MAILTO, LOCALHOST, S_MAILTO_EMAIL); // Greedily get more potential valid email values

      makeMultiT(S_MAILTO_EMAIL, qsAccepting, S_MAILTO_EMAIL);
      makeMultiT(S_MAILTO_EMAIL, qsNonAccepting, S_MAILTO_EMAIL_NON_ACCEPTING);
      makeMultiT(S_MAILTO_EMAIL_NON_ACCEPTING, qsAccepting, S_MAILTO_EMAIL);
      makeMultiT(S_MAILTO_EMAIL_NON_ACCEPTING, qsNonAccepting, S_MAILTO_EMAIL_NON_ACCEPTING); // For addresses without the mailto prefix
      // Tokens allowed in the localpart of the email

      var localpartAccepting = [AMPERSAND, APOSTROPHE, ASTERISK, BACKSLASH, BACKTICK, CARET, CLOSEBRACE, DOLLAR, DOMAIN, EQUALS, HYPHEN, NUM, OPENBRACE, PERCENT, PIPE, PLUS, POUND, QUERY, SLASH, SYM, TILDE, TLD, UNDERSCORE]; // Some of the tokens in `localpartAccepting` are already accounted for here and
      // will not be overwritten (don't worry)

      makeMultiT(S_DOMAIN, localpartAccepting, S_LOCALPART);
      makeT(S_DOMAIN, AT, S_LOCALPART_AT);
      makeMultiT(S_TLD, localpartAccepting, S_LOCALPART);
      makeT(S_TLD, AT, S_LOCALPART_AT);
      makeMultiT(S_DOMAIN_DOT, localpartAccepting, S_LOCALPART); // Now in localpart of address
      // TODO: IP addresses and what if the email starts with numbers?

      makeMultiT(S_LOCALPART, localpartAccepting, S_LOCALPART);
      makeT(S_LOCALPART, AT, S_LOCALPART_AT); // close to an email address now

      makeT(S_LOCALPART, DOT, S_LOCALPART_DOT);
      makeMultiT(S_LOCALPART_DOT, localpartAccepting, S_LOCALPART);
      makeT(S_LOCALPART_AT, TLD, S_EMAIL_DOMAIN);
      makeT(S_LOCALPART_AT, DOMAIN, S_EMAIL_DOMAIN);
      makeT(S_LOCALPART_AT, NUM, S_EMAIL_DOMAIN);
      makeT(S_LOCALPART_AT, LOCALHOST, S_EMAIL); // States following `@` defined above

      return S_START;
    }
    /**
     * Run the parser state machine on a list of scanned string-based tokens to
     * create a list of multi tokens, each of which represents a URL, email address,
     * plain text, etc.
     *
     * @param {State} start parser start state
     * @param {string} input the original input used to generate the given tokens
     * @param {{t: string, v: string, s: number, e: number}[]} tokens list of scanned tokens
     * @returns {MultiToken[]}
     */

    function run(start, input, tokens) {
      var len = tokens.length;
      var cursor = 0;
      var multis = [];
      var textTokens = [];

      while (cursor < len) {
        var state = start;
        var secondState = null;
        var nextState = null;
        var multiLength = 0;
        var latestAccepting = null;
        var sinceAccepts = -1;

        while (cursor < len && !(secondState = takeT(state, tokens[cursor].t))) {
          // Starting tokens with nowhere to jump to.
          // Consider these to be just plain text
          textTokens.push(tokens[cursor++]);
        }

        while (cursor < len && (nextState = secondState || takeT(state, tokens[cursor].t))) {
          // Get the next state
          secondState = null;
          state = nextState; // Keep track of the latest accepting state

          if (state.accepts()) {
            sinceAccepts = 0;
            latestAccepting = state;
          } else if (sinceAccepts >= 0) {
            sinceAccepts++;
          }

          cursor++;
          multiLength++;
        }

        if (sinceAccepts < 0) {
          // No accepting state was found, part of a regular text token
          // Add all the tokens we looked at to the text tokens array
          for (var i = cursor - multiLength; i < cursor; i++) {
            textTokens.push(tokens[i]);
          }
        } else {
          // Accepting state!
          // First close off the textTokens (if available)
          if (textTokens.length > 0) {
            multis.push(parserCreateMultiToken(Text, input, textTokens));
            textTokens = [];
          } // Roll back to the latest accepting state


          cursor -= sinceAccepts;
          multiLength -= sinceAccepts; // Create a new multitoken

          var Multi = latestAccepting.t;
          var subtokens = tokens.slice(cursor - multiLength, cursor);
          multis.push(parserCreateMultiToken(Multi, input, subtokens));
        }
      } // Finally close off the textTokens (if available)


      if (textTokens.length > 0) {
        multis.push(parserCreateMultiToken(Text, input, textTokens));
      }

      return multis;
    }
    /**
     * Utility function for instantiating a new multitoken with all the relevant
     * fields during parsing.
     * @param {Class<MultiToken>} Multi class to instantiate
     * @param {string} input original input string
     * @param {{t: string, v: string, s: number, e: number}[]} tokens consecutive tokens scanned from input string
     * @returns {MultiToken}
     */

    function parserCreateMultiToken(Multi, input, tokens) {
      var startIdx = tokens[0].s;
      var endIdx = tokens[tokens.length - 1].e;
      var value = input.substr(startIdx, endIdx - startIdx);
      return new Multi(value, tokens);
    }


    var INIT = {
      scanner: null,
      parser: null,
      pluginQueue: [],
      customProtocols: [],
      initialized: false
    };
    /**
     * Initialize the linkify state machine. Called automatically the first time
     * linkify is called on a string, but may be called manually as well.
     */

    function init() {
      // Initialize state machines
      INIT.scanner = {
        start: init$2(INIT.customProtocols),
        tokens: text
      };
      INIT.parser = {
        start: init$1(),
        tokens: multi
      };
      var utils = {
        createTokenClass: createTokenClass
      }; // Initialize plugins

      for (var i = 0; i < INIT.pluginQueue.length; i++) {
        INIT.pluginQueue[i][1]({
          scanner: INIT.scanner,
          parser: INIT.parser,
          utils: utils
        });
      }

      INIT.initialized = true;
    }
    /**
    	Parse a string into tokens that represent linkable and non-linkable sub-components
    	@param {string} str
    	@return {MultiToken[]} tokens
    */

    function tokenize(str) {
      if (!INIT.initialized) {
        init();
      }

      return run(INIT.parser.start, str, run$1(INIT.scanner.start, str));
    }

    /**
    	Convert strings of text into linkable HTML text
    */

    function escapeText(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escapeAttr(href) {
      return href.replace(/"/g, '&quot;');
    }

    function attributesToString(attributes) {
      if (!attributes) {
        return '';
      }

      var result = [];

      for (var attr in attributes) {
        var val = attributes[attr] + '';
        result.push("".concat(attr, "=\"").concat(escapeAttr(val), "\""));
      }

      return result.join(' ');
    }
    /**
     * Convert a plan text string to an HTML string with links. Expects that the
     * given strings does not contain any HTML entities. Use the linkify-html
     * interface if you need to parse HTML entities.
     *
     * @param {string} str string to linkify
     * @param {object} [opts] overridable options
     * @returns {string}
     */


    function linkifyStr(str) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      opts = new Options(opts);
      var tokens = tokenize(str);
      var result = [];

      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (token.t === 'nl' && opts.nl2br) {
          result.push('<br>\n');
          continue;
        } else if (!token.isLink || !opts.check(token)) {
          result.push(escapeText(token.toString()));
          continue;
        }

        var _opts$resolve = opts.resolve(token),
            formatted = _opts$resolve.formatted,
            formattedHref = _opts$resolve.formattedHref,
            tagName = _opts$resolve.tagName,
            className = _opts$resolve.className,
            target = _opts$resolve.target,
            rel = _opts$resolve.rel,
            attributes = _opts$resolve.attributes;

        var link = ["<".concat(tagName, " href=\"").concat(escapeAttr(formattedHref), "\"")];

        if (className) {
          link.push(" class=\"".concat(escapeAttr(className), "\""));
        }

        if (target) {
          link.push(" target=\"".concat(escapeAttr(target), "\""));
        }

        if (rel) {
          link.push(" rel=\"".concat(escapeAttr(rel), "\""));
        }

        if (attributes) {
          link.push(" ".concat(attributesToString(attributes)));
        }

        link.push(">".concat(escapeText(formatted), "</").concat(tagName, ">"));
        result.push(link.join(''));
      }

      return result.join('');
    }

    if (!String.prototype.linkify) {
      Object.defineProperty(String.prototype, 'linkify', {
        writable: false,
        value: function linkify(options) {
          return linkifyStr(this, options);
        }
      });
    }

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var lib = {};

    (function (exports) {
    Object.defineProperty(exports,"__esModule",{value:!0}),exports.emojiMap=exports.checkText=void 0;/* eslint-disable linebreak-style */var emojiMap={"o/":"\uD83D\uDC4B","</3":"\uD83D\uDC94","<3":"\uD83D\uDC97","8-D":"\uD83D\uDE01","8D":"\uD83D\uDE01",":-D":"\uD83D\uDE01",":-3":"\uD83D\uDE01",":3":"\uD83D\uDE01",":D":"\uD83D\uDE01","B^D":"\uD83D\uDE01","X-D":"\uD83D\uDE01",XD:"\uD83D\uDE01","x-D":"\uD83D\uDE01",xD:"\uD83D\uDE01",":')":"\uD83D\uDE02",":'-)":"\uD83D\uDE02",":-))":"\uD83D\uDE03","8)":"\uD83D\uDE04",":)":"\uD83D\uDE0A",":-)":"\uD83D\uDE04",":]":"\uD83D\uDE04",":^)":"\uD83D\uDE04",":c)":"\uD83D\uDE04",":o)":"\uD83D\uDE04",":}":"\uD83D\uDE04",":っ)":"\uD83D\uDE04","0:)":"\uD83D\uDE07","0:-)":"\uD83D\uDE07","0:-3":"\uD83D\uDE07","0:3":"\uD83D\uDE07","0;^)":"\uD83D\uDE07","O:-)":"\uD83D\uDE07","3:)":"\uD83D\uDE08","3:-)":"\uD83D\uDE08","}:)":"\uD83D\uDE08","}:-)":"\uD83D\uDE08","*)":"\uD83D\uDE09","*-)":"\uD83D\uDE09",":-,":"\uD83D\uDE09",";)":"\uD83D\uDE09",";-)":"\uD83D\uDE09",";-]":"\uD83D\uDE09",";D":"\uD83D\uDE09",";]":"\uD83D\uDE09",";^)":"\uD83D\uDE09",":-|":"\uD83D\uDE10",":|":"\uD83D\uDE10",":(":"\uD83D\uDE1E",":-(":"\uD83D\uDE12",":-<":"\uD83D\uDE12",":-[":"\uD83D\uDE12",":-c":"\uD83D\uDE12",":<":"\uD83D\uDE12",":[":"\uD83D\uDE12",":c":"\uD83D\uDE12",":{":"\uD83D\uDE12",":っC":"\uD83D\uDE12","%)":"\uD83D\uDE16","%-)":"\uD83D\uDE16",":-P":"\uD83D\uDE1C",":-b":"\uD83D\uDE1C",":-p":"\uD83D\uDE1C",":-Þ":"\uD83D\uDE1C",":-þ":"\uD83D\uDE1C",":P":"\uD83D\uDE1C",":b":"\uD83D\uDE1C",":p":"\uD83D\uDE1C",":Þ":"\uD83D\uDE1C",":þ":"\uD83D\uDE1C",";(":"\uD83D\uDE1C","X-P":"\uD83D\uDE1C",XP:"\uD83D\uDE1C","d:":"\uD83D\uDE1C","x-p":"\uD83D\uDE1C",xp:"\uD83D\uDE1C",":-||":"\uD83D\uDE20",":@":"\uD83D\uDE20",":-.":"\uD83D\uDE21",":-/":"\uD83D\uDE21",":/":"\uD83D\uDE10",":L":"\uD83D\uDE21",":S":"\uD83D\uDE21",":\\":"\uD83D\uDE21",":'(":"\uD83D\uDE22",":'-(":"\uD83D\uDE22","^5":"\uD83D\uDE24","^<_<":"\uD83D\uDE24","o/\\o":"\uD83D\uDE24","|-O":"\uD83D\uDE2B","|;-)":"\uD83D\uDE2B",":###..":"\uD83D\uDE30",":#":"\uD83D\uDE05",":-###..":"\uD83D\uDE30","D-':":"\uD83D\uDE31",D8:"\uD83D\uDE31","D:":"\uD83D\uDE31","D:<":"\uD83D\uDE31","D;":"\uD83D\uDE31",DX:"\uD83D\uDE31","v.v":"\uD83D\uDE31","8-0":"\uD83D\uDE32",":-O":"\uD83D\uDE32",":-o":"\uD83D\uDE32",":O":"\uD83D\uDE32",":o":"\uD83D\uDE32","O-O":"\uD83D\uDE32",O_O:"\uD83D\uDE32",O_o:"\uD83D\uDE32","o-o":"\uD83D\uDE32",o_O:"\uD83D\uDE32",o_o:"\uD83D\uDE32",":$":"\uD83D\uDE33","#-)":"\uD83D\uDE35",":&":"\uD83D\uDE36",":-#":"\uD83D\uDE36",":-&":"\uD83D\uDE36",":-X":"\uD83D\uDE36",":X":"\uD83D\uDE36",":-J":"\uD83D\uDE3C",":*":"\uD83D\uDE18",":^*":"\uD83D\uDE3D",ಠ_ಠ:"\uD83D\uDE45","*\\0/*":"\uD83D\uDE46","\\o/":"\uD83D\uDE46",":>":"\uD83D\uDE04",">.<":"\uD83D\uDE21",">:(":"\uD83D\uDE20",">:)":"\uD83D\uDE08",">:-)":"\uD83D\uDE08",">:/":"\uD83D\uDE21",">:O":"\uD83D\uDE32",">:P":"\uD83D\uDE1C",">:[":"\uD83D\uDE12",">:\\":"\uD83D\uDE21",">;)":"\uD83D\uDE08",">_>^":"\uD83D\uDE24","^^":"\uD83D\uDE0A",":sweat":"\uD83D\uDE05",":smile:":"\uD83D\uDE04",":laughing:":"\uD83D\uDE06",":blush:":"\uD83D\uDE0A",":smiley:":"\uD83D\uDE03",":relaxed:":"\u263A\uFE0F",":smirk:":"\uD83D\uDE0F",":heart_eyes:":"\uD83D\uDE0D",":kissing_heart:":"\uD83D\uDE18",":kissing_closed_eyes:":"\uD83D\uDE1A",":flushed:":"\uD83D\uDE33",":relieved:":"\uD83D\uDE0C",":satisfied:":"\uD83D\uDE06",":grin:":"\uD83D\uDE01",":wink:":"\uD83D\uDE09",":stuck_out_tongue_winking_eye:":"\uD83D\uDE1C",":stuck_out_tongue_closed_eyes:":"\uD83D\uDE1D",":grinning:":"\uD83D\uDE00",":kissing:":"\uD83D\uDE17",":kissing_smiling_eyes:":"\uD83D\uDE19",":stuck_out_tongue:":"\uD83D\uDE1B",":sleeping:":"\uD83D\uDE34",":worried:":"\uD83D\uDE1F",":frowning:":"\uD83D\uDE26",":anguished:":"\uD83D\uDE27",":open_mouth:":"\uD83D\uDE2E",":grimacing:":"\uD83D\uDE2C",":confused:":"\uD83D\uDE15",":hushed:":"\uD83D\uDE2F",":expressionless:":"\uD83D\uDE11",":unamused:":"\uD83D\uDE12",":sweat_smile:":"\uD83D\uDE05",":sweat:":"\uD83D\uDE13",":disappointed_relieved:":"\uD83D\uDE25",":weary:":"\uD83D\uDE29",":pensive:":"\uD83D\uDE14",":disappointed:":"\uD83D\uDE1E",":confounded:":"\uD83D\uDE16",":fearful:":"\uD83D\uDE28",":cold_sweat:":"\uD83D\uDE30",":persevere:":"\uD83D\uDE23",":cry:":"\uD83D\uDE22",":sob:":"\uD83D\uDE2D",":joy:":"\uD83D\uDE02",":astonished:":"\uD83D\uDE32",":scream:":"\uD83D\uDE31",":tired_face:":"\uD83D\uDE2B",":angry:":"\uD83D\uDE20",":rage:":"\uD83D\uDE21",":triumph:":"\uD83D\uDE24",":sleepy:":"\uD83D\uDE2A",":yum:":"\uD83D\uDE0B",":mask:":"\uD83D\uDE37",":sunglasses:":"\uD83D\uDE0E",":dizzy_face:":"\uD83D\uDE35",":imp:":"\uD83D\uDC7F",":smiling_imp:":"\uD83D\uDE08",":neutral_face:":"\uD83D\uDE10",":no_mouth:":"\uD83D\uDE36",":innocent:":"\uD83D\uDE07",":alien:":"\uD83D\uDC7D",":yellow_heart:":"\uD83D\uDC9B",":blue_heart:":"\uD83D\uDC99",":purple_heart:":"\uD83D\uDC9C",":heart:":"\u2764\uFE0F",":green_heart:":"\uD83D\uDC9A",":broken_heart:":"\uD83D\uDC94",":heartbeat:":"\uD83D\uDC93",":heartpulse:":"\uD83D\uDC97",":two_hearts:":"\uD83D\uDC95",":revolving_hearts:":"\uD83D\uDC9E",":cupid:":"\uD83D\uDC98",":sparkling_heart:":"\uD83D\uDC96",":sparkles:":"\u2728",":star:":"\u2B50",":star2:":"\uD83C\uDF1F",":dizzy:":"\uD83D\uDCAB",":boom:":"\uD83D\uDCA5",":collision:":"\uD83D\uDCA5",":anger:":"\uD83D\uDCA2",":exclamation:":"\u2757",":question:":"\u2753",":grey_exclamation:":"\u2755",":grey_question:":"\u2754",":zzz:":"\uD83D\uDCA4",":dash:":"\uD83D\uDCA8",":sweat_drops:":"\uD83D\uDCA6",":notes:":"\uD83C\uDFB6",":musical_note:":"\uD83C\uDFB5",":fire:":"\uD83D\uDD25",":hankey:":"\uD83D\uDCA9",":poop:":"\uD83D\uDCA9",":shit:":"\uD83D\uDCA9",":+1:":"\uD83D\uDC4D",":thumbsup:":"\uD83D\uDC4D",":-1:":"\uD83D\uDC4E",":thumbsdown:":"\uD83D\uDC4E",":ok_hand:":"\uD83D\uDC4C",":punch:":"\uD83D\uDC4A",":facepunch:":"\uD83D\uDC4A",":fist:":"\u270A",":v:":"\u270C\uFE0F",":wave:":"\uD83D\uDC4B",":hand:":"\u270B",":raised_hand:":"\u270B",":open_hands:":"\uD83D\uDC50",":point_up:":"\u261D\uFE0F",":point_down:":"\uD83D\uDC47",":point_left:":"\uD83D\uDC48",":point_right:":"\uD83D\uDC49",":raised_hands:":"\uD83D\uDE4C",":pray:":"\uD83D\uDE4F",":point_up_2:":"\uD83D\uDC46",":clap:":"\uD83D\uDC4F",":muscle:":"\uD83D\uDCAA",":metal:":"\uD83E\uDD18",":fu:":"\uD83D\uDD95",":walking:":"\uD83D\uDEB6",":runner:":"\uD83C\uDFC3",":running:":"\uD83C\uDFC3",":couple:":"\uD83D\uDC6B",":family:":"\uD83D\uDC6A",":two_men_holding_hands:":"\uD83D\uDC6C",":two_women_holding_hands:":"\uD83D\uDC6D",":dancer:":"\uD83D\uDC83",":dancers:":"\uD83D\uDC6F",":no_good:":"\uD83D\uDE45",":information_desk_person:":"\uD83D\uDC81",":raising_hand:":"\uD83D\uDE4B",":bride_with_veil:":"\uD83D\uDC70",":bow:":"\uD83D\uDE47",":couplekiss:":"\uD83D\uDC8F",":couple_with_heart:":"\uD83D\uDC91",":massage:":"\uD83D\uDC86",":haircut:":"\uD83D\uDC87",":nail_care:":"\uD83D\uDC85",":boy:":"\uD83D\uDC66",":girl:":"\uD83D\uDC67",":woman:":"\uD83D\uDC69",":man:":"\uD83D\uDC68",":baby:":"\uD83D\uDC76",":older_woman:":"\uD83D\uDC75",":older_man:":"\uD83D\uDC74",":man_with_gua_pi_mao:":"\uD83D\uDC72",":construction_worker:":"\uD83D\uDC77",":cop:":"\uD83D\uDC6E",":angel:":"\uD83D\uDC7C",":princess:":"\uD83D\uDC78",":smiley_cat:":"\uD83D\uDE3A",":smile_cat:":"\uD83D\uDE38",":heart_eyes_cat:":"\uD83D\uDE3B",":kissing_cat:":"\uD83D\uDE3D",":smirk_cat:":"\uD83D\uDE3C",":scream_cat:":"\uD83D\uDE40",":crying_cat_face:":"\uD83D\uDE3F",":joy_cat:":"\uD83D\uDE39",":pouting_cat:":"\uD83D\uDE3E",":japanese_ogre:":"\uD83D\uDC79",":japanese_goblin:":"\uD83D\uDC7A",":see_no_evil:":"\uD83D\uDE48",":hear_no_evil:":"\uD83D\uDE49",":speak_no_evil:":"\uD83D\uDE4A",":skull:":"\uD83D\uDC80",":feet:":"\uD83D\uDC3E",":lips:":"\uD83D\uDC44",":kiss:":"\uD83D\uDC8B",":droplet:":"\uD83D\uDCA7",":ear:":"\uD83D\uDC42",":eyes:":"\uD83D\uDC40",":nose:":"\uD83D\uDC43",":tongue:":"\uD83D\uDC45",":love_letter:":"\uD83D\uDC8C",":bust_in_silhouette:":"\uD83D\uDC64",":busts_in_silhouette:":"\uD83D\uDC65",":speech_balloon:":"\uD83D\uDCAC",":thought_balloon:":"\uD83D\uDCAD",":sunny:":"\u2600\uFE0F",":umbrella:":"\u2614",":cloud:":"\u2601\uFE0F",":snowflake:":"\u2744\uFE0F",":snowman:":"\u26C4",":zap:":"\u26A1",":cyclone:":"\uD83C\uDF00",":foggy:":"\uD83C\uDF01",":ocean:":"\uD83C\uDF0A",":cat:":"\uD83D\uDC31",":dog:":"\uD83D\uDC36",":mouse:":"\uD83D\uDC2D",":hamster:":"\uD83D\uDC39",":rabbit:":"\uD83D\uDC30",":wolf:":"\uD83D\uDC3A",":frog:":"\uD83D\uDC38",":tiger:":"\uD83D\uDC2F",":koala:":"\uD83D\uDC28",":bear:":"\uD83D\uDC3B",":pig:":"\uD83D\uDC37",":pig_nose:":"\uD83D\uDC3D",":cow:":"\uD83D\uDC2E",":boar:":"\uD83D\uDC17",":monkey_face:":"\uD83D\uDC35",":monkey:":"\uD83D\uDC12",":horse:":"\uD83D\uDC34",":racehorse:":"\uD83D\uDC0E",":camel:":"\uD83D\uDC2B",":sheep:":"\uD83D\uDC11",":elephant:":"\uD83D\uDC18",":panda_face:":"\uD83D\uDC3C",":snake:":"\uD83D\uDC0D",":bird:":"\uD83D\uDC26",":baby_chick:":"\uD83D\uDC24",":hatched_chick:":"\uD83D\uDC25",":hatching_chick:":"\uD83D\uDC23",":chicken:":"\uD83D\uDC14",":penguin:":"\uD83D\uDC27",":turtle:":"\uD83D\uDC22",":bug:":"\uD83D\uDC1B",":honeybee:":"\uD83D\uDC1D",":ant:":"\uD83D\uDC1C",":beetle:":"\uD83D\uDC1E",":snail:":"\uD83D\uDC0C",":octopus:":"\uD83D\uDC19",":tropical_fish:":"\uD83D\uDC20",":fish:":"\uD83D\uDC1F",":whale:":"\uD83D\uDC33",":whale2:":"\uD83D\uDC0B",":dolphin:":"\uD83D\uDC2C",":cow2:":"\uD83D\uDC04",":ram:":"\uD83D\uDC0F",":rat:":"\uD83D\uDC00",":water_buffalo:":"\uD83D\uDC03",":tiger2:":"\uD83D\uDC05",":rabbit2:":"\uD83D\uDC07",":dragon:":"\uD83D\uDC09",":goat:":"\uD83D\uDC10",":rooster:":"\uD83D\uDC13",":dog2:":"\uD83D\uDC15",":pig2:":"\uD83D\uDC16",":mouse2:":"\uD83D\uDC01",":ox:":"\uD83D\uDC02",":dragon_face:":"\uD83D\uDC32",":blowfish:":"\uD83D\uDC21",":crocodile:":"\uD83D\uDC0A",":dromedary_camel:":"\uD83D\uDC2A",":leopard:":"\uD83D\uDC06",":cat2:":"\uD83D\uDC08",":poodle:":"\uD83D\uDC29",":paw_prints:":"\uD83D\uDC3E",":bouquet:":"\uD83D\uDC90",":cherry_blossom:":"\uD83C\uDF38",":tulip:":"\uD83C\uDF37",":four_leaf_clover:":"\uD83C\uDF40",":rose:":"\uD83C\uDF39",":sunflower:":"\uD83C\uDF3B",":hibiscus:":"\uD83C\uDF3A",":maple_leaf:":"\uD83C\uDF41",":leaves:":"\uD83C\uDF43",":fallen_leaf:":"\uD83C\uDF42",":herb:":"\uD83C\uDF3F",":mushroom:":"\uD83C\uDF44",":cactus:":"\uD83C\uDF35",":palm_tree:":"\uD83C\uDF34",":evergreen_tree:":"\uD83C\uDF32",":deciduous_tree:":"\uD83C\uDF33",":chestnut:":"\uD83C\uDF30",":seedling:":"\uD83C\uDF31",":blossom:":"\uD83C\uDF3C",":ear_of_rice:":"\uD83C\uDF3E",":shell:":"\uD83D\uDC1A",":globe_with_meridians:":"\uD83C\uDF10",":sun_with_face:":"\uD83C\uDF1E",":full_moon_with_face:":"\uD83C\uDF1D",":new_moon_with_face:":"\uD83C\uDF1A",":new_moon:":"\uD83C\uDF11",":waxing_crescent_moon:":"\uD83C\uDF12",":first_quarter_moon:":"\uD83C\uDF13",":waxing_gibbous_moon:":"\uD83C\uDF14",":full_moon:":"\uD83C\uDF15",":waning_gibbous_moon:":"\uD83C\uDF16",":last_quarter_moon:":"\uD83C\uDF17",":waning_crescent_moon:":"\uD83C\uDF18",":last_quarter_moon_with_face:":"\uD83C\uDF1C",":first_quarter_moon_with_face:":"\uD83C\uDF1B",":moon:":"\uD83C\uDF14",":earth_africa:":"\uD83C\uDF0D",":earth_americas:":"\uD83C\uDF0E",":earth_asia:":"\uD83C\uDF0F",":volcano:":"\uD83C\uDF0B",":milky_way:":"\uD83C\uDF0C",":partly_sunny:":"\u26C5",":bamboo:":"\uD83C\uDF8D",":gift_heart:":"\uD83D\uDC9D",":dolls:":"\uD83C\uDF8E",":school_satchel:":"\uD83C\uDF92",":mortar_board:":"\uD83C\uDF93",":flags:":"\uD83C\uDF8F",":fireworks:":"\uD83C\uDF86",":sparkler:":"\uD83C\uDF87",":wind_chime:":"\uD83C\uDF90",":rice_scene:":"\uD83C\uDF91",":jack_o_lantern:":"\uD83C\uDF83",":ghost:":"\uD83D\uDC7B",":santa:":"\uD83C\uDF85",":christmas_tree:":"\uD83C\uDF84",":gift:":"\uD83C\uDF81",":bell:":"\uD83D\uDD14",":no_bell:":"\uD83D\uDD15",":tanabata_tree:":"\uD83C\uDF8B",":tada:":"\uD83C\uDF89",":confetti_ball:":"\uD83C\uDF8A",":balloon:":"\uD83C\uDF88",":crystal_ball:":"\uD83D\uDD2E",":cd:":"\uD83D\uDCBF",":dvd:":"\uD83D\uDCC0",":floppy_disk:":"\uD83D\uDCBE",":camera:":"\uD83D\uDCF7",":video_camera:":"\uD83D\uDCF9",":movie_camera:":"\uD83C\uDFA5",":computer:":"\uD83D\uDCBB",":tv:":"\uD83D\uDCFA",":iphone:":"\uD83D\uDCF1",":phone:":"\u260E\uFE0F",":telephone:":"\u260E\uFE0F",":telephone_receiver:":"\uD83D\uDCDE",":pager:":"\uD83D\uDCDF",":fax:":"\uD83D\uDCE0",":minidisc:":"\uD83D\uDCBD",":vhs:":"\uD83D\uDCFC",":sound:":"\uD83D\uDD09",":speaker:":"\uD83D\uDD08",":mute:":"\uD83D\uDD07",":loudspeaker:":"\uD83D\uDCE2",":mega:":"\uD83D\uDCE3",":hourglass:":"\u231B",":hourglass_flowing_sand:":"\u23F3",":alarm_clock:":"\u23F0",":watch:":"\u231A",":radio:":"\uD83D\uDCFB",":satellite:":"\uD83D\uDCE1",":loop:":"\u27BF",":mag:":"\uD83D\uDD0D",":mag_right:":"\uD83D\uDD0E",":unlock:":"\uD83D\uDD13",":lock:":"\uD83D\uDD12",":lock_with_ink_pen:":"\uD83D\uDD0F",":closed_lock_with_key:":"\uD83D\uDD10",":key:":"\uD83D\uDD11",":bulb:":"\uD83D\uDCA1",":flashlight:":"\uD83D\uDD26",":high_brightness:":"\uD83D\uDD06",":low_brightness:":"\uD83D\uDD05",":electric_plug:":"\uD83D\uDD0C",":battery:":"\uD83D\uDD0B",":calling:":"\uD83D\uDCF2",":email:":"\u2709\uFE0F",":mailbox:":"\uD83D\uDCEB",":postbox:":"\uD83D\uDCEE",":bath:":"\uD83D\uDEC0",":bathtub:":"\uD83D\uDEC1",":shower:":"\uD83D\uDEBF",":toilet:":"\uD83D\uDEBD",":wrench:":"\uD83D\uDD27",":nut_and_bolt:":"\uD83D\uDD29",":hammer:":"\uD83D\uDD28",":seat:":"\uD83D\uDCBA",":moneybag:":"\uD83D\uDCB0",":yen:":"\uD83D\uDCB4",":dollar:":"\uD83D\uDCB5",":pound:":"\uD83D\uDCB7",":euro:":"\uD83D\uDCB6",":credit_card:":"\uD83D\uDCB3",":money_with_wings:":"\uD83D\uDCB8",":e-mail:":"\uD83D\uDCE7",":inbox_tray:":"\uD83D\uDCE5",":outbox_tray:":"\uD83D\uDCE4",":envelope:":"\u2709\uFE0F",":incoming_envelope:":"\uD83D\uDCE8",":postal_horn:":"\uD83D\uDCEF",":mailbox_closed:":"\uD83D\uDCEA",":mailbox_with_mail:":"\uD83D\uDCEC",":mailbox_with_no_mail:":"\uD83D\uDCED",":package:":"\uD83D\uDCE6",":door:":"\uD83D\uDEAA",":smoking:":"\uD83D\uDEAC",":bomb:":"\uD83D\uDCA3",":gun:":"\uD83D\uDD2B",":hocho:":"\uD83D\uDD2A",":pill:":"\uD83D\uDC8A",":syringe:":"\uD83D\uDC89",":page_facing_up:":"\uD83D\uDCC4",":page_with_curl:":"\uD83D\uDCC3",":bookmark_tabs:":"\uD83D\uDCD1",":bar_chart:":"\uD83D\uDCCA",":chart_with_upwards_trend:":"\uD83D\uDCC8",":chart_with_downwards_trend:":"\uD83D\uDCC9",":scroll:":"\uD83D\uDCDC",":clipboard:":"\uD83D\uDCCB",":calendar:":"\uD83D\uDCC6",":date:":"\uD83D\uDCC5",":card_index:":"\uD83D\uDCC7",":file_folder:":"\uD83D\uDCC1",":open_file_folder:":"\uD83D\uDCC2",":scissors:":"\u2702\uFE0F",":pushpin:":"\uD83D\uDCCC",":paperclip:":"\uD83D\uDCCE",":black_nib:":"\u2712\uFE0F",":pencil2:":"\u270F\uFE0F",":straight_ruler:":"\uD83D\uDCCF",":triangular_ruler:":"\uD83D\uDCD0",":closed_book:":"\uD83D\uDCD5",":green_book:":"\uD83D\uDCD7",":blue_book:":"\uD83D\uDCD8",":orange_book:":"\uD83D\uDCD9",":notebook:":"\uD83D\uDCD3",":notebook_with_decorative_cover:":"\uD83D\uDCD4",":ledger:":"\uD83D\uDCD2",":books:":"\uD83D\uDCDA",":bookmark:":"\uD83D\uDD16",":name_badge:":"\uD83D\uDCDB",":microscope:":"\uD83D\uDD2C",":telescope:":"\uD83D\uDD2D",":newspaper:":"\uD83D\uDCF0",":football:":"\uD83C\uDFC8",":basketball:":"\uD83C\uDFC0",":soccer:":"\u26BD",":baseball:":"\u26BE",":tennis:":"\uD83C\uDFBE",":8ball:":"\uD83C\uDFB1",":rugby_football:":"\uD83C\uDFC9",":bowling:":"\uD83C\uDFB3",":golf:":"\u26F3",":mountain_bicyclist:":"\uD83D\uDEB5",":bicyclist:":"\uD83D\uDEB4",":horse_racing:":"\uD83C\uDFC7",":snowboarder:":"\uD83C\uDFC2",":swimmer:":"\uD83C\uDFCA",":surfer:":"\uD83C\uDFC4",":ski:":"\uD83C\uDFBF",":spades:":"\u2660\uFE0F",":hearts:":"\u2665\uFE0F",":clubs:":"\u2663\uFE0F",":diamonds:":"\u2666\uFE0F",":gem:":"\uD83D\uDC8E",":ring:":"\uD83D\uDC8D",":trophy:":"\uD83C\uDFC6",":musical_score:":"\uD83C\uDFBC",":musical_keyboard:":"\uD83C\uDFB9",":violin:":"\uD83C\uDFBB",":space_invader:":"\uD83D\uDC7E",":video_game:":"\uD83C\uDFAE",":black_joker:":"\uD83C\uDCCF",":flower_playing_cards:":"\uD83C\uDFB4",":game_die:":"\uD83C\uDFB2",":dart:":"\uD83C\uDFAF",":mahjong:":"\uD83C\uDC04",":clapper:":"\uD83C\uDFAC",":memo:":"\uD83D\uDCDD",":pencil:":"\uD83D\uDCDD",":book:":"\uD83D\uDCD6",":art:":"\uD83C\uDFA8",":microphone:":"\uD83C\uDFA4",":headphones:":"\uD83C\uDFA7",":trumpet:":"\uD83C\uDFBA",":saxophone:":"\uD83C\uDFB7",":guitar:":"\uD83C\uDFB8",":shoe:":"\uD83D\uDC5E",":sandal:":"\uD83D\uDC61",":high_heel:":"\uD83D\uDC60",":lipstick:":"\uD83D\uDC84",":boot:":"\uD83D\uDC62",":shirt:":"\uD83D\uDC55",":tshirt:":"\uD83D\uDC55",":necktie:":"\uD83D\uDC54",":womans_clothes:":"\uD83D\uDC5A",":dress:":"\uD83D\uDC57",":running_shirt_with_sash:":"\uD83C\uDFBD",":jeans:":"\uD83D\uDC56",":kimono:":"\uD83D\uDC58",":bikini:":"\uD83D\uDC59",":ribbon:":"\uD83C\uDF80",":tophat:":"\uD83C\uDFA9",":crown:":"\uD83D\uDC51",":womans_hat:":"\uD83D\uDC52",":mans_shoe:":"\uD83D\uDC5E",":closed_umbrella:":"\uD83C\uDF02",":briefcase:":"\uD83D\uDCBC",":handbag:":"\uD83D\uDC5C",":pouch:":"\uD83D\uDC5D",":purse:":"\uD83D\uDC5B",":eyeglasses:":"\uD83D\uDC53",":fishing_pole_and_fish:":"\uD83C\uDFA3",":coffee:":"\u2615",":tea:":"\uD83C\uDF75",":sake:":"\uD83C\uDF76",":baby_bottle:":"\uD83C\uDF7C",":beer:":"\uD83C\uDF7A",":beers:":"\uD83C\uDF7B",":cocktail:":"\uD83C\uDF78",":tropical_drink:":"\uD83C\uDF79",":wine_glass:":"\uD83C\uDF77",":fork_and_knife:":"\uD83C\uDF74",":pizza:":"\uD83C\uDF55",":hamburger:":"\uD83C\uDF54",":fries:":"\uD83C\uDF5F",":poultry_leg:":"\uD83C\uDF57",":meat_on_bone:":"\uD83C\uDF56",":spaghetti:":"\uD83C\uDF5D",":curry:":"\uD83C\uDF5B",":fried_shrimp:":"\uD83C\uDF64",":bento:":"\uD83C\uDF71",":sushi:":"\uD83C\uDF63",":fish_cake:":"\uD83C\uDF65",":rice_ball:":"\uD83C\uDF59",":rice_cracker:":"\uD83C\uDF58",":rice:":"\uD83C\uDF5A",":ramen:":"\uD83C\uDF5C",":stew:":"\uD83C\uDF72",":oden:":"\uD83C\uDF62",":dango:":"\uD83C\uDF61",":egg:":"\uD83E\uDD5A",":bread:":"\uD83C\uDF5E",":doughnut:":"\uD83C\uDF69",":custard:":"\uD83C\uDF6E",":icecream:":"\uD83C\uDF66",":ice_cream:":"\uD83C\uDF68",":shaved_ice:":"\uD83C\uDF67",":birthday:":"\uD83C\uDF82",":cake:":"\uD83C\uDF70",":cookie:":"\uD83C\uDF6A",":chocolate_bar:":"\uD83C\uDF6B",":candy:":"\uD83C\uDF6C",":lollipop:":"\uD83C\uDF6D",":honey_pot:":"\uD83C\uDF6F",":apple:":"\uD83C\uDF4E",":green_apple:":"\uD83C\uDF4F",":tangerine:":"\uD83C\uDF4A",":lemon:":"\uD83C\uDF4B",":cherries:":"\uD83C\uDF52",":grapes:":"\uD83C\uDF47",":watermelon:":"\uD83C\uDF49",":strawberry:":"\uD83C\uDF53",":peach:":"\uD83C\uDF51",":melon:":"\uD83C\uDF48",":banana:":"\uD83C\uDF4C",":pear:":"\uD83C\uDF50",":pineapple:":"\uD83C\uDF4D",":sweet_potato:":"\uD83C\uDF60",":eggplant:":"\uD83C\uDF46",":tomato:":"\uD83C\uDF45",":corn:":"\uD83C\uDF3D",":house:":"\uD83C\uDFE0",":house_with_garden:":"\uD83C\uDFE1",":school:":"\uD83C\uDFEB",":office:":"\uD83C\uDFE2",":post_office:":"\uD83C\uDFE3",":hospital:":"\uD83C\uDFE5",":bank:":"\uD83C\uDFE6",":convenience_store:":"\uD83C\uDFEA",":love_hotel:":"\uD83C\uDFE9",":hotel:":"\uD83C\uDFE8",":wedding:":"\uD83D\uDC92",":church:":"\u26EA",":department_store:":"\uD83C\uDFEC",":european_post_office:":"\uD83C\uDFE4",":city_sunrise:":"\uD83C\uDF07",":city_sunset:":"\uD83C\uDF06",":japanese_castle:":"\uD83C\uDFEF",":european_castle:":"\uD83C\uDFF0",":tent:":"\u26FA",":factory:":"\uD83C\uDFED",":tokyo_tower:":"\uD83D\uDDFC",":japan:":"\uD83D\uDDFE",":mount_fuji:":"\uD83D\uDDFB",":sunrise_over_mountains:":"\uD83C\uDF04",":sunrise:":"\uD83C\uDF05",":stars:":"\uD83C\uDF20",":statue_of_liberty:":"\uD83D\uDDFD",":bridge_at_night:":"\uD83C\uDF09",":carousel_horse:":"\uD83C\uDFA0",":rainbow:":"\uD83C\uDF08",":ferris_wheel:":"\uD83C\uDFA1",":fountain:":"\u26F2",":roller_coaster:":"\uD83C\uDFA2",":ship:":"\uD83D\uDEA2",":speedboat:":"\uD83D\uDEA4",":boat:":"\u26F5",":sailboat:":"\u26F5",":rowboat:":"\uD83D\uDEA3",":anchor:":"\u2693",":rocket:":"\uD83D\uDE80",":airplane:":"\u2708\uFE0F",":helicopter:":"\uD83D\uDE81",":steam_locomotive:":"\uD83D\uDE82",":tram:":"\uD83D\uDE8A",":mountain_railway:":"\uD83D\uDE9E",":bike:":"\uD83D\uDEB2",":aerial_tramway:":"\uD83D\uDEA1",":suspension_railway:":"\uD83D\uDE9F",":mountain_cableway:":"\uD83D\uDEA0",":tractor:":"\uD83D\uDE9C",":blue_car:":"\uD83D\uDE99",":oncoming_automobile:":"\uD83D\uDE98",":car:":"\uD83D\uDE97",":red_car:":"\uD83D\uDE97",":taxi:":"\uD83D\uDE95",":oncoming_taxi:":"\uD83D\uDE96",":articulated_lorry:":"\uD83D\uDE9B",":bus:":"\uD83D\uDE8C",":oncoming_bus:":"\uD83D\uDE8D",":rotating_light:":"\uD83D\uDEA8",":police_car:":"\uD83D\uDE93",":oncoming_police_car:":"\uD83D\uDE94",":fire_engine:":"\uD83D\uDE92",":ambulance:":"\uD83D\uDE91",":minibus:":"\uD83D\uDE90",":truck:":"\uD83D\uDE9A",":train:":"\uD83D\uDE8B",":station:":"\uD83D\uDE89",":train2:":"\uD83D\uDE86",":bullettrain_front:":"\uD83D\uDE85",":bullettrain_side:":"\uD83D\uDE84",":light_rail:":"\uD83D\uDE88",":monorail:":"\uD83D\uDE9D",":railway_car:":"\uD83D\uDE83",":trolleybus:":"\uD83D\uDE8E",":ticket:":"\uD83C\uDFAB",":fuelpump:":"\u26FD",":vertical_traffic_light:":"\uD83D\uDEA6",":traffic_light:":"\uD83D\uDEA5",":warning:":"\u26A0\uFE0F",":construction:":"\uD83D\uDEA7",":beginner:":"\uD83D\uDD30",":atm:":"\uD83C\uDFE7",":slot_machine:":"\uD83C\uDFB0",":busstop:":"\uD83D\uDE8F",":barber:":"\uD83D\uDC88",":hotsprings:":"\u2668\uFE0F",":checkered_flag:":"\uD83C\uDFC1",":crossed_flags:":"\uD83C\uDF8C",":izakaya_lantern:":"\uD83C\uDFEE",":moyai:":"\uD83D\uDDFF",":circus_tent:":"\uD83C\uDFAA",":performing_arts:":"\uD83C\uDFAD",":round_pushpin:":"\uD83D\uDCCD",":triangular_flag_on_post:":"\uD83D\uDEA9",":jp:":"\uD83C\uDDEF\uD83C\uDDF5",":kr:":"\uD83C\uDDF0\uD83C\uDDF7",":cn:":"\uD83C\uDDE8\uD83C\uDDF3",":us:":"\uD83C\uDDFA\uD83C\uDDF8",":fr:":"\uD83C\uDDEB\uD83C\uDDF7",":es:":"\uD83C\uDDEA\uD83C\uDDF8",":it:":"\uD83C\uDDEE\uD83C\uDDF9",":ru:":"\uD83C\uDDF7\uD83C\uDDFA",":gb:":"\uD83C\uDDEC\uD83C\uDDE7",":uk:":"\uD83C\uDDEC\uD83C\uDDE7",":de:":"\uD83C\uDDE9\uD83C\uDDEA",":one:":"1\uFE0F\u20E3",":two:":"2\uFE0F\u20E3",":three:":"3\uFE0F\u20E3",":four:":"4\uFE0F\u20E3",":five:":"5\uFE0F\u20E3",":six:":"6\uFE0F\u20E3",":seven:":"7\uFE0F\u20E3",":eight:":"8\uFE0F\u20E3",":nine:":"9\uFE0F\u20E3",":keycap_ten:":"\uD83D\uDD1F",":1234:":"\uD83D\uDD22",":zero:":"0\uFE0F\u20E3",":hash:":"#\uFE0F\u20E3",":symbols:":"\uD83D\uDD23",":arrow_backward:":"\u25C0\uFE0F",":arrow_down:":"\u2B07\uFE0F",":arrow_forward:":"\u25B6\uFE0F",":arrow_left:":"\u2B05\uFE0F",":capital_abcd:":"\uD83D\uDD20",":abcd:":"\uD83D\uDD21",":abc:":"\uD83D\uDD24",":arrow_lower_left:":"\u2199\uFE0F",":arrow_lower_right:":"\u2198\uFE0F",":arrow_right:":"\u27A1\uFE0F",":arrow_up:":"\u2B06\uFE0F",":arrow_upper_left:":"\u2196\uFE0F",":arrow_upper_right:":"\u2197\uFE0F",":arrow_double_down:":"\u23EC",":arrow_double_up:":"\u23EB",":arrow_down_small:":"\uD83D\uDD3D",":arrow_heading_down:":"\u2935\uFE0F",":arrow_heading_up:":"\u2934\uFE0F",":leftwards_arrow_with_hook:":"\u21A9\uFE0F",":arrow_right_hook:":"\u21AA\uFE0F",":left_right_arrow:":"\u2194\uFE0F",":arrow_up_down:":"\u2195\uFE0F",":arrow_up_small:":"\uD83D\uDD3C",":arrows_clockwise:":"\uD83D\uDD03",":arrows_counterclockwise:":"\uD83D\uDD04",":rewind:":"\u23EA",":fast_forward:":"\u23E9",":information_source:":"\u2139\uFE0F",":ok:":"\uD83C\uDD97",":twisted_rightwards_arrows:":"\uD83D\uDD00",":repeat:":"\uD83D\uDD01",":repeat_one:":"\uD83D\uDD02",":new:":"\uD83C\uDD95",":top:":"\uD83D\uDD1D",":up:":"\uD83C\uDD99",":cool:":"\uD83C\uDD92",":free:":"\uD83C\uDD93",":ng:":"\uD83C\uDD96",":cinema:":"\uD83C\uDFA6",":koko:":"\uD83C\uDE01",":signal_strength:":"\uD83D\uDCF6",":u5272:":"\uD83C\uDE39",":u5408:":"\uD83C\uDE34",":u55b6:":"\uD83C\uDE3A",":u6307:":"\uD83C\uDE2F",":u6708:":"\uD83C\uDE37\uFE0F",":u6709:":"\uD83C\uDE36",":u6e80:":"\uD83C\uDE35",":u7121:":"\uD83C\uDE1A",":u7533:":"\uD83C\uDE38",":u7a7a:":"\uD83C\uDE33",":u7981:":"\uD83C\uDE32",":sa:":"\uD83C\uDE02\uFE0F",":restroom:":"\uD83D\uDEBB",":mens:":"\uD83D\uDEB9",":womens:":"\uD83D\uDEBA",":baby_symbol:":"\uD83D\uDEBC",":no_smoking:":"\uD83D\uDEAD",":parking:":"\uD83C\uDD7F\uFE0F",":wheelchair:":"\u267F",":metro:":"\uD83D\uDE87",":baggage_claim:":"\uD83D\uDEC4",":accept:":"\uD83C\uDE51",":wc:":"\uD83D\uDEBE",":potable_water:":"\uD83D\uDEB0",":put_litter_in_its_place:":"\uD83D\uDEAE",":secret:":"\u3299\uFE0F",":congratulations:":"\u3297\uFE0F",":m:":"\u24C2\uFE0F",":passport_control:":"\uD83D\uDEC2",":left_luggage:":"\uD83D\uDEC5",":customs:":"\uD83D\uDEC3",":ideograph_advantage:":"\uD83C\uDE50",":cl:":"\uD83C\uDD91",":sos:":"\uD83C\uDD98",":id:":"\uD83C\uDD94",":no_entry_sign:":"\uD83D\uDEAB",":underage:":"\uD83D\uDD1E",":no_mobile_phones:":"\uD83D\uDCF5",":do_not_litter:":"\uD83D\uDEAF",":non-potable_water:":"\uD83D\uDEB1",":no_bicycles:":"\uD83D\uDEB3",":no_pedestrians:":"\uD83D\uDEB7",":children_crossing:":"\uD83D\uDEB8",":no_entry:":"\u26D4",":eight_spoked_asterisk:":"\u2733\uFE0F",":sparkle:":"\u2747\uFE0F",":eight_pointed_black_star:":"\u2734\uFE0F",":heart_decoration:":"\uD83D\uDC9F",":vs:":"\uD83C\uDD9A",":vibration_mode:":"\uD83D\uDCF3",":mobile_phone_off:":"\uD83D\uDCF4",":chart:":"\uD83D\uDCB9",":currency_exchange:":"\uD83D\uDCB1",":aries:":"\u2648",":taurus:":"\u2649",":gemini:":"\u264A",":cancer:":"\u264B",":leo:":"\u264C",":virgo:":"\u264D",":libra:":"\u264E",":scorpius:":"\u264F",":sagittarius:":"\u2650",":capricorn:":"\u2651",":aquarius:":"\u2652",":pisces:":"\u2653",":ophiuchus:":"\u26CE",":six_pointed_star:":"\uD83D\uDD2F",":negative_squared_cross_mark:":"\u274E",":a:":"\uD83C\uDD70\uFE0F",":b:":"\uD83C\uDD71\uFE0F",":ab:":"\uD83C\uDD8E",":o2:":"\uD83C\uDD7E\uFE0F",":diamond_shape_with_a_dot_inside:":"\uD83D\uDCA0",":recycle:":"\u267B\uFE0F",":end:":"\uD83D\uDD1A",":back:":"\uD83D\uDD19",":on:":"\uD83D\uDD1B",":soon:":"\uD83D\uDD1C",":clock1:":"\uD83D\uDD50",":clock130:":"\uD83D\uDD5C",":clock10:":"\uD83D\uDD59",":clock1030:":"\uD83D\uDD65",":clock11:":"\uD83D\uDD5A",":clock1130:":"\uD83D\uDD66",":clock12:":"\uD83D\uDD5B",":clock1230:":"\uD83D\uDD67",":clock2:":"\uD83D\uDD51",":clock230:":"\uD83D\uDD5D",":clock3:":"\uD83D\uDD52",":clock330:":"\uD83D\uDD5E",":clock4:":"\uD83D\uDD53",":clock430:":"\uD83D\uDD5F",":clock5:":"\uD83D\uDD54",":clock530:":"\uD83D\uDD60",":clock6:":"\uD83D\uDD55",":clock630:":"\uD83D\uDD61",":clock7:":"\uD83D\uDD56",":clock730:":"\uD83D\uDD62",":clock8:":"\uD83D\uDD57",":clock830:":"\uD83D\uDD63",":clock9:":"\uD83D\uDD58",":clock930:":"\uD83D\uDD64",":heavy_dollar_sign:":"\uD83D\uDCB2",":copyright:":"\xA9\uFE0F",":registered:":"\xAE\uFE0F",":tm:":"\u2122\uFE0F",":x:":"\u274C",":heavy_exclamation_mark:":"\u2757",":bangbang:":"\u203C\uFE0F",":interrobang:":"\u2049\uFE0F",":o:":"\u2B55",":heavy_multiplication_x:":"\u2716\uFE0F",":heavy_plus_sign:":"\u2795",":heavy_minus_sign:":"\u2796",":heavy_division_sign:":"\u2797",":white_flower:":"\uD83D\uDCAE",":100:":"\uD83D\uDCAF",":heavy_check_mark:":"\u2714\uFE0F",":ballot_box_with_check:":"\u2611\uFE0F",":radio_button:":"\uD83D\uDD18",":link:":"\uD83D\uDD17",":curly_loop:":"\u27B0",":wavy_dash:":"\u3030\uFE0F",":part_alternation_mark:":"\u303D\uFE0F"};exports.emojiMap=emojiMap;var checkText=function(a){var b=a&&a.split(" "),c=[];return b&&b.forEach(function(a){var b=a;a in emojiMap&&(b=emojiMap[a]),c.push(b);}),c.join(" ")};exports.checkText=checkText;
    } (lib));

    var index = /*@__PURE__*/getDefaultExportFromCjs(lib);

    var smile2emoji = /*#__PURE__*/_mergeNamespaces({
        __proto__: null,
        'default': index
    }, [lib]);

    const { checkText,emojiMap } = smile2emoji;

    class OutputStream {
        constructor() {
    //        this.doc = {};
            this.debug = false;
            this.footnotes = [];

            this.out = 'let html = arguments[0];\n';
            this.out += 'let include = arguments[1];\n';
            this.out += 'let json = {};\n';
            this.out += 'try {\n';      
            this.linkifyOptions = { defaultProtocol: 'https' };
        }

        footnoteNum(id,text) {
            for (let i=0 ; i<this.footnotes.length ; i++) {
                if (this.footnotes[i].id == id) {
                    if (text != undefined) {
                        this.footnotes[i].text = text;
                    }
                    return i+1
                }
            }
            this.footnotes.push({ id: id, text: text });
            return this.footnotes.length;
        }

        parse(str) {
            return lib$1.parse(str);
        }

        tag(i,t,v) {
            if (this.debug) {
                new Error().stack.split('\n')[2].replace(/.*\//,'').replace(')','');
    //            console.log(`${caller} > ${t} = ${JSON5.stringify(v)}`)
            }
            this.out += `${t} = ${lib$1.stringify(v)};\n`;
        }

        push(i,t,v) {
            if (this.debug) {
                new Error().stack.split('\n')[2].replace(/.*\//,'').replace(')','');
    //            console.log(`${caller} > ${t}.push(${JSON5.stringify(v)})`)
            }
            this.out += `${t}.push(${lib$1.stringify(v)});\n`;
        }

        raw(i,str) {
            this.out += "html.raw("+i+",\`"+str+"\`);\n";
        }

        footnote(i,id,text) {
            this.footnoteNum(id,text);
        }

        processString(str) {
            return checkText(str);    }

        text(str) {
    //        console.log('txt(str)', str);
            if (str === undefined) return str;
    //        console.log(str)
            let res = '[';
            for (let i=0 ; i<str.length ; i++) {
                const s = str[i];
                if (typeof s == 'string') {
                    res += `\`${this.processString(s)}\``;
                } else if (s.args != null && s.args.args != null) {
                    let args = JSON.stringify(s.args.args);
                    args = args.substring(1,args.length-1);
                    res += `include("${s.name}",${args})`;
                } else {
                    res += `include("${s.name}")`;
                }
                if (i < str.length-1) {
                    res += ',';
                }
            }
            res += ']';
    //        console.log(res);
            return res
        }

        p(i,str) {
            this.out += `html.p(${i},${this.text(str)});\n`;
        }

        ol(ln,indent,str) {
            this.out += `ln=${ln};html.ol(${indent},${this.text(str)});\n`;
        }

        ul(ln,indent,str) {
            this.out += `ln=${ln};html.ul(${indent},${this.text(str)});\n`;
        }

        xt(x,ln,indent,done,str) {
            this.out += `ln=${ln};`;
            this.out += `json.tasks=(json.tasks?json.tasks:[]);`;
            this.out += `json.tasks.push({line:ln,done:${done},text:\`${str}\`});`;
            const form = `<form method="PUT"><input ${(done?'checked':'')} type="checkbox" task="${ln}" onChange="this.form.submit()">&nbsp;`;
            str.unshift(form);
            str.push('</form>');
            this.out += `html.${x}l(${indent},${this.text(str)});\n`;
        }

        // ordered task
        ot(ln,indent,done,str) {
            this.xt('o',ln,indent,done,str);
        }

        // unordered task
        ut(ln,indent,done,str) {
            this.xt('u',ln,indent,done,str);
        }


        div(i,el,attr) {
            this.out += "html.div("+i+",\`"+el+"\`" + (attr == undefined ?'':",\`"+ attr + "\`")+");\n";
        }

        el(i,el,attr) {
            this.out += "html.el("+i+",\`"+el+"\`" + (attr == undefined ?'':",\`"+ attr + "\`")+");\n";
        }

        _el() {
            this.out += "html._el();\n";
        }

        comment(i,str) {
            this.out += `html.comment(${i},${this.text(str)});\n`;
        }

        table(i) {
            this.out += `html.table(${i});\n`;
        }

        thead(i) {
            this.out += `html.thead(${i});\n`;
        }

        tbody(i) {
            this.out += `html.tbody(${i});\n`;
        }

        tr(i) {
            this.out += `html.tr(${i});\n`;
        }

        td(i,str,attrs) {
            this.out += `html.td(${i},${this.text(str)},${attrs==undefined?"":"`"+attrs+"`"});\n`;
        }

        th(i,str,attrs) {
            this.out += `html.th(${i},${this.text(str)},${attrs==undefined?"":"`"+attrs+"`"});\n`;
        }

        h1(i,str) {
            this.out += `html.h1(${i},${this.text(str)});\n`;
        }

        h2(i,str) {
            this.out += `html.h2(${i},${this.text(str)});\n`;
        }

        h3(i,str) {
            this.out += `html.h3(${i},${this.text(str)});\n`;
        }

        h4(i,str) {
            this.out += `html.h4(${i},${this.text(str)});\n`;
        }

        h5(i,str) {
            this.out += `html.h5(${i},${this.text(str)});\n`;
        }

        h6(i,str) {
            this.out += `html.h6(${i},${this.text(str)});\n`;
        }

        code(str) {
            // console.log("$ " + str);
            this.out += str + '\n';
        }
        // writeln(str) {
        //     if (str) {
        //         this.out += "out.write(\"" + str + "\\n\");\n";
        //     } else {
        //         this.out += "out.write(\"\\n\");\n";
        //     }
        // }

        // escape for passing to raw()
        escape(str) {
            return str.replace(/`/gm,'\\`');
        }


        tagFor(c) {
            switch (c) {
                case '!':
                case '*':
                    return "b>";
                case '~':
                case '/':
                    return "i>";
                case '_':
                    return "u>";
                case '-':
                    return "del>";
                case '^':
                    return "sup>";
                case '`':
                    return "code>";
                case '$':
                    return "kbd>";
                default:
                    return c + "";
            }
        }


        indent(lvl) {
            let str = '';
            for (let i=0 ; i<lvl ; i++) str += ' ';
            return str;
        }

        path(s) {
            return '/' + encodeURIComponent(s.replace(/ +/g,"_").toLowerCase());
        }

        url(s) {
    //        console.log('url',s)
            s = s.replace(/\\\\/g,'\\');
            const l = linkifyStr(s, {
                defaultProtocol : 'https'
            });
            const m = l.match(/"([^"]+)"/);
            if (m==null) {
                return this.path(s);
            } else {
                return m[1]
            }
        }

        checkbox(checked) {
            this.checkboxes++;
            let s = '<form method="PUT">';
            s += '<input type="checkbox" name="' + this.checkboxes + '"' + (checked?' checked':'') + ' onChange="this.form.submit()">';
            s += '</form>';
            return s;
        }


        link(s) {
            var parts = s.split("|", 2);
            if (parts.length == 2 && parts[0].charAt(parts[0].length-1) == '\\') {
                parts[0] = parts[0].substring(0,parts[0].length - 1) + '|' + parts[1];
                parts.pop();
            }
            if (parts.length == 1) {
                if (parts[0].trim() == '') {
                    return '['+s+']';
                }

                let u = this.escapeString(parts[0].trim().replace(/\\\]/g,']'));

                if (u[0] == '^') {
                    u = u.substring(1).trim();
                    const fn = this.footnoteNum(u);
                    return "<sup><a href=\\\"#footnote-" + u + "\\\">[" + fn + "]</a></sup>";
                } else {
                    return "<a href=\\\"" + this.url(u) + "\\\">" + u + "</a>";
                }
            } else {
                const addr = this.escapeString(parts[0].trim().replace(/\|/g,'|'));
                const txt = this.escapeString(parts[1].trim().replace(/\]/g,']'));
                return "<a href=\\\"" + this.url(addr) + "\\\">" + txt + "</a>";
            }
        }

        escapeString(s) {
            let r = '';
            for (let i=0 ; i<s.length ; i++) {
                let a = s[i];
                // if (a == '\\' && i<s.length-1) {
                //     let b = s[i+1]
                //     if (b.match(punc)) {
                //         r += this.escapeChar(b);
                //         i++;
                //         continue;    
                //     }
                // }

                r += this.escapeChar(a);
            }
            return r;
        }

        escapeChar(c) {
            if (c=='<') {
                return "&lt;"
            } else if (c=='>') {
                return "&gt;";
            } else if (c=='&') {
                return '&amp;'
            } else if (c=='"') {
                return '&quot;'
            } else if (c=='\'') {
                return '&apos;'
            } else if (c=='`') {
                return '\\`'
            } else if (c=='\\') {
                return '\\\\'

            } else {
    //            console.log(c);
                return c;
            }
        }

        format(s,i,inChar) {
            var a, b;

            let strs = [];
            let str = '';

            while (i < s.length) {
                a = s.charAt(i++);
                b = s.charAt(i);

                if (a == '\\') {
                    if (b == '$') {
                        str += '\\$';
                        i++;
                        continue;
                    }
                    let punc = /^[-!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]$/;
                    if (b.match(punc)) {
                        str += this.escapeChar(b);
                        i++;
                        continue;    
                    }
                }

                if (a == '[') {
                    let prev = a;
                    let curr;
                    for (var j = i; j < s.length; j++) {
                        curr = s.charAt(j);
                        if (curr == ']' && prev !='\\')	{
                            str += this.link(s.substring(i, j));
                            i = j + 1;
                            if (i >= s.length) {
                                if (inChar != "") str += "</" + this.tagFor(inChar);
                                strs.push(str);
                                return {i: i, str: strs};
                            }
                            a = s.charAt(i++);
                            break;
                        }
                        prev = curr;
                    }
                }
                if (a == '@') {
                    const ch0 = /^[a-zA-Z]$/;
                    const chx = /^[a-zA-Z\d_]$/;
                    let user = '';
                    for (var j = i; j < s.length; j++) {
                        let ch = s.charAt(j);
                        if ((j==i && ch.match(ch0))
                                || (ch.match(chx))) {
                            user += ch;
                        } else {
                            break;
                        }
                    }
                    if (user !== '') {
                        i = j;
                        a = s.charAt(i++);
                        str += '<a href=\\"/users/'+user+'\\">@'+user+'</a>';
                    }
                }
                if (a == '$' && b == '{') {
                    str += '$';
                    for (var j = i; j < s.length; j++) {
                        let ch = s.charAt(j);
                        str += ch;
                        if (ch=='}') {
                            i = j + 1;
                            a = s.charAt(i++);
                            break;
                        }
                    }
                }
                if (a == '#') {
                    const ch0 = /^[a-zA-Z]$/;
                    const chx = /^[a-zA-Z\d_]$/;
                    let tag = '';
                    let bang = false;
                    if (s.charAt(i)=='!') {
                        // console.log('bang');
                        bang = true;
                        i++;
                    }
                    for (var j = i; j < s.length; j++) {
                        let ch = s.charAt(j);
                        if ((j==i && ch.match(ch0))
                                || (ch.match(chx))) {
                            tag += ch;
                        } else {
                            break;
                        }
                    }
                    if (tag !== '') {
                        i = j;
                        a = s.charAt(i++);
                        let tagValue = null;
                        if (a=='(') {
                            for (var j = i; j < s.length; j++) {
                                let ch = s.charAt(j);
                                if (ch==')') {
                                    try {
                                        let jsonStr = '{args:[' + s.substring(i,j) + ']}';
    //                                    console.log("attempting: ",jsonStr)
                                        tagValue = this.parse(jsonStr);
    //                                    console.log("got",tagValue);
                                        i = j + 1;
                                        a = s.charAt(i++);
                                        break;
                                    } catch (e) {
                                    }
                                }
                            }
                        }


                        if (bang) {
                            strs.push(str);
                            strs.push({ name: tag, args: tagValue });
                            str = '';

                        } else {


                        // process tag value
    //                    console.log('tagValue = ',tagValue)
                                if (tagValue !== null) {
        //                        console.log(tagValue)
                                if (tagValue.args.length==0) {
                                    tagValue = true;
                                } else if (tagValue.args.length==1) {
                                    tagValue = tagValue.args[0];
                                } else {
                                    tagValue = tagValue.args;
        //                            console.log(tagValue);
                                }
                            } else {
                                tagValue = true;
                            }
        


                            //console.log(tag,tagValue,!json.hasOwnProperty(tag));
    //console.log( json[tag] ? 'already defined')
                            this.tag(-1,'json.'+tag,tagValue);
    //                        this.code(`json.${tag} = JSON.parse('${JSON.stringify(tagValue)}')`);
    //                        this.json[tag] = tagValue
                            str += `<a href="/tags/${tag}">#${tag}</a>`;
                        }

                        if (i >= s.length) {
                            break;
                        }
                    }
                    // let prev = a;
                    // let curr
                    // for (var j = i; j < s.length; j++) {
                    //     curr = s.charAt(j)
                    //     if (curr == ']' && prev !='\\')	{
                    //     }
                    //     prev = curr
                    // }
                }
                if (i + 1 > s.length) {
                    str += this.escapeChar(a);
                    if (inChar != "") str += "</" + this.tagFor(inChar);//+" ";
                    strs.push(str);
                    return {i: i, str: strs};
                }
                if (a == b
                        && (a == '!' || a == '*' || a == '~' || a == '/' || a == '_' || a == '-'
                                || a == '^' || a == '`' || a == '$')) {
                    i++;
                    while (s.charAt(i)==a) {
                        b = a;
                        i++; // permissive with extra formatting tag chars
                    }
                    if (a == inChar) {
                        str += "</" + this.tagFor(inChar);//+" ";
                        strs.push(str);
                        return {i: i, str: strs};
                    } else {
                        str += "<" + this.tagFor(a);
                        strs.push(str);
                        let istr = this.format(s,i,a);
                        i = istr.i;
                        istr.str.map(t => strs.push(t));
                        str = '';
                    }
                } else {
                    str += this.escapeChar(a);
                }
            }
    //        console.log(inChar);
            if (inChar != "") str += "</" + this.tagFor(inChar);
            if (str != '' ) strs.push(str);
            return {i: i,str: strs};
        }






        build() {

            if (this.out == null) return this.out;

            if (this.footnotes.length > 0) {
                for (let i = 0 ; i<this.footnotes.length ; i++) {
                    const fn = this.footnotes[i];
                    this.out += `html.footnote(${i+1},'${fn.id}',${this.text(fn.text)});\n`;
                }
            }

            this.out += 'return json;\n';
            this.out += '} catch (e) {\n';
            this.out += '  console.log(e);\n';
            this.out += '  throw e;\n';
            this.out += '}\n';      
        
            const r = this.out;
            this.out = null;
            return r;
        }
    }

    class ListItemTag extends NonEmptyLine {
            constructor(ln,indent,text,name,value) {
                super(ln,indent,text);
                this.name = name;
                this.value = value;
            }

            asTag() {
                return this;
            }

            process(is,os,parent) {

    //            console.log('ListItemTag list item tag',this.name,this.value);

                while (is.nextLine instanceof EmptyLine) {
                    is.next();
                }
                
                if (is.nextLine !== false 
                        && this.value === undefined 
                        && is.nextLine.indent >= this.indent
                        && is.nextLine instanceof ListItem) {

                    // make sure to keep indent at the same level
                    const indent = is.nextLine.indent;

                    // no value with list after indented or at same level
                    // defines a named array
                    const ref = (parent?parent+'.'+this.name:'json.'+this.name);
    //                console.log('ListItemTag -> named array',ref);
                    os.tag(this.indent,ref,[]);
                    while (is.nextLine !== false
                            && is.nextLine.indent >= indent
                            && is.nextLine instanceof ListItem) {

                        is.next();


                        let tag = is.line.asTag();
                        tag.process(is,os,ref);

                        while (is.nextLine instanceof EmptyLine) {
                            is.next();
                        }
                    }

                } else if (is.nextLine !== false 
                        && this.value !== undefined 
                        && is.nextLine.indent == this.indent + 2
                        && is.nextLine instanceof Tag) {

                    os.push(this.indent,parent,{});

                    let ref = `${parent}[${parent}.length-1]`;
                    os.tag(this.indent,`${ref}.${this.name}`,os.parse(this.value));
                    
                    while (is.nextLine !== false
                            && is.nextLine.indent == this.indent + 2
                            && is.nextLine instanceof Tag) {

                        is.next();
                        let tag = is.line;
                        tag.process(is,os,ref);

                        while (is.nextLine instanceof EmptyLine) {
                            is.next();
                        }
                    }

                } else if (is.nextLine !== false 
                        && this.value === undefined 
                        && is.nextLine.indent > this.indent
                        && is.nextLine instanceof Tag) {
                            
                    os.push(this.indent,parent,{});

                    let ref = `${parent}[${parent}.length-1]`;
                    os.tag(this.indent,`${ref}.${this.name}`,{});

                    while (is.nextLine !== false
                            && is.nextLine.indent > this.indent
                            && is.nextLine instanceof Tag) {

                        is.next();
                        let tag = is.line;

                        if (tag.indent == this.indent+2) {
                            // at same level, part of this obj
                            tag.process(is,os,ref);
                        } else if (tag.indent > this.indent+2) {
                            // at next level, part of child
                            tag.process(is,os,`${ref}.${this.name}`);
                        } else {
                            throw new Error()
                        }

                        while (is.nextLine instanceof EmptyLine) {
                            is.next();
                        }
                    }
        
                } else if (this.value !== undefined) {
                    let v = {};
                    try {
                        v[this.name] = os.parse(this.value);
                    } catch (e) {
                        v[this.name] = this.value;
                    }

                    os.push(this.indent,parent,v);


                } else {
                    os.push(this.indent,parent,{});
                    let ref = `${parent}[${parent}.length-1]`;
                    os.tag(this.indent,`${ref}.${this.name}`,null);
                }
            
            }
        }

    class ListItem extends NonEmptyLine {
        constructor(ln,indent,text,marker,number,item) {
            super(ln,indent,text);
            this.marker = marker;
            this.number = number;
            this.item = item;
        }

        asTag() {
            let m = this.item.match(Tag.re);
            if (m) {
                return new ListItemTag(this.line,this.indent, this.text, m[3], m[4])
            } else {
                return new ListItemNoValueTag(this.line,this.indent, this.text, this.item)
            }
        }

        process(is,os) {

    //        os.write(os.indent(this.indent) + (this.marker ? '<ul>' : '<ol>'));

            while (is.nextLine !== false 
                    && !(is.nextLine instanceof EmptyLine) 
                    && !(is.nextLine instanceof ListItem)) {
                this.item += ' ' + is.nextLine.text;
                is.next();
            }

            const isTask = this.text.match(ListItem.taskRE);

            if (this.marker) {
                if (isTask) {
                    os.ut(this.ln,this.indent, isTask[1]!='', os.format(isTask[2],0,'').str);
                } else {
                    os.ul(this.ln,this.indent, os.format(this.item,0,'').str);
                }
            } else {
                if (isTask) {
                    os.ot(this.ln,this.indent, isTask[1]!='', os.format(isTask[2],0,'').str);
                } else {
                    os.ol(this.ln,this.indent, os.format(this.item,0,'').str);
                }
            }

            // while (is.nextLine !== false
            //         && !(is.nextLine instanceof EmptyLine) 
            //         && is.nextLine.indent >= this.indent
            //         && is.nextLine instanceof ListItem) {
            //     is.next();
            //     if (is.line.indent > this.indent) {
            //         is.line.process(is,os)
            //     } else {
            //         let ln = is.line;
            //         while (is.nextLine !== false 
            //                 && !(is.nextLine instanceof EmptyLine) 
            //                 && !(is.nextLine instanceof ListItem)) {
            //             ln.item += ' ' + is.nextLine.text;
            //             is.next();
            //         }

            //         if (this.marker) {
            //             os.ul(ln.indent, os.format(ln.item,0,'').str);
            //         } else {
            //             os.ol(this.indent, os.format(ln.item,0,'').str);
            //         }

            //     }
            // }

            // os.write(os.indent(this.indent) + (this.marker ? '</ul>' : '</ol>'));
        }

    }

    ListItem.re = /^([ ]*)((([-*+])|(\d+[\.)]))\s+(\S.*?))\s*$/; // indent, marker, text
    ListItem.taskRE = /^(?:(?:  )*) ?(?:(?:[-*+])|(?:\d+[\.)]))\s+\[ *([xX]?) *\]\s+(.*?)\s*$/;

    //import JSON5 from 'json5'

    //import {Parser} from 'acorn'


    class Tag extends NonEmptyLine {
        constructor(ln,indent,text,name,value) {
            super(ln,indent,text);
            this.name = name;
            this.value = value;
        }

        asTag() {
            return this;
        }

        process(is,os,parent) {

            while (is.nextLine instanceof EmptyLine) {
                is.next();
            }
            
            if (is.nextLine !== false 
                    && this.value === undefined 
                    && is.nextLine.indent >= this.indent
                    && is.nextLine instanceof ListItem) {

                // make sure to keep indent at the same level
                const indent = is.nextLine.indent;

                // no value with list after indented or at same level
                // defines a named array

                const ref = (parent?parent+'.'+this.name:'json.'+this.name);

                os.tag(this.indent,ref,[]);

                while (is.nextLine !== false
                        && is.nextLine.indent == indent
                        && is.nextLine instanceof ListItem) {

                    is.next();
                    let tag = is.line.asTag();
    //                console.log(`   ${ref}.push:`)
                    tag.process(is,os,ref);

                    while (is.nextLine instanceof EmptyLine) {
                        is.next();
                    }
                }

            } else if (is.nextLine !== false 
                    && this.value !== undefined 
                    && is.nextLine.indent == this.indent + 2   // TODO: hard coded :(
                    && is.nextLine instanceof Tag) {

                // make sure to keep indent at the same level
                const indent = this.indent + 2;

                // has value with tags after at same "apparent" level
                // defines an un-named object in list of parent
    //            console.log('Tag -> un-named object',parent)
                os.push(this.indent,parent,{});
                const ref = parent + '['+parent+'.length - 1]';
    //            console.log('Tag -> un-named object',ref)
                os.tag(this.indent,ref+'.'+this.name,this.value);

                while (is.nextLine !== false
                        && is.nextLine.indent == indent
                        && is.nextLine instanceof Tag) {

                    is.next();
                    let tag = is.line;
    //                console.log('Tag -> Tag')
                    tag.process(is,os,ref);

                    while (is.nextLine instanceof EmptyLine) {
                        is.next();
                    }
                }

            } else if (is.nextLine !== false 
                    && this.value === undefined 
                    && is.nextLine.indent > this.indent
                    && is.nextLine instanceof Tag) {

                // make sure to keep indent at the same level
                const indent = is.nextLine.indent;
                        
                // no value with a tag indented after it
                // defines a named object
                const ref = (parent?parent+'.'+this.name:'json.'+this.name);
    //            console.log('Tag -> named object',ref)
                os.tag(this.indent,ref,{});

                while (is.nextLine !== false
                        && is.nextLine.indent == indent
                        && is.nextLine instanceof Tag) {

                    is.next();
                    let tag = is.line;
    //                console.log('Tag -> Tag')
                    tag.process(is,os,ref);

                    while (is.nextLine instanceof EmptyLine) {
                        is.next();
                    }
                }

            } else if (this.value !== undefined) {

                try {
                    os.tag(this.indent,`${parent===undefined?'json':parent}.${this.name}`,os.parse(this.value));
                } catch (e) {
                    os.tag(this.indent,`${parent===undefined?'json':parent}.${this.name}`,this.value);
                }

            } else {

                os.tag(this.indent,`${parent===undefined?'json':parent}.${this.name}`,null);

            }

        }
    }

    Tag.re = /^([ \t]*)(([a-zA-Z_$][a-zA-Z\d_$]*)\s*:(?:\s+(.*?))?)\s*$/; // indent, name, values

    class ListItemNoValueTag extends Tag {
        constructor(ln,indent,text,name) {
            super(ln,indent,text,name,undefined);
        }

        process(is,os,parent) {
    //        console.log('ListItemNoValueTag',parent,this.name)
            os.push(this.indent,parent,this.name);
    return
        }
    }

    class Table extends NonEmptyLine {
            constructor(ln,indent,text,row) {
                super(ln,indent,text);
                this.row = row;
                this.colAlignment = {};
            }

            splitRow() {
                let row = { cells: this.row.split('|') };

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
                    is.next();
                    if (headerRow == -1 && is.line.text.match(Table.headerRE)) {
                        headerRow = rows.length;
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
                os.el(this.indent,'table');

                if (headerRow>0) {
    //                os.thead(this.indent+2)
                    os.el(this.indent+2,'thead');
                    for (let r = 0 ; r<headerRow ; r++) {
                        const row = rows[r];
    //                    os.tr(this.indent+4)
                        os.el(this.indent+4,'tr');
                        for (let c=0 ; c<row.cells.length ; c++) {
                            let {isHeading,attrs,str} = this.tableFormatting(c,row.cells[c]);
                            os.th(this.indent+6,os.format(str,0,'').str,attrs);
                        }
                        os._el();
                    }
                    os._el();
                }

                os.el(this.indent+2,'tbody');
                for (let r = headerRow + 1 ; r<rows.length ; r++) {
                    const row = rows[r];
                    os.el(this.indent+4,'tr');
                    for (let c=0 ; c<row.cells.length ; c++) {
                        let {isHeading,attrs,str} = this.tableFormatting(c,row.cells[c]);
                        if (isHeading) {
                            os.th(this.indent+6,os.format(str,0,'').str,attrs);
                        } else {
                            os.td(this.indent+6,os.format(str,0,'').str,attrs);
                        }
                    }
                    os._el();
                }            os._el(); // /tbody

                os._el(); // /table
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
                    return ` align="${this.colAlignment[c]}"`
                } else {
                    return undefined;
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
                                let c = pragmas[i+1];
                                if (c >= '3' && c <= '9') {
                                    rowspan=c*1;
                                    i++;
                                } else {
                                    rowspan=2;
                                }
                            } else {
                                rowspan=2;
                            }
                            break;
                        case '>':
                            if (i+1<pragmas.length) {
                                let c = pragmas[i+1];
                                if (c >= '3' && c <= '9') {
                                    colspan=c*1;
                                    i++;
                                } else {
                                    colspan=2;
                                }
                            } else {
                                colspan=2;
                            }

                            break;
                        default:
                            return { isHeading: false, attrs: this.colAttributes(c), str: s.trim() };

                    }
                }

                let attrs = undefined;

                if (isHeading && align!=null) {
                    this.colAlignment[c] = align;
                }

                if (align!=null || this.colAlignment[c] != undefined || rowspan!=null || colspan!=null) {
                    attrs = '';
                    if (align != null) {
                        attrs += ` align="${align}"`;
                    } else if (this.colAlignment[c] != undefined) {
                        attrs += ` align="${this.colAlignment[c]}"`;
                    }

                    if (rowspan != null) {
                        attrs += ` rowspan="${rowspan}"`;
                    }

                    if (colspan != null) {
                        attrs += ` colspan="${colspan}"`;
                    }
                }

                return {isHeading: isHeading, attrs: attrs, str: str };
            }
        }

    Table.re = /^([ \t]*)(\|(.+?)\|?)\s*$/;
    Table.headerRE = /^[-| ]+$/;

    class Div extends NonEmptyLine {
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
                            os.raw(this.indent,'');
                        } else {
                            os.raw(is.nextLine.indent,is.nextLine.text);
                        }
                        is.next();
                    }

                } else if (this.tag=='pre') {

                    while (is.nextLine !== false
                        && (is.nextLine instanceof EmptyLine
                            || is.nextLine.indent > this.indent)) {

                        if (is.nextLine instanceof EmptyLine) {
                            os.raw(this.indent,'');
                        } else if (is.nextLine instanceof Div) {
                            let l = is.nextLine;
                            os.div(l.indent, l.tag, (l.attributes?' ' + l.attributes.trim().replace(/"/g, '\\"'):''));
                        } else {
                            os.raw(is.nextLine.indent,is.nextLine.text);
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

    Div.re = /^([ \t]*)(<\s*((\!html)|([a-z]+))((?:\s+[a-z]+(="[^"]*")?)*)\s*>?\s*)$/i;

    //import EmptyLine from './EmptyLine.js';

    class Script extends NonEmptyLine {
        constructor(ln,text) {
            super(ln,-1,text.trim().substring(2));
        }
        process(is,os) {

            if (this.text.trim().slice(-2) == '%>') {
    //            os.code('// start and end')
                os.code(this.text.substring(0,this.text.length-2));
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

    Script.re = /^\s*(<%.*?)\s*$/; // indent, text

    class CodeBlock extends NonEmptyLine {
        constructor(ln,re) {
            super(ln,re[1].length,re[0]);
            this.language = re[4].toLowerCase();
        }

        process(is,os) {
            let code = '';

            while (is.nextLine !== false
                    && (is.nextLine instanceof EmptyLine
                        ||
                        (is.nextLine instanceof NonEmptyLine
                        && is.nextLine.indent >= this.indent
                        && !(is.nextLine instanceof CodeBlock)))) {

                if (is.nextLine instanceof EmptyLine) {
                    code += '\n';
                } else {
                    for (let i=this.indent ; i<is.nextLine.indent ; i++) {
                        code += ' ';
                    }
                    code += is.nextLine.text + '\n';
                }
                is.next();
            }

            switch (this.language) {
                case 'info':
                case 'tip':
                case 'note':
                case 'warning':
                    os.el(this.indent,'div', `class="alert-${this.language}"`);
                    os.p(this.indent+2,os.format(code,0,'').str);
                    os._el();
                    break;
                default:
                    os.el(this.indent,'pre');
                    os.el(this.indent+2,'code',`class="language-${this.language}"`);
                    os.raw(this.indent+4,os.escape(code));    
                    os._el();
                    os._el();    
            }

            if (is.nextLine !==false && is.nextLine instanceof CodeBlock) {
                is.next();
            }
        }
    }

    CodeBlock.re = /^(( )*)(```)(([a-zA-Z]+)?)\s*$/;

    class Footnote extends NonEmptyLine {
        constructor(ln,m) {
            super(ln,m[1].length,m[3]);
            this.ref = m[2];
        }

        process(is,os) {

            while (is.nextLine !== false && is.nextLine instanceof Paragraph) {
                this.text += ' ' + is.nextLine.text;
                is.next();
            }

            os.footnote(this.indent, this.ref, os.format(this.text,0,'').str);
        }

    }

    Footnote.re = /^((?:  )*) ?\[ *\^ *(\S+) *\] *: *(.+?) *$/;

    class HR extends NonEmptyLine {
        constructor(ln,re) {
            super(ln,re[1].length,re.input);
        }

        process(is,os) {
            os.div(this.indent,'hr');
        }

    }

    HR.re = /^(\s*)--+\s*$/;

    class InputStream {

        constructor(str) {
            this.str = str;
            this.i = 0;
            this.ln = 1;
            this.l = str.length;

            this.line = this.readline();
            this.nextLine = this.readline();
        }


        next() {
            this.line = this.nextLine;
            this.nextLine = this.readline();
        }


        readline() {
            if (this.i==this.l+1) {
                return false;
            }
            let ii = this.i;
            let nxt = this.l+1;
            while (ii<this.l) {
                if (this.str[ii]=='\r') {
                    if (ii+1<this.l && this.str[ii+1]=='\n') {
                        nxt = ii + 2;
                        break;
                    }
                } else if (this.str[ii]=='\n') {
                    nxt = ii + 1;
                    break;
                }
                ii++;
            }
            const res = this.str.substring(this.i,ii);
            this.i = nxt;
            let m;
            m = res.match(Heading.re);
            if (m) {
                return new Heading(this.ln++,m[1].length,m[2], m[3].length, m[4]);
            }
            m = res.match(Tag.re);
            if (m) {
    //            console.log(m);
                return new Tag(this.ln++,m[1].length, m[2], m[3], m[4])
            }
            // m = res.match(Task.re)
            // if (m) {
            //     return new Task(this.ln++,m);
            // }
            m = res.match(ListItem.re);
            if (m) {
    //            console.log(m);
                return new ListItem(this.ln++, m[1].length, m[2], m[4], m[5], m[6])
            }
            m = res.match(Table.re);
            if (m) {
                return new Table(this.ln++,m[1].length, m[2],m[3]);
            }

            m = res.match(Div.re);
            if (m) {
                return new Div(this.ln++, m)
            }
            m = res.match(Script.re);
            if (m) {
                return new Script(this.ln++,res);
            }
            m = res.match(Footnote.re);
            if (m) {
                return new Footnote(this.ln++,m);
            }
            m = res.match(EmptyLine.re);
            if (m) {
                return new EmptyLine(this.ln++);
            }
            m = res.match(CodeBlock.re);
            if (m) {
                return new CodeBlock(this.ln++, m);
            }
            m = res.match(HR.re);
            if (m) {
                return new HR(this.ln++,m);
            }
            m = res.match(Paragraph.re);
            if (m) {
                return new Paragraph(this.ln++, m[1].length, m[2] );
            }
            
            throw new Error('line is not matched: \"' + res + '\"')
        }


    }

    class SimpleOutputStream {
        constructor(invoke) {
            this.invoke = invoke;
            this.out = '';
            this.scopes = [{i:-1,el:'html'}];
            this.rawTag = null;
            this.footnotes = [];
        }

        indent(i) {
            for (let a=0 ; a<i ; a++) {
                this.out += ' ';
            }
        }

        footnote() {
            this.footnotes.push(arguments);
        }

        close() {
            let scope = this.scopes.pop();
            if (!scope) return;

    //        if (scope.el != 'text') {
                // switch (scope.el) {
                //     case 'p':
                //     case 'li':
                //     case 'td':
                //     case 'th':
                //     case 'h1':
                //     case 'h2':
                //     case 'h3':
                //     case 'h4':
                //     case 'h5':
                //     case 'h6':
                //         break;
                //     default:

                if (scope.el !== undefined) {
                        this.indent(scope.i);
                // }

                this.out += `</${scope.el}>\n`;
                }
    //        }
        }

        peek() {
            return this.scopes[this.scopes.length-1];
        }

        // pop() {
        //     return this.scopes.pop();
        // }

        // push(i,n,v) {
        //     console.log(`push(${i},${n},${JSON5.stringify(v)})`)
        // }
        // tag(i,n,v) {
        //     console.log(`tag(${i},${n},${JSON5.stringify(v)})`)
        // }

        // open(scope) {
        //     switch (scope.el) {
        //         case 'ol':
        //             console.log('open',scope)
        //             this.indent(scope.i)
        //             this.out += '<ol>\n';
        //             this.scopes.push(scope)
        //             break;
        //         case 'ul':
        //             console.log('open',scope)
        //             this.indent(scope.i);
        //             this.out += '<ul>\n';
        //             this.scopes.push(scope)
        //             break;
        //         case 'p':
        //             break;
        //         default:
        //             console.log('open',scope)
        //             this.indent(scope.i);
        //             this.scopes.push(scope)
        //             break;
                
        //     }

        // }

        now(i,el,attributes) {
            let curr = this.peek();
            if (el) el = el.toLowerCase();
            let next = {i:i,el:el};

    //        console.log(curr,'=>',next)

            // close table if needed
            // switch (curr.el) {

            //     case 'table':

            //         switch(next.el) {

            //             case 
            //         }
            //         break;

            //     case 'tr':

            //         switch (next.el) {

            //             case 'tr':
            //                 this.close();
            //                 curr = this.peek();
            //                 break;
            //             default:
            //                 this.close();
            //                 curr = this.peek();
            //                 if (curr.el == 'tbody' || curr.el == 'thead') {

            //                 }
            //         }
            // }

            // close table if needed
            // if (curr.el == 'table' && el != 'tr' && el != 'thead' && el != 'tbody') {
            //     this.close();
            //     curr = this.peek()
            // } else if ((curr.el=='thead' || curr.el=='tbody') && el!='tr') {
            //     this.close();
            //     this.close();
            //     curr = this.peek();            
            // } else if (curr.el=='tr' && el!='tr') {
            //     this.close();
            //     this.close();
            //     curr = this.peek();            
            // } else if (curr.el=='tr' && el=='tr') {
            //     this.close();
            //     curr = this.peek();
            // }

            // open table if needed
            // if (el=='tr' && curr.el!='table' && curr.el!='tbody' && curr.el!='thead') {
            //     this.indent(i)
            //     this.out += "<table>\n";
            //     this.scopes.push({i:i,el:'table'});
            // } else if (el=='tr' && curr.el!='table') {
            //     this.indent(i)
            //     this.out += "<table>\n";
            //     this.scopes.push({i:i,el:'table'});
            // } else if (el=='td' && curr.el!='tr') {
            //     this.indent(i)
            //     this.out += "<table>\n";
            //     this.scopes.push({i:i,el:'table'});
            //     this.indent(i)
            //     this.out += "<tr>\n";
            //     this.scopes.push({i:i,el:'tr'});
            // }

            while (next.i <= curr.i) {
                if ((curr.el=='ol' || curr.el=='ul') && curr.el==el && curr.i==i) break;
    //            console.log('closed')
                this.close();
                curr = this.peek();
            }

            if (next.i == curr.i && next.el != curr.el) {
    //            console.log('closed')
                this.close();
                curr = this.peek();
            }

            // table is a special case
            // if starting a new table and we're currently in a
            // table or tr it's not a valid state, so close the table
    //         if (el=='table') {
    // //            this.out += curr.i+':'+curr.el + '\n';
    //             if (curr.el=='tr') {
    //                 this.close();
    //                 curr = this.peek()
    //             }
    //             if (curr.el=='table') {
    //                 this.close();
    //                 curr = this.peek()
    //             }
    //         }
            // if (i!=curr.i || el!=curr.el) {
            //     if (el=='table' && curr.el=='table') {
            //         this.close();
            //         curr = this.peek();
            //     }


            // this.out += `${curr.i}:${curr.el}==tr && ${i}:${el}!=td\n`
            // if ( curr.el=='tr' && el!='td') {
            //     this.close();
            //     this.close();
            //     curr = this.peek()
            // }            


            if (i!=curr.i || el!=curr.el) {


                if (curr.i + 2 < i) {
                    for (let x=(curr.i<0?0:curr.i+2) ; x<i ; x += 2) {
                        this.indent(x);
                        this.out += '<div>\n';
                        this.scopes.push({i:x,el:'div'});
                   }
                }
    //            this.out += '-- open:'+el+', curr='+JSON.stringify(curr)+'\n'
                // if (i>curr.i && curr.el == 'table') {
                //     this.close();
                // }

    //           if (el!='text') {
        if (el !== undefined) {
                    this.indent(i);
                    this.out += "<"+el+(attributes?" "+attributes.trim():"")+">";
                    // switch (el) {
                    //     case 'p':
                    //     case 'li':
                    //     case 'td':
                    //     case 'th':
                    //     case 'h1':
                    //     case 'h2':
                    //     case 'h3':
                    //     case 'h4':
                    //     case 'h5':
                    //     case 'h6':
                    //         break;
                    //     default:
                            this.out += '\n';
                    // }
    //           }

        }


    //console.log('next.el',next.el);
                switch (next.el) {
                    case '!html':
                    case 'area':
                    case 'base':
                    case 'br':
                    case 'col':
                    case 'command':
                    case 'embed':
                    case 'hr':
                    case 'img':
                    case 'input':
                    case 'keygen':
                    case 'link':
                    case 'meta':
                    case 'param':
                    case 'source':
                    case 'track':
                    case 'wbe':
                        break;
                    default:
                        this.scopes.push(next);
                        // console.log(">>> " + next.el)
                    }
            }

    //        console.log('now',this.peek())

        }

        echo(i,str) {
            this.indent(i);
            this.out += str + '\n';
        }

        p(i,str) {
          this.now(i);
          this.echo(i,`<p>${this.text(str)}</p>`);
          this.close();
        }

        ref(i,r,str) {
            
        }

        text(str) {
            let s = '';

            if (str === undefined) return s;

            for (let j=0 ; j<str.length ; j++) {
                let o = str[j];
               if (o!==undefined) {
                    s += o;
               }
            }
            return s;
        }

        raw(i,str) {
            let indent = 0;
            for (let i=this.scopes.length-1 ; i>=0 ; i--) {
                let s = this.scopes[i];
                if (s.el == 'pre') {
                    indent = this.peek().i + 2;
                    break;
                }
            }
            this.echo(i - indent,str);
        }

        ul(i,str) {
            this.now(i,'ul');
            this.echo(i+2,`<li>${this.text(str)}</li>`);
        }

        ol(i,str) {
            this.now(i,'ol');
            this.echo(i+2,`<li>${this.text(str)}</li>`);
        }

        div(i,tag,attributes) {
            this.now(i,tag,attributes);
        }

        el(i,tag,attributes) {
            this.now(i,tag,attributes);
        }

        _el() {
            this.close();
        }

        comment(i,str) {
            this.echo(i,`<!-- ${str} -->`);
        }

        table(i) {
            this.now(i,'table');
        }

        thead(i) {
            this.now(i,'thead');
        }

        tbody(i) {
            this.now(i,'tbody');
        }

        tr(i) {
            this.now(i,'tr');
        }

        td(i,str,attrs) {
            this.echo(i,`<td${ attrs==undefined?'': attrs}>${this.text(str)}</td>`);
        }

        th(i,str,attrs) {
            this.echo(i,`<th${ attrs==undefined?'': attrs}>${this.text(str)}</th>`);
        }
        
        h1(i,str) {
            this.now(i);
            this.echo(i,`<h1>${this.text(str)}</h1>`);
            this.close();
        }

        h2(i,str) {
            this.now(i);
            this.echo(i,`<h2>${this.text(str)}</h2>`);
            this.close();
        }

        h3(i,str) {
            this.now(i);
            this.echo(i,`<h3>${this.text(str)}</h3>`);
            this.close();
        }

        h4(i,str) {
            this.now(i);
            this.echo(i,`<h4>${this.text(str)}</h4>`);
            this.close();
        }

        h5(i,str) {
            this.now(i);
            this.echo(i,`<h5>${this.text(str)}</h5>`);
            this.close();
        }

        h6(i,str) {
            this.now(i);
            this.echo(i,`<h6>${this.text(str)}</h6>`);
            this.close();
        }
        // writeln(str) {
        //     if (str) {
        //         this.out += "out.write(\"" + str + "\\n\");\n";
        //     } else {
        //         this.out += "out.write(\"\\n\");\n";
        //     }
        // }

        toString() {
    //        console.log(this.scopes)
            while (this.scopes.length>1) {
                this.close();
            }

            if (this.footnotes.length > 0) {
                this.out += '<hr>\n';
                this.out += '<ol class="footnotes">\n';
                this.footnotes.forEach(fn => {
                    this.out += `  <li><a name="#footnote-${fn[1]}">${this.text(fn[2])}</a></li>\n`;
                });
                this.out += '</ol>\n';
            }

            return this.out;
        }
    }

    //import { version } from '../package.json';

    function render(str,includeCallback) {

        const is = new InputStream(str);

        let os = new OutputStream();

        while (is.line !== false) {
            is.line.process(is,os);
            is.next();
        }

        const src = os.build();

        let f;
        
        try {
            f = new Function(src);
        } catch (e) {
            console.log(src);
            throw new Error(e,src);
        }

        let sos = new SimpleOutputStream();

        try {
            const resJson = f(sos,function() {
                let name = arguments[0];
                let args = [];
                for (let i=1 ; i<arguments.length ; i++) args.push(arguments[i]);
                return includeCallback(name,args)
            });

            const resHtml = sos.toString();

            return { src: src, json: resJson, html: resHtml };
        } catch (e) {
    //        console.log(os.toString())
            throw e + '\n\n' + os.toString();
        }
    }

    return render;

})();
//# sourceMappingURL=main.js.map
