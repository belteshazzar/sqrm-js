
import sqrm from '../build/sqrm.js'
import sqrmMin from '../build/sqrm.min.js'

describe("Bundle Tests", function() {

    describe("Non-minified Bundle", function() {

        it("simple", function() {

            const {html,json} = sqrm('fred was **here**, he really was')
            expect(html).to.eql("<p>fred was <b>here</b>, he really was</p>")
            expect(json).to.eql({})

        })
    });

    describe("Minified Bundle", function() {

        it("simple", function() {

            const{html,json} = sqrmMin('may __fred__ was ~~not~~ actually here :(')
            expect(html).to.eql("<p>may <u>fred</u> was <i>not</i> actually here 😞</p>")
            expect(json).to.eql({}})

        })
    });
})