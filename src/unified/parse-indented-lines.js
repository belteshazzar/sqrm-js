

export default function parseIndentedLines(options = { indentation: 2 }) {
    const self = this
    self.parser = parser
    self.options = { ...options }
    self.options.indentation = options.indentation || 2
  
    function parser(doc,vfile) {

        const root = {
            type: 'ilines',
            children: [],
            // position: {
            //     start: { line: 1, column: 1, offset: 0 },
            //     end: { line: -1, column: -1, offset: doc.length }
            // }
        };

        const l = doc.length
        let i = 0;
        let j = 0;
        let n = 1;
    
        let atLineStart = true
        let indent = 0
    
        function addLine(split) {
            const ilineIndent = Math.floor(indent/self.options.indentation)
            root.children.push({
                type: 'iline',
                indent: ilineIndent,
                value: doc.substring(i+ilineIndent*self.options.indentation,j),
                // position: {
                //     start: { line: n, column: indent+1, offset: i+indent },
                //     end: { line: n, column: j-i+1, offset: j }    
                // },
                // children: [{
                //     type: 'text',
                //     position: {
                //     }
                // }]
            })

            ++n
            atLineStart = true
            indent = 0
            i = j + split;
            j = i
        }
    
        while (j<l) {
    
            const s = doc[j]
            if (atLineStart) {
                if (s==' ') {
                    ++indent
                } else {
                    atLineStart = false
                }
            }
            if (s=='\r') {
                if (j+1<l && doc[j+1]=='\n') {
                    addLine(2)
                } else {
                    j++
                }
            } else if (s=='\n') {
                addLine(1)
            } else {
                ++j
            }
        }
        addLine(0)

        // root.position.end.line = n-1
        // root.position.end.column = j-i+1

        return root;
    }
}
