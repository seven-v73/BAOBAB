import Settings from '../models/Settings.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

// GET /api/settings - Récupérer les paramètres de la plateforme
export const getSettings = catchAsync(async (req, res) => {
  const settings = await Settings.getSettings()
  res.json(settings)
})

// PUT /api/settings - Mettre à jour les paramètres de la plateforme
export const updateSettings = catchAsync(async (req, res) => {
  const {
    platformName,
    contactEmail,
    description,
    notifications,
    maintenance,
    social,
  } = req.body

  let settings = await Settings.findOne()
  
  if (!settings) {
    settings = new Settings()
  }

  if (platformName !== undefined) settings.platformName = platformName
  if (contactEmail !== undefined) settings.contactEmail = contactEmail
  if (description !== undefined) settings.description = description
  if (notifications) {
    if (notifications.email !== undefined) settings.notifications.email = notifications.email
    if (notifications.newUsers !== undefined) settings.notifications.newUsers = notifications.newUsers
    if (notifications.newOrders !== undefined) settings.notifications.newOrders = notifications.newOrders
    if (notifications.newPosts !== undefined) settings.notifications.newPosts = notifications.newPosts
  }
  if (maintenance) {
    if (maintenance.enabled !== undefined) settings.maintenance.enabled = maintenance.enabled
    if (maintenance.message !== undefined) settings.maintenance.message = maintenance.message
  }
  if (social) {
    if (social.facebook !== undefined) settings.social.facebook = social.facebook
    if (social.twitter !== undefined) settings.social.twitter = social.twitter
    if (social.instagram !== undefined) settings.social.instagram = social.instagram
    if (social.linkedin !== undefined) settings.social.linkedin = social.linkedin
  }

  await settings.save()

  logger.info('Paramètres de la plateforme mis à jour', { updatedBy: req.user._id })

  res.json(settings)
})

