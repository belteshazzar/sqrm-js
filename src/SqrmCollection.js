

import fs from 'node:fs'

import * as acorn from 'acorn'
import * as walk from "acorn-walk"

import SqrmDocument from './SqrmDocument.js'
import SqrmRequest from '../src/SqrmRequest.js'
import SqrmResponse from '../src/SqrmResponse.js'

export default class SqrmCollection {

     constructor(folder = '.') {
        this.folder = folder;
        console.log("loading folder: " + folder);

        let x = fs.readdirSync(folder).map((f) => f.split('.'))
            .filter((el) => {
                return el[2] == "sqrm"
            })
            .sort((a,b) => {
                a[0].localeCompare(b[0]) || a[1] - b[1]
            });
        console.log("loading " + x.length + " docs")
        this.docs = new Map();
        let prevDoc = null;
        x.forEach((el) => {
            if (prevDoc != null && prevDoc.id != el[0]) {
                this.docs.set(prevDoc.id, prevDoc);
            }
            prevDoc = new SqrmDocument(this,el[0],el[1]*1)
        });
        if (prevDoc != null) this.docs.set(prevDoc.id,prevDoc)

        this.docs.forEach((doc) => {
            try {
                doc.load();
                doc.compile();
            } catch (e) {
                console.log(`failed to compile: ${doc.id}`)
                console.log(e);
            }
        })

        this.docs.forEach((doc) => {

            console.log("|")
            console.log('------ ' + doc.id + ' ---------------------------------')
            console.log("|")
            let request = new SqrmRequest(this);
            let response = new SqrmResponse();
            try {
                doc.execute(request,response);
                doc.json = response.json
                doc.json._id = doc.id;
                doc.json._rev = doc.rev;
            } catch (e) {
                console.log(`failed to execute: ${doc.id} --------`)
                console.log(doc.fn.toString());
                console.log('---------------------------------------')
                console.log(e);
                console.log('---------------------------------------')
            }

        })
    }

    load(doc) {
        if (doc.src!=null) return;
        doc.src = fs.readFileSync(`${this.folder}/${doc.id}.${doc.rev}.sqrm`, 'utf-8').toString();
    }

    include(name,request,response) {
        if (!this.docs.has(name)) {
            response.html.out += `<!-- failed to find document: ${name} -->`
            return;
        }

        const fn = this.docs.get(name).fn;
        let args = [];
        for (let i=3 ; i<arguments.length ; i++) args.push(arguments[i])
        let newRequest = Object.assign({},request);
        newRequest.args= args;
        fn(newRequest,response)
    }

    call(name,request,response) {
        if (!this.docs.has(name)) {
            response.html.out += `<!-- failed to find document: ${name} -->`
            return;
        }

        const fn = this.docs.get(name).fn;
            let args = [];
            for (let i=3 ; i<arguments.length ; i++) args.push(arguments[i])
            let newRequest = Object.assign({},request);
            newRequest.args= args;
            fn(newRequest,response)  
    }

    find(select,filter,skip,count) {

        console.log(select.toString())
        try {
            let tree = acorn.parse(select.toString(), {ecmaVersion: 2020})
            let param = tree.body[0].expression.params[0].name;
            walk.simple(tree, {
                MemberExpression(node) {
                    if (node.object.name == param) {     
                        console.log(node.property.name);
                    }
                }
              })

        } catch (e) {
            console.log('acorn parse error',e)
        }


        let res = [];

        if (typeof select == "string") {
            res.push(this.docs[select])
        } else if (typeof select == "function") {
            let it = this.docs.values();
            let el = it.next();
            while (!el.done) {
                if (el.value.json !== undefined
                        && select(el.value.json)) {
                    res.push(el.value)
                }
                el = it.next();
            }
        }
        return res
    }

}