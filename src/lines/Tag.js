
import EmptyLine from "./EmptyLine.js";
import NonEmptyLine from "./NonEmptyLine.js";
import ListItem from './ListItem.js'
//import JSON5 from 'json5'

//import {Parser} from 'acorn'


export default class Tag extends NonEmptyLine {
    constructor(ln,indent,text,name,value) {
        super(ln,indent,text);
        this.name = name;
        this.value = value;
    }

    asTag() {
        return this;
    }

    process(is,os,parent) {

        while (is.nextLine instanceof EmptyLine) {
            is.next();
        }
        
        if (is.nextLine !== false 
                && this.value === undefined 
                && is.nextLine.indent >= this.indent
                && is.nextLine instanceof ListItem) {

            // make sure to keep indent at the same level
            const indent = is.nextLine.indent;

            // no value with list after indented or at same level
            // defines a named array

            const ref = (parent?parent+'.'+this.name:'json.'+this.name)

            os.tag(this.indent,ref,[]);

            while (is.nextLine !== false
                    && is.nextLine.indent == indent
                    && is.nextLine instanceof ListItem) {

                is.next();
                let tag = is.line.asTag();
//                console.log(`   ${ref}.push:`)
                tag.process(is,os,ref);

                while (is.nextLine instanceof EmptyLine) {
                    is.next();
                }
            }

        } else if (is.nextLine !== false 
                && this.value !== undefined 
                && is.nextLine.indent == this.indent + 2   // TODO: hard coded :(
                && is.nextLine instanceof Tag) {

            // make sure to keep indent at the same level
            const indent = this.indent + 2;

            // has value with tags after at same "apparent" level
            // defines an un-named object in list of parent
//            console.log('Tag -> un-named object',parent)
            os.push(this.indent,parent,{})
            const ref = parent + '['+parent+'.length - 1]'
//            console.log('Tag -> un-named object',ref)
            os.tag(this.indent,ref+'.'+this.name,this.value)

            while (is.nextLine !== false
                    && is.nextLine.indent == indent
                    && is.nextLine instanceof Tag) {

                is.next();
                let tag = is.line;
//                console.log('Tag -> Tag')
                tag.process(is,os,ref);

                while (is.nextLine instanceof EmptyLine) {
                    is.next();
                }
            }

        } else if (is.nextLine !== false 
                && this.value === undefined 
                && is.nextLine.indent > this.indent
                && is.nextLine instanceof Tag) {

            // make sure to keep indent at the same level
            const indent = is.nextLine.indent;
                    
            // no value with a tag indented after it
            // defines a named object
            const ref = (parent?parent+'.'+this.name:'json.'+this.name)
//            console.log('Tag -> named object',ref)
            os.tag(this.indent,ref,{})

            while (is.nextLine !== false
                    && is.nextLine.indent == indent
                    && is.nextLine instanceof Tag) {

                is.next();
                let tag = is.line;
//                console.log('Tag -> Tag')
                tag.process(is,os,ref);

                while (is.nextLine instanceof EmptyLine) {
                    is.next();
                }
            }

        } else if (this.value !== undefined) {

            try {
                os.tag(this.indent,`${parent===undefined?'json':parent}.${this.name}`,os.parse(this.value));
            } catch (e) {
                os.tag(this.indent,`${parent===undefined?'json':parent}.${this.name}`,this.value);
            }

        } else {

            os.tag(this.indent,`${parent===undefined?'json':parent}.${this.name}`,null);

        }

    }
}

Tag.re = /^([ \t]*)(([a-zA-Z_$][a-zA-Z\d_$]*)\s*:(?:\s+(.*?))?)\s*$/ // indent, name, values
