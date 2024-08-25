import axios from 'axios';

const buildClient = ({ req }) => {
  // @ Creates an instance of axios that is preconfigured to work in either
  // the server or browser environment
  if (typeof window === 'undefined') {
    // On the Server Environment

    // Create a preconfigured version of axios
    // Once returned, it will be like a normal axios client but it'll have some
    // baseURL or domain wiredup to it and also headers wiredup to it as well
    return axios.create({
      // Request should be made to
      // http://ingress-nginx-controller.ingress-nginx.svc.cluster.local

      // @ Make requests over to Ingress NGINX and route off to Auth Service
      // Reach Ingress NGINX and specify route to forward request over to Auth Service
      // 'http://SERVICENAME.NAMESPACE.svc.cluster.local'
      // 'http://ingress-nginx.ingress.nginx.svc.cluster.local'
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  } else {
    // On the Browser Environment
    // Create a separate instance of axios for browser
    return axios.create({
      // Browser will take care of the headers and appending the domain
      baseURL: '/',
    });
  }
};

export default buildClient;
