const funky = require('funky')
const bongBongTime = require('./bong-bong-time')

function init (elem, opts) {
  elem.querySelector('img').onload = () => {
    elem.parentNode.parentNode._reflow()
  }
}

const view = funky`
${init}
<bong-bong-message>
  <div class="nickname">
    <span class="nick">${ doc => doc.user.nickname }</span>
    ${ bongBongTime }
  </div>
  <img src="${opts => opts.image}" />
</bong-bong-message>
`

module.exports = view
