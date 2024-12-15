
import testRunner from "./data-test-runner"

testRunner('headings',[
    {
        name: 'heading level 01',
        sqrm: `= head\n`,
        ilines: 2,
        slines: 2,
        docs: 1,
        'sxast-children': 2,
//        statements: 2,
        html: '<h1>head</h1>',
        json: {}
    },
    {
        name: 'heading level 02',
        sqrm: '== head\n',
        ilines: 2,
        slines: 2,
        docs: 1,
        'sxast-children': 2,
//        statements: 2,
        html: '<h2>head</h2>',
        json: {}
    },
    {
        name: 'heading 03',
        sqrm: '  === head\n',
        ilines: 2,
        slines: 2,
        docs: 1,
        'sxast-children': 2,
        // statements: 2, 
        html: '<div><h3>head</h3></div>',
        json: {},
    },
    {
        name: 'heading 04',
        sqrm: '= head\r\ning',
        ilines: 2,
        slines: 2,
        docs: 1,
        'sxast-children': 2,
        // statements: 2,
        html: '<h1>head</h1><p>ing</p>',
        json: {},
    },
    {
        name: 'heading 05',
        sqrm: '= head\r\ning\nand some more\n',
        ilines: 4,
        slines: 4,
        docs: 1,
        'sxast-children': 4,
        // statements: 4,
        html: '<h1>head</h1><p>ing\nand some more</p>',
        json: {},
    },
    {
        name: 'heading 06',
        sqrm: '= head\r\n\r\ning',
        ilines: 3,
        slines: 3,
        docs: 1,
        'sxast-children': 3,
        // statements: 3,
        html: '<h1>head</h1><p>ing</p>',
        json: {}
    },
    {
        name: 'heading 07',
        sqrm: '= head\r',
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        // statements: 1,
        html: '<h1>head</h1>',
        json: {},
    },
    {
        name: 'heading 08',
        sqrm: '= head\r\n',
        ilines: 2,
        slines: 2,
        docs: 1,
        'sxast-children': 2,
        // statements: 2,
        html: '<h1>head</h1>',
        json: {}
    },
    {
        name: 'heading 09',
        sqrm: '= head\ning',
        ilines: 2,
        slines: 2,
        docs: 1,
        'sxast-children': 2,
        // statements: 2,
        html: '<h1>head</h1><p>ing</p>',
        json: {},
    },
    {
        name: 'heading 10',
        sqrm: '= head\n',
        ilines: 2,
        slines: 2,
        docs: 1,
        'sxast-children': 2,
        // statements: 2,
        html: '<h1>head</h1>',
        json: {},
    },
    {
        name: 'heading 11',
        sqrm: '\n  == heading ============================ \ntext',
        ilines: 3,
        slines: 3,
        docs: 1,
        'sxast-children': 3,
        // statements: 3,
        html: '<div><h2>heading</h2></div><p>text</p>',
        json: {}
    },
    {
        name: 'heading 11a',
        sqrm: '\n  == heading ---------------------------- \ntext',
        ilines: 3,
        slines: 3,
        docs: 1,
        'sxast-children': 3,
        // statements: 3,
        html: '<div><h2>heading</h2></div><p>text</p>',
        json: {}
    },
    {
        name: 'heading 12',
        sqrm: '\n  == heading ============================ \n\ntext',
        ilines: 4,
        slines: 4,
        docs: 1,
        'sxast-children': 4,
        // statements: 4,
        html: '<div><h2>heading</h2></div><p>text</p>',
        json: {}
    },
    {
        name: 'heading 13',
        sqrm: '\n  = heading\n\ntext',
        ilines: 4,
        slines: 4,
        docs: 1,
        'sxast-children': 4,
        // statements: 4,
        html: '<div><h1>heading</h1></div><p>text</p>',
        json: {}
    },
    {
        name: 'heading 14',
        sqrm: '\n=\n\n',
        ilines: 4,
        slines: 4,
        docs: 1,
        'sxast-children': 4,
        // statements: 4,
        html: '<hr>',
        json: {}
    },
    {
        name: 'heading 15',
        sqrm: '= heading \ncontinued =======',
        ilines: 2,
        slines: 2,
        docs: 1,
        'sxast-children': 2,
        // statements: 2,
        html: '<h1>heading</h1><p>continued =======</p>',
        json: {}
    },
    {
        name: 'heading 16',
        sqrm: '= heading \n  indented',
        ilines: 2,
        slines: 2,
        docs: 1,
        'sxast-children': 2,
        // statements: 2,
        html: '<h1>heading</h1><div><p>indented</p></div>',
        json: {}
    }
])