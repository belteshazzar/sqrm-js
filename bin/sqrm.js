#!/usr/bin/env node

import fs from 'fs'
import SqrmCollection from '../src/SqrmCollection.js'
import SqrmDocument from '../src/SqrmDocument.js'
import HTMLOutputStream from '../src/HTMLOutputStream.js';
import SqrmRequest from '../src/SqrmRequest.js'
import SqrmResponse from '../src/SqrmResponse.js'

let maxArg = -1

let _i = process.argv.indexOf('-i')

if (_i) {
    maxArg = Math.max(maxArg,_i+1)
    _i = process.argv[_i+1];
}

let _f = process.argv.indexOf('-f')

if (_f) {
    maxArg = Math.max(maxArg,_f+1)
    _f = process.argv[_f+1];
}

let args = [];
for (let i=maxArg + 1 ; i< process.argv.length ; i++) {
    args.push(process.argv[i])
}

const collection = new SqrmCollection(_f);



let docs = collection.find((doc) => doc._id == _i)
if (docs.length == 0) {
    throw new Error("unable to find doc id=" + _i)
}
//console.log('docs found: ', docs)
let doc = docs[0]
console.log('sqrm -----------')
doc.load()
console.log(doc.src);
console.log('js -----------')
doc.compile()
console.log(doc.fn.toString())

let request = new SqrmRequest(collection,args);
let response = new SqrmResponse();

doc.execute(request,response);

console.log('json -----------')
console.log(JSON.stringify(response.json, null, 2));
console.log('html -----------')
console.log(response.html.toString());