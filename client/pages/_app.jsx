import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  // console.log(Object.keys(appContext));
  // return {};
  // console.log(appContext);

  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');
  // Get set of pageProps/componentProps i.e this is gonna be the set of data
  // that we're trying to fetch from the components or the individual pages
  // getInitialProps
  // const pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  // Handle when getInitialProps is undefineds Example on signin/signup page
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
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
