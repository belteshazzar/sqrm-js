
import testRunner from "./data-test-runner"

testRunner('divs',[
    {
        name: 'single',
        sqrm: `<div`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        // statements: 1,
        html: '<div></div>',
        json: {}
    },
    {
        name: 'nested',
        sqrm: `<div\n  nested`,
        ilines: 2,
        slines: 2,
        docs: 1,
        'sxast-children': 2,
        // statements: 2,
        html: '<div><p>nested</p></div>',
        json: {}
    },
    {
        name: 'html table',
        sqrm: `<table\n  <tr\n    <td\n      cell`,
        ilines: 4,
        slines: 4,
        docs: 1,
        'sxast-children': 4,
        // statements: 4,
        html: '<table><tr><td><p>cell</p></td></tr></table>',
        json: {}
    },
    {
        name: 'pop',
        sqrm: `<ol\n  <li\n    one\n  <li\n    two\n<ul\n  <li\n    woot`,
        ilines: 8,
        slines: 8,
        docs: 1,
        'sxast-children': 8,
        // statements: 8,
        html: '<ol><li>one</li><li>two</li></ol><ul><li>woot</li></ul>',
        json: {}
    },
    {
        name: 'lists',
        sqrm: `- one\n- 3.4`,
        ilines: 2,
        slines: 2,
        docs: 1,
        'sxast-children': 2,
        // statements: 2,
        html: '<ul><li>one</li><li>3.4</li></ul>',
        json: {}
    },
])
