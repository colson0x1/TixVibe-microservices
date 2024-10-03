// @ts-nocheck
// To associate an existing Order and Ticket together
const ticket = await Ticket.findOne({});
const order = await Order.findOne({});

order.ticket = ticket;
await order.save();

// To associate an existing Ticket with a *new* Order
const ticket = await Ticket.findOne({});
const order = Order.build({
  ticket: ticket,
  userId: '...',
  status: OrderStatus.Created,
  expiresAt: tomorrow,
});

await order.save();

// To fetch an existing Order from the database with its associated Ticket
// i.e to find out what Order is associated with what given Ticket
// 'ticket' is the name of the record or key on the Order that we want to populate
// Then when mongoose goes and finds this Order inside of the database, it will
// also fetch the associated ticket with it as well
const order = await Order.findById('...').populate('ticket');
// Access ticket off the Order
// know the price of the ticket
order.ticket.price;
// know the title of the ticket
order.ticket.title;
