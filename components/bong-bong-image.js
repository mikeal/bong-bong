const funky = require('funky')
const bongBongTime = require('./bong-bong-time')

const view = funky`
<bong-bong-message>
  <div class="nickname">
    <span class="nick">${ doc => doc.user.nickname }</span>
    ${ bongBongTime }
  </div>
  <img src="${opts => opts.image}" />
</bong-bong-message>
`

module.exports = view
