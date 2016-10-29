const createSwarm = require('../../killa-beez')
const funky = require('../../funky')
const levelup = require('levelup')
const levjs = require('level-js')
const isBuffer = require('is-buffer')
const xhr = require('xhr')

const bongBongMessage = require('./bong-bong-message')
const bongBongInput = require('./bong-bong-input')

const defaultSignalExchange = 'https://signalexchange.now.sh'
const defaultRoomExchange = 'https://roomexchange.now.sh'

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

function init (elem) {
  let users = {}

  let appendMessage = (doc) => {
    console.log('txt', doc)
  }

  elem.on('feed', feed => {
    let log = elem.get('log')
    let swarm = elem.get('swarm')
    if (!log) throw new Error('Must set the log before setting the feed.')

    log.on('add', node => {
      // console.log('add', node)
      let doc
      if (isBuffer(node.value)) {
        doc = JSON.parse(node.value.toString())
      } else if (node.value.type) {
        doc = node.value
      }
      if (!doc) return
      // console.log('doc', doc)
      if (doc && doc.type && doc.type === 'user') {
        users[doc.publicKey] = doc
        console.log('user', user)
      }
      if (doc && doc.type && doc.type === 'text') {
        appendMessage(doc)
      }
    })
    // log.on('preadd', (node) => {
    //   console.log('preadd', node)
    // })
    // log.on('reject', () => console.log('reject'))

    let user = {
      nickname: elem.get('nickname') || null,
      publicKey: swarm.publicKey,
      type: 'user'
    }
    let userKey = null
    elem.on('user', user => {
      log.add(userKey ? [userKey] : null, user, (err, node) => {
        if (err) return console.error(err)
        userKey = node.key
      })
    })
    elem.on('nickname', nickname => {
      user.nickname = nickname
      elem.set('user', user)
    })
    elem.set('user', user)

    window.log = log
  })

  elem.on('swarm', swarm => {
    elem.set('log', swarm.log)
    elem.set('feed', swarm.feed)
  })

  elem.on('rtcConfig', rtcConfig => {
    if (!elem.get('swarm')) {
      let signalExchange = elem.get('signal-exchange') || defaultSignalExchange
      let roomExchange = elem.get('room-exchange') || defaultRoomExchange

      let room = elem.get('room')
      if (!room) throw new Error('room not set')
      let ns = elem.get('bong-bong-ns') || 'bong-bong'
      room = `${ns}:${room}`
      let opts = {levelup: levelup('./'+room+Math.random(), {db: levjs}), config: rtcConfig}
      let swarm = createSwarm(signalExchange, opts)
      swarm.joinRoom(roomExchange, room)
      elem.set('swarm', swarm)
    }
  })

  elem.on('connected', () => {
    getRtcConfig((err, rtcConfig) => {
      if (err) return console.error(err)
      elem.set('rtcConfig', rtcConfig)
    })
  })
}

funky`
${init}
<bong-bong>
</bong-bong>
<style>
:host {
  display: flex;
}
div.viewer {
  width:100%;
}
</style>
<div class="viewer">
  <div class="messages"></div>
</div>
<bong-bong-input>
</bong-bong-input>
<slot></slot>
`

module.exports = shaolin
