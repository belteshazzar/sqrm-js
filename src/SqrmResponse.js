
import {h} from 'hastscript'
import {t} from './hastscript-tools.js'
import {matches, select, selectAll} from 'hast-util-select'
import SqrmRequest from './SqrmRequest.js'
import sastToHast from './sast-to-hast.js';
import JsonTree from './jast.js'

export default class SqrmResponse {
    constructor(db,jsonTree) {
        this.db = db
        this.root = [];

        this.yamlNotAllowedIndent = -1

        this.hastCallbacks = []

        this.jsonTree = jsonTree || new JsonTree()
        this.json = this.jsonTree.json

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
            template: this.template.bind(this),
//            set: this.set,
//            append: this.append//.bind(this),
        };//, tree: new Tree(), util: util };


    }

    processHast(cb) {
        this.hastCallbacks.push(cb)
    }

    include({collection = 'default',name,args}) {

        const docs = this.db.find(collection,name)

        if (docs == null) {
            return { type: 'comment', value: `failed to include doc: ${collection}.${name}( ${JSON.stringify(args)} )` }
        }

        if (docs.length != 1) {
            return { type: 'comment', value: `failed to include single doc: ${collection}.${name}( ${JSON.stringify(args)} )` }
        }

        const doc = docs[0]
        let request = new SqrmRequest(args);
        let response = new SqrmResponse(this.db,this.jsonTree);
        doc.execute(request,response)
        let hast = sastToHast(response.root)
        return h('div',{class: `${collection}.${name}`},hast.children)
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
        if (this.appendTextToNode != null && obj.type == 'paragraph') {
            if (this.appendTextToNode.minIndent !== undefined) {
                if (this.appendTextToNode.minIndent <= obj.indent) {
                    delete this.appendTextToNode.minIndent
                    this.appendTextToNode.indent = obj.indent
                    const ls = obj.text.split('\n')
                    for (let i=0 ; i<ls.length ; i++) {
                        if (this.appendTextToNode.jsonNode.value != '') {
                            if (this.appendTextToNode.mode == '|') {
                                this.appendTextToNode.jsonNode.value += '\n'
                            } else {
                                this.appendTextToNode.jsonNode.value += ' '
                            }
                        }
                        this.appendTextToNode.jsonNode.value += ls[i].trim() // obj.text.trim()
                    }
                    wasAppended = true
                }
            } else if (this.appendTextToNode.indent == obj.indent) {
                const ls = obj.text.split('\n')
                for (let i=0 ; i<ls.length ; i++) {
                    if (this.appendTextToNode.jsonNode.value != '') {
                        if (this.appendTextToNode.mode == '|') {
                            this.appendTextToNode.jsonNode.value += '\n'
                        } else {
                            this.appendTextToNode.jsonNode.value += ' '
                        }
                    }
                    this.appendTextToNode.jsonNode.value += ls[i].trim() // obj.text.trim()
                }
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
            if (obj.type == 'yaml') obj.type = 'paragraph'
            this.root.push( obj )// { type: 'text', line: obj.line, text: obj.text, indent: obj.indent, children: obj.children }
        } else {

            let jsonNode = this.jsonTag(yaml)

            if (jsonNode != null) {
                if (yaml.value && yaml.value.length==1 && typeof yaml.value[0] == "string") {

                    if (yaml.value[0]=='|' || yaml.value[0]=='>') {
                        // remove the | or > from the value of this node
                        jsonNode.value = ''
                        this.appendTextToNode = { minIndent: yaml.indent+1, mode: yaml.value[0], jsonNode: jsonNode }
                    } else {
                        this.appendTextToNode = null
                    }
                } else {
                    this.appendTextToNode = null
                }

                this.root.push( { type: 'blank', line: obj.line } )// h('a',{href:`/tags/${obj.name}`},obj.children)
            } else {
                this.appendTextToNode = null
                if (obj.type == 'yaml') obj.type = 'paragraph'
                this.root.push( obj )// { type: 'text', line: obj.line, text: obj.text, indent: obj.indent, children: obj.children }
            }
        }
    }

    addTask({line,done,text}) {
        let tasksNode = null

        if (this.jsonTree.root.type == 'unknown') {
            this.jsonTree.root.type = 'object'
            this.jsonTree.root.childrenIndent = 0
            delete this.jsonTree.root.minChildIndent
            tasksNode = { type: 'array', name: 'tasks', childrenIndent: 1, children: [] }
            this.jsonTree.root.children = [tasksNode]
        } else if (this.jsonTree.root.type == 'object') {
            for (let i=0 ; i<this.jsonTree.root.children.length ; i++) {
                const child = this.jsonTree.root.children[i]
                if (child.name == 'tasks') {
                    tasksNode = child
                    break
                }
            }

            if (tasksNode == null) {
                tasksNode = { type: 'array', name: 'tasks', childrenIndent: 1, children: [] }
                this.jsonTree.root.children.push(tasksNode)
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

    template(fn) {
        return fn()
    }

    inlineTag({name,args,children}) {
        this.jsonTag({
            indent: 0,
            isArrayElement: false,
            name: name,
            colon: true,
            value: (args === undefined ? true : args )
        })

        return h('a',{ href: `/tags/${name}` }, children )
    }

    // j(name,value) {

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

    jsonTag({indent,isArrayElement,name,colon,value}) {

        if (value != undefined && value.length == 1) {
            value = value[0]
        }

        let parent = null
        if (isArrayElement) {
            // if this is an array element: look for unknown or array

            this.jsonTree.iterateLikeStack((el) => {
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

            this.jsonTree.iterateLikeStack((el) => {
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

            if (colon && value === undefined) {
                parent.children = [ { minChildIndent: indent, type: 'unknown', name: name } ]
            } else {
                parent.children = [ { type: 'value', name: name, value: value } ]
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
            if (colon && value === undefined) {
                jsonNode = { minChildIndent: indent+1, type:'unknown',name:name }
                const arrayElement = { childrenIndent: indent+1, type: 'object', children: [jsonNode]}
                parent.children = [arrayElement]
            } else if (colon) {
                jsonNode = { childrenIndent: indent+1, type:'value', name:name, value:value}
                const arrayElement = { childrenIndent: indent+1, type: 'object', children: [jsonNode]}
                parent.children = [arrayElement]
            } else if (!colon) {
                jsonNode = { type: 'value', value: value }
                parent.children = [ jsonNode ]
            }

            // this.updateJson()
            return jsonNode
        }

        if (parent.type == 'object' && !isArrayElement) {
 
            let child = null
            if (colon && value === undefined) {
                child = { minChildIndent: indent, type: 'unknown', name: name }
            } else {
                child = { type: 'value', name: name, value: value }
            }

            for (let i=0 ; i<parent.children.length ; i++) {
                if (parent.children[i].name == name) {
                    parent.children[i] = child
                    return parent.children[i]
                }
            }

            parent.children.push(child)
            return parent.children[parent.children.length-1]
        }

        if (parent.type == 'array' && isArrayElement) {

            let jsonNode = null
            if (colon && value === undefined) {
                jsonNode = { minChildIndent: indent+1, type:'unknown',name:name }
                const arrayElement = { childrenIndent: indent+1, type: 'object', children: [jsonNode]}
                parent.children.push(arrayElement)
            } else if (colon) {
                jsonNode = { childrenIndent: indent+1, type:'value',name:name,value:value}
                const arrayElement = { childrenIndent: indent+1, type: 'object', children: [jsonNode]}
                parent.children.push(arrayElement)
            } else if (!colon) {
                jsonNode = { type: 'value', value: value }
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
