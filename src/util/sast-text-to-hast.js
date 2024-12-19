
import {h} from 'hastscript'
import {t} from '../util/hastscript-tools.js'

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

export default function sastTextToHast(children,context) {
// console.log(children)

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

        let child = children[i]
        if (child instanceof Function) {
            try {
                child = child.call(context)
                // console.log(child)
            } catch (e) {
                console.log(child)
                throw e
            }
        }

        switch (child.type) {
            case 'text':
            case 'element':
            case 'comment':
                stack[stack.length-1].children.push(child)
                // console.log('text, stack now',util.inspect(stack,false,null,true))
                break;
            case 'link':
                let link = child
                if (link.class == 'footnote') {
                    stack[stack.length-1].children.push(h('sup',{},[h('a',{
                        href: link.ref
                    },[t('['+link.text+']')])]))
                } else {
                    stack[stack.length-1].children.push(h('a',{
                        href: link.ref
                    },[t(link.text)]))
                }
                break;
            // case 'include':
            //     let inc = child
            //     stack[stack.length-1].children.push(h('span',{
            //         class: inc.name,
            //         args: inc.args
            //     },[]))               
            //     break;
            // case 'mention':
            //     let m = child
            //     stack[stack.length-1].children.push(h('a',{
            //         href: '/users/' + m.value,
            //     },[t( '@' + m.value)]))
            //     break;
            case 'format':
                if (!closedOpenStyle(child.style)) {
                    openStyle(child.style)
                }
                break;
            default:
                throw new Error('not implemented: ' + JSON.stringify(child))
        }

        // console.log('stack',util.inspect(stack,false,null,true))
        // console.log('hast',util.inspect(hast,false,null,true))

    }
// console.log(hast)
    return hast
}
