
export default class SqrmRequest {

    constructor(collection, args = []) {
        this.docs = collection
        this.args = args;
    }

}