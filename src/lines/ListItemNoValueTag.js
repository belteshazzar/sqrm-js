
import Tag from './Tag.js'
import ListItem from './ListItem.js';

export default class ListItemNoValueTag extends Tag {
    constructor(ln,indent,text,name) {
        super(ln,indent,text,name,undefined);
    }

    process(is,os,parent) {
//        console.log('ListItemNoValueTag',parent,this.name)
        os.push(this.indent,parent,this.name)
return
        if (is.nextLine !== false) {

            const indent = is.nextLine.indent;

            if (indent >= this.indent
                && is.nextLine instanceof ListItem) {
            
                while (is.nextLine !== false
                        && is.nextLine.indent == indent
                        && is.nextLine instanceof ListItem) {

                    is.next();
                    let tag = is.line.asTag();
                    tag.process(is,os);
                }

            } else if (indent > this.indent
                    && is.nextLine instanceof Tag) {
            
                while (is.nextLine !== false
                        && is.nextLine.indent == indent
                        && is.nextLine instanceof Tag) {

                    is.next();
                    let tag = is.line;
                    tag.process(is,os);
                }

            }
        }
    }
}