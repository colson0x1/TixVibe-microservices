import mongoose from 'mongoose';

const objectId = new mongoose.Types.ObjectId().toHexString();

export { objectId as id };
