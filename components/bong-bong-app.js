const funky = require('funky')
const bongBongMessage = require('./bong-bong-message')
const bel = require('bel')

const view = funky`
<bong-bong-app>
  ${ doc => doc.ts ? '' : bel`<div class="boxclose">✖</div>` }
</bong-bong-app>
`

module.exports = opts => {
  opts.msgBody = view(opts)
  return bongBongMessage(opts)
}