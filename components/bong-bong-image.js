const funky = require('funky')
const bongBongMessage = require('./bong-bong-message')

function init (elem, opts) {
  elem.querySelector('img').onload = () => {
    elem.parentNode.parentNode.parentNode.parentNode.parentNode._reflow()
  }
}

const view = funky`
${init}
<bong-bong-image>
  <img src="${opts => opts.data.image}" />
</bong-bong-image>
`

module.exports = opts => {
  opts.msgBody = view(opts)
  return bongBongMessage(opts)
}