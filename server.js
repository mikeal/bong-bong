const websocket = require('websocket-stream')
const methodman = require('methodman')
const jsonstream2 = require('jsonstream2')
const corsify = require('corsify')
const events = require('events')
const http = require('http')
const sodi = require('../sodi')
const sodiAuthority = require('../sodi-authority')

const defaultdb = 'https://mikeal.cloudant.com/bong-bong'
const storage = require('./lib/storage')(process.env.BONG_COUCHDB || defaultdb)

const rooms = new events.EventEmitter()

storage.feed.on('change', change => {
  let [room, ts] = change.id.split('@')
  if (rooms.listenerCount(room)) {
    storage.db.get(change.id, (err, doc) => {
      if (err) return console.error('BAD!!!')
      console.log(room, doc)
      rooms.emit(room, doc)
    })
  }
})

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

function onWebsocketStream (stream) {
  let rpc = {}
  let databaseStream = jsonstream2.stringify()
  let inRooms = []
  let dbWrite = obj => databaseStream.write(obj)
  rpc.joinRoom = (room, cb) => {
    rooms.on(room, dbWrite)
    inRooms.push(room)
  }
  rpc.writeData = (room, doc, cb) => {
    doc.authorities[0]
    let msg = JSON.stringify(doc.message)
    let verified = sodi.verify(msg, doc.signature, doc.publicKey)
    if (!verified) {
      console.log('bad sign')
      return cb(new Error('Invalid signature.'))
    }
    if (!validAuthority(doc.authorities[0])) {
      console.error('no valid auth')
      return cb(new Error('No valid authority'))
    }
    doc._id = `${room}@${(new Date()).toISOString()}`
    console.log('posting', doc)
    storage.db.post(doc, cb)
  }

  var meth = methodman(stream)
  meth.commands(rpc, 'base')
  databaseStream.pipe(meth.stream('database'))

  let clean = () => inRooms.forEach(room => rooms.removeListener(room, dbWrite))
  stream.on('error', clean)
  stream.on('end', clean)
}

const cors = corsify({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization'
})

const handler = (req, res) => {}
const app = http.createServer(cors(handler))
const wss = websocket.createServer({server: app}, onWebsocketStream)
app.listen(8080)
