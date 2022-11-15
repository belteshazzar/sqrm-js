
import {expect} from 'chai';
import SqrmFSCollection from '../src/SqrmFSCollection.js';

describe("file system collection tests", function() {

    describe("single folder", function() {

        it("file system collection", function() {

            const options = {
                log_src: process.env.npm_config_src == 'true',
                log_lines: process.env.npm_config_lines == 'true',
                log_sxast: process.env.npm_config_sxast == 'true',
                log_code: process.env.npm_config_code == 'true',
    
                log_sast: process.env.npm_config_sast == 'true',
                log_hast: process.env.npm_config_hast == 'true',
                log_html: process.env.npm_config_html == 'true',
                log_jast: process.env.npm_config_jast == 'true',
                log_json: process.env.npm_config_json == 'true'
            };

            const c = new SqrmFSCollection('./test/collection',options)
            expect(c).to.not.be.null

            // defines json, has no params or data needs
            // test calling directly
            expect(c.get('paris')).to.not.be.null
            const paris = c.call('paris')
            expect(paris).to.not.be.null
            expect(paris.html).to.not.be.null
            expect(paris.json).to.not.be.null
            expect(paris.html).to.equal('')
            expect(paris.json).to.deep.equal({city: 'Paris', country: 'France', coordinates: { lat: 48.856613, lon: 2.352222}})

            // defines json, has no params or data needs
            // test calling directly
            expect(c.get('london')).to.not.be.null
            const london = c.call('london')
            expect(london).to.not.be.null
            expect(london.html).to.not.be.null
            expect(london.json).to.not.be.null
            expect(london.html).to.equal('')
            expect(london.json).to.deep.equal({city: 'London', country: 'England', coordinates: { lat: 51.507222, lon: -0.1275}})

            // expects params [{lat:,lon:}]
            // test calling directly
            expect(c.get('map')).to.not.be.null
            const map = c.call('map',[london.json.coordinates])
            expect(map).to.not.be.null
            expect(map.html).to.not.be.null
            expect(map.json).to.not.be.null
            expect(map.html).to.equal(`<map latitude="${london.json.coordinates.lat}" longitude="${london.json.coordinates.lon}"></map>`)
            expect(map.json).to.deep.equal({})

            // expects params [{city:,country:,coordinates:{lat:,lon:}}]
            // includes map for {lat:,lon}
            // test calling directly
            expect(c.get('info_box')).to.not.be.null
            const info_box = c.call('info_box',[london.json])
            expect(info_box).to.not.be.null
            expect(info_box.html).to.not.be.null
            expect(info_box.json).to.not.be.null
            expect(info_box.html).to.equal(`<div class="p">The city of ${london.json.city} is in the country of ${london.json.country}.</div><div class="p"><div class="map"><map latitude="${london.json.coordinates.lat}" longitude="${london.json.coordinates.lon}"></map></div></div>`)
            expect(info_box.json).to.deep.equal({})


            expect(c.get('page-find')).to.not.be.null
            const page_find = c.call('page-find')
            expect(page_find).to.not.be.null
            expect(page_find.html).to.not.be.null
            expect(page_find.json).to.not.be.null
            expect(page_find.html).to.equal(`<div class="p">This is page-find.</div>`)
            expect(page_find.json).to.deep.equal({
                city: 'Paris',
                country: 'France',
                coordinates: { lat: 48.856613, lon: 2.352222 }
              })

            expect(c.get('page-include-chained')).to.not.be.null
            const page_include_chained = c.call('page-include-chained')
            expect(page_include_chained).to.not.be.null
            expect(page_include_chained.html).to.not.be.null
            expect(page_include_chained.json).to.not.be.null
            expect(page_include_chained.html).to.equal(`<div class="p">This is page-include-chained.</div>`)
            expect(page_include_chained.json).to.deep.equal({})

            expect(c.get('page-include-direct')).to.not.be.null
            const page_include_direct = c.call('page-include-direct')
            expect(page_include_direct).to.not.be.null
            expect(page_include_direct.html).to.not.be.null
            expect(page_include_direct.json).to.not.be.null
            expect(page_include_direct.html).to.equal(`<div class="p">this page includes paris, so its another page that looks like paris</div><div class="p">direct include to include yaml/json for the city of <div class="paris"></div></div>`)
            expect(page_include_direct.json).to.deep.equal({
                city: 'Paris',
                country: 'France',
                coordinates: { lat: 48.856613, lon: 2.352222 }
              })

            expect(c.get('page-include-multiple-json')).to.not.be.null
            const page_include_multiple_json = c.call('page-include-multiple-json')
            expect(page_include_multiple_json).to.not.be.null
            expect(page_include_multiple_json.html).to.not.be.null
            expect(page_include_multiple_json.json).to.not.be.null
            expect(page_include_multiple_json.html).to.equal(`<div class="p">This is page-include-multiple-json.</div><ul><li>London</li><li>Paris</li><li>Paris</li><li>Paris</li></ul>`)
            expect(page_include_multiple_json.json).to.deep.equal({
                cities: [
                  { City: 'London' },
                  { City: 'Paris' },
                  { City: 'Paris' },
                  { City: 'Paris' }
                ]
              })
        })
    })
})
    