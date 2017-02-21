const funky = require('funky')

const bongBongTime = require('./bong-bong-time')

const init = (elem, opts) => {
  if (opts.id) elem.id = opts.id
}

const view = funky`
${init}
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
    bong-msg-content {
      flex: flex-grow;
      width: 100%;
    }
    bong-msg-content div.nickname,
    bong-msg-content bong-msg-body,
    bong-msg-content bong-msg-body iframe {
      width: 100%;
    }

    bong-msg-body bong-text p {
      margin-top: 5px;
    }

  </style>
  <bong-avatar>
    <img src="${ doc => doc.user.avatar_url }" />
  </bong-avatar>
  <bong-msg-content>
    <div class="nickname">
      <span class="nick">${ doc => doc.user.login }</span>
      ${ bongBongTime }
    </div>
    <bong-msg-body>
      ${ doc => doc.msgBody }
    </bong-msg-body>
  </bong-msg-content>
</bong-bong-message>
`

module.exports = view
