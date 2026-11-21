// À lancer une fois par base (locale, production) : remplace l'ancien index texte des contributions,
// qui prenait le champ « language » comme langue d'index et faisait échouer les propositions sans langue.
import 'dotenv/config'
import mongoose from 'mongoose'
import Contribution from '../models/Contribution.js'

await mongoose.connect(process.env.MONGODB_URI)
const dropped = await Contribution.syncIndexes()
console.log('Index des contributions synchronisés. Supprimés :', dropped.length ? dropped.join(', ') : 'aucun')
await mongoose.disconnect()
