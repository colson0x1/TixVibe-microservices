/* @ Mongoose User Model */
import mongoose from 'mongoose';
import { Password } from '../services/password';

// An interface that describes the properties that are required to create
// a new User
// i.e describes what it takes to create a User
// UserAttrs -> User Attributes
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that a User Model has
// i.e describes what the entire collection of Users looks like or at least
// methods associated with the User Model
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties that a User Document has
// i.e describes what properties a single User has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  // updatedAt: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      // Turn User Document into JSON
      // doc - actual user document
      // ret - the thing that eventually get turned into JSON
      // @ directly modify `ret` obj instead of returning a new object
      transform(doc, ret) {
        // remap `_id` to `id`
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v; // or - versionKey: false;
      },
    },
  },
);

// middleware fn implemented in Mongoose
userSchema.pre('save', async function (done) {
  // Only hash the password if it has been modified
  if (this.isModified('password')) {
    // Get the hashed version of the password
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

// user is now instance of UserDoc
/*
const user = User.build({
  email: 'colson@stillhome.com',
  password: 'password'
})
user.email;
user.password;
user.updatedAt;
*/

export { User };

// Anytime we create a new user, we're now going to call `buildUser` instead of
// calling `new User()`
// This should be kept in mind across all services when we try to create a new
// user
// This is all done to do effective type checking which cannot be done with the
// standard `new User()` for creating a new document
// So anytime we're going to create a new user document, we're going to call
// this `buildUser` fn!
/*
const buildUser = (attrs: UserAttrs) => {
  return new User(attrs);
};

export { User, buildUser };
*/
