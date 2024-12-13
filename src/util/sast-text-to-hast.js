
import {h} from 'hastscript'
import {visit} from 'unist-util-visit'
import {t} from '../util/hastscript-tools.js'
import lineToSxast from '../util/parse-text.js'
import util from 'util'


function tagForStyle(s) {
    switch (s) {
        case 'bold': return h('b');
        case 'italic': return h('i');
        case 'underline': return h('u');
        case 'strike-through': return h('s')
        case 'superscript': return h('sup')
        case 'subscript': return h('sub')
        case 'code': return h('code')
        case 'kbd': return h('kbd')
        default: return h('div',{'data-style':s})
    }
}

export default function sastTextToHast(children) {

    let hast = []

    let stack = [{ children: hast }]

    function openStyle(s) {
        let n = tagForStyle(s)
        stack[stack.length-1].children.push(n)
        stack.push({ style: s, children: n.children })
    }

    function closedOpenStyle(s) {

//        console.log(util.inspect(stack,false,null,true))
        let i = stack.length - 1
        while (i>0 && stack[i].style != s) {
            i--
        }
        if (i>0) {
            // console.log('currently in style: ' + s + ' at stack i=' + i)

            while (stack.length>i) {
                stack.pop()
            }

            return true
        } else {
            return false
        }
    }

    // console.log('init stack',util.inspect(stack,false,null,true))
    // console.log('init hast',util.inspect(hast,false,null,true))

    if (children) for (let i=0 ; i<children.length ; i++) {

        // console.log('next child: ',util.inspect(children[i],false,null,true))

        switch (children[i].type) {
            case 'text':
            case 'element':
            case 'comment':
                stack[stack.length-1].children.push(children[i])
                // console.log('text, stack now',util.inspect(stack,false,null,true))
                break;
            case 'link':
                let link = children[i]
                stack[stack.length-1].children.push(h('a',{
                    href: link.ref,
                },[t(link.text)]))
                break;
            // case 'include':
            //     let inc = children[i]
            //     stack[stack.length-1].children.push(h('span',{
            //         class: inc.name,
            //         args: inc.args
            //     },[]))               
            //     break;
            // case 'mention':
            //     let m = children[i]
            //     stack[stack.length-1].children.push(h('a',{
            //         href: '/users/' + m.value,
            //     },[t( '@' + m.value)]))
            //     break;
            case 'format':
                if (!closedOpenStyle(children[i].style)) {
                    openStyle(children[i].style)
                }
                break;
            default:
                throw new Error('not implemented: ' + JSON.stringify(children[i]))
        }

        // console.log('stack',util.inspect(stack,false,null,true))
        // console.log('hast',util.inspect(hast,false,null,true))

    }

    return hast
}
