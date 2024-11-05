process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios');

// const cookie = 'express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalkzTWpsa1pHVmlORGxsT0RSaU5XRmpNVGd6WlRWaE5TSXNJbVZ0WVdsc0lqb2lZMjlzYzI5dVFHZHZiMmRzWlM1amIyMGlMQ0pwWVhRaU9qRTNNekEzT1Rjd05UZDkudjduV2t4ektJRlliMzl3ekNyNWc3R2l5WFQ2NTBITkR1am5qSkIwZmxuMCJ9';
const cookie =
  'session=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalkzTWpsa1pHVmlORGxsT0RSaU5XRmpNVGd6WlRWaE5TSXNJbVZ0WVdsc0lqb2lZMjlzYzI5dVFHZHZiMmRzWlM1amIyMGlMQ0pwWVhRaU9qRTNNekEzT1Rjd05UZDkudjduV2t4ektJRlliMzl3ekNyNWc3R2l5WFQ2NTBITkR1am5qSkIwZmxuMCJ9';

const doRequest = async () => {
  const data = await axios.post(
    `https://tixvibe.dev/api/tickets`,
    { title: 'ticket', price: 1000 },
    {
      headers: { cookie },
    },
  );

  await axios.put(
    `https://tixvibe.dev/api/tickets`,
    { title: 'ticket', price: 2000 },
    {
      headers: { cookie },
    },
  );

  await axios.put(
    `https://tixvibe.dev/api/tickets`,
    { title: 'ticket', price: 3000 },
    {
      headers: { cookie },
    },
  );

  console.log('Request complete');
};

(async () => {
  for (let i = 0; i < 400; i++) {
    doRequest();
  }
})();
