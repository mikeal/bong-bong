const funky = require('funky')
const emojione = require('emojione')
const bel = require('bel')
const bongMessage = require('./bong-bong-message')

var linkify = require('linkifyjs/html')

function toTextElement (str) {
  // str = escapeHtml(str)
  let ret = bel`<span></span>`
  ret.innerHTML = linkify(emojione.toImage(str), {defaultProtocol: 'https'})
  return ret
}

const bongText = funky`
<bong-text>
  <div class="text">${ doc => toTextElement(doc.data.text) }</div>
</bong-text>
`

module.exports = opts => {
  opts.msgBody = bongText(opts)
  return bongMessage(opts)
}