let isPrimitive = (val) => {
    
  if ( val === Object(val) ) {
    return false
  } else{
    return true
  }
}

let handler = {
    has(target, property) {
        // console.log('handler.has',target,property)
        // throw new Error('has not-implemented')
        return Reflect.has(...arguments);
    },
    get(target, property, receiver) {
        // console.log('get',target,property)
        if (property in target) {
            let value = target[property]
            // console.log('get = ',value)
            if (typeof value === 'object' && value === Object(value)) {
                return new Proxy(value,handler);
            } else {
                return value
            }
        } else if (isPrimitive(property)) {
            return target[property]
        } else {
            // console.log(target,isPrimitive(target),property,isPrimitive(property))
            // console.log('get = ',`${property} not set`)
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