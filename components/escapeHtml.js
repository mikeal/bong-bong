const eMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
}

module.exports = string => String(string).replace(/[&<>"'\/]/g, s => eMap[s])
