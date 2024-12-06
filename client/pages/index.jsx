// import buildClient from '../api/build-client';
import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {
  // console.log(currentUser);
  // axios.get('/api/users/currentuser').catch((err) => console.log(err.message));
  // console.log(currentUser);
  // console.log(tickets);

  // Helper variable where Im looping over my array of tickets and building up
  // a separate row for each ticket
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          {/* Here, `href` kind of describes the generic or the general route 
          without any customized ids or anything like that. Then we seperately
          provide `as` prop and that is the real URL that we are trying to
          navigate to */}
          {/* <Link href='/ticket/[ticketId]' as={`/tickets/${ticket.id}`}> */}
          <Link
            href={{
              pathname: 'tickets/[ticketId]',
              query: { ticketId: ticket.id },
            }}
          >
            View
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className='table'>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

// Now its going to be really easy for us to fetch some data using the
// `client` argument or `currentUser` without having to make a follow up
// request to fetch the current user (i.e inside of Landing Page getInitialProps
// fn) AND without having to import the `buildClient` function to build up
// a client inside the getInitialProps here!
LandingPage.getInitialProps = async (context, client, currentUser) => {
  /*
  console.log('LANDING PAGE!');
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');

  return data;
  */
  // return {};

  // Whenever we make use of Axios to fetch some data, which is what this client
  // really is, we get back a big `res` or `response` object and the actual data
  // that we care about is nested on the `data` property.
  const { data } = await client.get('/api/tickets');

  // Return an object with a key of tickets and refer to that data
  // This returned object right here, everything inside of here, is giong to be
  // merged into the props that are being passed to the Landing Page i.e because
  // this object has a key of `tickets`, we can now receive this prop as
  // `tickets` inside of the actual component
  return { tickets: data };
};

export default LandingPage;

/* LandingPage.getInitialProps = async ({ req }) => { */
// console.log(req.headers);
/* const response = await axios
    .get('/api/users/currentuser')
    .catch((err) => console.log(err.message));

  return response.data; */

// if (typeof window === 'undefined') {
// Executed on the Server
// Request should be made to
// http://ingress-nginx-controller.ingress-nginx.svc.cluster.local

// @ Make requests over to Ingress NGINX and route off to Auth Service
// Reach Ingress NGINX and specify route to forward request over to Auth Service
// const { data } = await axios.get(
// 'http://SERVICENAME.NAMESPACE.svc.cluster.local'
// 'http://ingress-nginx.ingress.nginx.svc.cluster.local'
/* 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser', */
// {
/* headers: {
          Host: 'tixvibe.dev',
        }, */
// headers: req.headers,
// },
// );

// return data;
// } else {
// Executed on the Browser
// Request can be made with a base url of ''
// const response = await axios.get('/api/users/currentuser');
// return response.data;

// const { data } = await axios.get('/api/users/currentuser');
/*
 *  If user is signed out: { currentUser: null}
 *  Or object if the user is signed in: { currentUser: { ... } }
 */
// return data;
// }
// };
