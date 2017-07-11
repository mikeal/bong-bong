# Bong Bong

[![Greenkeeper badge](https://badges.greenkeeper.io/mikeal/bong-bong.svg)](https://greenkeeper.io/)

Open public chat service built for the web.

## Development

First, pull down the git repository and install the dependencies.

```
$ git clone https://github.com/mikeal/bong-bong.git
$ cd bong-bong
$ npm install
```

Bong Bong is essentialy only two pieces.

* A client-side web application.
* A WebSocket services for querying and writing to a database.

The vast majority of Bong Bong is implemented in the client side JavaScript application. For most development work you'll only need to run the local `budo`
server.

```
$ npm run dev
```

Then open http://localhost:9966 and you'll be looking at the test room on your locally, and dynamically, built website. The room is public and you're still using the public WebSocket service. The test room has nonsense written into it all the time so don't worry about writing random data into this room during development.

If you need to develop on the WebSocket service you need to run a different command and pull up a different address.

```
$ npm run devsocket
```

Then open http://localhost:9966?devsocket=true and you'll be looking at the test room on your locally, and dynamically, built website pointed at your local WebSocket server.

Your local WebSocket server won't have write access to the public database. If you need to do development that includes writing to the database you'll need to point it at a different CouchDB database by setting the `BONG_COUCHDB` environment variable.

## Project Layout

Bong Bong is implemented as a series of re-usable components. Each component is
a mix of pure DOM elements and JavaScript code. There is no "framework," just
plain old JS DOM manipulation. Because Bong Bong already relys on modern
browser APIs (WebSockets, WebRTC) we're free to use modern DOM calls, CSS
features, and many ES6 features that are widely available in all supported
browsers.

```
/components
 - bong-bong.js // Main component and startup JS
 - bong-bong-app.js // Embedabble apps component
 - bong-bong-message.js // Base message component.
 ```