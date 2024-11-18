import Queue from 'bull';

// Interface that describes the data that we're going to stick into this
// Job.
interface Payload {
  orderId: string;
}

// Use `Queue` to create a new instance of a queue.
// This is the thing that is going to allows us to publish a job and eventually
// process a job as well.
// Queue takes two arguments. The first argument is going to be the name of
// the channel/subject i.e This is going to be essentially the bucket over
// inside of Redis server that we want to store this job in temporarily.
// So giving a name for this queue to be `order:expiration`
// Second argument takes in an options object.
// i.e Add in options to tell the queue that we want to connect it to the
// instance of the Redis server that is running inside the pod through the
// redis deployment on K8 cluster
// Job is going to have `orderId` information which is going to be stored
// as a bucket in the list of Job inside Redis instance
// Just `orderId` because that is the information that we want to communicate
// back over to this point in time for processing and publishing event
// i.e We want to communicate `orderId` when we at some point in time
// try to process this job.
// Applying Payload interface as a generic type to our Queue which now gives
// TS enough information to understand exactly what kind of data is going to
// be flowing through our Queue
// And now when we enqueue/publish a job or process a job, TS is going to be
// able to use this Payload interface to make sure we are trying to put the
// right information into the queue and receive the correct type of information
// from it as well.
const expirationQueue = new Queue<Payload>('order:expiration', {
  // Tell this queue that we want to use Redis
  redis: {
    // Host of the Redis instance
    host: process.env.REDIS_HOST,
  },
});

// Right after a Queue, here is the code to process a Job
// This is going to be where the Redis server sends the Job back over to us and
// we start to process it in some way
// Its going to take async fn. And this async fn is going to be called with
// an argument say job.
// Job object itself is similar in nature to that message object from the
// NATS streaming server library i.e node-nats-streaming
// So that library with the Message type.
// This job right here is not our actual data. Instead it is an object that
// wraps up our data, and has some information abuot the job itself as well.
// So information such as the date when it was initially created or maybe
// some id of the job itself or whatever else. It is all contained inside of
// this job and the data that we're going to send along inside the job i.e
// `orderId` is one of the properties inside there.
// So inside of here, we want to eventually publish an expiration event
expirationQueue.process(async (job) => {
  // To print orderId, we need to reach into this `job` object, reference the
  // Payload and get the `orderId` property i.e job.data.orderId
  console.log(
    'Publish an expiration:complete event for orderId',
    // Here we are getting autocomplete from TS specificly because of the
    // Payload interface. So this is where TS is gonna
    job.data.orderId,
  );
});

// Export the actual queue that was just created so it can be used in some
// other location inside of project
export { expirationQueue };
