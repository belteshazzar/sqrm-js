
//import HTMLOutputStream from './HTMLOutputStream.js'
// import {h} from 'hastscript'
// import util from 'node:util'
// import { timeStamp } from 'node:console'
// import HtmlOutputTree from './_HtmlOutputTree.js'


import {h} from 'hastscript'
import {t} from './hastscript-tools.js'

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
            set: this.set,
            append: this.append//.bind(this),
        };//, tree: new Tree(), util: util };

        this.jsonStructure = { indent: 0, type: 'unknown' }
    }


    include(doc,args) {
        console.error(arguments)
    }

    jsonAt(indent) {

        function findIndent(node) {

//            console.log('- findIndent',node)
            if (node.type == 'object' || node.type == 'array') {
                if (node.childrenIndent == indent) {
                    return node
                }
                return findIndent(node.children[node.children.length-1])
            }

            if (node.indent <= indent ) return node

            return null
        }

        return findIndent(this.jsonStructure)
    }

    j({indent,isArrayElement = false, name,value,canHaveChildren = false}) {

        console.log('====j')
        console.log(indent,isArrayElement,name,value,canHaveChildren)

        let parent = this.jsonAt(indent)

        if (parent) {

            if (parent.type == 'unknown') {

                if (isArrayElement) {
                    parent.type = 'array'
                    parent.childrenIndent = indent
                } else {
                    parent.type = 'object'
                    parent.childrenIndent = indent
                }

                if (canHaveChildren) {
                    parent.children = [ { indent: indent, type: 'unknown', name: name }]
                } else {
                    parent.children = [ { indent: indent, type: 'value', name: name, value: value }]
                }

            } else if (parent.type == 'object') {

                if (isArrayElement) {
                    console.log('!!! array element into object')
                    return false
                }

                if (canHaveChildren) {
                    parent.children.push({ indent: indent, type: 'unknown', name: name })
                } else {
                    parent.children.push({ indent: indent, type: 'value', name: name, value: value })
                }
                
            } else if (parent.type == 'array') {

                if (!isArrayElement) {
                    console.log("!!! non-array element into array")
                    return false
                }

                if (canHaveChildren) {
                    parent.children.push({ indent: indent, type: 'unknown', name: name })
                } else {
                    parent.children.push({ indent: indent, type: 'value', name: name, value: value })
                }

            } else {
                console.log('un-handled parent.type',parent.type)
                console.log('parent = ',parent)
                return false
            }

        } else {
            console.log('un-handled null parent')
            return false
        }

        return true

    }

    append(ln) {
        this.lines.push(ln)
    }
} 
