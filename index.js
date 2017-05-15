const { Address6, Address4 } = require('ip-address');
const net = require('net');
const http = require('http');
const inspector = require('./inspector');

var server = http.createServer(function(req, res) {
  res.end('Hello');
});

server.listen(1337);
