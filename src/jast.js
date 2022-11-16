
let handler = {
    has(target, property) {
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
            // case 'value': {
            //     return true
            // }
            default: {
                throw new Error(target.type)
            }
        }
        return false

        // return property in target
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
        throw new Error('set not-implemented')
    }
}

export default class JsonTree {

    constructor() {
        this.root = { minChildIndent: 0, type: 'unknown', name: 'root' }
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
}
