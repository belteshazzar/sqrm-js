
import {h} from 'hastscript'
import JsonTree from './json-tree.js'
import sastTextToHast from './util/sast-text-to-hast.js';
import sastTableToHast from './util/sast-table-to-hast.js';

export default class SqrmContext {
    constructor(db,jsonTree) {
        this.db = db

        this.hast = {
            type: 'root',
            children: [],
        };

        this.indentStack = [this.hast];
        this.yamlNotAllowedIndent = -1
        this.hastCallbacks = []
        this.jsonTree = jsonTree || new JsonTree()
        this.json = this.jsonTree.json
        this.blank = null;
        this.preIndent = -1;
    }

    addLine(obj) {

        function spaces(i) {
            let ss = ''
            for (let j=0 ; j<i ; j++) ss = ss + '  '
            return ss
        }

        if (this.preIndent > 0 && (obj.type == 'blank-line' || obj.indent >= this.preIndent)) {

            if (obj.type == 'element-line' 
                    && obj.tag == 'code'
                    && this.indentStack[this.preIndent].tagName == 'pre') {

                const code = h('code',obj.properties,[{type:'text',value:'\n'}])
                const pre = this.indentStack[this.preIndent]
                pre.children.push(code)
                this.indentStack.push(code)
                this.preIndent++
            } else {
                this.indentStack[this.preIndent].children.push({
                    type: 'text',
                    value: obj.text ? spaces(obj.indent-this.preIndent)+obj.text+'\n' : '\n'
                })
            }
        } else if (obj.type == 'blank-line') {
            if (this.blank = null) {
                this.blank = '\n'
            } else {
                this.blank += '\n'
            }
        } else {

            this.preIndent = -1

            if (obj.type == 'yaml-line') {

                if (this.blank = null) {
                    this.blank = '\n'
                } else {
                    this.blank += '\n'
                }
                this.jsonTag(obj)

            } else {
                const indent = obj.indent

                while (this.indentStack.length - 1 < indent) {
                    let node = h('div')
                    this.indentStack[this.indentStack.length - 1].children.push(node)
                    this.indentStack.push(node);
                }

                while (this.indentStack.length - 1 > indent) {
                    this.indentStack.pop();
                }

                let prev = null;
                const indentLevel = this.indentStack[indent]

                if (indentLevel && indentLevel.children.length>0) {
                    prev = indentLevel.children[indentLevel.children.length-1]
                }

                if (obj.type == 'text-line') {

                    if (this.blank == null && prev && prev.tagName == 'p') {
                        prev.sqrm.push({ type: 'text', value: '\n' })
                        prev.sqrm.push(... obj.children)
                        prev.children = sastTextToHast(prev.sqrm)
                    } else {
                        let hast = h('p')
                        hast.sqrm = obj.children
                        hast.children = sastTextToHast(obj.children)
                        indentLevel.children.push(hast);
                    }
                } else if (obj.type == 'table-row-line' || obj.type == 'table-divider-line') {
                    if (this.blank == null && prev && prev.tagName == 'table') {
                        prev.sqrm.push(obj);
                        prev.children = sastTableToHast(prev.sqrm).children
                    } else {
                        let hast = h('table')
                        hast.sqrm = [obj]
                        hast.children = sastTableToHast(hast.sqrm).children
                        indentLevel.children.push(hast);
                    }
                } else if (obj.type == 'ordered-list-item-line') {
                    if (prev && prev.tagName == 'ol') {
                        prev.children.push(h('li',{},obj.children))
                    } else {
                        let li = h('li',{},obj.children)
                        let ol = h('ol',{},[li]) //{ type: 'ordered-list', children: [toHast(obj)] }
                        indentLevel.children.push(ol)
                        this.indentStack.push(li)
                    }
                } else if (obj.type == 'unordered-list-item-line') {
                    if (prev && prev.tagName == 'ul') {
                        prev.children.push(h('li',{},obj.children))
                    } else {
                        let li = h('li',{},obj.children)
                        let ul = h('ul',{},[li]) //{ type: 'ordered-list', children: [toHast(obj)] }
                        indentLevel.children.push(ul)
                        this.indentStack.push(li)
                    }
                } else if (obj.type == 'hr-line') {
                    indentLevel.children.push(h('hr'))
                } else if (obj.type == 'heading-line') {
                    indentLevel.children.push(h('h'+obj.level,{},obj.children))

                } else if (obj.type == 'code-block-line') {

                    let cls = 'language-' + (obj.language ? obj.language : 'text' )
                    this.preIndent = indent + 1
                    let code = h('code',{ class: cls },[{type:'text',value:'\n'}])
                    let pre = h('pre',{},[code])
                    pre.children.push = function(el) {
                        code.children.push(el)
                    }
                    indentLevel.children.push(pre)
                    this.indentStack.push(pre)

                } else if (obj.type == 'element-line') {
                    let hast
                    if (obj.tag == '!doctype') {
                        hast = { type: 'doctype' }
                    } else {
                        hast = h(obj.tag,obj.properties)

                        if (obj.tag=='pre' || obj.tag=='script' || obj.tag=='style') {
                            //console.log('=============== ' + (indent+1));
                            this.preIndent = indent + 1
                            hast.children.push({type:'text',value:'\n'})
                        }
                    }
                    indentLevel.children.push(hast);
                    this.indentStack.push(hast)
                } else {
                    throw new Error('not implemented obj.type='+obj.type)
                }

                this.blank = null;
            }
        }
    }

    appendToDoc(obj) {

        if (this.yamlNotAllowedIndent != -1 && obj.type != 'blank-line') {
            if (obj.indent < this.yamlNotAllowedIndent) {
                this.yamlNotAllowedIndent = -1
            }
        }

        if (this.yamlNotAllowedIndent == -1 && obj.type == 'div-line') {
            switch (obj.tag) {
                case 'pre':
                case 'script':
                case 'style':
                case '!--':
                    this.yamlNotAllowedIndent = obj.indent + 1
            }
        }

        let wasAppended = false
        if (this.appendTextToNode != null && obj.type == 'text-line') {
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
            this.doc.children.push(obj)
        }
    }

    maybeYaml(obj) {
// console.log('maybeYaml',obj)
        if (this.yamlNotAllowedIndent != -1 && obj.indent < this.yamlNotAllowedIndent) {
            this.yamlNotAllowedIndent = -1
        }

        const yaml = ( obj.type == 'yaml-line' ? obj : obj.yaml )

        const line = obj

        if (this.yamlNotAllowedIndent != -1) {
            this.appendTextToNode = null
            if (obj.type == 'yaml-line') obj.type = 'paragraph-line'
            this.doc.children.push( obj )// { type: 'text', line: obj.line, text: obj.text, indent: obj.indent, children: obj.children }
        } else {

            // console.log('yaml:',yaml)
            let jsonNode = this.jsonTag(yaml)
            // console.log('jsonNode:',jsonNode)

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

                this.doc.children.push( { type: 'blank-line', line: obj.line } )// h('a',{href:`/tags/${obj.name}`},obj.children)
            } else {
                this.appendTextToNode = null
                // if (obj.type == 'yaml') obj.type = 'paragraph'
                // this.doc.children.push( obj )// { type: 'text', line: obj.line, text: obj.text, indent: obj.indent, children: obj.children }
            }
        }
    }

    // addTask({line,done,text}) {
    //     let tasksNode = null

    //     if (this.jsonTree.root.type == 'unknown') {
    //         this.jsonTree.root.type = 'object'
    //         this.jsonTree.root.childrenIndent = 0
    //         delete this.jsonTree.root.minChildIndent
    //         tasksNode = { type: 'array', name: 'tasks', childrenIndent: 1, children: [] }
    //         this.jsonTree.root.children = [tasksNode]
    //     } else if (this.jsonTree.root.type == 'object') {
    //         for (let i=0 ; i<this.jsonTree.root.children.length ; i++) {
    //             const child = this.jsonTree.root.children[i]
    //             if (child.name == 'tasks') {
    //                 tasksNode = child
    //                 break
    //             }
    //         }

    //         if (tasksNode == null) {
    //             tasksNode = { type: 'array', name: 'tasks', childrenIndent: 1, children: [] }
    //             this.jsonTree.root.children.push(tasksNode)
    //         }
    //     } else {
    //         // silently not supported if the root is an array
    //         return
    //     }

    //     const taskNode = { type: 'object', childrenIndent: 2, children: [] }
    //     taskNode.children.push({ type: 'value', name: 'line', value: line })
    //     taskNode.children.push({ type: 'value', name: 'text', value: text })
    //     taskNode.children.push({ type: 'value', name: 'done', value: done })
    //     tasksNode.children.push(taskNode)

    //     // this.updateJson()
    // }

    // template(fn) {
    //     return fn()
    // }

    // inlineTag({name,args,children}) {
    //     this.jsonTag({
    //         indent: 0,
    //         isArrayElement: false,
    //         name: name,
    //         colon: true,
    //         value: (args === undefined ? true : args )
    //     })

    //     return h('a',{ href: `/tags/${name}` }, children )
    // }

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

    // todo: move to json-tree.js
    jsonTag({indent=1,isArrayElement=false,name,colon=true,value}) {

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
// console.log(util.inspect(this.jsonTree,false,null,true))
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
// console.log('parent=',parent)
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
