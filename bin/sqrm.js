#!/usr/bin/env node

import fs from 'fs'
import util from 'node:util'

import sqrm from '../src/sqrm.js'

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    process.exit();
});

const _json = process.argv.indexOf('--json') > 0 || process.argv.indexOf('-j') > 0
const _html = process.argv.indexOf('--html') > 0 || process.argv.indexOf('-h') > 0
const color = process.argv.indexOf('--color') > 0 || process.argv.indexOf('-c') > 0

function printUsage() {
    console.log('Usage: sqrm')
    console.log()
    console.log("Options:")
    console.log("  -f filename      Read the file, only in tty mode")
    console.log("                   Must be provided in tty mode")
    console.log("  -j --json        Output JSON")
    console.log("  -h --html        Output HTML")
    console.log("  -c --color       Display JSON with color")
    console.log()
    console.log("Examples:")
    console.log()
    console.log("  sqrm -json -f my-file.sqrm")
    console.log("  ./bin/sqrm.js --json -f my-file.sqrm")
    console.log("  cat my-file.sqrm | sqrm --json")
    console.log("  sqrm -j < my-file.sqrm")
    console.log()
    process.exit(1)
}

function callSqrm(src) {

    const res = sqrm(src)

    if ((_json && _html) || (!_json && !_html)) {
        console.log(util.inspect(res,false,null,true))
    } else if (res.docs !== undefined && Array.isArray(res.docs)) {

        let html = ''
        let json = []

        res.docs.forEach((el) => {
            html += '\n' + el.html
            json.push(el.json)
        })

        if (_json) {
            console.log(JSON.stringify(json))
        } else {
            console.log(html)
        }
    } else {
        if (_json) {
            console.log(JSON.stringify(res.json))
        } else {
            console.log(res.html)
        }
    }

    process.exit();
}

if (process.stdin.isTTY === true) {

    let _f = process.argv.indexOf('-f')
    if (_f < 0) printUsage()

    if (process.argv.length <= _f + 1) printUsage()

    _f = process.argv[_f+1]

    if (!fs.existsSync(_f)) {
        console.log('ERROR: file does not exist')
        process.exit(2)
    }

    callSqrm(fs.readFileSync(_f, "utf-8").toString())

} else {

    process.stdin.on('data', data => {
        callSqrm(data.toString())
    });
}
