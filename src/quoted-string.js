

// Could be in ticks so that we can have \n's but we dont want template
// replacements so using double quotes (escape double quotes and new lines)
// https://gist.github.com/getify/3667624
export default function qouted(str) {
	str = str.replaceAll('\r','')
	str = str.replace(/\\([\s\S])|(")/g,"\\$1$2");
	str = str.replace(/\\([\s\S])|(\n)/g,"\\$1$2");
    return `"${str}"`
}

