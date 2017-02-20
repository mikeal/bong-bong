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
  <style>
    bong-bong-message {
      display: flex;
    }
    bong-avatar img {
      width: 50px;
      height: 50px;
      border-radius: 3px;
      border: 1px solid #e1e8ed;
    }
    bong-avatar {
      margin-right: 15px;
    }
  </style>
  <bong-avatar>
    <img src="${ doc => doc.user.avatar_url }" />
  </bong-avatar>
  <bong-msg-body>
    <div class="nickname">
      <span class="nick">${ doc => doc.user.login }</span>
      ${ bongBongTime }
    </div>
    <div class="text">${ doc => toTextElement(doc.data.text) }</div>
  </bong-msg-body>
</bong-bong-message>
`

module.exports = view
