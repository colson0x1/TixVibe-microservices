import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component currentUser={currentUser} {...pageProps} />
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  // console.log(Object.keys(appContext));
  // return {};
  // console.log(appContext);

  const client = buildClient(appContext.ctx);
  // This endpoint: `/api/users/currentUser`, gives back an object that has
  // the `currentUser` property in it which refers to the current user
  const { data } = await client.get('/api/users/currentuser');
  // Get set of pageProps/componentProps i.e this is gonna be the set of data
  // that we're trying to fetch from the components or the individual pages
  // getInitialProps
  // const pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  // Handle when getInitialProps is undefineds Example on signin/signup page
  let pageProps = {};
  // Child components getInitialProps fn invocation
  if (appContext.Component.getInitialProps) {
    // Pass client that we've already build above to child component's
    // `getInitialProps` invocation as a second argument
    // + Also, get the `currentUser` and provide as a third argument to
    // child components `getInitialProps` fn invocation
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser,
    );
  }

  // console.log(pageProps);
  // console.log(data);

  // return data;
  return {
    pageProps,
    // currentUser: data.currentUser,
    ...data,
  };
};

export default AppComponent;
