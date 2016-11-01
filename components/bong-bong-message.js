const funky = require('../../funky')
const emojione = require('emojione')
const bel = require('bel')
const escapeHtml = require('./escapeHtml')

function toTextElement (str) {
  str = escapeHtml(str)
  return bel([`<span>${emojione.toImage(str)}</span>`])
}

const view = funky`
<bong-bong-message>
  <div class="nickname">${ doc => doc.user.nickname }</div>
  <div class="text">${ doc => toTextElement(doc.text) }</div>
</bong-bong-message>
`

module.exports = view
