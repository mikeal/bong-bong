const funky = require('../../funky')
const emojione = require('emojione')
const bel = require('bel')
const moment = require('moment')
const escapeHtml = require('./escapeHtml')

function toTextElement (str) {
  str = escapeHtml(str)
  return bel([`<span>${emojione.toImage(str)}</span>`])
}

const view = funky`
${() => {}}
<bong-bong-message>
  <div class="nickname">
    <span class="nick">${ doc => doc.user.nickname }</span>
    <span class="ts" ts="${ doc => '' + doc.ts }"
    >${ doc => {
      let now = Date.now()
      if ((now - doc.ts) < 10 * 60 * 1000) {
        return moment(doc.ts).fromNow()
      } else {
        return moment(doc.ts).calendar()
      }
    }}</span>
  </div>
  <div class="text">${ doc => toTextElement(doc.text) }</div>
</bong-bong-message>
`

module.exports = view
