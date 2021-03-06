const emojione = require('emojione')
const bel = require('bel')
const marked = require('marked')
const sanitize = require('sanitize-html')
const bongMessage = require('./bong-bong-message')

function toTextElement (str) {
  // str = escapeHtml(str)
  let elem = bel`<bong-text></bong-text>`
  elem.innerHTML = emojione.toImage(sanitize(marked.parse(str)))
  return elem
}

module.exports = opts => {
  opts.msgBody = module.exports.getBody(opts)
  return bongMessage(opts)
}
module.exports.getBody = opts => toTextElement(opts.data.text)
