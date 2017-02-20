/* globals alert, localStorage, URL */
const funky = require('funky')
const bel = require('bel')
const moment = require('moment')
const jsonstream2 = require('jsonstream2')
const sodiAuthority = require('sodi-authority')
const sodi = require('sodi')
const events = require('events')
const blurModal = require('blur-modal')
const EventEmitter = require('events').EventEmitter

const websocket = require('websocket-stream')
const methodman = require('methodman')

const globalApps = [
  require('./apps/dropub.json'),
  require('./apps/stickers.json'),
  require('./apps/pixel-pad.json')
]

const bongBongInput = require('./bong-bong-input')
const bongBongMessage = require('./bong-bong-message')
const bongBongSettings = require('./bong-bong-settings')
const bongBongImage = require('./bong-bong-image')
const bongBongApp = require('./bong-bong-app')

const tick = require('./timers')

const defaultStorage = new EventEmitter()
defaultStorage.get = key => localStorage[key]
defaultStorage.set = (key, value) => {
  localStorage[key] = value
  defaultStorage.emit(key, value)
}

const uuid = a => {
  return a ? (a ^ Math.random() * 16 >> a / 4).toString(16)
             : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid)
}

const instant = {behavior: 'instant'}

function findFrame (event) {
  let frames = document.getElementsByTagName('iframe')
  for (var i = 0; i < frames.length; i++) {
    if (frames[i].contentWindow === event.source) return frames[i]
  }
  return false
}

function validAuthority (signature) {
  for (var i = 0; i < sodiAuthority.knownKeys.length; i++) {
    let key = sodiAuthority.knownKeys[i]
    if (signature.publicKey === key.key) {
      if (key.expiration > Date.now()) {
        return true
      }
    }
  }
  return false
}

function onLog (elem, opts) {
  let log = opts.log
  if (!log) throw new Error('Must set the log before setting the feed.')

  if (!opts.storage) {
    opts.storage = defaultStorage
  }
  if (opts.nickname) {
    opts.set('nickname', opts.nickname)
  }

  let displayContainer = elem.querySelector('div.bb-display')

  function insertMessage (el, doc) {
    /*
      This not the simplest way to insert elements in the right order
      but it should be the fastest for our use case because it optimizes
      for new nodes being inserted at the end.
    */
    let before = null
    let spans = [...document.querySelectorAll('span.ts')].reverse()
    let _insert = () => {
      let display = displayContainer
      let top = display.scrollTop
      let bottom = top + display.clientHeight
      let height = display.scrollHeight

      if (before === null) {
        display.appendChild(el)
      } else {
        display.insertBefore(el, before.parentNode.parentNode)
      }

      if (top === 0 || (bottom + el.scrollHeight + 5) > height) {
        // If we are at the very top or very bottom of the scroll
        // focus on the last element.
        display.children[display.children.length - 1].scrollIntoView(instant)
      } else {
        // TODO: check if we were inserted before or after the prior
        //       scroll point and adjust accordingly
      }
    }
    for (var i = 0; i < spans.length; i++) {
      let span = spans[i]
      let _string = span.getAttribute('ts')
      let ts
      if (_string === 'none') {
        ts = Infinity
      } else {
        ts = +_string
      }
      if (ts < (doc.ts ? doc.ts : Infinity)) {
        return _insert()
      } else {
        before = span
      }
    }
    _insert() // insert before the first element
  }

  let onTextMessage = (doc) => {
    // TODO: Find existing node and update if exists
    let el = bongBongMessage(doc)
    insertMessage(el, doc)
    tick()
  }

  let post = (type, data, cb) => {
    opts.writeData({type, data}, cb)
  }

  log.on('data', obj => {
    let doc = obj.doc
    let user = obj.user
    if (!doc || !doc.type || !user) return
    doc.user = user

    switch (doc.type) {
      case 'text': {
        onTextMessage(doc)
        break
      }
      case 'app': {
        let iframe = bel`
          <iframe class="bong-bong-app-modal" frameborder=0
                  src="${doc.data.embed}" scrolling=no />
        `
        // let url = new URL(doc.data.embed)
        let el = bongBongApp(doc)
        insertMessage(el, doc)
        tick()
        let height = 100
        let width = el.offsetWidth - 32
        iframe.setAttribute('height', Math.floor(height))
        iframe.setAttribute('width', Math.floor(width))
        iframe.setAttribute('embed-uuid', doc.uuid)
        iframe.setAttribute('embed-latestKey', doc._id)
        iframe.setAttribute('id', `embed-${doc.uuid}`)
        let pending = []
        iframe.write = data => {
          pending.push(data)
        }
        iframe.onload = () => {
          iframe.write = data => {
            iframe.contentWindow.postMessage({data}, '*')
          }
          while (pending.length) {
            iframe.write(pending.shift())
          }
        }
        el.appendChild(iframe)
        break
      }
      case 'app-data': {
        let iframe = document.getElementById(`embed-${doc['embed-uuid']}`)
        if (!iframe.write) {
          iframe.write = data => {
            iframe.contentWindow.postMessage({data}, '*')
          }
        }
        iframe.write(doc.data)
        break
      }
      case 'image': {
        let el = bongBongImage(doc)
        insertMessage(el, doc)
        break
      }
    }
  })

  let childMessages = {}
  window.addEventListener('message', msg => {
    if (msg.data &&
        typeof msg.data === 'string' &&
        msg.data.slice(0, 'setImmediate'.length) === 'setImmediate') {
      return // setImmediate polyfill.
    }
    console.log(msg)
    let frame = findFrame(msg)
    // Height Set
    if (msg.data && msg.data.height) {
      frame.setAttribute('height', msg.data.height)
      return
    }
    let nodeid = frame.getAttribute('embed-uuid')
    if (!nodeid) {
      // Initial Doc Write.
      if (!childMessages[msg.origin]) {
        return console.error('no app', msg)
      }
      childMessages[msg.origin](msg)
    } else {
      if (!msg.data.app && !msg.data.data) {
        return console.error('not app data', msg)
      }
      // Doc write from app in stream.
      let uuid = frame.getAttribute('embed-uuid')
      let latestKey = frame.getAttribute('embed-latestKey')
      let data = {
        data: msg.data.data,
        origin: msg.origin,
        api: msg.data.api,
        app: msg.data.app,
        parent: latestKey,
        'embed-uuid': uuid
      }
      opts.writeData({type: 'app-data', data}, (err, info) => {
        if (err) return console.error(err)
        frame.setAttribute('embed-latestKey', info.id)
      })
    }
  })

  elem.appMessage = (app) => {
    let iframe = bel`
      <iframe class="bong-bong-app-modal" frameborder=0
              src="${app.iframe}" scrolling=no />
    `
    let url = new URL(app.iframe)
    let doc = {type: 'app'}
    let el = bongBongApp(doc)
    childMessages[url.origin] = msg => {
      let info = {data: msg.data, origin: msg.origin}

      let cleanup = (ts) => {
        // Remove close box
        let closebox = el.querySelector('div.boxclose')
        closebox.parentNode.removeChild(closebox)
        // Set time info
        let time = el.querySelector('span.ts')
        time.setAttribute('ts', ts)
        let now = Date.now()

        if ((now - ts) < 10 * 60 * 1000) {
          time.innerHTML = moment(ts).fromNow()
        } else {
          time.innerHTML = moment(ts).calendar()
        }
      }

      // let setNodeId = node => {
      //   iframe.setAttribute('embed-uuid', node.value.uuid)
      //   iframe.setAttribute('embed-latestKey', node.key)
      //   iframe.setAttribute('id', `embed-${node.value.uuid}`)
      // }

      // Image insert
      if (msg.data && msg.data.image) {
        info.image = msg.data.image
        post('image', info, (err, node) => {
          if (err) return console.error(err)
        })
      }
      if (msg.data && msg.data.embed) {
        post('app', info, (err, node) => {
          if (err) return console.error(err)
          cleanup(Date.now())
        })
      }
      childMessages[url.origin] = null
    }

    insertMessage(el, doc)
    tick()
    let height = app.height || 100
    let width = el.offsetWidth - 32
    iframe.setAttribute('height', Math.floor(height))
    iframe.setAttribute('width', Math.floor(width))
    el.appendChild(iframe)
    el.querySelector('div.boxclose').onclick = e => {
      let box = e.target.parentNode.parentNode
      box.parentNode.removeChild(box)
    }
  }

  let postTextMessage = (text) => {
    post('text', {text})
    return true
  }

  let inputView = bongBongInput({log, postTextMessage, apps: globalApps})
  let footer = elem.querySelector('div.bb-footer')
  footer.appendChild(inputView)

  opts.storage.on('nickname', nickname => {
    user.nickname = nickname
    elem.setUser(user)
  })

  let settings = bongBongSettings(opts)
  elem.querySelector('div.bb-header').appendChild(settings)

  // set the height so that overflow works.
  let reflow = () => {
    let header = elem.querySelector('div.bb-header')
    let footer = elem.querySelector('div.bb-footer')
    let height = elem.scrollHeight - (header.offsetHeight + footer.offsetHeight + 50)
    let display = elem.querySelector('div.bb-display')
    display.style.height = height + 'px'
    if (display.children.length) {
      display.children[display.children.length - 1].scrollIntoView(instant)
    }
  }
  reflow()
  elem._reflow = reflow
  window.onresize = reflow
}

function init (elem, opts) {
  if (!opts) opts = {}
  if (opts.log) {
    return onLog(elem, opts)
  }

  let room = opts.room

  if (!room) throw new Error('room not set')

  host = 'bong-bong.now.sh'
  scheme = 'wss'

  if ((new URL(window.location)).searchParams.get('devsocket')) {
    scheme = 'ws'
    host = 'localhost:8080'
  }

  const ws = websocket(`${scheme}://${host}`)

  if (localStorage.bongBongToken) {
    let token = JSON.parse(localStorage.bongBongToken)
    opts.sodi = sodi(token.keypair)
    opts.token = token
  }

  if (!opts.sodi) {
    opts.login = () => {
      let unblur
      let loginIframe = sodiAuthority((err, info) => {
        if (err) throw err
        opts.keypair = info.keypair
        opts.sodi = sodi(info.keypair)
        opts.signature = info.signature
        delete opts.login
        if (opts.onLogin) opts.onLogin()
        let token = {
          keypair: {
            publicKey: info.keypair.publicKey.toString('hex'),
            secretKey: info.keypair.secretKey.toString('hex')
          },
          signature: info.signature
        }
        localStorage.bongBongToken = JSON.stringify(token)
        opts.token = token
        unblur()
      })
      unblur = blurModal(loginIframe)
    }
  }

  const meth = methodman(ws)
  console.log('starting')
  meth.on('commands:base', remote => {
    // TODO: initial query
    console.log('remote')
    remote.joinRoom(room, (err, info) => {
      if (err) throw err
    })
    opts.writeData = (data, cb) => {
      data.ts = Date.now()
      let doc = {
        message: data,
        signature: opts.sodi.sign(JSON.stringify(data)).toString('hex'),
        publicKey: opts.sodi.public,
        authorities: [opts.token.signature]
      }
      if (!cb) cb = () => {} // TODO: remove need for this.
      remote.writeData(room, doc, cb)
    }
    // TODO: opts.writeData

    remote.recent(room, (err, info) => {
      // TODO: add button for further paging.
    })
  })
  meth.on('stream:database', (stream, id) => {
    console.log('database stream')
    // TODO: decode JSON
    let parser = jsonstream2.parse([/./])
    let log = new events.EventEmitter()
    let verify = doc => {
      let msg = JSON.stringify(doc.message)
      return sodi.verify(msg, doc.signature, doc.publicKey)
    }
    stream.pipe(parser).on('data', obj => {
      // Check if this was signed by a valid authority
      if (!validAuthority(obj.authorities[0])) return
      // Verify both the authority signature and message
      // signature are valid.
      if (verify(obj) &&
          verify(obj.authorities[0]) &&
          obj.authorities[0].message.publicKey === obj.publicKey
        ) {
        let user = obj.authorities[0].message.user
        let doc = obj.message
        log.emit('data', {user, doc})
      }
    })
    opts.log = log
    onLog(elem, opts)
    if (opts.login) opts.login()

    let reconnect = e => {
      console.log('Disconnected', e)
      // TODO: Implement reconnect logic.
    }
    stream.on('error', reconnect)
    stream.on('end', reconnect)
  })
}

const view = funky`
${init}
<bong-bong>
  <link href='//fonts.googleapis.com/css?family=Lato:400,700' rel='stylesheet' type='text/css' />
  <style>
  bong-bong {
    font-family: 'Lato', sans-serif;
    font-size: 22px;
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }
  bong-bong div.bb-display {
    flex: 1;
    background-color: #f2f2f2;
    padding-top: 10px;
    overflow: auto;
  }
  bong-bong bong-bong-input {
    margin-top: auto;
  }
  bong-bong div.bb-header {
    border-bottom: 1px solid #dbdbdb;
  }
  bong-bong div.bb-footer {
    border-top: 1px solid #dbdbdb;
    z-index: 2;
  }
  bong-bong-message {
    background-color: #fff;
    border: 1px solid #e1e8ed;
    border-radius: 5px;
    padding: 15px;
    display: block;
    margin-bottom: 10px;
    margin-left: 10px;
    margin-right: 10px;
    font-size: 15px;
    min-height: min-content;
  }
  bong-bong-message div.avatar {

  }
  bong-bong-message span.nick {
    font-weight: bold;
  }
  bong-bong-message span.ts {
    font-weight: bold;
    font-size: 12px;
    color: rgb(158, 158, 166);
    outline-color: rgb(59, 153, 252);
    outline-width: 4px;
    font-weight: lighter;
  }
  bong-bong-message div.text {

  }
  bong-bong-message img.emojione {
    max-height: 1.1em;
    font-size: 18px;
    margin-bottom: -2px;
    line-height: 16px;
  }
  bong-bong-message iframe {
    margin-top: 13px;
  }
  span.bb-download {
    cursor: pointer;
  }
  div.bb-file {
    padding: 10px;
  }
  div.bb-file a {
    color: black;
  }
  div.bb-file span.bb-not-downloaded {
    color: grey;
  }
  div.boxclose {
    line-height: 10px;
    width: 15px;
    height: 15px;
    line-height: 14px;
    font-size: 8pt;
    font-family: tahoma;
    margin-top: -20px;
    margin-right: -20px;
    float: right;

    background-color: #FFCCCC;
    border-radius: 10px;
    border-color: red;
    border-style: solid;
    border-width: 1px;

    text-align: center;
    vertical-align: middle;

    color: red;
    cursor: pointer;
  }
  </style>
  <div class="bb-header"></div>
  <div class="bb-display"></div>
  <div class="bb-footer"></div>
</bong-bong>
`

module.exports = view
