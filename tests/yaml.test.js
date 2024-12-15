
import testRunner from "./data-test-runner"

testRunner('simple yaml',[
    {
        name: 'yaml int',
        sqrm: `a: 3`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '',
        json: { a: 3 }
    },
    {
        name: 'yaml float',
        sqrm: `a: 4.5`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '',
        json: { a: 4.5 }
    },
    {
        name: 'yaml unquoted string',
        sqrm: `a: fred`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '',
        json: { a: "fred" }
    },
    {
        name: 'yaml quoted string',
        sqrm: `a: "fred"`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '',
        json: { a: "fred" }
    },
    {
        name: 'yaml single quote string',
        sqrm: `a: 'fred'`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '',
        json: { a: "fred" }
    },
    {
        name: 'yaml template string',
        sqrm: `a: \`fred\``,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '',
        json: { a: "fred" }
    },
    {
        name: 'yaml false',
        sqrm: `a: false`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '',
        json: { a: false }
    },
    {
        name: 'yaml math',
        sqrm: `a: 6 * 4`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '',
        json: { a: 24 }
    },
    {
        name: 'yaml math ref',
        sqrm: `a: this.json.x + 4`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '',
        json: { a: 4 }
    },
    {
        name: 'yaml template string',
        sqrm: `a: \`a string with a value \${this.json.b} \``,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '',
        json: { a: 'a string with a value null ' }
    },
    {
        name: 'yaml implicit template string',
        sqrm: `a: a string with a value \${this.json.b} `,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '',
        json: { a: 'a string with a value null' }
    },
    {
        name: 'yaml invalid javascript to string',
        sqrm: `a: something random + 4`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '',
        json: { a: 'something random + 4' }
    },
    {
        name: 'yaml invalid javascript to string 2',
        sqrm: `a: not + allowed`,
        ilines: 1,
        slines: 1,
        docs: 1,
        'sxast-children': 1,
        statements: 1,
        html: '',
        json: { a: 'not + allowed' }
    },
])
