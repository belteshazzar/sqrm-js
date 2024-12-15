
import testRunner from "./data-test-runner"

testRunner('tags',[
    {
        name: 'tag no params',
        sqrm: `inline #tag`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        // statements: 1,
        html: `<p>inline <a href="/tags/tag">#tag</a></p>`,
        json: { tag : true }
    },
    {
        name: 'tag int param',
        sqrm: `inline2 #tag(1)`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        // statements: 1,
        html: `<p>inline2 <a href="/tags/tag?args=%5B1%5D">#tag(1)</a></p>`,
        json: { tag : 1 }
    },
    {
        name: 'tag 2 param with javascript',
        sqrm: `inline3 #tag(1,Math.PI)`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        // statements: 1,
        html: `<p>inline3 <a href="/tags/tag?args=%5B1%2C3.141592653589793%5D">#tag(1,Math.PI)</a></p>`,
        json: { tag : [1,Math.PI] }
    },
    {
        name: 'tag array param',
        sqrm: `inline4 #tag(['a','b'])`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        // statements: 1,
        html: `<p>inline4 <a href="/tags/tag?args=%5B%5B%22a%22%2C%22b%22%5D%5D">#tag(['a','b'])</a></p>`,
        json: { tag : ['a','b'] }
    },
    {
        name: 'complex tag yaml text template',
        sqrm: `
=== fredy
  \t
  text with a #tag
a: 5
  was ~~here~~ !!woot!! but a = \${this.json.a} __yes?__   
`,
        ilines: 7,
        slines: 7,
        docs: 1,
        'sxast-children': 7,
        // statements: 7,
        html: `<h3>fredy</h3><div><p>text with a <a href="/tags/tag">#tag</a></p><p>was <i>here</i> <b>woot</b> but a = 5 <u>yes?</u></p></div>`,
        json: { a : 5, tag: true }
    },
])
