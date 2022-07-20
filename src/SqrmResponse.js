import HTMLOutputStream from './HTMLOutputStream.js'

export default class SqrmResponse {
    constructor() {
        this.html = new HTMLOutputStream();
        this.json = {};
    }
} 
