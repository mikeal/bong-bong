/* globals Notification */
const notify = doc => {
  Notification.requestPermission().then(result => {
    if (result !== 'granted') return
    let title = `${doc.user.login} mentioned you.`
    let body = doc.data.text
    let icon = doc.user.avatar_url
    let n = new Notification(title, {body, icon})
  })
}

module.exports = notify
