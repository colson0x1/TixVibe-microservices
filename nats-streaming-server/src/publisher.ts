import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

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
stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: '1111',
      title: 'Tomorrowland',
      price: 3300,
    });
  } catch (err) {
    console.log(err);
  }

  // Information we want to share
  /* const data = {
    id: '1111',
    title: 'Tomorrowland',
    price: 3300
  } */
  // Gotcha around NATS: We can only share strings or essentially raw data
  // We cannot share directly a plain JavaScript object
  // In order to share this or send it over to NATS Streaming Server, we first
  // have to convert it into JSON which is a plain string
  // So essentially all of our data, before we send over to NATS Streaming
  // Server, we just have to convert it into JSON!
  /* const data = JSON.stringify({
    id: '1111',
    title: 'Tomorrowland',
    price: 3300,
  }); */

  // First argument to publish is the: subject name or name of the channel
  // Second argument is the data we want to share
  // There is this optional third argument which is a callback function. This
  // fn is going to be invoked after we publish the data
  /* stan.publish('ticket:created', data, () => {
    console.log('Event published');
  }); */

  // @ Event is reffered to as message in the world of NATS
});
