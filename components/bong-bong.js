/* globals alert, localStorage */
const createSwarm = require('../../killa-beez')
const funky = require('../../funky')
const levelup = require('levelup')
const levjs = require('level-js')
const isBuffer = require('is-buffer')
const xhr = require('xhr')
const EventEmitter = require('events').EventEmitter

const bongBongInput = require('./bong-bong-input')
const bongBongMessage = require('./bong-bong-message')
const bongBongSettings = require('./bong-bong-settings')

const defaultSignalExchange = 'https://signalexchange.now.sh'
const defaultRoomExchange = 'https://roomexchange.now.sh'

const defaultStorage = new EventEmitter()
defaultStorage.get = key => localStorage[key]
defaultStorage.set = (key, value) => {
  localStorage[key] = value
  defaultStorage.emit(key, value)
}

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

  let onTextMessage = (doc, node) => {
    // TODO: Find existing node and update if exists
    console.log(node)
    let el = bongBongMessage(doc)
    elem.querySelector('div.bb-display').appendChild(el)
  }

  log.on('add', node => {
    let doc
    if (isBuffer(node.value)) {
      doc = JSON.parse(node.value.toString())
    } else if (node.value.type) {
      doc = node.value
    }
    if (!doc || !doc.type) return
    if (doc && doc.type && doc.type === 'user') {
      users[doc.publicKey] = doc
      console.log('user', user)
    }
    if (doc && doc.type && doc.type === 'text') {
      console.log('text', doc)
      onTextMessage(doc, node)
    }
  })

  let user = {
    nickname: opts.storage.get('nickname') || null
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
      console.log('no nick', alert)
      alert('Please set your nickname before posting.')
      return false
    }
    log.add(null, {text: text, user: user, type: 'text'})
    return true
  }

  let inputView = bongBongInput({log, postTextMessage})
  elem.querySelector('div.bb-footer').appendChild(inputView)

  opts.storage.on('nickname', nickname => {
    user.nickname = nickname
    elem.setUser(user)
  })

  let settings = bongBongSettings(opts)
  elem.querySelector('div.bb-header').appendChild(settings)
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
        levelup: levelup('./' + room + Math.random(), {db: levjs}),
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
  }
  bong-bong bong-bong-input {
    margin-top: auto;
  }
  bong-bong div.bb-header {
    border-bottom: 1px solid #dbdbdb;
  }
  bong-bong div.bb-footer {
    border-top: 1px solid #dbdbdb;
  }
  bong-bong-message {
    border-radius: 1px;
    border: 1px solid #d3d3d3;
    background-color: white;
    display: block;
    margin: .5em;
    padding: .5em;
    font-size: 18px;
  }
  bong-bong-message div.avatar {

  }
  bong-bong-message div.nickname {
    font-weight: bold;
  }
  bong-bong-message div.text {

  }
  </style>
  <div class="bb-header"></div>
  <div class="bb-display"></div>
  <div class="bb-footer"></div>
</bong-bong>
`

module.exports = view
