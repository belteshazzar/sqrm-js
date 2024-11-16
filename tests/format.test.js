
import testRunner from "./data-test-runner"

testRunner('simple formatting',[
    {
        name: 'one word',
        sqrm: 'woot',
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '<p>woot</p>',
        json: {}
    },
    {
        name: 'bold',
        sqrm: 'woot **bold**',
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '<p>woot <b>bold</b></p>',
        json: {}
    },
    {
        name: 'underline',
        sqrm: 'woot ___underlined',
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '<p>woot <u>underlined</u></p>',
        json: {}
    },
    {
        name: 'format bold',
        sqrm: '  w !!test!! here ',
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '<div><p>w <b>test</b> here</p></div>',
        json: {}
    },
    {
        name: 'heading and formatting',
        sqrm: `
=== fred
   \t
  was ~~here~~ !!woot!! __yes?__   `,
        ilines: 4,
        slines: 4,
        docs: 1,
        'sxast-children': 4,
        statements: 4,
        html: '<h3>fred</h3><div><p>was <i>here</i> <b>woot</b> <u>yes?</u></p></div>',
        json: {}
    },
])
