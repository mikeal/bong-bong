const funky = require('funky')
const moment = require('moment')
const bel = require('bel')

const view = funky`
<bong-bong-message>
  <div class="nickname">
    <span class="nick">${ doc => doc.user.nickname }</span>
    <span class="ts" ts="${ doc => doc.ts ? '' + doc.ts : 'none' }"
    >${ doc => {
      if (!doc.ts) return ''
      let now = Date.now()
      if ((now - doc.ts) < 10 * 60 * 1000) {
        return moment(doc.ts).fromNow()
      } else {
        return moment(doc.ts).calendar()
      }
    }}</span>
    ${ doc => doc.ts ? '' : bel`<div class="boxclose">✖</div>` }
  </div>
</bong-bong-message>
`

module.exports = view
