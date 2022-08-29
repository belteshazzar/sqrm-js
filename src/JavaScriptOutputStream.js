
import JSON5 from 'json5'
import LineParser from './LineParser.js';
import {h} from 'hastscript'
import {t,i} from './hastscript-tools.js'
import * as acorn from 'acorn'

//console.log(acorn);
//const { acorn } = ac



export default class JavaScriptOutputStream {
    constructor() {
//        this.doc = {};
        this.debug = false;
        this.indent = 0;
        this._hs = [];
       this.footnotes = [];


        this.out = 'try {\n\n'      
        this.out += 'const request = arguments[0];\n'
        this.out += 'const h = request.libs.h;\n'
        this.out += 'const t = request.libs.t;\n'
        this.out += 'const include = request.libs.include;\n'
        // this.out += 'let tree = request.libs.tree;\n'
        // this.out += 'let util = request.libs.util;\n'
        this.out += 'const docs = request.docs;\n';
        this.out += 'const response = arguments[1];\n'
        this.out += 'const html = response.html;\n';
        this.out += 'const json = response.json;\n\n'
    }


    parse(str) {

        function ap() {
            try {
                const node = acorn.parse(str, {ecmaVersion: 2020})
                return 'acorn parsed'
            } catch (e) {
                return 'acorn FAILED'
            }
        }

        try {
            const res = JSON5.parse(str);
            console.log("json5 parsed: ",str)
            console.log(ap())
            return res
        } catch (e) {
            console.log("json5 FAILED to parse:",str)
            console.log(ap())
            throw e;
        }
    }

    tag(i,t,v) {
        if (this.debug) {
            const caller = new Error().stack.split('\n')[2].replace(/.*\//,'').replace(')','')
//            console.log(`${caller} > ${t} = ${JSON5.stringify(v)}`)
        }
        this.out += `${t} = ${JSON5.stringify(v)};\n`
    }

    push(i,t,v) {
        if (this.debug) {
            const caller = new Error().stack.split('\n')[2].replace(/.*\//,'').replace(')','')
//            console.log(`${caller} > ${t}.push(${JSON5.stringify(v)})`)
        }
        this.out += `${t}.push(${JSON5.stringify(v)});\n`
    }

    raw(i,str) {
        this.out += "html.raw("+i+",\`"+str+"\`);\n";
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

    footnote(i,id,text) {
        this.footnoteNum(id,text)
    }

    // processString(str) {
    //     return checkText(str);;
    // }

    parseLine(str) {
        return new LineParser(this,str).root.children;
    }

    h(i,el,attrs,strOrEls) {
        if (el === undefined) {
            throw new Error();
        }

//        console.log(attrs);
        this.out += `html.append(${i},`
//        let _hs = '])'
//        console.log('this.indent',this.indent,'i',i);
//         while (this.indent + 2 <= i) {
//             this.out += 'h("div",{},'
//             _hs += '])'
//             this.indent += 2;
// //            console.log('+ this.indent',this.indent,'i',i);
//         }
        this.out += `h("${el}",${JSON.stringify(attrs)},`
        if (strOrEls==undefined) {
            this.out += '[]'
        } else {
            this.out += new LineParser(this,strOrEls).code()
        }
        this.out += `));\n`
    }

//     text(str) {
// //        console.log('txt(str)', str);
//         if (str === undefined) return str;
// //        console.log(str)
//         let res = '['
//         for (let i=0 ; i<str.length ; i++) {
//             const s = str[i];
//             if (typeof s == 'string') {
//                 res += `\`${this.processString(s)}\``
//             } else if (s.args != null && s.args.args != null) {
//                 let args = JSON.stringify(s.args.args)
//                 args = args.substring(1,args.length-1)
//                 res += `() => docs.include("${s.name}",request,response,${args})`;
//             } else {
//                 res += `() => docs.include("${s.name}",request,response)`;
//             }
//             if (i < str.length-1) {
//                 res += ','
//             }
//         }
//         res += ']'
// //        console.log(res);
//         return res
//     }

//     p(i,str) {
// //        this.out += `html.p(${i},${this.text(str)});\n`
//         this.out += `html.el(${i},'p',${this.text(str)},true);\n`
//     }

    ol(ln,indent,str) {
//        this.out += `ln=${ln};html.ol(${indent},${this.text(str)});\n`;
        // this.out += `html.el(${indent},'ol');\n`,
        // this.out += `html.el(${indent+2},'li',${this.text(str)},true);\n`
        this.h(indent,'ol',{})
        this.h(indent+2,'li',{},str)
    }

    ul(ln,indent,str) {
//        this.out += `ln=${ln};html.ul(${indent},${this.text(str)});\n`;
        // this.out += `html.el(${indent},'ul');\n`,
        // this.out += `html.el(${indent+2},'li',${this.text(str)},true);\n`
        this.h(indent,'ul',{})
        this.h(indent+2,'li',{},str)
    }

    xt(x,ln,indent,done,str) {
//        this.out += `ln=${ln};`;
        this.out += `json.tasks=(json.tasks?json.tasks:[]);`
        this.out += `json.tasks.push({line:${ln},done:${done},text:\`${str}\`});`

        const form = h('form',{
            method:'PUT'
        },[
            h('input',{
                checked : done,
                type: 'checkbox',
                task: ln,
                onchange: 'this.form.submit()'
            },[]),
            t(' ' + str)
        ]);
//        const form = `<form method="PUT"><input ${(done?'checked':'')} type="checkbox" task="${ln}" onChange="this.form.submit()">&nbsp;`
//        str.unshift(form);
//        str.push('</form>')
//        this.out += `html.${x}l(${indent},${this.text(str)});\n`;
        this.h(indent,x+'l',{})
        this.h(indent+2,'li',{},form)
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
//        this.out += "html.div("+i+",\`"+el+"\`" + (attr == undefined ?'':",\`"+ attr + "\`")+");\n";
        this.out += `html.el(${i},'${el}',[]);\n`
    }

    el(i,el,attr) {
//        this.out += "html.el("+i+",\`"+el+"\`" + (attr == undefined ?'':",\`"+ attr + "\`")+");\n";
        this.out += `html.el(${i},'${el}',[]);\n`
    }

//    _el() {
//        this.out += "html._el();\n"
//    }

    comment(i,str) {
//        this.out += `html.comment(${i},${this.text(str)});\n`;
        this.out += `html.comment(${i},'${str}');\n`
    }

    table(i) {
//        this.out += `html.table(${i});\n`;
        this.out += `html.el(${i},'table');\n`
    }

    thead(i) {
//        this.out += `html.thead(${i});\n`;
        this.out += `html.el(${i},'thead');\n`
    }

    tbody(i) {
//        this.out += `html.tbody(${i});\n`;
        this.out += `html.el(${i},'tbody');\n`
    }

    tr(i) {
//        this.out += `html.tr(${i});\n`;
        this.out += `html.el(${i},'tr');\n`
    }

    td(i,str,attrs) {
//        this.out += `html.td(${i},${this.text(str)},${attrs==undefined?"":"`"+attrs+"`"});\n`;
        this.out += `html.el(${i},'td',${this.text(str)},true);\n`
    }

    th(i,str,attrs) {
//        this.out += `html.th(${i},${this.text(str)},${attrs==undefined?"":"`"+attrs+"`"});\n`;
        this.out += `html.el(${i},'th',${this.text(str)},true);\n`
    }

//     h1(i,str) {
// //        this.out += `html.h1(${i},${this.text(str)});\n`;
//         this.out += `html.el(${i},'h1',${this.text(str)},true);\n`
//     }

//     h2(i,str) {
// //        this.out += `html.h2(${i},${this.text(str)});\n`;
//         this.out += `html.el(${i},'h2',${this.text(str)},true);\n`
//     }

//     h3(i,str) {
// //        this.out += `html.h3(${i},${this.text(str)});\n`;
//         this.out += `html.el(${i},'h3',${this.text(str)},true);\n`
//     }

//     h4(i,str) {
// //        this.out += `html.h4(${i},${this.text(str)});\n`;
//         this.out += `html.el(${i},'h4',${this.text(str)},true);\n`
//     }

//     h5(i,str) {
// //        this.out += `html.h5(${i},${this.text(str)});\n`;
//         this.out += `html.el(${i},'h5',${this.text(str)},true);\n`
//     }

//     h6(i,str) {
// //        this.out += `html.h6(${i},${this.text(str)});\n`;
//         this.out += `html.el(${i},'h6',${this.text(str)},true);\n`
//     }

    code(str) {
        // console.log("$ " + str);
        this.out += (str===undefined?'':str) + '\n';
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

    indent(lvl) {
        let str = '';
        for (let i=0 ; i<lvl ; i++) str += ' ';
        return str;
    }


    checkbox(checked) {
        this.checkboxes++;
        let s = '<form method="PUT">'
        s += '<input type="checkbox" name="' + this.checkboxes + '"' + (checked?' checked':'') + ' onChange="this.form.submit()">'
        s += '</form>'
        return s;
    }






    build() {

        if (this.out == null) return this.out;

        if (this.footnotes.length > 0) {
            this.out += `html.append(0,h("hr"))\n`
             this.out += `html.append(0,h("ol",{class:"footnotes"},[`
            for (let i = 0 ; i<this.footnotes.length ; i++) {
                const fn = this.footnotes[i];
// //                this.out += `html.footnote(${i+1},'${fn.id}',\`${fn.text}\`);\n`;

                if (i>0) this.out += ','
                this.out += `h("li",{},[h("a",{name:"#footnote-${fn.id}"},`
                console.log(`footnote text: ${fn.text}`)
                if (fn.text !== undefined) this.out += new LineParser(this,fn.text).code()
                this.out += ')])'
            }

            this.out += ']));\n'
        }

//        this.out += '  console.log(tree.build());'
        this.out += '\n} catch (e) {\n'
//        this.out += '  console.log(e);\n'
        this.out += '  throw e;\n'
        this.out += '}\n'      
    
        const r = this.out;
        this.out = null;
        return r;
    }
}
