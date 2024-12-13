
import parseEcma from './parse-ecma.js'
import quoted from '../util/quoted-string.js';
import util from 'util'
import {templateOrString} from '../util/str-to-esast.js'

let p = new parseEcma()

function program() {
    return {
        type: "Program",
        sourceType: 'module',
        start: 0,
        end: 0,
        body: []
    };
}

function literal(s) {
    return {
        type: "Literal",
        start: -1,
        end: -1,
        value: s,
        raw: s
      }
}

function id(s) {
    return {
        type: "Identifier",
        start: -1,
        end: -1,
        name: s
      }
}

function me(expr) {
    return {
        type: "MemberExpression",
        start: 0,
        end: 0,
        object: Array.isArray(expr[0]) ? me(expr[0]) : expr[0],
        property: expr[1],
        "computed": expr[1].type == "Literal",
        "optional": false
      }
}

function c(id,_init) {
    return {
        type: "VariableDeclaration",
        start: 0,
        end: 0,
        declarations: [{
            type: "VariableDeclarator",
            start: 0,
            end: 0,
            id: {
                type: "Identifier",
                start: 0,
                end: 0,
                name: id
            },
            init: me(_init)
        }],
        "kind": "const"
    }
}

function inlineTag(tag) {
    return {
        "type": "CallExpression",
        "callee": {
            "type": "ArrowFunctionExpression",
            "id": null,
            "expression": false,
            "generator": false,
            "async": false,
            "params": [],
            "body": {
                "type": "BlockStatement",
                "body": [{
                    "type": "ReturnStatement",
                    "argument": {
                        "type": "ExpressionStatement",
                        "expression": {
                          "type": "CallExpression",
                          "callee": {
                            "type": "MemberExpression",
                            "object": {
                              "type": "ThisExpression",
                            },
                            "property": {
                              "type": "Identifier",
                              "name": "inlineTag"
                            },
                            "computed": false,
                            "optional": false
                          },
                          "arguments": [{
                              "type": "ObjectExpression",
                              "properties": props(tag)//[
    //                            prop(id('type'),literal('"tag"')),
                            //     prop(id('name'),literal(quoted(tag.name))),
                            //     prop(id('value'),p.parser(`${tag.value}`).body[0].expression) ////////////////////////////////////////
                            //   ]//props(tag)
                          }],
                          "optional": false
                        }
                    },
                }]
            }},
            "arguments": [],
            "optional": false
    }
}

function inlineInclude(o) {
    return {
        "type": "CallExpression",
        "callee": {
            "type": "ArrowFunctionExpression",
            "id": null,
            "expression": false,
            "generator": false,
            "async": false,
            "params": [],
            "body": {
                "type": "BlockStatement",
                "body": [{
                    "type": "ReturnStatement",
                    "argument": {
                        "type": "ExpressionStatement",
                        "expression": {
                          "type": "CallExpression",
                          "callee": {
                            "type": "MemberExpression",
                            "object": {
                              "type": "ThisExpression",
                            },
                            "property": {
                              "type": "Identifier",
                              "name": "inlineInclude"
                            },
                            "computed": false,
                            "optional": false
                          },
                          "arguments": [{
                              "type": "ObjectExpression",
                              "properties": props(o)//[
                            //     prop(id('type'),literal('"tag"')),
                            //     prop(id('name'),literal(quoted(o.name))),
                            //     prop(id('value'),p.parser(`${o.value}`).body[0].expression) ////////////////////////////////////////
                            //   ]//props(tag)
                          }],
                          "optional": false
                        }
                    },
                }]
            }},
            "arguments": [],
            "optional": false
    }
}

function inlineMention(o) {
    return {
        "type": "CallExpression",
        "callee": {
            "type": "ArrowFunctionExpression",
            "id": null,
            "expression": false,
            "generator": false,
            "async": false,
            "params": [],
            "body": {
                "type": "BlockStatement",
                "body": [{
                    "type": "ReturnStatement",
                    "argument": {
                        "type": "ExpressionStatement",
                        "expression": {
                          "type": "CallExpression",
                          "callee": {
                            "type": "MemberExpression",
                            "object": {
                              "type": "ThisExpression",
                            },
                            "property": {
                              "type": "Identifier",
                              "name": "inlineMention"
                            },
                            "computed": false,
                            "optional": false
                          },
                          "arguments": [{
                              "type": "ObjectExpression",
                              "properties": props(o)//[
                                // prop(id('type'),literal('"tag"')),
                                // prop(id('name'),literal(quoted(o.value))),
                                // prop(id('value'),p.parser(`${o.value}`).body[0].expression) ////////////////////////////////////////
                            //   ]//props(tag)
                          }],
                          "optional": false
                        }
                    }
                }]
            }},
            "arguments": [],
            "optional": false
    }
}

function object(o) {

    if (o.type && o.type=='tag') {
        return inlineTag(o)
    } else if (o.type && o.type=='include') {
        return inlineInclude(o)
    } else if (o.type && o.type=='mention') {
        return inlineMention(o)
    } else if (o.type && o.type=='text') {

        return {
            type: "ObjectExpression",
            start: 0,
            end: 0,
            properties: [{
                type: "Property",
                start: 0,
                end: 0,
                method: false,
                shorthand: false,
                computed: false,
                key: id('type'),
                value: literal('"text"'),
                kind: "init"
            },{
                type: "Property",
                start: 0,
                end: 0,
                method: false,
                shorthand: false,
                computed: false,
                key: id('value'),
                value: templateOrString(o.value),
                kind: "init"
            }]
        };

    } else {
        return {
            type: "ObjectExpression",
            properties: props(o)
        };
    }
}

function array(a) {
    return {
        type: "ArrayExpression",
        elements: a.map((x) => value(x))
    }
}

function value(o) {
    if (o === null) {
        return literal('null')
    } else if (Array.isArray(o)) {
        return array(o)
    } else if (typeof o === 'object') {
        return object(o)
    } else if (typeof o === 'string') {
        return literal(quoted(o))
    } else {
        return literal(o)
    }
}

function prop(k,v) {
    return {
        type: "Property",
        method: false,
        shorthand: false,
        computed: false,
        key: k,
        value: v,
        kind: "init"
    }

}
function props(o) {
    return Object.keys(o).map((k) => {
        if (k=='$js') {
            // console.log(o[k])
            return prop(id(k),o[k])
        } else {
            return prop(id(k),value(o[k]))
        }
        // return {
        //     type: "Property",
        //     start: 0,
        //     end: 0,
        //     method: false,
        //     shorthand: false,
        //     computed: false,
        //     key: id(k),
        //     value: value(o[k]),
        //     kind: "init"
        // }
    })
}

function funcCall(name,param) {
    return {
        type: "ExpressionStatement",
        expression: {
            type: "CallExpression",
            callee: id(name),
            arguments: [object(param)]
        }
    }
}

function callAppendToDoc(line) {
    return funcCall('this.appendToDoc',line)
}

function callMaybeYaml(line) {
    // line.value is already ecma ast
    const value = line.value
    delete line.value
    const call = funcCall('this.maybeYaml',line)
    call.expression.arguments[0].properties.push(prop(id('value'),value))
    return call
}

function template(str) {
    return {
        type: 'TemplateLiteral',
        expressions: {},
        quasis: [{
            type: 'TemplateElement',
            value: { raw: str, cooked: str },
            tail: true,
        }]
    }
}

function anon_function(lines) {

    const funcCall = {
        "type": "FunctionExpression",
        "id": null,
        "expression": false,
        "generator": false,
        "async": false,
        "params": [],
        "body": {
            "type": "BlockStatement",
            "body": []
        }
    }

    lines.forEach(line => {
        funcCall.body.body.push(this_addLine(line))
    });

    return funcCall
}

function this_addLine(line) {

    return {
        "type": "ExpressionStatement",
        "expression": {
            "type": "CallExpression",
            "callee": {
                "type": "MemberExpression",
                "object": {
                    "type": "ThisExpression",
                },
                "property": {
                    "type": "Identifier",
                    "name": "addLine"
                },
                "computed": false,
                "optional": false
            },
            "arguments": [{
                "type": "ObjectExpression",
                "properties": Object.keys(line)
                    .map(k => k=='$js'?prop(id('value'),line[k]):prop(id(k),value(line[k])))
            }],
            "optional": false
        }
      }
}

export default function resqrmToEsast(options = {}) {

    return (root,file) => {
        const prog = program()

        for (let child of root.children) {
            if (child.type == "script-line") {
                prog.body.push(p.parser(child.code).body[0])
            } else {
                prog.body.push(this_addLine(child))
            }
        }

        return prog
    }

};