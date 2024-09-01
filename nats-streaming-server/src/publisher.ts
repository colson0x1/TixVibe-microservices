import nats from 'node-nats-streaming';

// @ stan -> NATS Project terminology for client
// NATS is a library
// stan is am actual instance or a client that is used to connect to
// NATS streaming server
const stan = nats.connect('tixvibe', 'stillhome', {
  url: 'http://localhost:4222',
});

// await for this stan to actually connect to the NATS streaming server
// So promise (async/await) can't be used
// We have to take a primarily event driven approach

// After the client successfully connects to the NATS streaming server, its
// going to emit a connect event
// So we're gonna listen for the connect event and fn as a second argument
// The fn will be executed after the client has successfully connected to
// the NATS streaming server
stan.on('connect', () => {
  console.log('Publisher connected to NATS');
});
