const follow = require('follow')
const couch = require('couch')

module.exports = (url) => {
  const db = couch(url)
  const feed = new follow.Feed({db: url, since: 'now'})
  const exports = {db, feed}
  feed.follow()
  return exports
}