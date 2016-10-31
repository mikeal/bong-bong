const funky = require('../../funky')
const emojione = require('emojione')
const bel = require('bel')

function init (elem, opts) {

}

var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}

function toTextElement (str) {
  str = escapeHtml(str)
  return bel([`<span>${emojione.toImage(str)}</span>`])
}

const view = funky`
${init}
<bong-bong-message>
  <div class="nickname">${ doc => doc.user.nickname }</div>
  <div class="text">${ doc => toTextElement(doc.text) }</div>
</bong-bong-message>
`

module.exports = view
