const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter', 'admin'],
    default: 'candidate'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  refreshToken: String
}, {
  timestamps: true
});

// Virtual for candidate profile
UserSchema.virtual('profile', {
  ref: 'CandidateProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// Virtual for recruiter profile
UserSchema.virtual('recruiterProfile', {
  ref: 'RecruiterProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// Virtual for candidate scores (DNA/behavioral)
UserSchema.virtual('score', {
  ref: 'CandidateScore',
  localField: '_id',
  foreignField: 'candidate',
  justOne: true
});

// Set toJSON and toObject to include virtuals
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
