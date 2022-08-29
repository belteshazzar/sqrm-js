
//import HTMLOutputStream from './HTMLOutputStream.js'
import {h} from 'hastscript'
import {toHtml} from 'hast-util-to-html'
import {visit} from 'unist-util-visit'
import util from 'node:util'
import { Console, timeStamp } from 'node:console'

export default class HtmlOutputTree {
    constructor() {
        this.root = h()//'div',{i:-1});
        this.curr = this.root;
        this.parents = {0 : this.root }
        this.level = 0
        this.footnotes = {};
    }

    append(i,el) {
        const isOpen = el.children.length == 0
        let parent;

//        console.log(`append(${i}) this.level=${this.level}, hasChildren=${el.children.length!=0}`)

console.log('-------------')
console.log(this.level + ' -> ' + i + ' : ' + el.tagName);
// Object.keys(this.parents).forEach(k => console.log(k,this.parents[k].tagName));

// parents:{ 0 : root} + 0:ul   =>   parents:{ 0 : root, 2: ul }
// parents:{ 0 : root} + 2:ul   =>   parents:{ 0 : root, 2: div, 4: ul }
// parents:{ 0 : root} + 4:ul   =>   parents:{ 0 : root, 2: div, 4: div, 6: ul }


        if (i > this.level) {

            console.log('increase level')

            for (let lvl = this.level ; lvl <= i ; lvl += 2) {
                if (this.parents[lvl] == undefined) {
                    console.log('adding: '+lvl);
                    let _h = h('div')
                    this.parents[lvl-2].children.push(_h)
                    this.parents[lvl] = _h
                }
            }

            parent = this.parents[i];
            console.log('new parent @',i,parent.tagName)

        } else if (i < this.level) {

            console.log('decrease level')

            for (let lvl = i+4 ; lvl<=this.level ; lvl += 2) {
                console.log('deleting: '+lvl)
                delete this.parents[lvl];
            }

            parent = this.parents[i];
            console.log('new parent @',i,parent.tagName)

        }

        
        // console.log('++2')
        // Object.keys(this.parents).forEach(k => console.log(k,this.parents[k].tagName));
        // console.log('++2')

//        console.log(this.parents);

        if (isOpen) {
            console.log('is open')

//            console.log(this.parents[i+2],el)
           if (this.parents[i+2] !== undefined && this.parents[i+2].tagName == el.tagName) {

                console.log(el.tagName + ' =============');

                if (el.tagName == 'tr') {

                    this.parents[i+2] = el;
                    this.parents[i].children.push(el);
    
                }

           } else {

                console.log('putting ' + el.tagName + ' into ' + this.parents[i].tagName )

                this.parents[i+2] = el;
                this.parents[i].children.push(el);
            }


            this.level = i + 2;
        } else {
            this.level = i;
            this.parents[i].children.push(el);
        }

        // console.log('++3')
        // Object.keys(this.parents).forEach(k => console.log(k,this.parents[k].tagName));
        // console.log(this.level);
        // console.log('++3')


//         if ( this.level == i + 2 && this.parents[i+2] != null && this.parents[i+2].tagName == el.tagName) {

//         console.log('same parent repeated')
    
//     } else {
        
// }




        return el;
    }

    
    el(i,el,txt,endEl = false) {

        el = el.toLowerCase()

        console.log('-------')
        console.log(i,el)
        console.log(this.curr)

        if (this.curr.properties !== undefined && i == this.curr.properties.i) {
            // same level, sibling
            // push to parent.children
            const parent = this.curr.properties.parent;
            let sibling = h(el,{i:i})
            this.curr.properties.parent = parent;
            parent.children.push(sibling)

            if (txt !== undefined) {
                txt.forEach((t) => {
                    sibling.children.push({type: 'text', value: t})
                });
            }
    
            if (!endEl) this.curr = sibling;

        } else if (this.curr.properties === undefined || i > this.curr.properties.i) {

            let lvl = (this.curr.properties ? this.curr.properties.i + 2: 0);
            while (lvl < i) {
                // nested, child
                // push to curr.children
                const parent = this.curr;
                const child = h('div',{i:lvl})
                lvl += 2
                child.properties.parent = parent;
                parent.children.push(child);
                this.curr = child;
            }

            // nested, child
            // push to curr.children
            const parent = this.curr;
            const child = h(el,{i:i})
            child.properties.parent = parent;
            parent.children.push(child);

            if (txt !== undefined) {
                txt.forEach((t) => {
                    child.children.push({type: 'text', value: t})
                });
            }
    
            if (!endEl) this.curr = child;

        } else {

            while( i < this.curr.properties.i) {
                this.curr = this.curr.properties.parent
                console.log('this.curr := ',this.curr)
            }

            if (i === this.curr.properties.i && el === this.curr.tagName) {

            } else {
                // same level, sibling
                // push to parent.children
                const parent = this.curr.properties.parent;
                let sibling = h(el,{i:i})
                this.curr.properties.parent = parent;
                parent.children.push(sibling)

                if (txt !== undefined) {
                    txt.forEach((t) => {
                        sibling.children.push({type: 'text', value: t})
                    });
                }
        
                if (!endEl) this.curr = sibling;
    
            }
        }

    }

    comment(i,str) {
//        this.els.push({i: i, str: str})
    }

    toString() {        

        visit(this.root, 'element', (node) => {
            delete node.properties.parent;
        })
//        console.log(util.inspect(this.root,false,null,true))
        visit(this.root, 'element', (node) => {
            delete node.properties.i
        })

        console.log(util.inspect(this.root,false,null,true));

        return toHtml(this.root)
    }
}

