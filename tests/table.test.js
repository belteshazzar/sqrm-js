
import testRunner from "./data-test-runner"

testRunner('simple table',[
    {
        name: 'simplest table',
        sqrm: '| table |',
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '<table><tbody><tr><td>table</td></tr></tbody></table>',
        json: {}
    },
    {
        name: 'following table',
        sqrm: 'woot\n| table |',
        ilines: 2,
        slines: 2,
        docs: 1,
        'sxast-children': 2,
        statements: 2,
        html: '<p>woot</p><table><tbody><tr><td>table</td></tr></tbody></table>',
        json: {}
    },
    {
        name: 'basic table',
        sqrm: '| a | b |\n| c | d |',
        ilines: 2,
        slines: 2,
        docs: 1,
        'sxast-children': 2,
        statements: 2,
        html: '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>',
        json: {}
    },
    {
        name: 'table with header',
        sqrm: '| h1 | h2 |\n|---|\n| c1 | c2 |',
        ilines: 3,
        slines: 3,
        docs: 1,
        'sxast-children': 3,
        statements: 3,
        html: '<table><thead><tr><th>h1</th><th>h2</th></tr></thead><tbody><tr><td>c1</td><td>c2</td></tr></tbody></table>',
        json: {}
    },
    {
        name: 'table with header and footer',
        sqrm: '| h1 | h2 |\n|---|\n| c1 | c2 |\n|---|----|\n| f1 | f2 |',
        ilines: 5,
        slines: 5,
        docs: 1,
        'sxast-children': 5,
        statements: 5,
        html: '<table><thead><tr><th>h1</th><th>h2</th></tr></thead><tbody><tr><td>c1</td><td>c2</td></tr></tbody><tfoot><tr><td>f1</td><td>f2</td></tr></tfoot></table>',
        json: {}
    },
])
