const funky = require('../../funky')
const emojione = require('emojione')
const bel = require('bel')

function init (elem, opts) {

}

const view = funky`
${init}
<bong-bong-message>
  <div>${ doc => doc.user.nickname }</div>
  <div>${ doc => bel([`<span>${ emojione.toImage(doc.text) }</span>`]) }</div>
</bong-bong-message>
`

module.exports = view
