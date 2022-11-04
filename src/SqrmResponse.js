

import {h} from 'hastscript'
import {t} from './hastscript-tools.js'
import {matches, select, selectAll} from 'hast-util-select'

import toJson from './../src/jast-to-json.js'

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
    constructor(docs) {
        this.docs = docs
        this.root = [];

        this.yamlNotAllowedIndent = -1

        this.hastCallbacks = []

        this.libs = {
            h: h,
            t: t,
            matches: matches,
            select: select,
            selectAll: selectAll,
            processHast: this.processHast.bind(this),
            include: this.include.bind(this),
//            j: this.j.bind(this),
            maybeYaml: this.maybeYaml.bind(this),
            addTask: this.addTask.bind(this),
            inlineTag: this.inlineTag.bind(this),
            appendToHtml: this.appendToHtml.bind(this),
//            set: this.set,
//            append: this.append//.bind(this),
        };//, tree: new Tree(), util: util };

        let handler = {
            has(target, property) {
                // console.log('has',target.type,property)
                throw new Error('json.has not-implemented')
                // return key in target;
            },
            get(target, property, receiver) {
                switch (target.type) {
                    case 'object': {
                        for (let i=0 ; i<target.children.length ; i++) {
                            let child = target.children[i]
                            if (child.name == property) {
                                if (child.type == 'value') {
                                    return child.value
                                } else {
                                    return new Proxy(child,handler)
                                }
                            }
                        }
                        return null;
                    }
                    case 'array': {
                        const v = target.children[property]
                        if (v==null) return null
                        else if (v.type == 'value') return v.value
                        return new Proxy(v,handler)
                    }
                    case 'unknown': {
                        return null;
                    }
                    case 'value': {
                        return target.value[property]
                    }
                    default: {
                        throw new Error(target.type)
                    }
                }
            },
            set(target, property, value, receiver) {
                // console.log('set',target.type,property,value)
                throw new Error('set not-implemented')
                // target[property] = value
                // return true
            }
        }

        this.jsonTree = { minChildIndent: 0, type: 'unknown', name: 'root' }
        this.json = new Proxy(this.jsonTree,handler)
    }

    processHast(cb) {
        this.hastCallbacks.push(cb)
    }

    // updateJson() {
    //     this.json = toJson(this.jsonTree)
    // }


    include(args) {
        return this.docs.include(args)
    }

    appendToHtml(obj) {

        if (this.yamlNotAllowedIndent != -1 && obj.type != 'blank') {
            if (obj.indent < this.yamlNotAllowedIndent) {
                this.yamlNotAllowedIndent = -1
            }
        }

        if (this.yamlNotAllowedIndent == -1 && obj.type == 'div') {
            switch (obj.tag) {
                case 'pre':
                case 'script':
                case 'style':
                case '!--':
                    this.yamlNotAllowedIndent = obj.indent + 1
            }
        }

        let wasAppended = false
        if (this.appendTextToNode != null && obj.type == 'text') {
            if (this.appendTextToNode.minIndent !== undefined) {
                if (this.appendTextToNode.minIndent <= obj.indent) {
                    delete this.appendTextToNode.minIndent
                    this.appendTextToNode.indent = obj.indent
                    this.appendTextToNode.jsonNode.value = obj.text.trim()
                    wasAppended = true
                }
            } else if (this.appendTextToNode.indent == obj.indent) {
                if (this.appendTextToNode.mode == '|') {
                    this.appendTextToNode.jsonNode.value += '\n'
                } else {
                    this.appendTextToNode.jsonNode.value += ' '
                }
                this.appendTextToNode.jsonNode.value += obj.text.trim()
                wasAppended = true
            }
        }

        if (!wasAppended) {
            this.appendTextToNode = null
            this.root.push(obj)
        }
    }

    maybeYaml(obj) {

        if (this.yamlNotAllowedIndent != -1 && obj.indent < this.yamlNotAllowedIndent) {
            this.yamlNotAllowedIndent = -1
        }

        const yaml = ( obj.type == 'yaml' ? obj : obj.yaml )
        const line = obj

        if (this.yamlNotAllowedIndent != -1) {
            this.appendTextToNode = null
            if (obj.type == 'yaml') obj.type = 'text'
            this.root.push( obj )// { type: 'text', line: obj.line, text: obj.text, indent: obj.indent, children: obj.children }
        } else {

            let jsonNode = this.jsonTag(yaml)

            if (jsonNode != null) {

                if (yaml.args && yaml.args.length==1) {

                    if (yaml.args[0]=='|' || yaml.args[0]=='>') {
                        this.appendTextToNode = { minIndent: yaml.indent+1, mode: yaml.args[0], jsonNode: jsonNode }
                    } else {
                        this.appendTextToNode = null
                    }
                } else {
                    this.appendTextToNode = null
                }

                this.root.push( { type: 'blank', line: obj.line } )// h('a',{href:`/tags/${obj.name}`},obj.children)
            } else {
                this.appendTextToNode = null
                if (obj.type == 'yaml') obj.type = 'text'
                this.root.push( obj )// { type: 'text', line: obj.line, text: obj.text, indent: obj.indent, children: obj.children }
            }
        }
    }

    addTask({line,done,text}) {
        let tasksNode = null

        if (this.jsonTree.type == 'unknown') {
            this.jsonTree.type = 'object'
            this.jsonTree.childrenIndent = 0
            delete this.jsonTree.minChildIndent
            tasksNode = { type: 'array', name: 'tasks', childrenIndent: 1, children: [] }
            this.jsonTree.children = [tasksNode]
        } else if (this.jsonTree.type == 'object') {
            for (let i=0 ; i<this.jsonTree.children.length ; i++) {
                const child = this.jsonTree.children[i]
                if (child.name == 'tasks') {
                    tasksNode = child
                    break
                }
            }

            if (tasksNode == null) {
                tasksNode = { type: 'array', name: 'tasks', childrenIndent: 1, children: [] }
                this.jsonTree.children.push(tasksNode)
            }
        } else {
            // silently not supported if the root is an array
            return
        }

        const taskNode = { type: 'object', childrenIndent: 2, children: [] }
        taskNode.children.push({ type: 'value', name: 'line', value: line })
        taskNode.children.push({ type: 'value', name: 'text', value: text })
        taskNode.children.push({ type: 'value', name: 'done', value: done })
        tasksNode.children.push(taskNode)

        // this.updateJson()
    }

    inlineTag(obj) {
        this.jsonTag({
            indent: 0,
            isArrayElement: false,
            name: obj.name,
            colon: true,
            args: (obj.args === undefined ? true : obj.args )
        })

        return h('a',{ href: `/tags/${obj.name}` }, obj.children )
    }

    // j(name,value) {
    //     console.log('j',name,value)

    //     if (typeof name == 'object') {
    //         if (this.jsonTag(name)) {
    //             // valid yaml, added to json
    //             return h('a',{href:`/tags/${name.name}`},name.children)
    //         } else {
    //             return name.children
    //         }
    //     } else {
    //         if (this.jsonTag({
    //                 indent: 0,
    //                 isArrayElement: false,
    //                 name: name,
    //                 colon: true,
    //                 value: value})) {
    //             // valid yaml, added to json
    //             return h('a',{href:`/tags/${name.name}`},name.children)
    //         } else {
    //             return name.children
    //         }
    //     }
    // }

    jsonTag({indent,isArrayElement,name,colon,args}) {

        if (args != undefined && args.length == 1) {
            args = args[0]
        }

        let parent = null
        if (isArrayElement) {
            // if this is an array element: look for unknown or array

            iterateLikeStack(this.jsonTree, (el) => {
                if (el.type=='unknown' && el.minChildIndent<=indent) {
                    parent = el
                    return false
                } else if (el.type=='array' && el.childrenIndent==indent) {
                    parent = el
                    return false
                }
            })

        } else {
            // if this is not an array element: look fo unknown or object

            iterateLikeStack(this.jsonTree, (el) => {
                if (el.type=='unknown' && el.minChildIndent<=indent) {
                    parent = el
                    return false
                } else if (el.type=='object' && el.childrenIndent==indent) {
                    parent = el
                    return false
                }                
            })
        }

        if (parent == null) {
            return null
        }

        if (parent.type == 'unknown' && !isArrayElement) {
            if (parent.minChildIndent > indent) throw new Error()

            parent.type = 'object'
            parent.childrenIndent = indent
            delete parent.minChildIndent

            if (colon && args === undefined) {
                parent.children = [ { minChildIndent: indent, type: 'unknown', name: name } ]
            } else {
                parent.children = [ { type: 'value', name: name, value: args } ]
            }

            // this.updateJson()
            return parent.children[0]
        }

        if (parent.type == 'unknown' && isArrayElement) {
            if (parent.minChildIndent > indent) throw new Error()

            parent.type = 'array'
            parent.childrenIndent = indent
            delete parent.minChildIndent

            let jsonNode = null
            if (colon && args === undefined) {
                jsonNode = { minChildIndent: indent+1, type:'unknown',name:name }
                const arrayElement = { childrenIndent: indent+1, type: 'object', children: [jsonNode]}
                parent.children = [arrayElement]
            } else if (colon) {
                jsonNode = { childrenIndent: indent+1, type:'value', name:name, value:args}
                const arrayElement = { childrenIndent: indent+1, type: 'object', children: [jsonNode]}
                parent.children = [arrayElement]
            } else if (!colon) {
                jsonNode = { type: 'value', value: args }
                parent.children = [ jsonNode ]
            }

            // this.updateJson()
            return jsonNode
        }

        if (parent.type == 'object' && !isArrayElement) {
 
            if (colon && args === undefined) {
                parent.children.push({ minChildIndent: indent, type: 'unknown', name: name })
            } else {
                parent.children.push({ type: 'value', name: name, value: args })
            }

            // this.updateJson()
            return parent.children[parent.children.length-1]
        }

        if (parent.type == 'array' && isArrayElement) {

            let jsonNode = null
            if (colon && args === undefined) {
                jsonNode = { minChildIndent: indent+1, type:'unknown',name:name }
                const arrayElement = { childrenIndent: indent+1, type: 'object', children: [jsonNode]}
                parent.children.push(arrayElement)
            } else if (colon) {
                jsonNode = { childrenIndent: indent+1, type:'value',name:name,value:args}
                const arrayElement = { childrenIndent: indent+1, type: 'object', children: [jsonNode]}
                parent.children.push(arrayElement)
            } else if (!colon) {
                jsonNode = { type: 'value', value: args }
                parent.children.push(jsonNode)
            }

            // this.updateJson()
            return jsonNode
        }

        return null
    }

    // append(ln) {
    //     this.lines.push(ln)
    // }
} 
