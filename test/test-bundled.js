
import sqrm from '../build/sqrm-0.1.6.js'
import sqrmMin from '../build/sqrm-0.1.6.min.js'
import {expect} from 'chai';

describe("Bundle Tests", function() {

    describe("Non-minified Bundle", function() {

        it("simple", function() {

            const {html,json} = sqrm('fred was **here**, he really was')
            expect(html).to.eql(`<div class="p">fred was <b>here</b>, he really was</div>`)
            expect(json).to.eql({})

        })
    });

    describe("Minified Bundle", function() {

        it("simple", function() {

            const{html,json} = sqrmMin('may __fred__ was ~~not~~ actually here :(')
            expect(html).to.eql(`<div class="p">may <u>fred</u> was <i>not</i> actually here 😞</div>`)
            expect(json).to.eql({})

        })
    });
})