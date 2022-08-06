
//import HTMLOutputStream from './HTMLOutputStream.js'
import {h} from 'hastscript'
import {toHtml} from 'hast-util-to-html'
import {visit} from 'unist-util-visit'
import util from 'node:util'
import { timeStamp } from 'node:console'
import HtmlOutputTree from './HtmlOutputTree.js'




export default class SqrmResponse {
    constructor() {
        this.html = new HtmlOutputTree();//new HTMLOutputStream();
        this.json = {};
    }
} 
