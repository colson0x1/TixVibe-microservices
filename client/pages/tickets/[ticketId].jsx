import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      // body is going to be the id of the ticket that we want to purchase
      ticketId: ticket.id,
    },
    // onSuccess is going to be invoked with whatever response we get back
    // from the request
    // So in this case, hopefully it will be the `order` that was created
    // onSuccess: (order) => console.log(order),
    // We want to navigate a user over to the OrderShow Component whenever
    // onSuccess callback gets invoked cause that's the point at which we know
    // that, hey, order has been created. We should now navigate the user
    // over and show them details about this order.
    // onSuccess is going to be called with the order that was just created
    // i.e We have already access to the id of the 0rder
    // NOTE: Its different when programatically navigating over to the
    // wildcard route
    // First argument now is, essentially the path to the file inside of pages
    // dir i.e `/orders/[orderId]`
    // Second argument is, the actual url that we're tryna go to i.e
    // order/ the real id of the order i.e `{/orders/${order.id}}`
    onSuccess: (order) =>
      Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={() => doRequest()} className='btn btn-primary'>
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  // We're specifically pulling out a property called ticketId because that
  // is what I named this file i.e `[ticketId]`
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  // This returned object right here is going to get merged into all the
  // different props that are provided to TicketShow component
  return { ticket: data };
};

export default TicketShow;
