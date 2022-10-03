
import NonEmptyLine from "./NonEmptyLine.js";
import BlankLine from "./BlankLine.js";
import Tag from './Tag.js'
import ListItem from './ListItem.js'

export default class ListItemTag extends NonEmptyLine {
        constructor(ln,indent,text,name,value) {
            super(ln,indent,text);
            this.name = name;
            this.value = value;
        }

        asTag() {
            return this;
        }

        process(is,os,parent) {

//            console.log('ListItemTag list item tag',this.name,this.value);

            while (is.nextLine instanceof BlankLine) {
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
                const ref = (parent?parent+'.'+this.name:this.name)
//                console.log('ListItemTag -> named array',ref);
                os.tag(this.indent,ref,[]);
                while (is.nextLine !== false
                        && is.nextLine.indent >= indent
                        && is.nextLine instanceof ListItem) {

                    is.next();


                    let tag = is.line.asTag();
                    tag.process(is,os,ref);

                    while (is.nextLine instanceof BlankLine) {
                        is.next();
                    }
                }

            } else if (is.nextLine !== false 
                    && this.value !== undefined 
                    && is.nextLine.indent == this.indent + 2
                    && is.nextLine instanceof Tag) {

                os.tag(this.indent,parent,{})

                let ref = `${parent}[${parent}.length-1]`
                os.tag(this.indent,`${ref}.${this.name}`,os.parse(this.value))
                
                while (is.nextLine !== false
                        && is.nextLine.indent == this.indent + 2
                        && is.nextLine instanceof Tag) {

                    is.next();
                    let tag = is.line;
                    tag.process(is,os,ref);

                    while (is.nextLine instanceof BlankLine) {
                        is.next();
                    }
                }

            } else if (is.nextLine !== false 
                    && this.value === undefined 
                    && is.nextLine.indent > this.indent
                    && is.nextLine instanceof Tag) {
                        
                os.tag(this.indent,parent,{})

                let ref = `${parent}[${parent}.length-1]`
                os.tag(this.indent,`${ref}.${this.name}`,{})

                while (is.nextLine !== false
                        && is.nextLine.indent > this.indent
                        && is.nextLine instanceof Tag) {

                    is.next();
                    let tag = is.line;

                    if (tag.indent == this.indent+2) {
                        // at same level, part of this obj
                        tag.process(is,os,ref);
                    } else if (tag.indent > this.indent+2) {
                        // at next level, part of child
                        tag.process(is,os,`${ref}.${this.name}`);
                    } else {
                        throw new Error()
                    }

                    while (is.nextLine instanceof BlankLine) {
                        is.next();
                    }
                }
    
            } else if (this.value !== undefined) {
                let v = {}
                try {
                    v[this.name] = os.parse(this.value)
                } catch (e) {
                    v[this.name] = this.value
                }

                os.tag(this.indent,parent,v);


            } else {
                os.tag(this.indent,parent,{})
                let ref = `${parent}[${parent}.length-1]`
                os.tag(this.indent,`${ref}.${this.name}`,null)
            }
        
        }
    }
