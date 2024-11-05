/* @ Optimistic Concurrency Control (OCC) TEST
 * resolve data consistency issues:
 * Terminal WINDOW 1
 * $ MONGO SHELL TO ORDERS DB
 * // Tickets Service should always be correct because it goes first and should
 * have 400 tickets that has price of 3000
 * $ db.tickets.remove({})
 * $ db.tickets.find({ price: 3000 }).length()
 * Terminal WINDOW 2
 * // The real test is here on Orders Service. After running the query, if
 * all the tickets inside the Orders DB are 400, then OCC is implemented
 * successfully i.e the meaning is, all events are not flowing in correct
 * orders across services
 * $ MONGO SHELL TO TICKETS DB
 * $ db.tickets.remove({}
 * $ db.tickets.find({ price: 3000 }).length()
 */

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
