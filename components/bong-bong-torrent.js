const funky = require('../../funky')
const bel = require('bel')

function init (elem, opts) {

}

const view = funky`
${init}
<bong-bong-message>
  <div class="nickname">${ doc => doc.user.nickname }</div>
  <bong-bong-torrent>
  ${ opts => opts.files.map(f => {
    return bel`<div>${f.name}</div>`
  }) }
  </bong-bong-torrent>
</bong-bong-message>
`

module.exports = view
