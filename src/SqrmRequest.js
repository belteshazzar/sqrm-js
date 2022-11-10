
let handler = {
    has(target, property) {
        throw new Error('has not-implemented')
    },
    get(target, property, receiver) {
        // console.log('get',target,property)
        if (property in target) {
            let value = target[property]
            // console.log('get = ',value)
            if (typeof value === 'object') {
                return new Proxy(value,handler);
            } else {
                return value
            }
        } else {
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