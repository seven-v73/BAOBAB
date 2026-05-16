import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  platformName: {
    type: String,
    default: 'MonBaobab',
  },
  contactEmail: {
    type: String,
    default: 'contact@baobab.com',
  },
  description: {
    type: String,
    default: 'Plateforme dédiée à la promotion de la culture africaine',
  },
  notifications: {
    email: {
      type: Boolean,
      default: true,
    },
    newUsers: {
      type: Boolean,
      default: true,
    },
    newOrders: {
      type: Boolean,
      default: false,
    },
    newPosts: {
      type: Boolean,
      default: true,
    },
  },
  maintenance: {
    enabled: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: 'Le site est en maintenance. Nous reviendrons bientôt.',
    },
  },
  social: {
    facebook: {
      type: String,
      default: '',
    },
    twitter: {
      type: String,
      default: '',
    },
    instagram: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
  },
  team: [{
    name: {
      type: String,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      trim: true,
      default: '',
    },
    nationality: {
      type: String,
      trim: true,
      default: '',
    },
    flag: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    focus: {
      type: String,
      trim: true,
      default: 'center 35%',
    },
  }],
}, {
  timestamps: true,
})

// S'assurer qu'il n'y a qu'un seul document de paramètres
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create({})
  }
  return settings
}

const Settings = mongoose.model('Settings', settingsSchema)

export default Settings
