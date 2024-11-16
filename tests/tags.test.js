
import testRunner from "./data-test-runner"

testRunner('tags',[
    {
        name: 'tag no params',
        sqrm: `inline #tag`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '<p>inline <a href=\"#\" data-sqrm-type=\"tag\" data-sqrm-value=\"[true]\" onclick=\"sqrmCB(this)\">#tag</a></p>',
        json: { tag : true }
    },
    {
        name: 'tag int param',
        sqrm: `inline2 #tag(1)`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '<p>inline2 <a href="#" data-sqrm-type="tag" data-sqrm-value="[1]" onclick="sqrmCB(this)">#tag(1)</a></p>',
        json: { tag : 1 }
    },
    {
        name: 'tag 2 param with javascript',
        sqrm: `inline3 #tag(1,Math.PI)`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '<p>inline3 <a href=\"#\" data-sqrm-type=\"tag\" data-sqrm-value=\"[1,3.141592653589793]\" onclick=\"sqrmCB(this)\">#tag(1,Math.PI)</a></p>',
        json: { tag : [1,Math.PI] }
    },
    {
        name: 'tag array param',
        sqrm: `inline4 #tag(['a','b'])`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '<p>inline4 <a href=\"#\" data-sqrm-type=\"tag\" data-sqrm-value=\"[[&#x22;a&#x22;,&#x22;b&#x22;]]\" onclick=\"sqrmCB(this)\">#tag([\'a\',\'b\'])</a></p>',
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
        statements: 7,
        html: '<h3>fredy</h3><div><p>text with a <a href=\"#\" data-sqrm-type=\"tag\" data-sqrm-value=\"[true]\" onclick=\"sqrmCB(this)\">#tag</a></p><p>was <i>here</i> <b>woot</b> but a = 5 <u>yes?</u></p></div>',
        json: { a : 5, tag: true }
    },
])
