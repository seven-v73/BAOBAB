import { sendEmail, emailTemplates } from './emailService.js'

export const sendOrderConfirmation = async (order, user) => {
  const subject = `Confirmation de commande ${order.orderNumber} - BAOBAB`
  const html = emailTemplates.orderConfirmation(order, user)
  return await sendEmail(user.email, subject, html)
}

export const sendOrderShipped = async (order, user) => {
  const subject = `Votre commande ${order.orderNumber} a été expédiée - BAOBAB`
  const html = emailTemplates.orderShipped(order, user)
  return await sendEmail(user.email, subject, html)
}

export const sendWelcomeEmail = async (user) => {
  const subject = `Bienvenue sur BAOBAB !`
  const html = emailTemplates.welcome(user)
  return await sendEmail(user.email, subject, html)
}

