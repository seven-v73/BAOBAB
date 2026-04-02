import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // Ne pas retourner le password par défaut
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  avatar: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
}, {
  timestamps: true,
})

// Hash password avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Méthode pour comparer les passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Méthode pour retourner user sans password
userSchema.methods.toJSON = function() {
  const user = this.toObject()
  delete user.password
  return user
}

const User = mongoose.model('User', userSchema)

export default User

