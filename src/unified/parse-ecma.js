import {Parser} from 'acorn'
import {fromEstree} from 'esast-util-from-estree'
import {VFileMessage} from 'vfile-message'

export default function parseEcma(options = {}) {
    const self = this
    self.parser = parser
    self.options = { ...options }
  
    function parser(value,vfile) {

        let acorn = Parser
        const comments = []
        let tree
      
        if (self.options.plugins) {
          acorn = acorn.extend(...self.options.plugins)
        }
      
        const text =
          typeof value === 'string'
            ? value.toString()
            : new TextDecoder().decode(value)
      
        try {
          tree = acorn.parse(text, {
            ecmaVersion: self.options.version || 'latest',
            sourceType: self.options.module ? 'module' : 'script',
            allowReturnOutsideFunction:
              self.options.allowReturnOutsideFunction || undefined,
            allowImportExportEverywhere:
              self.options.allowImportExportEverywhere || undefined,
            allowAwaitOutsideFunction:
              self.options.allowAwaitOutsideFunction || undefined,
            allowHashBang: self.options.allowHashBang || undefined,
            allowSuperOutsideMethod: self.options.allowSuperOutsideMethod || undefined,
            locations: true,
            onComment: comments
          })
        } catch (error) {
          const cause = (error)
      
          const message = new VFileMessage('Could not parse JavaScript with Acorn', {
            cause,
            place: {
              line: cause.loc.line,
              column: cause.loc.column + 1,
              offset: cause.pos
            },
            ruleId: 'acorn',
            source: 'esast-util-from-js'
          })
      
          message.url = 'https://github.com/syntax-tree/esast-util-from-js#throws'
      
          throw message
        }
      
        tree.comments = comments
      
        return fromEstree(tree)
    }
}
