
let handler = {
    has(target, property) {
        if (property=='toJSON') return true
        switch (target.type) {
            case 'object': {
                for (let i=0 ; i<target.children.length ; i++) {
                    let child = target.children[i]
                    if (child.name == property) {
                        return true
                    }
                }
            }
            case 'array': {
                return property in target.children
            }
            case 'unknown': {
                return false
            }
            case 'value': {
                return true
            }
            default: {
                throw new Error(target.type)
            }
        }
        return false

        // return property in target
    },
    get(target, property, receiver) {

        if (property=='toJSON') {
            switch (target.type) {
                case 'object':
                    const obj = {}
                    if (target.children) target.children.forEach(child => {
                        obj[child.name] = new Proxy(child,handler).toJSON()
                    });
                    return () => (obj)
                case 'array':
                    const arr = []
                    if (target.children) target.children.forEach(child => {
                        arr.push(new Proxy(child,handler).toJSON())
                    });
                    return () => (arr)
                case 'unknown':
                    return () => (null);
                case 'value':
                    return () => (target.value);
                default: {
                    throw new Error(target.type);
                }
            }
        }
        switch (target.type) {
            case 'object': {

                if (property == 'constructor') return Object

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

                if (property == 'constructor') return Array

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
        if (target.type != 'array' && target.type != 'object') {
            console.log(target,property,value)
            throw new Error('set on json not array or object not-implemented')
        }
        for (let i=0 ; i<target.children.length ; i++) {
            if (target.children[i].name == property) {
                target.children[i].type = 'value'
                target.children[i].value = value
                return true
            }
        }
        target.children.push({ type: 'value', name: property, value: value })
        return true;
    },
    ownKeys(target) {
        if (target.children) {
            return target.children.map(child => child.name)
        } else {
            return []
        }
    }
}

export default class JsonTree {

    constructor() {
        this.root = { childrenIndent: 0, type: 'object', name: 'root', children: [] }
        this.json = new Proxy(this.root,handler)        
    }

    iterateLikeStack(cb) {
        let el = this.root
        while (el != null) {
            if (cb.call(null,el) === false) return
            el = (el.children ? el.children[el.children.length-1] : null)
            if (el!=null && el.type == 'value') {
                el = null
            }
        }
    }

    addLine({indent=1,isArrayElement=false,name,colon=true,value,$value},context) {

        if ($value !== undefined) {
            value = $value.call(context)
        }

        if (value != undefined && value.length == 1) {
            value = value[0]
        }

        let parent = null
        if (isArrayElement) {
            // if this is an array element: look for unknown or array

            this.iterateLikeStack((el) => {
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
            this.iterateLikeStack((el) => {
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


}
