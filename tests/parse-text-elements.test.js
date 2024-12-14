
import parseText from '../src/util/parse-text.js'

const lineElementsData = [
  ['blah [ link ] blah', [{ type: 'text', value: 'blah '},{type: 'link', ref: 'link', text: 'link' },{type:'text', value: ' blah'}]],
  ['blah [  ] blah', [{ type: 'text', value: 'blah [  ] blah'}]],
  ['blah @mention blah', [{ type: 'text', value: 'blah ' }, {type: 'mention', value: 'mention' },{type:'text', value: ' blah'}]],
  ['blah @ fred', [{ type: 'text', value: 'blah @ fred' }]],
  ['blah @', [{ type: 'text', value: 'blah @' }]],
  ['blah #tag blah', [{ type: 'text', value: 'blah ' }, {type: 'tag', name: 'tag', text: '#tag', args: 'true' },{type:'text', value: ' blah'}]],
  ['blah # tag blah', [{ type: 'text', value: 'blah # tag blah' }]],
  ['blah #', [{ type: 'text', value: 'blah #' }]],
  ['blah #tag(   )', [{ type: 'text', value: 'blah ' }, {type: 'tag', name: 'tag', text: '#tag(   )', args: 'true' }]],
  ['blah #tag( params', [{ type: 'text', value: 'blah ' }, {type: 'tag', name: 'tag', text: '#tag', args: 'true'},{type:'text', value: '( params'}]],
  ['blah #tag(1,2)', [{ type: 'text', value: 'blah ' }, {type: 'tag', name: 'tag', text: '#tag(1,2)', args: '1,2'}]],
  ['blah #tag(["a"])', [{ type: 'text', value: 'blah ' }, {type: 'tag', name: 'tag', text: '#tag(["a"])', args: '["a"]'}]],
  ['blah #!tag blah', [{ type: 'text', value: 'blah ' }, {type: 'include', name: 'tag', text: '#!tag', args: 'true' },{type:'text', value: ' blah'}]],
  ['blah #! tag blah', [{ type: 'text', value: 'blah #! tag blah' }]],
  ['blah #!', [{ type: 'text', value: 'blah #!' }]],
  ['blah #!tag(   )', [{ type: 'text', value: 'blah ' }, {type: 'include', name: 'tag', text: '#!tag(   )', args: 'true' }]],
  ['blah #!tag( params', [{ type: 'text', value: 'blah ' }, {type: 'include', name: 'tag', text: '#!tag', args: 'true'},{type:'text', value: '( params'}]],
  ['blah #!tag(1,2)', [{ type: 'text', value: 'blah ' }, {type: 'include', name: 'tag', text: '#!tag(1,2)', args: '1,2'}]],
  ['blah #!tag(["a"])', [{ type: 'text', value: 'blah ' }, {type: 'include', name: 'tag', text: '#!tag(["a"])', args: '["a"]'}]],
  ['blah #!tag.child blah', [{ type: 'text', value: 'blah ' }, {type: 'include', collection: 'tag', name: 'child', text: '#!tag.child', args: 'true' },{type:'text', value: ' blah'}]],
  ['blah #! tag.child blah', [{ type: 'text', value: 'blah #! tag.child blah' }]],
  ['blah #!', [{ type: 'text', value: 'blah #!' }]],
  ['blah #!.child', [{ type: 'text', value: 'blah #!.child' }]],
  ['blah #!tag.child(   )', [{ type: 'text', value: 'blah ' }, {type: 'include', collection: 'tag', name: 'child', text: '#!tag.child(   )', args: 'true' }]],
  ['blah #!tag.child( params', [{ type: 'text', value: 'blah ' }, {type: 'include', collection: 'tag', name: 'child', text: '#!tag.child', args: 'true'},{type:'text', value: '( params'}]],
  ['blah #!tag.child(1,2)', [{ type: 'text', value: 'blah ' }, {type: 'include', collection: 'tag', name: 'child', text: '#!tag.child(1,2)', args: '1,2'}]],
  ['blah #!tag.child(["a"])', [{ type: 'text', value: 'blah ' }, {type: 'include', name: 'child', collection: 'tag', args: '["a"]', text: '#!tag.child(["a"])'}]],
  ['blah #!tag.(   )', [{ type: 'text', value: 'blah ' }, {type: 'include', name: 'tag', text: '#!tag', args: 'true'},{type: 'text',value: '.(   )'}]],
  ['blah #!tag._( params', [{ type: 'text', value: 'blah ' }, {type: 'include', name: 'tag', text: '#!tag', args: 'true'},{type: 'text', value: '._( params'}]],
  ['blah #!tag.(1,2)', [{ type: 'text', value: 'blah ' }, {type: 'include', name: 'tag', text: '#!tag', args: 'true'},{type:'text',value: '.(1,2)'}]],
  ['blah #!tag.(["a"])', [{ type: 'text', value: 'blah ' }, {type: 'include', name: 'tag', text: '#!tag', args: 'true'},{ type: 'text', value: '.('},{type: 'link', ref: 'a', text: 'a'},{type: 'text', value: ')'}]],
]

describe("parse line elements test suite", () => {

  it.each(lineElementsData)("test '%s'",(text,expected) => {

    let out = parseText(text)
    expect(out).not.toBeNull()
    out.forEach(el => { delete el.$js})
    expect(out).toEqual(expected)

  })

})