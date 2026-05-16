import nodemailer from 'nodemailer'
import env from '../config/env.js'
import logger from './logger.js'

// Configuration du transporteur email
let transporter = null

// Initialiser le transporteur
const initTransporter = () => {
  // Si SMTP configuré, utiliser Nodemailer
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 587,
      secure: Number(env.SMTP_PORT) === 465, // true pour 465, false pour autres ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
    logger.info('📧 Service email configuré avec SMTP')
  } else {
    // Mode développement : logger seulement
    logger.warn('⚠️  SMTP non configuré - les emails seront loggés uniquement')
    transporter = {
      sendMail: async (options) => {
        logger.info(`📧 Email (dev mode):`, {
          to: options.to,
          subject: options.subject,
          html: options.html?.substring(0, 100) + '...',
        })
        return { messageId: 'dev-' + Date.now() }
      }
    }
  }
}

// Initialiser au chargement
initTransporter()

/**
 * Envoie un email
 */
export const sendEmail = async (to, subject, html, text = null) => {
  try {
    if (!transporter) {
      initTransporter()
    }

    const mailOptions = {
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Extraire le texte si pas fourni
    }

    const info = await transporter.sendMail(mailOptions)
    logger.info(`✅ Email envoyé à ${to}: ${subject}`)
    return info
  } catch (error) {
    logger.error(`❌ Erreur lors de l'envoi d'email à ${to}:`, error)
    throw error
  }
}

/**
 * Template HTML pour les emails
 */
export const emailTemplates = {
  orderConfirmation: (order, user) => {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)}€</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.subtotal.toFixed(2)}€</td>
      </tr>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 20px; text-align: center; color: #1a1a1a; }
          .content { background: #f9f9f9; padding: 20px; }
          .order-details { background: white; padding: 15px; margin: 20px 0; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌳 MonBaobab</h1>
            <h2>Confirmation de commande</h2>
          </div>
          <div class="content">
            <p>Bonjour <strong>${user.name}</strong>,</p>
            <p>Merci pour votre commande ! Votre commande <strong>${order.orderNumber}</strong> a été confirmée.</p>
            
            <div class="order-details">
              <h3>Détails de la commande</h3>
              <table>
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 10px; text-align: left;">Produit</th>
                    <th style="padding: 10px; text-align: center;">Qté</th>
                    <th style="padding: 10px; text-align: right;">Prix</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #d4af37;">
                <p style="text-align: right; margin: 5px 0;"><strong>Sous-total:</strong> ${order.subtotal.toFixed(2)}€</p>
                <p style="text-align: right; margin: 5px 0;"><strong>Livraison:</strong> ${order.shipping.toFixed(2)}€</p>
                ${order.discount > 0 ? `<p style="text-align: right; margin: 5px 0; color: #27ae60;"><strong>Réduction:</strong> -${order.discount.toFixed(2)}€</p>` : ''}
                <p style="text-align: right; margin: 10px 0; font-size: 18px;"><strong>Total:</strong> ${order.total.toFixed(2)}€</p>
              </div>
            </div>

            <div class="order-details">
              <h3>Adresse de livraison</h3>
              <p>
                ${order.shippingAddress.name}<br>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.zipCode} ${order.shippingAddress.city}<br>
                ${order.shippingAddress.country}
              </p>
            </div>

            <p>Vous pouvez suivre votre commande depuis votre <a href="${env.FRONTEND_URL}/dashboard">tableau de bord</a>.</p>
          </div>
          <div class="footer">
            <p>Merci de votre confiance !</p>
            <p>L'équipe MonBaobab</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  orderShipped: (order, user) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 20px; text-align: center; color: #1a1a1a; }
          .content { background: #f9f9f9; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌳 MonBaobab</h1>
            <h2>Votre commande est en route !</h2>
          </div>
          <div class="content">
            <p>Bonjour <strong>${user.name}</strong>,</p>
            <p>Excellente nouvelle ! Votre commande <strong>${order.orderNumber}</strong> a été expédiée.</p>
            ${order.trackingNumber ? `<p><strong>Numéro de suivi:</strong> ${order.trackingNumber}</p>` : ''}
            <p>Vous pouvez suivre votre colis depuis votre <a href="${env.FRONTEND_URL}/orders/${order._id}">tableau de bord</a>.</p>
            <p>Merci de votre confiance !</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  welcome: (user) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 20px; text-align: center; color: #1a1a1a; }
          .content { background: #f9f9f9; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌳 MonBaobab</h1>
            <h2>Bienvenue !</h2>
          </div>
          <div class="content">
            <p>Bonjour <strong>${user.name}</strong>,</p>
            <p>Merci de vous être inscrit sur MonBaobab !</p>
            <p>Découvrez les valeurs, l'histoire et les produits authentiques de l'Afrique.</p>
            <p><a href="${env.FRONTEND_URL}/shop" style="display: inline-block; padding: 10px 20px; background: #d4af37; color: #1a1a1a; text-decoration: none; border-radius: 5px; margin-top: 20px;">Découvrir la boutique</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  },
}

