const funky = require('funky')
const emojione = require('emojione')
const bel = require('bel')
const bongBongTime = require('./bong-bong-time')

var linkify = require('linkifyjs/html')

function toTextElement (str) {
  // str = escapeHtml(str)
  let ret = bel`<span></span>`
  ret.innerHTML = linkify(emojione.toImage(str), {defaultProtocol: 'https'})
  return ret
}

const view = funky`
${() => {}}
<bong-bong-message>
  <div class="nickname">
    <span class="nick">${ doc => doc.user.login }</span>
    ${ bongBongTime }
  </div>
  <div class="text">${ doc => toTextElement(doc.data.text) }</div>
</bong-bong-message>
`

module.exports = view
