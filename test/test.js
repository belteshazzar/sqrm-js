
// TODO: yaml docs from https://www.cloudbees.com/blog/yaml-tutorial-everything-you-need-get-started

import {expect} from 'chai';

import * as fs from 'fs'//const fs = require("fs");

//import JSON5 from 'json5'
import {h} from 'hastscript'
//import {t} from '../src/hastscript-tools.js'
import sqrm from '../src/sqrm.js'
import SqrmDB from '../src/SqrmDB.js'

class TestSqrmDB extends SqrmDB {

  constructor(settings) {
    super(settings)
  }

  find(collection,select,filter,skip,count) {
    return [{
      execute : (req,res) => {
        res.libs.appendToHtml({type: 'paragraph', indent: 0, children: [this.settings.includeCallback(collection,select,req.args)] })
      }
    }]
  }

}

function test(name,source,expectedHtml,expectedJson={},includeCallback) {
    
    it(name+"", function() {

        const db = new TestSqrmDB({
            includeCallback: includeCallback,
            log_src: process.env.npm_config_src,
            log_lines: process.env.npm_config_lines,
            log_sxast: process.env.npm_config_sxast,
            log_code: process.env.npm_config_code,

            log_sast: process.env.npm_config_sast,
            log_hast: process.env.npm_config_hast,
            log_html: process.env.npm_config_html,
            log_jast: process.env.npm_config_jast,
            log_json: process.env.npm_config_json,
        })

        const result = sqrm(source,db)

        let html,json

        if (result.docs !== undefined && Array.isArray(result.docs)) {

            html = ''
            json = []

            result.docs.forEach((el) => {
                html += el.html
                json.push(el.json)
            })

        } else {
            html = result.html
            json = result.json
        }

        expect(json).to.eql(expectedJson)
        expect(html).to.eql(expectedHtml);
    })
}

describe("Non-file based tests", function() {

    describe("Escaping", function() {

        test("escape characters",
            'fred & barry ( 1 < 3 || 4 > 4 \\ woot)',
            '<div class="p">fred &#x26; barry ( 1 &#x3C; 3 || 4 > 4 \\ woot)</div>',
            {});
    });

    describe("Headings", function() {

        test('heading 1',
            '= head\n',
            '<h1>head</h1>',
            {})

        test('heading 2',
            '== head\n',
            '<h2>head</h2>',
            {});

        test('heading 3',
            '  === head\n',
            '<div><h3>head</h3></div>',
            {})

        test("heading 4",
            '= head\r\ning',
            '<h1>head</h1><div class="p">ing</div>',
            {})

        test("heading 5",
            '= head\r\ning\nand some more\n',
            '<h1>head</h1><div class="p">ing\nand some more</div>',
            {})

        test("heading 6", 
            '= head\r\n\r\ning',
            '<h1>head</h1><div class="p">ing</div>',
            {})

        test("heading 7",
            '= head\r',
            '<h1>head</h1>',
            {})

        test("heading 8",
            '= head\r\n',
            '<h1>head</h1>',
            {})

        test("heading 9",
            '= head\ning',
            '<h1>head</h1><div class="p">ing</div>',
            {})

        test("heading 10", 
            '= head\n',
            '<h1>head</h1>',
            {})

        test("heading 11",
            '\n  == heading ============================ \ntext',
            '<div><h2>heading</h2></div><div class="p">text</div>',
            {})

        test("heading 11a", 
            '\n  == heading ---------------------------- \ntext',
            '<div><h2>heading</h2></div><div class="p">text</div>',
            {})

        test("heading 12",
            '\n  == heading ============================ \n\ntext',
            '<div><h2>heading</h2></div><div class="p">text</div>',
            {})

        test("heading 13", 
            '\n  = heading\n\ntext',
            '<div><h1>heading</h1></div><div class="p">text</div>',
            {})

        test("heading 14", 
            '\n=\n\n',
            '<hr>',
            {})

        test("heading 15",
            '= heading \ncontinued =======',
            '<h1>heading</h1><div class="p">continued =======</div>',
            {})

        test("heading 16",
            '= heading \n  indented',
            '<h1>heading</h1><div><div class="p">indented</div></div>',
            {})
    });

    describe("paragraphs", function() {

        test("paragraphs 1",
            'a',
            '<div class="p">a</div>',
            {})

        test("paragraphs 2",
            'a\nb\n',
            '<div class="p">a\nb</div>',
            {})

        test("paragraphs 3",
            'a\nb\n',
            '<div class="p">a\nb</div>',
            {})

        test("paragraphs 4",
            'a\nb\n\nc\n',
            '<div class="p">a\nb</div><div class="p">c</div>',
            {})

        test("paragraphs 5",
            '!!a\nb\n\nc\n',
            '<div class="p"><b>a\nb</b></div><div class="p">c</div>',
            {})

        test("paragraphs 6",
            'a!!\nb!!c\nd\n\nc\n',
            '<div class="p">a<b>\nb</b>c\nd</div><div class="p">c</div>',
            {})

        test("paragraphs 7",
            'a #tag(1,\n"b") c\nd\n\nc\n',
            '<div class="p">a <a href="/tags/tag">#tag(1,\n"b")</a> c\nd</div><div class="p">c</div>',
            {tag: [1,'b']})
    });

    describe('indenting',function() {

        test("pre indenting",
            '<pre\n   | leading space',
            '<pre>\n | leading space\n</pre>',
            {})

        test("pre code indenting",
            '<pre\n  <code\n     | leading space',
            '<pre>\n<code>\n | leading space\n</code>\n</pre>',
            {})

        test("script indenting",
            '<script\n    2 leading spaces',
            '<script>\n  2 leading spaces\n</script>',
            {})

        test("style indenting",
            '<style\n    2 leading spaces',
            '<style>\n  2 leading spaces\n</style>',
            {})

        test("alert indenting",
            '```warning\n    2 leading spaces',
            '<div class="alert-warning">  2 leading spaces</div>',
            {})

        test("code block indenting",
            '```javascript\n    2 leading spaces',
            '<pre><code class="language-javascript">\n  2 leading spaces\n</code></pre>',
            {})
    });

    describe("lists", function() {

        test("lists 1",
            '- a b\n  c d\n- e f\n\n',
            '<ul><li>a b\nc d</li><li>e f</li></ul>',
            {})

        test("lists 2",
            'i: 3\n- v : ${json.i}\n',
            '<ul><li>v : 3</li></ul>',
            {i: 3 })

        test("lists 3",
            'i: 3\nvs:\n- v : json.i\n',
            '',
            { i: 3, vs: [ {v: 3 }]})
    })

    describe("formatting", function() {

        test('formatting 1','a !! b !! c','<div class="p">a <b> b </b> c</div>')
        test('formatting 1a','a!!b!!c','<div class="p">a<b>b</b>c</div>')
        test('formatting 2','a ** b ** c','<div class="p">a <b> b </b> c</div>')
        test('formatting 3','a ~~ b ~~ c','<div class="p">a <i> b </i> c</div>')
        test('formatting 4','a // b // c','<div class="p">a <i> b </i> c</div>')
        test('formatting 5','a -- b -- c','<div class="p">a <del> b </del> c</div>')
        test('formatting 6','a __ b __ c','<div class="p">a <u> b </u> c</div>')
        test('formatting 7','a `` b `` c','<div class="p">a <code> b </code> c</div>')
        test('formatting 8','a ^^ b ^^ c','<div class="p">a <sup> b </sup> c</div>')
        
        test('formatting 9','a !! b c','<div class="p">a <b> b c</b></div>')
        test('formatting 10','a ** b c','<div class="p">a <b> b c</b></div>')
        test('formatting 11','a ~~ b c','<div class="p">a <i> b c</i></div>')
        test('formatting 12','a // b c','<div class="p">a <i> b c</i></div>')
        test('formatting 13','a -- b c','<div class="p">a <del> b c</del></div>')
        test('formatting 14','a __ b c','<div class="p">a <u> b c</u></div>')
        test('formatting 15','a `` b c','<div class="p">a <code> b c</code></div>')
        test('formatting 16','a ^^ b c','<div class="p">a <sup> b c</sup></div>')

        test('formatting 17','a \\!! b c','<div class="p">a !! b c</div>')
        test('formatting 18','a \\** b c','<div class="p">a ** b c</div>')
        test('formatting 19','a \\~~ b c','<div class="p">a ~~ b c</div>')
        test('formatting 20','a \\// b c','<div class="p">a // b c</div>')
        test('formatting 21','a \\-- b c','<div class="p">a -- b c</div>')
        test('formatting 22','a \\__ b c','<div class="p">a __ b c</div>')
        test('formatting 23','a \\`` b c','<div class="p">a `` b c</div>')
        test('formatting 24','a \\^^ b c','<div class="p">a 😊 b c</div>')
        
        test('formatting 25','a ^^ b __ c -- !! d !! e','<div class="p">a <sup> b <u> c <del> <b> d </b> e</del></u></sup></div>')
        
        test('formatting after template 1','v: 3\nthe value is **${json.v}** and not bold','<div class="p">the value is <b>3</b> and not bold</div>',{v: 3})
        test('formatting after template 2','v: 3\nthe value is **${json.v}','<div class="p">the value is <b>3</b></div>',{v: 3})
        test('formatting after template 3','v: 3\nthe value is **${json.v + "}" }','<div class="p">the value is <b>3}</b></div>',{v: 3})
        test('formatting after template 4','v: 3\nthe value is **${ "}**" }','<div class="p">the value is <b>}**</b></div>',{v: 3})
        test('formatting after template 5','v: 3\nthe value is **${ \'}**\' }','<div class="p">the value is <b>}**</b></div>',{v: 3})

        test('formatting invalid template 1','${','<div class="p">${</div>')
        test('formatting invalid template 2','$','<div class="p">$</div>')
        test('formatting invalid template 3','${ "fred}','<div class="p">${ "fred}</div>')
        test('formatting invalid template 4','${ 4 + 3" ','<div class="p">${ 4 + 3"</div>')
        test('formatting invalid template 5','${ \'} " ','<div class="p">${ \'} "</div>')

        test('formatting template with html','${ "<b>bold</b>" }','<div class="p">&#x3C;b>bold&#x3C;/b></div>',)

    });

    describe("html entities", function() {

        test('entities - markdown',
            '&nbsp; & &amp; &copy; &AElig; &Dcaron; &frac34; &HilbertSpace; &DifferentialD; &ClockwiseContourIntegral; &ngE;',
            '<div class="p">\xa0 &#x26; &#x26; © Æ Ď ¾ ℋ ⅆ ∲ ≧̸</div>')
        test('entities - special',
            '& © Æ Ď ¾ ℋ ⅆ ∲ ≧̸',
            '<div class="p">&#x26; © Æ Ď ¾ ℋ ⅆ ∲ ≧̸</div>')
    })

    describe("links", function() {

        // links
        
        test("links 27",'s1df \\[Link back to H2] fred','<div class="p">s1df [Link back to H2] fred</div>')
        test("links 28",'s2df [Link back to H2\\] fred','<div class="p">s2df [Link back to H2] fred</div>')
        test("links 30",'s4df [ Link text | google.com ] fred','<div class="p">s4df <a href="https://google.com">Link text</a> fred</div>')

        test("links 31",'s4df [ Link text | www.google.com ] fred','<div class="p">s4df <a href="https://www.google.com">Link text</a> fred</div>')
        test("links 32",'s4df [ Link text | /fred ] fred','<div class="p">s4df <a href="/fred">Link text</a> fred</div>')
        test("links 33",'s4df [ Link text | #heading-3 ] fred','<div class="p">s4df <a href="#heading-3">Link text</a> fred</div>')
        test("links 34",'s4df [ www.google.com ] fred','<div class="p">s4df <a href="https://www.google.com">https://www.google.com</a> fred</div>')
        test("links 35",'s4df [ fred@google.com ] fred','<div class="p">s4df <a href="mailto:fred@google.com">mailto:fred@google.com</a> fred</div>')
        test("links 37",'s4df [ /fred ] fred','<div class="p">s4df <a href="/fred">/fred</a> fred</div>')
        test("links 38",'s4df [ #heading-3 ] fred','<div class="p">s4df <a href="#heading-3">#heading-3</a> fred</div>')
    })

    describe("link refs", function() {

       test("link refs 0",'s4df [ Link text ] fred','<div class="p">s4df <a link-ref="link text">Link text</a> fred</div>')
       test("link refs 1",'s5df [Link text | ref ] fred','<div class="p">s5df <a link-ref="ref">Link text</a> fred</div>')
       test("link refs 2",'s6df [Link text | ref 2 ] fred','<div class="p">s6df <a link-ref="ref 2">Link text</a> fred</div>')
       test("link refs 3",'s7df [Link text | ref-x ] fred','<div class="p">s7df <a link-ref="ref-x">Link text</a> fred</div>')
        
    });

    describe("link refs w/definitions", function() {

        test("link ref defs 0",
            's5df [ Link text ] fred\n[ link text ]: www.google.com',
            '<div class="p">s5df <a href="https://www.google.com">Link text</a> fred</div>')
        test("link ref defs 1",
            's5df [Link text | ref ] fred\n[ref]: www.google.com',
            '<div class="p">s5df <a href="https://www.google.com">Link text</a> fred</div>')
        test("link ref defs 2",
            's6df [Link text | ref 2 ] fred\n[ ref 2]: www.google.com',
            '<div class="p">s6df <a href="https://www.google.com">Link text</a> fred</div>')
        test("link ref defs 3",
            's7df [Link text | ref-x ] fred\n[ ref-x  ] : www.google.com',
            '<div class="p">s7df <a href="https://www.google.com">Link text</a> fred</div>')
         
        test("link ref defs 4",
            's7df [google] fred\n[ google  ] : this is a link to google | www.google.com',
            '<div class="p">s7df <a href="https://www.google.com">this is a link to google</a> fred</div>')
     });
 
    describe("divs", function() {
    
        test('divs 1','fred\n\n< blockquote\n\n  <div id="fred" class="woot" \n woot\n\n','<div class="p">fred</div><blockquote><div id="fred" class="woot"></div></blockquote><div class="p">woot</div>')
        test('divs 2','fred\n\n<blockquote\n\n  with more\n\n  <div\n\n    another indented','<div class="p">fred</div><blockquote><div class="p">with more</div><div><div class="p">another indented</div></div></blockquote>')
        
        test('divs h1','<h1\n  fred','<h1><div class="p">fred</div></h1>')
        test('divs h2','<h2\n  fred','<h2><div class="p">fred</div></h2>')
        test('divs h3','<h3\n  fred','<h3><div class="p">fred</div></h3>')
        test('divs h4','<h4\n  fred','<h4><div class="p">fred</div></h4>')
        test('divs h5','<h5\n  fred','<h5><div class="p">fred</div></h5>')
        test('divs h6','<h6\n  fred','<h6><div class="p">fred</div></h6>')
        test('divs h7','<h7\n  fred','<h7><div class="p">fred</div></h7>')
    });

    describe("inline mentions", function() {

        // inline mentions
        
        test('mentions 1','twitter style @user mentions',
            '<div class="p">twitter style <a href="/users/user">@user</a> mentions</div>')
        
    });

    describe("hash tags", function() {
    
        // tags
        
        test('tags 1','this is a tag #a in a line',
            '<div class="p">this is a tag <a href="/tags/a">#a</a> in a line</div>',
            {  "a": true})
        test('tags 2','this is an invalid tag #- in a line',
            '<div class="p">this is an invalid tag #- in a line</div>')
        test('tags 3','this is an invalid tag # in a line',
            '<div class="p">this is an invalid tag # in a line</div>')
        test('tags 4','this is an escaped tag \\#a in a line',
            '<div class="p">this is an escaped tag #a in a line</div>')
        test('tags 5','this is a tag ending a #line',
            '<div class="p">this is a tag ending a <a href="/tags/line">#line</a></div>',
            {  "line": true })
        test('tags 6','#tag_me is at the start of the line',
            '<div class="p"><a href="/tags/tag_me">#tag_me</a> is at the start of the line</div>',
            {  "tag_me": true})
        test('tags 7','\\#tag_me: this is a line, # is not valid in a prop',
            '<div class="p">#tag_me: this is a line, # is not valid in a prop</div>')
        test('tags 8','#tag_me: is at the start of the line',
            '<div class="p"><a href="/tags/tag_me">#tag_me</a>: is at the start of the line</div>',
            { "tag_me": true})
        test('tags 9','#tag_me\\: is at the start of the line',
            '<div class="p"><a href="/tags/tag_me">#tag_me</a>\\: is at the start of the line</div>',
            {  "tag_me": true})
        
    });

    describe("yaml", function() {

        test('yaml str double qoute','v : "woot"','',{ v: "woot" })
        test('yaml str single quote','v : \'woot\'','',{ v: "woot" })
        test('yaml str tick','v : `woot`','',{ v: "woot" })

        test('yaml number','v : 8','',{ v: 8 })
        test('yaml array','v : [1,2,3]','',{ v: [1,2,3] })
        test('yaml object','v : { a: 4, b: "bee", c: [1,2,3] }','',{ v: { a: 4, b: "bee", c: [1,2,3] } })


        test('yaml number octal','v : 011','',{ v: 9 })

        test('yaml invalid quoting','g : b * "stev','',{g: "b * \"stev"})

        test('yaml reading numbers',
            'date1: "2021-06-19"\ndate2: 2021-06-19\nversion: 1.2.3-rc',
            '',
            { date1: "2021-06-19", date2: 2021 - 6 - 19, version: "1.2.3-rc"})

        test('yaml multiple values','v : 3\nv: 4','',{ v: 4 })
        })

    describe("hash tags with parameters", function() {
    
        // tags with parameters
        
        test('tag params 1','this is a tag #a(1,2,[")"]) in a line',
            '<div class="p">this is a tag <a href="/tags/a">#a(1,2,[")"])</a> in a line</div>',
            {  "a": [    1,    2,   [     ")"    ]  ]})
        test('tag params 2','this is a tag ending a #line("with () text")',
            '<div class="p">this is a tag ending a <a href="/tags/line">#line("with () text")</a></div>',
            { "line": "with () text"})
        test('tag params 3','#tag_me(1,2) is at the start of the line',
            '<div class="p"><a href="/tags/tag_me">#tag_me(1,2)</a> is at the start of the line</div>',
            {  "tag_me": [    1,    2  ]})
        test('tag params 4','multiple tags #here and #there, also #here',
            '<div class="p">multiple tags <a href="/tags/here">#here</a> and <a href="/tags/there">#there</a>, also <a href="/tags/here">#here</a></div>',
            {"here": true, "there": true})
        test('tag params 5','#tag',
            '<div class="p"><a href="/tags/tag">#tag</a></div>',
            {"tag": true})

        test('tag params 6',
            '#image("my_image.png",200,200,"alt text")',
            '<div class="p"><a href="/tags/image">#image("my_image.png",200,200,"alt text")</a></div>',
            { image: ["my_image.png", 200,200, "alt text"]})
        
    });

    describe("hash bang ??", function() {

        test('simple hash bang for an image with error',
            'this is an image: #!image(my_image.png,200,200,alt text) inline',
            '<div class="p">this is an image: <div class="default.image"><div class="p"><img src="my_image.png,200,200,alt text" width="undefined" height="undefined" alt="undefined"></div></div>(my_image.png,200,200,alt text) inline</div>',
            {},
            function includeCallback(collection,name,args) {
                return h('img',{
                    src: `${args[0]}`,
                    width: `${args[1]}`,
                    height: `${args[2]}`,
                    alt: `${args[3]}`
                })
            })

        test('simple hash bang for an image',
            'this is an image: #!image("my_image.png",200,200,"alt text") inline',
            '<div class="p">this is an image: <div class="default.image"><div class="p"><img src="my_image.png" width="200" height="200" alt="alt text"></div></div> inline</div>',
            {},
            function includeCallback(collection,name,args) {
                return h('img',{
                    src: `${args[0]}`,
                    width: `${args[1]}`,
                    height: `${args[2]}`,
                    alt: `${args[3]}`
                })
            }
        )

        test('hash bang param testing',
            'this is an image: #!image("my_image.png",200,400,"alt text",request.args,`-\\${i}-`,true,null, 5 * 3, Math.max(4,5)) inline',
            '<div class="p">this is an image: <div class="default.image"><div class="p"><img src="my_image.png" width="200" height="400" alt="alt text"></div></div> inline</div>',
            {},
            function includeCallback(collection,name,args) {

                expect(args).to.not.be.null
                expect(args.length).to.eql(10)
                expect(args[0]).to.eql('my_image.png')
                expect(args[1]).to.eql(200)
                expect(args[2]).to.eql(400)
                expect(args[3]).to.eql('alt text')
                expect(args[4]).to.eql([])
                expect(args[5]).to.eql('-${i}-')
                expect(args[6]).to.eql(true)
                expect(args[7]).to.eql(null)
                expect(args[8]).to.eql(15)
                expect(args[9]).to.eql(5)

                return h('img',{
                    src: `${args[0]}`,
                    width: `${args[1]}`,
                    height: `${args[2]}`,
                    alt: `${args[3]}`
                })
            }
        )

        test('hash bang param testing',
            'i: 3\nthis is an image: #!image("my_image.png",200,400,"alt text",request.args,`-${json.i}-`,true,null, 5 * 3, Math.max(4,5)) inline',
            '<div class="p">this is an image: <div class="default.image"><div class="p"><img src="my_image.png" width="200" height="400" alt="alt text"></div></div> inline</div>',
            {i:3},
            function includeCallback(collection,name,args) {

                expect(args).to.not.be.null
                expect(args.length).to.eql(10)
                expect(args[0]).to.eql('my_image.png')
                expect(args[1]).to.eql(200)
                expect(args[2]).to.eql(400)
                expect(args[3]).to.eql('alt text')
                expect(args[4]).to.eql([])
                expect(args[5]).to.eql('-3-')
                expect(args[6]).to.eql(true)
                expect(args[7]).to.eql(null)
                expect(args[8]).to.eql(15)
                expect(args[9]).to.eql(5)

                return h('img',{
                    src: `${args[0]}`,
                    width: `${args[1]}`,
                    height: `${args[2]}`,
                    alt: `${args[3]}`
                })
            }
        )

        test('simple hash collection',
            '#!pages.page',
            '<div class="p"><div class="pages.page"><div class="p"><img></div></div></div>',
            {},
            function includeCallback(collection,name,args) {
                expect(collection).to.equal('pages')
                expect(name).to.equal('page')
                expect(args).to.deep.equal([true])
                return h('img')
            })
    })

    describe("template strings", function() {
    
        // inline includes
        
        test('template 1','menu: WOOT \n\nalso supports ${json.menu} tag includes',
            '<div class="p">also supports WOOT tag includes</div>',
            {  "menu": "WOOT" })
        test('template 2','menu:\n  - saturday\n  - sunday\n\nand with params ${json.menu[0]} like that',
            '<div class="p">and with params saturday like that</div>',
            {"menu": ["saturday","sunday"]})

        test('template 3',"obj3: {a:1,b:2}",'',{obj3:{a:1,b:2}})
        test('template 4',"#obj2( {a:1,b:2} )",'<div class="p"><a href="/tags/obj2">#obj2( {a:1,b:2} )</a></div>',{obj2:{a:1,b:2}})
        test('template 5',"- Fred: [1,2,3]",'',[ { Fred: [1,2,3] }] )
    
    });

    // misc
        
    describe("misc", function() {

        // detect this and make it a list rather than yaml?
        test('is this yaml or a list?','text followed by a list:\n- one\n- two\n',
            '<div class="p">text followed by a list:</div>',["one","two"])
        
        // is this yaml (json) or a list (html)? ... its a json array
        test('simple list','- one\n- two',
            '',["one","two"])
        
    })

})

describe("file based tests", function() {

    function includeCallback(collection,name,args) {
        return h('img',{
            src: `${args[0]}`,
            width: `${args[1]}`,
            height: `${args[2]}`,
            alt: `${args[3]}`
        })
    }

    const pattern = /\.sqrm$/
    fs.readdirSync('./test/docs/').forEach(file => {
        if (pattern.test(file)) {

            const name = file.replace(/\.[^/.]+$/, "")

            const src = fs.readFileSync(`./test/docs/${name}.sqrm`, 'utf-8').toString()
            const expectedHtml = (
                fs.existsSync(`./test/docs/${name}.html`)
                ? fs.readFileSync(`./test/docs/${name}.html`, 'utf-8').toString().replaceAll(/\r/g,'')
                : '' )
            const expectedJson = (
                fs.existsSync(`./test/docs/${name}.json`)
                ? JSON.parse(fs.readFileSync(`./test/docs/${name}.json`, 'utf-8').toString())
                : {} )

            test(`file: ${file}`,src,expectedHtml,expectedJson,includeCallback)

        }
    });

});
