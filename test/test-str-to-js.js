import {expect} from 'chai';

import strToJson from '../src/str-to-js.js'

describe("unit-test", function() {

    function testParams(str,res,pre = '') {
        const code = strToJson(str)
        const fn = new Function((pre != '' ? pre+';' : '')+'return (function() { return Array.from(arguments); }).apply(null,'+code+')' )
        expect(fn).to.not.be.null
        const r = fn()
        expect(r).to.deep.equal(res)
    }
    
    describe("str-to-js args", function() {

        it('number', () => testParams('4.3',[4.3]))

        it('numbers', () => testParams(`4.2,1.2`,[4.2,1.2]))

        it('string', () => testParams(`"fred"`,["fred"]))

        it('strings', () => testParams(`"fred",'steve'`,["fred",'steve']))

        it('template', () => testParams('`fred`',['fred']))

        it('template-i', () => testParams('`fred=${i}`',['`fred=${i}`']))

        it('template-i=3', () => testParams('`fred=${i}`',['fred=3'],'let i=3'))

        it('templates', () => testParams('`i=${i}`,`j=${j}`',['`i=${i}`,`j=${j}`']))

        it('templates,i=3', () => testParams('`i=${i}`,`j=${j}`',['`i=${i}`,`j=${j}`'],'let i=3'))

        it('templates,i=3,j=2', () => testParams('`i=${i}`,`j=${j}`',['i=3','j=2'],'let i=3,j=2'))

        it('invalid number', () => testParams(`4.e`,["4.e"]))

        it('identifier not found', () => testParams(`a`,[`a`]))

        it('identifiers not found', () => testParams(`a,b`,["a,b"]))

        it('number', function() {
            expect(() => strToJson(`4.e`,true)).to.throw(`Invalid number (1:1)`)
        })

        it('invalid brackets', function() {
            expect(() => strToJson(`a,")`,true)).to.throw(`Unterminated string constant (1:3)`)
        })

    })

    function testProp(str,res,pre='') {
        const code = strToJson(str)
        const fn = new Function((pre != '' ? pre+';' : '')+'return { prop: (function() { return Array.from(arguments); }).apply(null,'+code+')[0] }' )
        expect(fn).to.not.be.null
        const r = fn()
        expect(r).to.not.be.null
        expect(r.prop).to.deep.equal(res)
    }
    
    describe("str-to-js prop", function() {

        it('number', () => testProp('4.3',4.3))
        it('array', () => testProp('[ 1,2,3 ]',[1,2,3]))
        it('object', () => testProp('{ a: 3, b: 5, c: [1,2]}',{ a: 3, b: 5, c: [1,2]}))
        it('quoted string', () => testProp('"fred"',"fred"))
        it('ticked string', () => testProp('`fred`',"fred"))
        it('ticked string w/func call', () => testProp('`${Math.PI}`',"3.141592653589793"))
        it('single quoted string', () => testProp("'fred'","fred"))
        it('func call', () => testProp('Math.PI',Math.PI))
        it('funcion', () => testProp('(()=> { return { pi: Math.PI } })()',{pi:Math.PI}))

    })
})
