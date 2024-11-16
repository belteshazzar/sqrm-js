
import {h} from 'hastscript'
import {visit} from 'unist-util-visit'
import {t} from '../util/hastscript-tools.js'
import lineToSxast from '../util/parse-text.js'
import util from 'util'
import sastTextToHast from '../util/sast-text-to-hast.js'
import sastTableToHast from '../util/sast-table-to-hast.js'
import sastListToHast from '../util/sast-list-to-hast.js'

export default function sastToHast(options = {}) {


    function toHast(node) {
        switch (node.type) {
            case 'element':
                if (node.tag && node.tag.toLowerCase() == '!doctype') {
                    return { type: 'doctype', properties: node.properties }
                }
                return {
                    type: 'element',
                    tagName: node.tag ? node.tag : 'div',
                    properties: node.properties
                }
            case 'heading':
                return { type: 'element', tagName: 'h'+node.level }
            case 'hr':
                return { type: 'element', tagName: 'hr' }
            case 'paragraph':
                return { type: 'element', tagName: 'p' }
            case 'ordered-list-item':
                return { type: 'element', tagName: 'ol' }
            case 'unordered-list-item':
                return { type: 'element', tagName: 'ul' }
            case 'table':
                return { type: 'element', tagName: 'table' }
            case 'table-row':
                return { type: 'element', tagName: 'tr' }
            case 'text':
                return node;
            default:
                throw new Error("unknown sast node type: " + node.type)
        }
    }

    function processChildren(children) {
        let result = []

        let i=0

        let prev = null
        while (i<children.length) {
            let curr = children[i]
            let h = toHast(curr)
            if (curr.children) {
                switch (curr.type) {
                    case 'heading':
                        h.children = sastTextToHast(curr.children)
                        break
                    case 'paragraph':
                        let lines = curr.children
                        // for (let j=i+1 ; j<children.length && children[j].type == 'paragraph' ; j++) {
                        //     curr = children[++i]
                        //     lines.push({type: 'text', value: '\n' })
                        //     lines = lines.concat(curr.children)
                        // }
                        h.children = sastTextToHast(lines)
                        break;
                    case 'ordered-list-item':
                        h.children = [{ type: 'element', tagName: 'li', children: processChildren(curr.children) }]
                        for (let j=i+1 ; j<children.length && children[j].type == 'ordered-list-item' ; j++) {
                            curr = children[++i]
                            h.children.push({ type: 'element', tagName: 'li', children: processChildren(curr.children)})
                        }
                        break;
                    case 'unordered-list-item':
                        h.children = [{ type: 'element', tagName: 'li', children: processChildren(curr.children) }]
                        for (let j=i+1 ; j<children.length && children[j].type == 'unordered-list-item' ; j++) {
                            curr = children[++i]
                            h.children.push({ type: 'element', tagName: 'li', children: processChildren(curr.children)})
                        }
                        break;
                    case 'table':
                        // let rows = [curr]
                        // for (let j=i+1 ; j<children.length && (children[j].type == 'table-row' || children[j].type == 'table-divider') ; j++) {
                        //     curr = children[++i]
                        //     rows.push(curr)
                        // }
                        // console.log(util.inspect(rows,false,null,true))
                        h.children = sastTableToHast(curr.children).children
                        break;
                    default:
                        h.children = processChildren(curr.children)    
                }
            }
            result.push(h)
            prev = curr
            i++
        }
        return result
    }


    return (tree,file) => {

//        console.log(util.inspect(tree,false,null,true))

        const hast = { type: 'root', children: processChildren(tree.children) };


//         visit(tree, function (node) {

//             if (node.tagName) {
//                 // already converted
//                 return
//             }

//             switch (node.type) {
//                 case 'element':
//                 //    console.log(node)
//                     if (node.tag.toLowerCase() == "!doctype") {
//                         node.type = 'doctype'
//                         delete node.tag
//                     } else {
//                         node.tagName = node.tag
//                     }
//                     delete node.tag
// //                    console.log(node)
//                     break;
//                 case 'doc':
//                     node.type = 'root';
//                     break;
//                 case 'element':
//                     // text nodes are already hast nodes
//                     break;
//                 case 'heading':
//                     node.type = 'element';
//                     node.tagName = 'h' + node.level
//                     break;
//                 case 'hr':
//                     node.type = 'element';
//                     node.tagName = 'hr'
//                     break;
//                 case 'paragraph':
//                     node.type = 'element';
//                     node.tagName = 'p'
//                     node.children = sastTextToHast(node.children)
// //                    node.properties = { class: 'p' }
//                     break;
//                 case 'table':
//                     node.type = 'element'
//                     node.tagName = 'table'
//                     node.children = sastTableToHast(node.children).children
//                     break;
//                 case 'ordered-list':
//                     node.type = 'element'
//                     node.tagName = 'ol'
//                     node.children = sastListToHast(node.children).children
//                     break;
//                 case 'unordered-list':
//                     node.type = 'element'
//                     node.tagName = 'ul'
//                     node.children = sastListToHast(node.children).children
//                     break;
//                 case 'text':
//                     // text nodes are already hast nodes
//                     break;
//                 default:
//                     console.log("unknown sast node type: " + node.type)
//                     // console.log(util.inspect(tree,false,null,true))
//                     throw new Error("unknown sast node type: " + node.type)
//             }
//         })

        return hast
    }

}
