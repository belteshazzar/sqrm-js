# sqrm

markdown is for formatting, yaml is for data ... but why can't we have both?

[youtube](https://www.youtube.com/watch?v=vqgSO8_cRio)

sqrm (pronounced squirm and short for square embrace) is a format that produces
html and json output. it allows you to mix formatting and data in a single
document


1. indenting is important -- sqrm supports nesting html divs
2. hashtags -- sqrm uses hashtags like your use on twitter, they are fundamental to server side and client side processing
3. scripting -- sqrm supports embedded javascript to customize the output
4. includes -- sqrm documents can easily include other documents



# processing pipeline

    1. string             -> lines              (stringToLines)  sqrm-to-last (intermeddiatry lines)

    2. lines              -> flat-sqrm-w-script (linesToSqrm)    last-to-sxast (sqrm-scripted ast)

    3. flat-sqrm-w-script -> javascript         (sqrmToCode)     sxast-to-js

    4. javascript         -> flat-sqrm          (fn response)    produces sqrm ast (no script elements)

    5. flat-sqrm          -> sqrm-tree          (sqrmToSqrmNested)

    6. sqrm-tree          -> hast               (sqrmToHast)

    7. hast               -> html               (hastToHtml)
