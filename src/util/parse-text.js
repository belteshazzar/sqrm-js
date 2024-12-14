
//import {h} from 'hastscript'
import {t} from './hastscript-tools.js'
import {functionParamsToEsast} from './str-to-esast.js'
import link from './str-to-link.js'
import {yamlToEsast,yamlToEsastArray} from '../util/str-to-esast.js'

function styleFor(c) {
    switch (c) {
        case '!':
        case '*':
            return "bold";
        case '~':
        case '/':
            return "italic";
        case '_':
            return "underline";
        case '-':
            return "strike-through";
        case '^':
            return "superscript";
        case '`':
            return "code";
        case '$':
            return "kbd";
        case ',':
            return "subscript";
        default:
            return c + "";
    }
}


export default function parseText(s) {
s = s.trim()

    let elements = []
    let index = 0

    // if (typeof str == 'string') {
    //     process(root,str,0,'')
    // } else {
    //     root.children.push(str);
    // }

    // function escapeChar(c) {
    //     return c
        
    //     if (c=='`') {
    //         return '\\`' // '&#96;'
    //     // } else if (c==':') {
    //     //     return '&#58;'
    //     } else if (c=='\\') {
    //         return '\\\\'
    //     } else {
    //         return c;
    //     }
    // }



    // function path(s) {
    //     return '/' + encodeURIComponent(s.replace(/ +/g,"_").toLowerCase());
    // }

 
//    function process(parent,s,index,inChar) {

        var a, b;
        let str = '';

        while (index < s.length) {
            a = s.charAt(index++);
            b = s.charAt(index);


            if (a == '\\') {
//                console.log(a,b)
                if (b == '$') {
                    str += '\\$';
                    index++;
                    continue;
                }
                let punc = /^[-!\"#%&'()*+,-./:;<=>?@[\]^_`{|}~]$/
                if (b.match(punc)) {

//                    console.log(punc)
                    str += b//escapeChar(b);
                    index++;
                    continue;    
                } else {
//                    console.log('\\\\')
                    str += '\\\\'
                    continue
                }
            } else if (a == '[') {
                let prev = a;
                let curr
                let foundLink = false
                let k = index
                let linkText = ''
                for ( ; k < s.length; k++) {
                    curr = s.charAt(k)
                    if (curr == ']') {
                        if (prev == '\\') {
                            linkText = linkText.substring(0,linkText.length-1) + curr
                        } else {
                            foundLink = true
                            break
                        }
                    } else {
                        linkText += curr
                    }
                    
                    prev = curr
                }

                if (!foundLink) {
                    str += a
  //                  index++;
                    continue
                }

                const ln = link(linkText)
// console.log(ln)
                if (ln == null) {
                    str += a
//                    index++;
                    continue
                }

                if (str!='') {
                    elements.push(t(str))
                    str = ''
                }
                elements.push(ln)
                index = k+1

            } else if (a == '@') {
                const ch0 = /^[a-zA-Z]$/
                const chx = /^[a-zA-Z\d_]$/

                if (s.charAt(index).match(ch0)) {

                    if (str != '') {
                        elements.push(t(str))
                        str = ''
                    }

                    let k = index+1
                    while (k < s.length && s.charAt(k).match(chx)) {
                        k++
                    }

                    elements.push({ type: 'mention', value: s.substring(index,k)})
                    index = k
                } else {
                    str += a
                }

            } else if (a == '#') {
                const tagAt = index-1

                const tagRegex = /#(?<bang>!)?(?<part1>[a-zA-Z][a-zA-Z\d_]*)(\.(?<part2>[a-zA-Z][a-zA-Z\d_]*))?/y // must start at specified start index
                tagRegex.lastIndex = tagAt
                let res = tagRegex.exec(s)

                // only include can have a namespace/collection
                if (!res || (!res.groups.bang && res.groups.part2)) {
                    str += a
                } else {
                    // console.log(res)
                    // console.log(res[0])
                    index = tagAt+res[0].length
                    // console.log(s.substring(index))

//                    index = jj;
                    a = s.charAt(index);
                    let tagStr = null
                    let tagValueStr = null

                    if (a=='(') {
                        for (var k = index; k < s.length; k++) {
                            let ch = s.charAt(k)
                            if (ch==')') {
                                tagStr = s.substring(tagAt,k+1)
                                tagValueStr = s.substring(index+1,k)
                                // console.log(tagStr,tagValueStr)
                                tagValueStr = tagValueStr.trim()
                                if (tagValueStr=='') tagValueStr = 'true'
//                                tagValueStr = '['+tagValueStr+']'
                                // console.log(`"${tagValueStr}"`)
                                index = k + 1
                                break
                                // try {
                                //     tagValue = functionParamsToEsast(tagValueStr,true)
                                //     tagStr = s.substring(tagAt,k+1)
                                //     index = k + 1
                                //     a = s.charAt(index++);
                                //     break;
                                // } catch (e) {
                                //     // find next end bracket and try again
                                // }
                            }
                        }
                        
                        // if ')' was never found tagValueStr == null
                        if (tagStr == null) {
                            tagStr = s.substring(tagAt,index)
                            tagValueStr = 'true'//'true'//functionParamsToEsast('true',false)
                        }
                    } else {
                        tagStr = s.substring(tagAt,index)
                        tagValueStr = 'true'//'true'//functionParamsToEsast('true',false)
                    }

                    if (str != '') {
                        elements.push(t(str))
                        str = ''
                    }

                    if (res.groups.bang) {
                        const includeOpts = {
                            type: 'include',
                            name: res.groups.part1,
                            text: tagStr 
                        }
                        if (tagValueStr) {
                            includeOpts.args = tagValueStr
                            includeOpts.$js = yamlToEsastArray(tagValueStr)
                        }
                        if (res.groups.part2) {
                            includeOpts.collection = res.groups.part1
                            includeOpts.name = res.groups.part2
                        }
                        elements.push(includeOpts)
                    } else {
                        elements.push({
                            type:'tag',
                            name: res.groups.part1,
                            args: tagValueStr || 'true',
                            $js: yamlToEsastArray(tagValueStr || 'true'),
                            text: tagStr 
                        })
                    }

                }
            // } else if (index + 1 > s.length) {
            //     str += a//escapeChar(a);
            //     console.log('got to end, returning')
            //     elements.push(t(str))
            //     continue//return index;//{index: index, str: strs};
            } else if (a == b
                    && (a == '!' || a == '*' || a == '~' || a == '/' || a == '_' || a == '-'
                            || a == '^' || a == '`' || a == '$' || a == ',')) {
                index++;
                while (s.charAt(index)==a) {
                    b = a;
                    index++; // permissive with extra formatting tag chars
                }

//                console.log('a="'+a+'",b="'+b+'",inChar="'+inChar+'",str="'+str+'"')
                // if (a == inChar) {
                //     elements.push(t(str))
                //     continue//return index; //{index: index, str: strs};
                // } else {
                    elements.push(t(str))
                    str = '';
                    const el = { type: 'format', style: styleFor(a) }
                    elements.push(el)
                    continue//index = process(el,s,index,a)
                // }
            } else {
                str += a//escapeChar(a);
            }
        }

        // check if there is any text left over
        if (str != '' ) {
            // console.log('got to end')
            elements.push(t(str));//strs.push(str)
        }
//        continue// index;//{index: index,str: strs};
//    }

    return elements//root.children
}