
import { CURRENCY } from '../../../../utils/stripeconfig'
import { formatAmountForStripe } from '../../../../utils/stripe-helpers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
   // https://github.com/stripe/stripe-node#configuration
   apiVersion: '2020-03-02',
})

export default async function handler(req, res) {
   if (req.method === 'POST') {
      const { amount } = req.body
      try {
         // Create PaymentIntent from body params.
         const params = {
            payment_method_types: ['card'],
            amount: formatAmountForStripe(amount, CURRENCY),
            currency: CURRENCY,
            description: process.env.STRIPE_PAYMENT_DESCRIPTION ?? '',
         }
         const payment_intent = await stripe.paymentIntents.create(
            params
         )

         res.status(200).json(payment_intent)
      } catch (err) {
         console.log('py', err.message)
         res.status(500).json({ statusCode: 500, message: err.message })
      }
   } else {
      res.setHeader('Allow', 'POST')
      res.status(405).end('Method Not Allowed')
   }
}