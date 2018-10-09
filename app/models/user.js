const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    saltRounds = 10,
    to = require('await-to-js').default;

const UserSchema = new Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
  email: String,
  firstName: String,
  lastName: String,
  about: String,
  dob: Date,
  registeredAt: { type: Date, default: Date.now },
  updatedAT: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function(next) {
  const user = this;

  if (!user.isModified('password')) return next();


  const [err, hashedPassword] = await to(bcrypt.hash(user.password, saltRounds));

  if (err) return next(err);

  user.password = hashedPassword;

  next();
});

UserSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password)
};

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
