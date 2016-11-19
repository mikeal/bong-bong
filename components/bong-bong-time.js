const bel = require('bel')
const moment = require('moment')

const getString = doc => {
  if (!doc.ts) return ''
  let now = Date.now()
  if ((now - doc.ts) < 10 * 60 * 1000) {
    return moment(doc.ts).fromNow()
  } else {
    return moment(doc.ts).calendar()
  }
}

// TODO: Make funky's parsign a little more tolerant so we can do this easily
module.exports = doc => {
  return bel`
    <span class="ts" ts="${ doc.ts ? '' + doc.ts : 'none' }"
    >${ getString(doc) }</span>
  `
}
