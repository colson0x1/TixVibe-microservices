import { useEffect, useState } from 'react';

const OrderShow = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      // msLeft -> milliseconds left
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    // Manually invoke findTimeLeft right away because that's gonna update
    // our timeLeft right away and then 1 second later, starts to call it
    // again and again and again
    findTimeLeft();
    // Call that findTimeLeft helper function once per second
    // Issue 1:
    // setInterval is going to run around for the first time 1000
    // milliseconds in the future. So in another words, when we call
    // setInterval, its going to wait `1000` specified amount of time before
    // calling the function `findTimeLeft` for the very first time. So that
    // means inside of our, we're going to essentially have to wait 1 second
    // when this component is first rendered before we're going to see any time
    // appear.
    // We do not wanna go 1 second without showing any time. We wanna show time
    // remaining instantly. So it has to be manually invoked immediately.
    /* setInterval(findTimeLeft, 1000); */
    // Issue 2:
    // Whenever we call setInterval, thats going to setup an interval or timer
    // thats gonna run forever unless we actually stop it. So if we ever
    // navigate away from this component, the timer is still going to be
    // running. So we need to make sure that, if we ever navigate away, we
    // stop the interval entirely.
    // So to do so, whenever we setup an interval, we're going to get back
    // a timer id. Timer id is an integer thats going to identify the interval
    // that we just created. Then to make sure that we turn off or stop this
    // interval as soon as we navigate away from this component, we're going
    // to return a function from useEffect and inside there we'll call
    // clearInterval and pass in the timer id.
    const timerId = setInterval(findTimeLeft, 1000);

    // Whenever we return a function from useEffect, that function will be
    // invoked if we're about to navigate away from this component or if the
    // component is about to be rerendered.
    // Its only going to call it if the component is about to be rerendered
    // if we have a dependency listed inside the array. But since we have an
    // empty array, this function below is only going to be called if we
    // navigate away or stop showing this component for some reason.
    return () => {
      clearInterval(timerId);
    };
    // We might get a little warning here because we're referencing some
    // kind of dependency inside this useEffect fn without referencing it
    // inside of this dependency array. Adding 'order' resolves it.
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  // return <div>{msLeft / 1000} seconds until order expires</div>;
  return <div>Time left to pay: {timeLeft} seconds</div>;
};

OrderShow.getInitialProps = async (context, client) => {
  // It is specifically this `orderId` since that is what I named this file
  // i.e `[orderId]`
  const { orderId } = context.query;
  // Fetch details about the order
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
