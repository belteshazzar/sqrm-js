
import {h} from 'hastscript'
import {j,t,i} from './hastscript-tools.js'
import util from 'node:util'
import {visit} from 'unist-util-visit'
import linkifyStr from 'linkify-string';
//import JavaScriptOutputStream from './_JavaScriptOutputStream.js';

import strToJson from './str-to-json.js'

export default class LineParser {

    constructor(strOrEls) {
        this.root = h()
        this.linkifyOptions = { defaultProtocol: 'https' };

//        console.log(typeof strOrEls)
        if (typeof strOrEls == 'string') {
            this.process(this.root,strOrEls,0,'')
        } else {
            this.root.children.push(strOrEls);
        }

    //     console.log('++++++++++++++++')
    //    console.log(util.inspect(this.root,false,null,true));
    //    console.log('++++++++++++++++')
       this.codeStr = LineParser.genCode(this.root.children)
    }

    static genCode(children) {
        let codeStr = '['
        for (let index=0 ; index<children.length ; index++) {
            let child = children[index]
            if (child.type == 'text') {
                codeStr += `t(\`${child.value}\`)`
            } else if (child.type == 'element') {
                codeStr += `h("${child.tagName}",${util.inspect(child.properties,false,null,false)},`
                codeStr += this.genCode(child.children)
                codeStr += ')'
            } else if (child.type == 'include') {
                codeStr += `i("${child.value}",${util.inspect(child.args,false,null,false)})`
            } else if (child.type == 'tag') {
                codeStr += `j("${child.name}",${util.inspect(child.value,false,null,false)})`
//                codeStr += `(() => { json["${child.name}"] = ${util.inspect(child.value,false,null,false)}})()`
//                codeStr += `json.${child.name} = ${child.value}`
            } else {
                throw new Error("child.type: " + child.type);
            }
            if (index < children.length - 1) codeStr += ','
        }
        codeStr += ']'
        return codeStr;
    }

    code() {
        return this.codeStr;
    }



    escapeChar(c) {
        if (c=='`') {
            return '\\`' // '&#96;'
        // } else if (c==':') {
        //     return '&#58;'
        } else if (c=='\\') {
            return '\\\\'
        } else {
            return c;
        }
    }

    tagFor(c) {
        switch (c) {
            case '!':
            case '*':
                return "b";
            case '~':
            case '/':
                return "i";
            case '_':
                return "u";
            case '-':
                return "del";
            case '^':
                return "sup";
            case '`':
                return "code";
            case '$':
                return "kbd";
            default:
                return c + "";
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


    link(s) {
        var parts = s.split("|", 2);
        if (parts.length == 2 && parts[0].charAt(parts[0].length-1) == '\\') {
            parts[0] = parts[0].substring(0,parts[0].length - 1) + '|' + parts[1]
            parts.pop();
        }
        if (parts.length == 1) {
            if (parts[0].trim() == '') {
                //return '['+s+']';
                return t(`[${s}]`)
            }

            let u = this.escapeString(parts[0].trim().replace(/\\\]/g,']'));

            if (u[0] == '^') {
                u = u.substring(1).trim();
//                const fn = this.jsout.footnoteNum(u);
//                console.log('footnote',u,fn)
                // return "<sup><a href=\\\"#footnote-" + u + "\\\">[" + fn + "]</a></sup>";
                return h('sup',{},[ h('a',{'footnote-u':u,'href': `#footnote-${u}`},[t(`TBD`)])])
            } else {
                //return "<a href=\\\"" + this.url(u) + "\\\">" + u + "</a>";
                return h('a',{'href':this.url(u)},[t(u)])
            }
        } else {
            const addr = this.escapeString(parts[0].trim().replace(/\|/g,'|'));
            const txt = this.escapeString(parts[1].trim().replace(/\]/g,']'));
            //return "<a href=\\\"" + this.url(addr) + "\\\">" + txt + "</a>";
            return h('a',{'href':this.url(addr)},[t(txt)])
        }
    }

//     tag(i,t,v) {
//         if (this.debug) {
//             const caller = new Error().stack.split('\n')[2].replace(/.*\//,'').replace(')','')
// //            console.log(`${caller} > ${t} = ${JSON5.stringify(v)}`)
//         }
// console.log('tag is called =========')
//         this.codeStr += `${t} = ${JSON5.stringify(v)};\n`
//     }
    
    process(parent,s,index,inChar) {
//        console.log(`process(parent,${s},${index},${inChar})`)
        var a, b;

//        let strs = []
        let str = '';

        while (index < s.length) {
            a = s.charAt(index++);
            b = s.charAt(index);

            if (a == '\\') {
                if (b == '$') {
                    str += '\\$';
                    index++;
                    continue;
                }
                let punc = /^[-!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]$/
                if (b.match(punc)) {
                    str += this.escapeChar(b);
                    index++;
                    continue;    
                }
            }

            if (a == '[') {
                let prev = a;
                let curr
                for (let k = index; k < s.length; k++) {
                    curr = s.charAt(k)
                    if (curr == ']' && prev !='\\')	{
                        //str += this.link(s.substring(index, j));
                        parent.children.push(t(str))
                        str = ''
                    parent.children.push(this.link(s.substring(index,k)))
                        index = k + 1;
                        if (index >= s.length) {
//                            if (inChar != "") str += "</" + this.tagFor(inChar);
                            parent.children.push(t(str))
                            str = ''
//                            strs.push(str)
                            return index;// {i: index, str: strs};
                        }
                        a = s.charAt(index++);
                        break;
                    }
                    prev = curr
                }
            }
            if (a == '@') {
                const ch0 = /^[a-zA-Z]$/
                const chx = /^[a-zA-Z\d_]$/
                let user = ''
                let k = index
                for (; k < s.length; k++) {
                    let ch = s.charAt(k)
                    if ((k==index && ch.match(ch0))
                            || (ch.match(chx))) {
                        user += ch;
                    } else {
                        break;
                    }
                }
                if (user !== '') {
                    index = k;
                    a = s.charAt(index++);
                    parent.children.push(t(str))
                    str = ''
                    //str += '<a href=\\"/users/'+user+'\\">@'+user+'</a>'
                    parent.children.push(h('a',{'href':`/users/${user}`},[t(`@${user}`)]))
                }
            }
            if (a == '$' && b == '{') {
                str += '$'
                for (let k = index; k < s.length; k++) {
                    let ch = s.charAt(k)
                    str += ch;
                    if (ch=='}') {
                        index = k + 1
                        a = s.charAt(index++);
                        break;
                    }
                }
            }
            if (a == '#') {
                const tagAt = index-1
                const ch0 = /^[a-zA-Z]$/
                const chx = /^[a-zA-Z\d_]$/
                let tag = ''
                let bang = false;
                if (s.charAt(index)=='!') {
                    bang = true;
                    index++;
                }
                let jj = index
                for (; jj < s.length; jj++) {
                    let ch = s.charAt(jj)
                    if ((jj==index && ch.match(ch0))
                            || (ch.match(chx))) {
                        tag += ch;
                    } else {
                        break;
                    }
                }
                if (tag !== '') {
                    index = jj;
                    a = s.charAt(index++);
                    let tagStr = null
                    let tagValueStr = null
                    if (a=='(') {
                        for (var k = index; k < s.length; k++) {
                            let ch = s.charAt(k)
                            if (ch==')') {
                                tagValueStr = s.substring(index,k)
                                if (strToJson(tagValueStr)) {
                                    tagStr = s.substring(tagAt,k+1)
                                    // console.log(tagStr,tagValueStr,tagValue)
                                    index = k + 1
                                    a = s.charAt(index++);
                                    break;
                                } else {
                                    tagValueStr = null
                                    console.log('FAILED to parse:' + s.substring(index,k))
                                }
                            }
                        }
                    } else {
                        tagStr = s.substring(tagAt,index-1)
                    }


                    console.log('tag',tag,tagStr,tagValueStr)

                    if (bang) {
                        //strs.push(str)
                        //strs.push({ name: tag, args: tagValue })
                        //str = ''
                        // console.log('adding include',tag,tagValueStr,tagValue)

                        parent.children.push(i(tag,tagValueStr))
                    } else {


                    // process tag value
                        // if (tagValue !== null) {
                        //     if (tagValue.value.length==0) {
                        //         tagValue = true;
                        //     } else if (tagValue.value.length==1) {
                        //         tagValue = tagValue.value[0]
                        //     } else {
                        //         tagValue = tagValue.value;
                        //         // console.log('tagValue === array',tagValue)
                        //     }
                        // } else {
                        //     tagValue = true;
                        // }
    


//                        this.tag(-1,'json.'+tag,tagValue);
//                        this.code(`json.${tag} = JSON.parse('${JSON.stringify(tagValue)}')`);
//                        this.json[tag] = tagValue
                        if (str != '') {
                            parent.children.push(t(str))
                            str = ''
                        }

                        // console.log('adding tag',tag,tagValueStr,tagValue)

                        //str += `<a href="/tags/${tag}">#${tag}</a>`
//                        parent.children.push(h('a',{href:`/tags/${tag}`},[t(`#${tag}${tagValueStr==null?'':tagValueStr}`)]))
                        parent.children.push({
                            type:'tag',
                            indent: 0,
                            name: tag,
                            colon: true,
                            value: tagValueStr,
                            children: [t(tagStr)] 
                        })

                        // console.log('at: ' + s.substring(index-3,index+3))
                    }

                    if (index >= s.length) {
                        break;
                    }
                }
                // let prev = a;
                // let curr
                // for (var j = index; j < s.length; j++) {
                //     curr = s.charAt(j)
                //     if (curr == ']' && prev !='\\')	{
                //     }
                //     prev = curr
                // }
            }
            if (index + 1 > s.length) {
                str += this.escapeChar(a);
                parent.children.push(t(str))
//                if (inChar != "") str += "</" + this.tagFor(inChar)//+" ";
//                strs.push(str)
                return index;//{index: index, str: strs};
            }
            if (a == b
                    && (a == '!' || a == '*' || a == '~' || a == '/' || a == '_' || a == '-'
                            || a == '^' || a == '`' || a == '$')) {
                index++;
                while (s.charAt(index)==a) {
                    b = a;
                    index++; // permissive with extra formatting tag chars
                }
                if (a == inChar) {
                    parent.children.push(t(str))
                    // str += "</" + this.tagFor(inChar)//+" ";
                    // strs.push(str)
                    return index; //{index: index, str: strs};
                } else {
                    parent.children.push(t(str))
                    str = '';
                    const el = h(this.tagFor(a),{})
                    parent.children.push(el)
                    index = this.process(el,s,index,a)

                    // str += "<" + this.tagFor(a);
                    // strs.push(str);
                    // let istr = this.process(parent,s,index,a);
                    // index = istr.index;
                    // istr.str.map(t => strs.push(t))
                }
            } else {
                str += this.escapeChar(a);
            }
        }
//        console.log(inChar);
//        if (inChar != "") str += "</" + this.tagFor(inChar);
        if (str != '' ) parent.children.push(t(str));//strs.push(str)
        return index;//{index: index,str: strs};
    }

}