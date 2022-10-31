

export default class SqrmDocument {
    
    constructor(fn, _options) {

        const defaults = {
            id: 'new-document',
            rev: 1,
        };
        const options = Object.assign({}, defaults, _options);

        this.fn = fn
    }

    execute(request,response) {
        if (this.fn == null) return
        this.fn(request,response)
    }
}
