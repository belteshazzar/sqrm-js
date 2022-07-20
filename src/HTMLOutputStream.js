import JSON5 from 'json5'

class Node {
    constructor(el,parent) {
        this.el = el;
        this.parent = parent;
        this.children = [];
    }
}

function el(e,parent) {
    return new Node(e,parent)
}

export default class SimpleOutputStream {
    constructor(invoke) {
        this.invoke = invoke
        this.out = '';
        this.scopes = [{i:-1,el:'html'}];
        this.rawTag = null;
        this.footnotes = [];
    }

    indent(i) {
        for (let a=0 ; a<i ; a++) {
            this.out += ' ';
        }
    }

    footnote() {
        this.footnotes.push(arguments)
    }

    closeTo(i,el) {
        let curr = this.peek();
        while (curr.i>=i) {
            curr = this.scopes.pop();
            this.indent(curr.i)
            this.out += `</${curr.el}>\n`
            curr = this.peek();
        }
    }

    close() {
        let scope = this.scopes.pop();

        if (scope.i == -1) {
            throw new Error();
        }

        if (!scope) return;

        if (scope.el == undefined) {
            throw new Error();
        }

        this.indent(scope.i)
        this.out += `</${scope.el}>\n`


    }

    peek() {
        return this.scopes[this.scopes.length-1];
    }

    now(i,el,attributes) {

        let curr = this.peek()
        if (el) el = el.toLowerCase()

        let next = {i:i,el:el};

        while (next.i <= curr.i) {
            if ((curr.el=='ol' || curr.el=='ul') && curr.el==el && curr.i==i) break;
            this.close()
            curr = this.peek();
        }

        if (next.i == curr.i && next.el != curr.el) {
            this.close();
            curr = this.peek()
        }

        if (i!=curr.i || el!=curr.el) {
            if (curr.i + 2 < i) {
                for (let x=(curr.i<0?0:curr.i+2) ; x<i ; x += 2) {
                    this.indent(x);
                    this.out += '<div>\n';
                    this.scopes.push({i:x,el:'div'});
               }
            }

            if (el == undefined) {
                throw new Error();
            }

            this.indent(i)
            this.out += "<"+el+(attributes?" "+attributes.trim():"")+">";
            this.out += '\n';

            switch (next.el) {
                case '!html':
                case 'area':
                case 'base':
                case 'br':
                case 'col':
                case 'command':
                case 'embed':
                case 'hr':
                case 'img':
                case 'input':
                case 'keygen':
                case 'link':
                case 'meta':
                case 'param':
                case 'source':
                case 'track':
                case 'wbe':
                    break;
                default:
                    this.scopes.push(next);
            }
        }
    }

    p(i,str) {
      if (typeof i == 'string') {
        str = i
        i=0
      }
      this.now(i,'p')
//      this.indent(i+2)
      this.text(i+2,str)
      this.closeTo(i,'p')
  }

    ref(i,r,str) {
        
    }

    text(i,str) {
        if (typeof i == 'string' || typeof i == 'array') {
            str = i
            i = 0
        }
        if (typeof str == 'string') {
            str = [str]
        }

        if (str === undefined) return;

        for (let j=0 ; j<str.length ; j++) {
            let o = str[j];
            if (typeof o == 'string') {
                this.indent(i)
                this.out += o + '\n'
            } else if (typeof o == 'function') {
                o();
            } else {
                console.log("error")
            }
        }
//        return s;
    }

    raw(i,str) {
        if (typeof i == 'string') {
            str = i;
            i = 0;
        }
        let indent = 0;
        for (let i=this.scopes.length-1 ; i>=0 ; i--) {
            let s = this.scopes[i];
            if (s.el == 'pre') {
                indent = this.peek().i + 2;
                break;
            }
        }
        this.indent(i-indent)
        this.out += str + '\n'
//        this.echo(i - indent,str)
    }

    ul(i,str) {
        if (typeof i == 'string') {
            str = i;
            i = 0;
          }
        this.now(i,'ul')
        this.now(i+2,'li')
        this.text(i+4,str);
        this.closeTo(i+2,'li')

    }

    ol(i,str) {
        if (typeof i == 'string') {
            str = i;
            i = 0;
          }
    
        this.now(i,'ol')
        this.now(i+2,'li')
        this.text(i+4,str);
        this.closeTo(i+2,'li')
//        this.out += '</li>\n'
//        this.echo(i+2,`<li>${this.text(str)}</li>`);
    }

    div(i,tag,attributes) {
        if (typeof i == 'string') {
            attributes = tag
            tag = i
            i=0
          }
            this.now(i,tag,attributes)
    }

    el(i,tag,attributes) {
        if (typeof i == 'string') {
            attributes = tag
            tag = i
            i=0
          }
        this.now(i,tag,attributes)
    }

    _el() {
        this.close();
    }

    comment(i,str) {
        if (typeof i == 'string') {
            str = i;
            i = 0;
          }
        this.indent(i);
        this.out += `<!-- ${str} -->\n`
//        this.echo(i,`<!-- ${str} -->`);
    }

    table(i) {
        this.now(i,'table')
    }

    thead(i) {
        this.now(i,'thead')
    }

    tbody(i) {
        this.now(i,'tbody')
    }

    tr(i) {
        this.now(i,'tr')
    }

    td(i,str,attrs) {
        if (typeof i == 'string') {
            attributes = tag
            tag = i
            i=0
          }
        this.now(i,'td',attrs);
        // this.indent(i)
        // this.out += `<td${ attrs==undefined?'': attrs}>`
        this.text(i+2,str)
        this.closeTo(i,'td')
        // this.out += '</td>\n'

//        this.echo(i,`<td${ attrs==undefined?'': attrs}>${this.text(str)}</td>`)
    }

    th(i,str,attrs) {
        if (typeof i == 'string') {
            attributes = tag
            tag = i
            i=0
          }
        this.now(i,'th',attrs)
        // this.indent(i)
        // this.out += `<th${ attrs==undefined?'': attrs}>`
        this.text(i+2,str)
        this.closeTo(i,'th')
//        this.out += '</th>\n'

//        this.echo(i,`<th${ attrs==undefined?'': attrs}>${this.text(str)}</th>`)
    }
    
    h1(i,str) {
        if (typeof i == 'string') {
            str = i;
            i = 0;
          }

        this.now(i,'h1')
//        this.indent(i+2)
        this.text(i+2,str)
        this.closeTo(i,'h1');
    }

    h2(i,str) {
        if (typeof i == 'string') {
            str = i;
            i = 0;
          }
        this.now(i,'h2')
//        this.indent(i+2)
        this.text(i+2,str)
        this.closeTo(i,'h2');
    }

    h3(i,str) {
        if (typeof i == 'string') {
            str = i;
            i = 0;
          }
        this.now(i,'h3')
//        this.indent(i+2)
        this.text(i+2,str)
        this.closeTo(i,'h3');
    }

    h4(i,str) {
        if (typeof i == 'string') {
            str = i;
            i = 0;
          }
        this.now(i,'h4')
//        this.indent(i+2)
        this.text(i+2,str)
        this.closeTo(i,'h4');
    }

    h5(i,str) {
        if (typeof i == 'string') {
            str = i;
            i = 0;
          }
        this.now(i,'h5')
//        this.indent(i+2)
        this.text(i+2,str)
        this.closeTo(i,'h5');
    }

    h6(i,str) {
        if (typeof i == 'string') {
            str = i;
            i = 0;
          }

        this.now(i,'h6')
//        this.indent(i+2)
        this.text(i+2,str)
        this.closeTo(i,'h6');

    }
    // writeln(str) {
    //     if (str) {
    //         this.out += "out.write(\"" + str + "\\n\");\n";
    //     } else {
    //         this.out += "out.write(\"\\n\");\n";
    //     }
    // }

    toString() {
//        console.log(this.scopes)
        while (this.scopes.length>1) {
            this.close();
        }

        if (this.footnotes.length > 0) {
            this.out += '<hr>\n'
            this.out += '<ol class="footnotes">\n'
            this.footnotes.forEach(fn => {
                this.out += `  <li>\n`
                this.out += `    <a name="#footnote-${fn[1]}">\n`
                this.text(6,fn[2])
                this.out += '    </a>\n'
                this.out += '  </li>\n'
            })
            this.out += '</ol>\n'
        }

        return this.out;
    }
}