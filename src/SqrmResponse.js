
//import HTMLOutputStream from './HTMLOutputStream.js'
// import {h} from 'hastscript'
import util from 'node:util'
// import { timeStamp } from 'node:console'
// import HtmlOutputTree from './_HtmlOutputTree.js'


import {h} from 'hastscript'
import {t} from './hastscript-tools.js'
import toJson from './../src/jast-to-json.js'

let debug = false

function iterateLikeStack(tree,cb) {
    let el = tree
    while (el != null) {
        if (cb.call(null,el) === false) return
        el = (el.children ? el.children[el.children.length-1] : null)
        if (el!=null && el.type == 'value') {
            el = null
        }
    }
}

export default class SqrmResponse {
    constructor() {
//        this.html = new HtmlOutputTree();//new HTMLOutputStream();
        this.root = [];
        this.json = {};

        this.libs = {
            h: h,
            t: t,
            i: this.include,
            j: this.j.bind(this),
            maybeYaml: this.maybeYaml.bind(this),
            addTask: this.addTask.bind(this),
            inlineTag: this.inlineTag.bind(this),
            set: this.set,
            append: this.append//.bind(this),
        };//, tree: new Tree(), util: util };

        this.jsonTree = { minChildIndent: 0, type: 'unknown', name: 'root' }
    }


    include(doc,args) {
        console.error(arguments)
    }

    maybeYaml() {
        console.log('maybeYaml',arguments)
    }

    addTask() {
        console.log('addTask',arguments)
    }

    inlineTag() {
        console.log('inlineTag',arguments)
    }

    j(name,value) {
        console.log('j',name,value)

        if (typeof name == 'object') {
            if (this.jsonTag(name)) {
                // valid yaml, added to json
                return h('a',{href:`/tags/${name.name}`},name.children)
            } else {
                return name.children
            }
        } else {
            if (this.jsonTag({
                    indent: 0,
                    isArrayElement: false,
                    name: name,
                    colon: true,
                    value: value})) {
                // valid yaml, added to json
                return h('a',{href:`/tags/${name.name}`},name.children)
            } else {
                return name.children
            }
        }
    }

    jsonTag({indent,isArrayElement,name,colon,value}) {
//debug = (name=='v' || name=='n' || name=='s') // (name=='h')// || name=='i' || name == 'k')

        if (debug) {
            console.log('=======================')
            console.log('params:')
            console.log({ indent: indent,isArrayElement: isArrayElement,name:name,color:colon,value:value})
        }

        // while (
        //         (top.childrenIndent != undefined && top.childrenIndent > indent)
        //         ||
        //         (top.indent > indent)
        //     ) {
        //     this.jsonStack.pop()
        //     top = this.jsonStack[this.jsonStack.length - 1]
        // }

        let parent = null
        if (isArrayElement) {
            // if this is an array element: look for unknown or array

            iterateLikeStack(this.jsonTree, (el) => {
                if (el.type=='unknown' && el.minChildIndent<=indent) {
                    parent = el
                    if (debug) console.log('found parent (array el into unknown)')
                    return false
                } else if (el.type=='array' && el.childrenIndent==indent) {
                    parent = el
                    if (debug) console.log('found parent (array el into array)')
                    return false
                }
            })

        } else {
            // if this is not an array element: look fo unknown or object

            iterateLikeStack(this.jsonTree, (el) => {
                if (el.type=='unknown' && el.minChildIndent<=indent) {
                    parent = el
                    if (debug) console.log('found parent (non-array el into unknown)')
                    return false
                } else if (el.type=='object' && el.childrenIndent==indent) {
                    parent = el
                    if (debug) console.log('found parent (non-array el into object)')
                    return false
                }                
            })
        }

        if (debug) {
            console.log('parent --------')
            console.log(parent)
        }

        if (parent == null) {
            if (debug) {
                console.log('--> not valid yaml, no parent')
                console.log('json tree ----')
                console.log(toJson(this.jsonTree))
            }
            return false
        }

        if (parent.type == 'unknown' && !isArrayElement) {
            if (debug) console.log('--> unknown + ! array element')
            if (parent.minChildIndent > indent) throw new Error()

            parent.type = 'object'
            parent.childrenIndent = indent
            delete parent.minChildIndent

            if (colon && value === undefined) {
                let n = { minChildIndent: indent, type: 'unknown', name: name }
                parent.children = [ n ]
            } else {
                parent.children = [ { type: 'value', name: name, value: value } ]
            }
            if (debug) {
                 console.log('json tree ----')
                 console.log(toJson(this.jsonTree))
                }
            return true
        }

        if (parent.type == 'unknown' && isArrayElement) {
            if (debug) console.log('--> unknown + array element')
            if (parent.minChildIndent > indent) throw new Error()

            parent.type = 'array'
            parent.childrenIndent = indent
            delete parent.minChildIndent

            if (colon && value === undefined) {
                const unknown = { minChildIndent: indent+1, type:'unknown',name:name }
                const arrayElement = { childrenIndent: indent+1, type: 'object', children: [unknown]}
                parent.children = [arrayElement]
            } else if (colon) {
                const v = { childrenIndent: indent+1, type:'value',name:name,value:value}
                const arrayElement = { childrenIndent: indent+1, type: 'object', children: [v]}
                parent.children = [arrayElement]
            } else if (!colon) {
                parent.children = [ { type: 'value', value: value }]
            }

            if (debug) {
                 console.log('json tree ----')
                 console.log(toJson(this.jsonTree))
                }
            return true

            // let o = { indent: indent, type: "object", childrenIndent: indent+1 }
            // top.children = [o]
            // this.jsonStack.push(o)
            // top = o
            // if (canHaveChildren) {
            //     let v = { indent: indent, type: 'unknown', name: name }
            //     top.children = [ v ]
            //     this.jsonStack.push(v)
            // } else {
            //     top.children = [{ indent: indent, type: 'value', name: name, value: value }]
            // }
            // console.log('----c')
            // console.log(toJson(this.jsonTree))
            // console.log('----')
            //     return true
        }

        if (parent.type == 'object' && !isArrayElement) {
            if (debug) console.log('--> object + ! array element')
            if (debug) console.log(colon,value,typeof value,value==undefined,value===undefined)
 
            if (colon && value === undefined) {
                if (debug) console.log(' COLON and NO VALUE')
                let n = { minChildIndent: indent, type: 'unknown', name: name }
                parent.children.push(n)
            } else {
                parent.children.push({ type: 'value', name: name, value: value })
            }
            if (debug) {
                 console.log('json tree ----')
                 console.log(toJson(this.jsonTree))
                }

            return true
        }


        if (parent.type == 'array' && isArrayElement) {
            if (debug) console.log('--> array + array element')

            if (colon && value === undefined) {
                const unknown = { minChildIndent: indent+1, type:'unknown',name:name }
                const arrayElement = { childrenIndent: indent+1, type: 'object', children: [unknown]}
                parent.children.push(arrayElement)
            } else if (colon) {
                const v = { childrenIndent: indent+1, type:'value',name:name,value:value}
                const arrayElement = { childrenIndent: indent+1, type: 'object', children: [v]}
                parent.children.push(arrayElement)
            } else if (!colon) {
                parent.children.push({ type: 'value', value: value })
            }

            if (debug) {
                 console.log('json tree ----')
                 console.log(util.inspect(this.jsonTree,false,null,true))
                 console.log(toJson(this.jsonTree))
                }

            return true

        }



//         if (parent) {

//             if (parent.type == 'unknown') {

//                 if (isArrayElement) {
//                     parent.type = 'array'
//                     parent.childrenIndent = indent
//                 } else {
//                     parent.type = 'object'
//                     parent.childrenIndent = indent
//                 }

//                 if (canHaveChildren) {
//                     parent.children = [ { indent: indent, type: 'unknown', name: name }]
//                 } else {
//                     parent.children = [ { indent: indent, type: 'value', name: name, value: value }]
//                 }

//             } else if (parent.type == 'object') {

//                 if (isArrayElement) {
//                     if (parent.children[parent.children.length - 1].type == 'unknown') {

//                         parent = parent.children[parent.children.length - 1]
//                         parent.type = 'array'
//                         parent.childrenIndent = indent
//                         parent.children = []

//                     } else {
//                         console.log('!!! array element into object')
//                         // console.log(parent)
//                         return false    
//                     }
//                 }

//                 if (canHaveChildren) {
//                     parent.children.push({ indent: indent, type: 'unknown', name: name })
//                 } else {
//                     parent.children.push({ indent: indent, type: 'value', name: name, value: value })
//                 }
                
//             } else if (parent.type == 'array') {

//                 if (!isArrayElement) {
//                     console.log("!!! non-array element into array")
//                     return false
//                 }

//                 if (canHaveChildren) {
//                     parent.children.push({ indent: indent, type: 'unknown', name: name })
//                 } else {
//                     parent.children.push({ indent: indent, type: 'value', name: name, value: value })
//                 }

//             } else if (parent.type == 'value') {

//                 console.log('!!! element into value')
//                 return false

//             } else {
//                 console.log('un-handled parent.type',parent.type)
// //                console.log('parent = ',parent)
//                 return false
//             }

//         } else {
//             console.log('un-handled null parent')
//             return false
//         }
        if (debug) {
            console.log('--> not valid yaml')
            console.log('json tree ----')
            console.log(toJson(this.jsonTree))
        }
        return false

    }

    append(ln) {
        this.lines.push(ln)
    }
} 
