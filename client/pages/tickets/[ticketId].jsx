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
    onSuccess: (order) => console.log(order),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={doRequest} className='btn btn-primary'>
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
