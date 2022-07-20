
import {expect} from 'chai';

import * as fs from 'fs'//const fs = require("fs");

import JSON5 from 'json5'
import SqrmDocument from '../src/SqrmDocument.js';
import SqrmRequest from '../src/SqrmRequest.js';
import SqrmResponse from '../src/SqrmResponse.js';
import * as acorn from 'acorn'


console.log(acorn.parse("let x = {a:1 , b:2}").body[0].declarations[0].init);

class TestSqrmCollection {

   constructor(src,includeCallback) {
    this.src = src;
    this.includeCallback = includeCallback;
   }

   load(doc) {
    doc.src = this.src
   }

   include(name,request,response) {
//    console.log(response);
    let args = [];
    for (let i=3 ; i<arguments.length ; i++) args.push(arguments[i])
//    console.log('include',name,args);
//    console.log(response.html.out);
     response.html.out += this.includeCallback(name,args)
   }

   call(name,request,response) {
   }

   find(select,filter,skip,count) {
  }

}

function test(name,source,expectedHtml,expectedJson={},includeCallback) {
    it(name+"", function() {

        const collection = new TestSqrmCollection(source,includeCallback);
        const doc = new SqrmDocument(collection,'id',1);
        doc.load();
        doc.compile();
        const request = new SqrmRequest(collection,[]);
        const response = new SqrmResponse();

//if (includeCallback) {
//    console.log(doc.fn.toString());
//}

        doc.execute(request,response);

        const html = response.html.toString()
        const json = response.json;
        expect(json).to.eql(expectedJson)
        expect(html).to.eql(expectedHtml);
    })
}

function testFF(name,filename) {
    test(name+ " - "+filename,
        fs.readFileSync(`./test/docs/${filename}.1.sqrm`, 'utf-8').toString(),
        fs.readFileSync(`./test/docs/${filename}.html`, 'utf-8').toString().replaceAll(/\r/g,''),
        {},
        null);    
}

function testFFF(name,filename) {
    test(name+ " - "+filename,
        fs.readFileSync(`./test/docs/${filename}.1.sqrm`, 'utf-8').toString(),
        fs.readFileSync(`./test/docs/${filename}.html`, 'utf-8').toString().replaceAll(/\r/g,''),
        JSON5.parse(fs.readFileSync(`./test/docs/${filename}.json`, 'utf-8').toString()),
        null);    
}

describe("Sqrm Render", function() {

    describe("Escaping", function() {

        test("escape characters",
            '  fred & barry ( 1< 3 || 4 > 4 \\ woot)',
            '<div>\n  <p>\n    fred &amp; barry ( 1&lt; 3 || 4 &gt; 4 \\ woot)\n  </p>\n</div>\n',
            {});
    });

    describe("Headings", function() {

        test('heading 1',
            '= head\n',
            '<h1>\n  head\n</h1>\n',
            {})

        test('heading 2',
            '== head\n',
            '<h2>\n  head\n</h2>\n',
            {});

        test('heading 3',
            '  === head\n',
            '<div>\n  <h3>\n    head\n  </h3>\n</div>\n',
            {})

        test("heading 4",
            '= head\r\ning',
            '<h1>\n  head\n</h1>\n<p>\n  ing\n</p>\n',
            {})

        test("heading 5",
            '= head\r\ning\nand some more\n',
            '<h1>\n  head\n</h1>\n<p>\n  ing and some more\n</p>\n',
            {})

        test("heading 6", 
            '= head\r\n\r\ning',
            '<h1>\n  head\n</h1>\n<p>\n  ing\n</p>\n',
            {})

        test("heading 7",
            '= head\r',
            '<h1>\n  head\n</h1>\n',
            {})

        test("heading 8",
            '= head\r\n',
            '<h1>\n  head\n</h1>\n',
            {})

        test("heading 9",
            '= head\ning',
            '<h1>\n  head\n</h1>\n<p>\n  ing\n</p>\n',
            {})

        test("heading 10", 
            '= head\n',
            '<h1>\n  head\n</h1>\n',
            {})

        test("heading 11",
            '\n  == heading ============================ \ntext',
            '<div>\n  <h2>\n    heading\n  </h2>\n</div>\n<p>\n  text\n</p>\n',
            {})

        test("heading 11a", 
            '\n  == heading ---------------------------- \ntext',
            '<div>\n  <h2>\n    heading\n  </h2>\n</div>\n<p>\n  text\n</p>\n',
            {})

        test("heading 12",
            '\n  == heading ============================ \n\ntext',
            '<div>\n  <h2>\n    heading\n  </h2>\n</div>\n<p>\n  text\n</p>\n',
            {})

        test("heading 13", 
            '\n  = heading\n\ntext',
            '<div>\n  <h1>\n    heading\n  </h1>\n</div>\n<p>\n  text\n</p>\n',
            {})

        test("heading 14", 
            '\n=\n\n',
            '<p>\n  =\n</p>\n',
            {})

        test("heading 15",
            '= heading \ncontinued =======',
            '<h1>\n  heading\n</h1>\n<p>\n  continued =======\n</p>\n',
            {})

        test("heading 16",
            '= heading \n  indented',
            '<h1>\n  heading\n</h1>\n<div>\n  <p>\n    indented\n  </p>\n</div>\n',
            {})
    });

    describe("paragraphs", function() {

        test("paragraphs 1",
            'a',
            '<p>\n  a\n</p>\n',
            {})

        test("paragraphs 2",
            'a\nb\n',
            '<p>\n  a b\n</p>\n',
            {})

        test("paragraphs 3",
            'a\nb\n',
            '<p>\n  a b\n</p>\n',
            {})

        test("paragraphs 4",
            'a\nb\n\nc\n',
            '<p>\n  a b\n</p>\n<p>\n  c\n</p>\n',
            {})

    });

    describe("formatting", function() {

        test('formatting 1','a !! b !! c','<p>\n  a <b>\n   b </b>\n   c\n</p>\n')
        test('formatting 2','a ** b ** c','<p>\n  a <b>\n   b </b>\n   c\n</p>\n')
        test('formatting 3','a ~~ b ~~ c','<p>\n  a <i>\n   b </i>\n   c\n</p>\n')
        test('formatting 4','a // b // c','<p>\n  a <i>\n   b </i>\n   c\n</p>\n')
        test('formatting 5','a -- b -- c','<p>\n  a <del>\n   b </del>\n   c\n</p>\n')
        test('formatting 6','a __ b __ c','<p>\n  a <u>\n   b </u>\n   c\n</p>\n')
        test('formatting 7','a `` b `` c','<p>\n  a <code>\n   b </code>\n   c\n</p>\n')
        test('formatting 8','a ^^ b ^^ c','<p>\n  a <sup>\n   b </sup>\n   c\n</p>\n')
        
        test('formatting 9','a !! b c','<p>\n  a <b>\n   b c</b>\n</p>\n')
        test('formatting 10','a ** b c','<p>\n  a <b>\n   b c</b>\n</p>\n')
        test('formatting 11','a ~~ b c','<p>\n  a <i>\n   b c</i>\n</p>\n')
        test('formatting 12','a // b c','<p>\n  a <i>\n   b c</i>\n</p>\n')
        test('formatting 13','a -- b c','<p>\n  a <del>\n   b c</del>\n</p>\n')
        test('formatting 14','a __ b c','<p>\n  a <u>\n   b c</u>\n</p>\n')
        test('formatting 15','a `` b c','<p>\n  a <code>\n   b c</code>\n</p>\n')
        test('formatting 16','a ^^ b c','<p>\n  a <sup>\n   b c</sup>\n</p>\n')

        test('formatting 17','a \\!! b c','<p>\n  a !! b c\n</p>\n')
        test('formatting 18','a \\** b c','<p>\n  a ** b c\n</p>\n')
        test('formatting 19','a \\~~ b c','<p>\n  a ~~ b c\n</p>\n')
        test('formatting 20','a \\// b c','<p>\n  a // b c\n</p>\n')
        test('formatting 21','a \\-- b c','<p>\n  a -- b c\n</p>\n')
        test('formatting 22','a \\__ b c','<p>\n  a __ b c\n</p>\n')
        test('formatting 23','a \\`` b c','<p>\n  a `` b c\n</p>\n')
        test('formatting 24','a \\^^ b c','<p>\n  a 😊 b c\n</p>\n')
        
        test('formatting 25','a ^^ b __ c -- !! d !! e','<p>\n  a <sup>\n   b <u>\n   c <del>\n   <b>\n   d </b>\n   e</del>\n  </u>\n  </sup>\n</p>\n')
        
    });

    describe("emoji", function() {
        
        testFF("emoji","emoji")
        
    });

    describe("links", function() {

        // links
        
        testFF("links 26","links");
        test("links 27",'s1df \\[Link back to H2] fred','<p>\n  s1df [Link back to H2] fred\n</p>\n')
        test("links 28",'s2df [Link back to H2\\] fred','<p>\n  s2df [Link back to H2] fred\n</p>\n')
        test("links 29",'s3df [ Link back to H2 ] fred','<p>\n  s3df <a href="/link_back_to_h2">Link back to H2</a> fred\n</p>\n')
        test("links 30",'s4df [ Link | with text ] fred','<p>\n  s4df <a href="/link">with text</a> fred\n</p>\n')
        test("links 31",'s5df [Link ba\\|ck to H2] fred','<p>\n  s5df <a href="/link_ba%7Cck_to_h2">Link ba|ck to H2</a> fred\n</p>\n')
        test("links 32",'s6df [Link ba\\]ck to H2] fred','<p>\n  s6df <a href="/link_ba%5Dck_to_h2">Link ba]ck to H2</a> fred\n</p>\n')
        test("links 33",'s7df [Link ba\\ck to H2] fred','<p>\n  s7df <a href="/link_ba%5Cck_to_h2">Link ba\\ck to H2</a> fred\n</p>\n')
        
    });

    describe("footnotes", function() {

        testFF("footnote links","links-footnotes");
        
    });

    describe("lists", function() {

        // lists
        
        testFF(34,"list-unordered");
        testFF(35,"list-ordered");
        
    });

    describe("links - task lists - checkboxes", function() {
        
        testFFF('task list',"links-tasks")

    })

    describe("tables", function() {

        // tables
        
        testFF('tables',"table");
        testFF('tables-divs',"divs")
        testFF('tables-divs1',"divs1")
        testFF('tables-divs2',"divs2")
        testFF('tables-divs3',"divs3")
        testFF('table formatting',"table2")
        testFF('table col alignment',"table3")
        testFF('table header row',"table4")
    });

    describe("code blocks", function() {

        testFF('code blocks',"code")

    })

    describe("tags", function() {

        // tags
        
        testFFF(371,"yaml")
        testFFF(372,"yaml2")
        testFFF(373,"yaml3")
        testFFF(374,"yaml4")
        testFFF(375,"yaml5")

    });

    describe("divs", function() {
    
        // divs
        testFF('divs',"divs5");

        test(38,'fred\n\n< blockquote\n\n  <div id="fred" class="woot" \n\n    woot\n\n','<p>\n  fred\n</p>\n<blockquote>\n  <div id="fred" class="woot">\n    <p>\n      woot\n    </p>\n  </div>\n</blockquote>\n')
        test(39,'fred\n\n<blockquote\n  with more\n\n  <div\n    another indented\n','<p>\n  fred\n</p>\n<blockquote>\n  <p>\n    with more\n  </p>\n  <div>\n    <p>\n      another indented\n    </p>\n  </div>\n</blockquote>\n')
        
    });

    describe("inline mentions", function() {

        // inline mentions
        
        test(40,'twitter style @user mentions',
            '<p>\n  twitter style <a href="/users/user">@user</a> mentions\n</p>\n')
        
        });

    describe("hash tags", function() {
    
        // tags
        
        test(41,'this is a tag #a in a line',
            '<p>\n  this is a tag <a href="/tags/a">#a</a> in a line\n</p>\n',
            {  "a": true})
        test(42,'this is an invalid tag #- in a line',
            '<p>\n  this is an invalid tag #- in a line\n</p>\n')
        test(43,'this is an invalid tag # in a line',
            '<p>\n  this is an invalid tag # in a line\n</p>\n')
        test(44,'this is an escaped tag \\#a in a line',
            '<p>\n  this is an escaped tag #a in a line\n</p>\n')
        test(45,'this is a tag ending a #line',
            '<p>\n  this is a tag ending a <a href="/tags/line">#line</a>\n</p>\n',
            {  "line": true })
        test(46,'#tag_me is at the start of the line',
            '<p>\n  <a href="/tags/tag_me">#tag_me</a> is at the start of the line\n</p>\n',
            {  "tag_me": true})
        test(47,'\\#tag_me: this is a line, # is not valid in a prop',
            '<p>\n  #tag_me: this is a line, # is not valid in a prop\n</p>\n')
        test(48,'#tag_me: is at the start of the line',
            '<p>\n  <a href="/tags/tag_me">#tag_me</a>: is at the start of the line\n</p>\n',
            { "tag_me": true})
        test(49,'#tag_me\\: is at the start of the line',
            '<p>\n  <a href="/tags/tag_me">#tag_me</a>\\: is at the start of the line\n</p>\n',
            {  "tag_me": true})
        
    });

    describe("hash tags with parameters", function() {
    
        // tags with parameters
        
        test(50,'this is a tag #a(1,2,[")"]) in a line',
            '<p>\n  this is a tag <a href="/tags/a">#a</a> in a line\n</p>\n',
            {  "a": [    1,    2,   [     ")"    ]  ]})
        test(51,'this is a tag ending a #line("with () text")',
            '<p>\n  this is a tag ending a <a href="/tags/line">#line</a>\n</p>\n',
            { "line": "with () text"})
        test(52,'#tag_me(1,2) is at the start of the line',
            '<p>\n  <a href="/tags/tag_me">#tag_me</a> is at the start of the line\n</p>\n',
            {  "tag_me": [    1,    2  ]})
        test(53,'multiple tags #here and #there, also #here',
            '<p>\n  multiple tags <a href="/tags/here">#here</a> and <a href="/tags/there">#there</a>, also <a href="/tags/here">#here</a>\n</p>\n',
            {"here": true, "there": true})
        test(54,'#tag',
            '<p>\n  <a href="/tags/tag">#tag</a>\n</p>\n',
            {"tag": true})
        
        
    });

    describe("hash bang ??", function() {

        test('simple hash bang for an image with error',
            'this is an image: #!image(my_image.png,200,200,alt text) inline',
            '<p>\n  this is an image: \n  <img src="undefined" width="undefined" height="undefined" alt="undefined">\n  (my_image.png,200,200,alt text) inline\n</p>\n',
            {},
            function includeCallback(doc,params) {
                return `  <img src="${params[0]}" width="${params[1]}" height="${params[2]}" alt="${params[3]}">\n`
            })

        test('simple hash bang for an image',
            'this is an image: #!image("my_image.png",200,200,"alt text") inline',
            '<p>\n  this is an image: \n  <img src="my_image.png" width="200" height="200" alt="alt text">\n   inline\n</p>\n',
            {},
            function includeCallback(doc,params) {
                return `  <img src="${params[0]}" width="${params[1]}" height="${params[2]}" alt="${params[3]}">\n`
            })
    })

    describe("template strings", function() {
    
        // inline includes
        
        test(55,'menu: WOOT \n\nalso supports ${json.menu} tag includes',
            '<p>\n  also supports WOOT tag includes\n</p>\n',
            {  "menu": "WOOT" })
        test(56,'menu:\n  - saturday\n  - sunday\n\nand with params ${json.menu[0]} like that',
            '<p>\n  and with params saturday like that\n</p>\n',
            {"menu": ["saturday","sunday"]})
    
    });

    // misc
        
    describe("misc", function() {

        test(57,'text followed by a list:\n- one\n- two\n',
            '<p>\n  text followed by a list:\n</p>\n<ul>\n  <li>\n    one\n  </li>\n  <li>\n    two\n  </li>\n</ul>\n')
        
        // is this yaml (json) or a list (html)? hint: its a list
        test(58,'- one\n- two',
            '<ul>\n  <li>\n    one\n  </li>\n  <li>\n    two\n  </li>\n</ul>\n')
        
        // script elements
        
        testFFF("scriptlet","scriptlet");
            
        // script elements
        
        testFFF("script element tags","tags");
    });
});

// line formatting

