

export default function sqrmToLines(str, indentation = 2) {

    const l = str.length
    let lines = []
    let i = 0;
    let j = 0;
    let n = 1;

    let atLineStart = true
    let indent = 0

    function addLine(split) {
        lines.push({line: n, indent: Math.floor(indent/indentation), text: str.substring(i,j)})
        ++n
        atLineStart = true
        indent = 0
        i = j + split;
        j = i
    }

    while (j<l) {

        const s = str[j]
        if (atLineStart) {
            if (s==' ') {
                ++indent
            } else {
                atLineStart = false
            }
        }
        if (s=='\r') {
            if (j+1<l && str[j+1]=='\n') {
                addLine(2)
            } else {
                j++
            }
        } else if (s=='\n') {
            addLine(1)
        } else {
            ++j
        }
    }
    addLine(0)

    return lines;
}
