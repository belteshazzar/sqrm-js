
import JSON5 from 'json5'
import linkifyStr from 'linkify-string';
import * as smile2emoji from 'smile2emoji'
const { checkText,emojiMap } = smile2emoji
import {h} from 'hastscript'

import * as acorn from 'acorn'

//console.log(acorn);
//const { acorn } = ac



export default class OutputStream {
    constructor() {
//        this.doc = {};
        this.debug = false;
        this.footnotes = [];

        this.out = 'try {\n'      
        this.out += 'let request = arguments[0];\n'
        this.out += 'let docs = request.docs;\n';
        this.out += 'let response = arguments[1];\n'
        this.out += 'let html = response.html;\n';
        this.out += 'let json = response.json;\n'
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

    footnote(i,id,text) {
        this.footnoteNum(id,text)
    }

    processString(str) {
        return checkText(str);;
    }

    text(str) {
//        console.log('txt(str)', str);
        if (str === undefined) return str;
//        console.log(str)
        let res = '['
        for (let i=0 ; i<str.length ; i++) {
            const s = str[i];
            if (typeof s == 'string') {
                res += `\`${this.processString(s)}\``
            } else if (s.args != null && s.args.args != null) {
                let args = JSON.stringify(s.args.args)
                args = args.substring(1,args.length-1)
                res += `() => docs.include("${s.name}",request,response,${args})`;
            } else {
                res += `() => docs.include("${s.name}",request,response)`;
            }
            if (i < str.length-1) {
                res += ','
            }
        }
        res += ']'
//        console.log(res);
        return res
    }

    p(i,str) {
        this.out += `html.p(${i},${this.text(str)});\n`
    }

    ol(ln,indent,str) {
        this.out += `ln=${ln};html.ol(${indent},${this.text(str)});\n`;
    }

    ul(ln,indent,str) {
        this.out += `ln=${ln};html.ul(${indent},${this.text(str)});\n`;
    }

    xt(x,ln,indent,done,str) {
        this.out += `ln=${ln};`;
        this.out += `json.tasks=(json.tasks?json.tasks:[]);`
        this.out += `json.tasks.push({line:ln,done:${done},text:\`${str}\`});`
        const form = `<form method="PUT"><input ${(done?'checked':'')} type="checkbox" task="${ln}" onChange="this.form.submit()">&nbsp;`
        str.unshift(form);
        str.push('</form>')
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
        this.out += "html._el();\n"
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
        s = s.replace(/\\\\/g,'\\')
        const l = linkifyStr(s, {
            defaultProtocol : 'https'
        });
        const m = l.match(/"([^"]+)"/)
        if (m==null) {
            return this.path(s);
        } else {
            return m[1]
        }
    }

    checkbox(checked) {
        this.checkboxes++;
        let s = '<form method="PUT">'
        s += '<input type="checkbox" name="' + this.checkboxes + '"' + (checked?' checked':'') + ' onChange="this.form.submit()">'
        s += '</form>'
        return s;
    }


    link(s) {
        var parts = s.split("|", 2);
        if (parts.length == 2 && parts[0].charAt(parts[0].length-1) == '\\') {
            parts[0] = parts[0].substring(0,parts[0].length - 1) + '|' + parts[1]
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
        let punc = /^[-!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]$/
        let r = ''
        for (let i=0 ; i<s.length ; i++) {
            let a = s[i]
            // if (a == '\\' && i<s.length-1) {
            //     let b = s[i+1]
            //     if (b.match(punc)) {
            //         r += this.escapeChar(b);
            //         i++;
            //         continue;    
            //     }
            // }

            r += this.escapeChar(a)
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

        let strs = []
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
                let punc = /^[-!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]$/
                if (b.match(punc)) {
                    str += this.escapeChar(b);
                    i++;
                    continue;    
                }
            }

            if (a == '[') {
                let prev = a;
                let curr
                for (var j = i; j < s.length; j++) {
                    curr = s.charAt(j)
                    if (curr == ']' && prev !='\\')	{
                        str += this.link(s.substring(i, j));
                        i = j + 1;
                        if (i >= s.length) {
                            if (inChar != "") str += "</" + this.tagFor(inChar);
                            strs.push(str)
                            return {i: i, str: strs};
                        }
                        a = s.charAt(i++);
                        break;
                    }
                    prev = curr
                }
            }
            if (a == '@') {
                const ch0 = /^[a-zA-Z]$/
                const chx = /^[a-zA-Z\d_]$/
                let user = ''
                for (var j = i; j < s.length; j++) {
                    let ch = s.charAt(j)
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
                    str += '<a href=\\"/users/'+user+'\\">@'+user+'</a>'
                }
            }
            if (a == '$' && b == '{') {
                str += '$'
                for (var j = i; j < s.length; j++) {
                    let ch = s.charAt(j)
                    str += ch;
                    if (ch=='}') {
                        i = j + 1
                        a = s.charAt(i++);
                        break;
                    }
                }
            }
            if (a == '#') {
                const ch0 = /^[a-zA-Z]$/
                const chx = /^[a-zA-Z\d_]$/
                let tag = ''
                let bang = false;
                if (s.charAt(i)=='!') {
                    // console.log('bang');
                    bang = true;
                    i++;
                }
                for (var j = i; j < s.length; j++) {
                    let ch = s.charAt(j)
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
                            let ch = s.charAt(j)
                            if (ch==')') {
                                try {
                                    let jsonStr = '{args:[' + s.substring(i,j) + ']}'
//                                    console.log("attempting: ",jsonStr)
                                    tagValue = this.parse(jsonStr);
//                                    console.log("got",tagValue);
                                    i = j + 1
                                    a = s.charAt(i++);
                                    break;
                                } catch (e) {
                                }
                            }
                        }
                    }


                    if (bang) {
                        strs.push(str)
                        strs.push({ name: tag, args: tagValue })
                        str = ''

                    } else {


                    // process tag value
//                    console.log('tagValue = ',tagValue)
                            if (tagValue !== null) {
    //                        console.log(tagValue)
                            if (tagValue.args.length==0) {
                                tagValue = true;
                            } else if (tagValue.args.length==1) {
                                tagValue = tagValue.args[0]
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
                        str += `<a href="/tags/${tag}">#${tag}</a>`
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
                if (inChar != "") str += "</" + this.tagFor(inChar)//+" ";
                strs.push(str)
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
                    str += "</" + this.tagFor(inChar)//+" ";
                    strs.push(str)
                    return {i: i, str: strs};
                } else {
                    str += "<" + this.tagFor(a);
                    strs.push(str);
                    let istr = this.format(s,i,a);
                    i = istr.i;
                    istr.str.map(t => strs.push(t))
                    str = '';
                }
            } else {
                str += this.escapeChar(a);
            }
        }
//        console.log(inChar);
        if (inChar != "") str += "</" + this.tagFor(inChar);
        if (str != '' ) strs.push(str)
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

        this.out += '} catch (e) {\n'
//        this.out += '  console.log(e);\n'
        this.out += '  throw e;\n'
        this.out += '}\n'      
    
        const r = this.out;
        this.out = null;
        return r;
    }
}
