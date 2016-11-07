/* globals alert, localStorage */
const createSwarm = require('../../killa-beez')
const funky = require('../../funky')
const levelup = require('levelup')
// const levjs = require('level-js')
const memdown = require('memdown')
const isBuffer = require('is-buffer')
const xhr = require('xhr')
const dragDrop = require('drag-drop')
const webtorrent = require('webtorrent')()
const EventEmitter = require('events').EventEmitter

const bongBongInput = require('./bong-bong-input')
const bongBongMessage = require('./bong-bong-message')
const bongBongTorrent = require('./bong-bong-torrent')
const bongBongSettings = require('./bong-bong-settings')

const tick = require('./timers')

const defaultSignalExchange = 'https://signalexchange.now.sh'
const defaultRoomExchange = 'https://roomexchange.now.sh'

const defaultStorage = new EventEmitter()
defaultStorage.get = key => localStorage[key]
defaultStorage.set = (key, value) => {
  localStorage[key] = value
  defaultStorage.emit(key, value)
}

if (!window.setImmediate) {
  window.setImmediate = (cb) => setTimeout(cb, 0)
}

const instant = {behavior: 'instant'}

function getRtcConfig (cb) {
  xhr({
    url: 'https://instant.io/rtcConfig',
    timeout: 10000
  }, (err, res) => {
    if (err || res.statusCode !== 200) {
      cb(new Error('Could not get WebRTC config from server. Using default (without TURN).'))
    } else {
      var rtcConfig
      try {
        rtcConfig = JSON.parse(res.body)
      } catch (err) {
        return cb(new Error('Got invalid WebRTC config from server: ' + res.body))
      }
      cb(null, rtcConfig)
    }
  })
}

function setupDragDrop (elem, postTorrent) {
  dragDrop(elem, {
    onDrop: files => {
      webtorrent.seed(files, torrent => {
        postTorrent(files, torrent)
      })
    },
    onDragOver: () => {
      // TODO: tmp modal
    },
    onDragLeave: () => {
      // TODO: tmp modal
    }
  })
}

let pluck = (obj, attrs) => {
  let ret = {}
  attrs.forEach(a => { ret[a] = obj[a] })
  return ret
}

function onLog (elem, opts) {
  let log = opts.log
  let users = opts.users = {}
  let publicKey = opts.publicKey || opts.swarm.publicKey
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

      if (top === 0 || bottom + 5 > height) {
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
      let ts = +span.getAttribute('ts')
      if (ts < doc.ts) {
        return _insert()
      } else {
        before = span
      }
    }
    _insert() // insert before the first element
  }

  let onTextMessage = (doc, node) => {
    // TODO: Find existing node and update if exists
    let el = bongBongMessage(doc)
    insertMessage(el, doc)
    tick()
  }

  function onTorrent (doc) {
    doc.webtorrent = webtorrent
    let el = bongBongTorrent(doc)
    insertMessage(el, doc)
    tick()
  }

  log.on('add', node => {
    let doc
    if (isBuffer(node.value)) {
      doc = JSON.parse(node.value.toString())
    } else if (node.value.type) {
      doc = node.value
    }
    if (!doc || !doc.type) return
    console.log('doc', doc)
    if (doc && doc.type) {
      switch (doc.type) {
        case 'user': {
          users[doc.publicKey] = doc
          break
        }
        case 'text': {
          onTextMessage(doc, node)
          break
        }
        case 'torrent': {
          onTorrent(doc)
          break
        }
      }
    }
  })

  let user = {
    nickname: opts.storage.get('nickname') || null
  }
  let post = (type, obj) => {
    obj.type = type
    obj.user = user
    obj.ts = Date.now()
    log.add(null, obj)
  }
  let userKey = null
  elem.setUser = (_user) => {
    user = _user
    user.publicKey = publicKey
    user.type = 'user'
    log.add(userKey ? [userKey] : null, user, (err, node) => {
      if (err) return console.error(err)
      userKey = node.key
    })
  }
  elem.setUser(user)

  let postTextMessage = (text) => {
    if (!user.nickname) {
      alert('Please set your nickname before posting.')
      return false
    }
    post('text', {text})
    return true
  }

  let inputView = bongBongInput({log, postTextMessage})
  let footer = elem.querySelector('div.bb-footer')
  footer.appendChild(inputView)

  opts.storage.on('nickname', nickname => {
    user.nickname = nickname
    elem.setUser(user)
  })

  let settings = bongBongSettings(opts)
  elem.querySelector('div.bb-header').appendChild(settings)

  setupDragDrop(elem, (files, torrent) => {
    let obj = {}
    let content = ['name', 'type', 'size', 'lastModified']
    obj.files = files.map(f => pluck(f, content))
    obj.torrent = pluck(torrent, ['magnetURI', 'infoHash'])
    obj.torrent.size = torrent.length
    obj.torrent.files = torrent.files.length
    post('torrent', obj)
  })
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

function onSwarm (elem, opts) {
  opts.log = opts.swarm.log
  onLog(elem, opts)
}

function init (elem, opts) {
  if (!opts) opts = {}
  if (opts.log) {
    return onLog(elem, opts)
  }
  if (!opts.log && opts.swarm) {
    return onSwarm(elem, opts)
  }

  if (!opts.log && !opts.swarm && opts.room) {
    getRtcConfig((err, rtcConfig) => {
      if (err) return console.error(err)

      let signalExchange = opts.signalExchange || defaultSignalExchange
      let roomExchange = opts.roomExchange || defaultRoomExchange
      let room = opts.room

      if (!room) throw new Error('room not set')
      let ns = opts.ns || 'bong-bong'
      room = `${ns}:${room}`
      let sopts = {
        levelup: levelup(`./${room}`, {db: memdown}),
        config: rtcConfig
      }
      let swarm = createSwarm(signalExchange, sopts)
      swarm.joinRoom(roomExchange, room)
      opts.swarm = swarm
      onSwarm(elem, opts)
    })
    return
  }
  throw new Error('Must pass either feed, swarm, or room option.')
}

const view = funky`
${init}
<bong-bong>
  <link href='http://fonts.googleapis.com/css?family=Lato:400,700' rel='stylesheet' type='text/css' />
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
  </style>
  <div class="bb-header"></div>
  <div class="bb-display"></div>
  <div class="bb-footer"></div>
</bong-bong>
`

module.exports = view
