// import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  // console.log(currentUser);
  // axios.get('/api/users/currentuser').catch((err) => console.log(err.message));
  // console.log(currentUser);

  return (
    <>
      {currentUser ? (
        <h1>You are signed in</h1>
      ) : (
        <h1>You are NOT signed in</h1>
      )}
    </>
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
  return {};
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
