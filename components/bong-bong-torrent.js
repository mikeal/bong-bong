const funky = require('../../funky')
const bel = require('bel')
const moment = require('moment')

function init (elem, opts) {

}

const view = funky`
${init}
<bong-bong-message>
  <div class="nickname">
    <span class="nick">${ doc => doc.user.nickname }</span>
    <span class="ts" ts="${ doc => doc.ts }"
    >${ doc => {
      let now = Date.now()
      if ((now - doc.ts) < 10 * 60 * 1000) {
        return moment(doc.ts).fromNow()
      } else {
        return moment(doc.ts).calendar()
      }
    }}<span>
  </div>
  <bong-bong-torrent>
  ${ opts => opts.files.map(f => {
    return bel`<div>${f.name}</div>`
  }) }
  </bong-bong-torrent>
</bong-bong-message>
`

module.exports = view
