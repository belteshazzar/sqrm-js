
export default function stringify(options) {
  const self = this
  const settings = {...self.data('settings'), ...options}
  self.compiler = compiler

  function compiler(tree) {
    return JSON.stringify(tree)
  }
}
