
import {h} from 'hastscript'
import {t} from './hastscript-tools.js'
import strToJs from './str-to-js.js'
import link from './str-to-link.js'

export default function lineToSxast(str) {

    let root = h()

    if (typeof str == 'string') {
        process(root,str,0,'')
    } else {
        root.children.push(str);
    }

    function escapeChar(c) {
        return c
        
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

    function tagFor(c) {
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


    // function path(s) {
    //     return '/' + encodeURIComponent(s.replace(/ +/g,"_").toLowerCase());
    // }

 
    function process(parent,s,index,inChar) {
        var a, b;
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
                    str += escapeChar(b);
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
                        parent.children.push(t(str))
                        str = ''
                        parent.children.push(link(s.substring(index,k)))
                        index = k + 1;
                        if (index >= s.length) {
                            parent.children.push(t(str))
                            str = ''
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
                let dotAt = -1
                for (; jj < s.length; jj++) {
                    let ch = s.charAt(jj)
                    if ((jj==index && ch.match(ch0))
                            || (ch.match(chx)) || (bang==true && ch=='.' && dotAt == -1)) {
                        tag += ch;
                        if (ch=='.') dotAt = jj
                    } else {
                        break;
                    }
                }
                if (tag !== '') {

                    index = jj;
                    a = s.charAt(index++);
                    let tagStr = null
                    let tagValue = null
                    let tagValueStr = null

                    if (a=='(') {
                        for (var k = index; k < s.length; k++) {
                            let ch = s.charAt(k)
                            if (ch==')') {
                                tagValueStr = s.substring(index,k)
                                try {
                                    tagValue = strToJs(tagValueStr,true)
                                    tagStr = s.substring(tagAt,k+1)
                                    index = k + 1
                                    a = s.charAt(index++);
                                    break;
                                } catch (e) {
                                    // find next end bracket and try again
                                }
                            }
                        }
                        
                        if (tagValue == null) {
                            // if ')' was never found tagValueStr == null
                            if (tagValueStr == null) {
                                tagValueStr = s.substring(index)
                            }
                            tagValue = strToJs(tagValueStr,false)
                        }
                    } else {
                        tagStr = s.substring(tagAt,index-1)
                        tagValue = strToJs('true',false)
                    }

                    if (str != '') {
                        parent.children.push(t(str))
                        str = ''
                    }

                    if (bang) {
                        const includeOpts = {
                            type: 'include',
                            name: tag, 
                            args: tagValue
                        }
                        if (dotAt != -1) {
                            const ss = tag.split('.')
                            if (ss.length != 2) throw new Error(`error parsing tag with namespace "${tag}"`)
                            includeOpts.collection = ss[0]
                            includeOpts.name = ss[1]
                        }
                        parent.children.push(includeOpts)
                    } else {
                        parent.children.push({
                            type:'tag',
                            indent: 0,
                            name: tag,
                            colon: true,
                            args: tagValue,
                            children: [t(tagStr)] 
                        })

                    }

                    if (index >= s.length) {
                        break;
                    }
                }
            }
            if (index + 1 > s.length) {
                str += escapeChar(a);
                parent.children.push(t(str))
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
                    return index; //{index: index, str: strs};
                } else {
                    parent.children.push(t(str))
                    str = '';
                    const el = h(tagFor(a),{})
                    parent.children.push(el)
                    index = process(el,s,index,a)
                }
            } else {
                str += escapeChar(a);
            }
        }

        if (str != '' ) parent.children.push(t(str));//strs.push(str)
        return index;//{index: index,str: strs};
    }

    return root.children
}