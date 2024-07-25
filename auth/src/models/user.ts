/* @ Mongoose User Model */
import mongoose from 'mongoose';

// An interface that describes the properties that are required to create
// a new User
// UserAttrs -> User Attributes
interface UserAttrs {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', userSchema);

// Anytime we create a new user, we're now going to call `buildUser` instead of
// calling `new User()`
// This should be kept in mind across all services when we try to create a new
// user
// This is all done to do effective type checking which cannot be done with the
// standard `new User()` for creating a new document
// So anytime we're going to create a new user document, we're going to call
// this `buildUser` fn!
const buildUser = (attrs: UserAttrs) => {
  return new User(attrs);
};

export { User, buildUser };
