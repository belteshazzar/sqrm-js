let isPrimitive = (val) => {
    
  if ( val === Object(val) ) {
    return false
  } else{
    return true
  }
}

let handler = {
    has(target, property) {
        return Reflect.has(...arguments);
    },
    get(target, property, receiver) {
        if (property in target) {
            let value = target[property]
            if (typeof value === 'object' && value === Object(value)) {
                return new Proxy(value,handler);
            } else {
                return value
            }
        } else if (isPrimitive(property)) {
            return target[property]
        } else {
            return `${property} not set`
        }
        //   return Reflect.get(...arguments);
    },
    set(target, property, value, receiver) {
    }
}

export default class SqrmRequest {

    constructor(args = []) {
        this.args = new Proxy(args,handler) ;
    }
}