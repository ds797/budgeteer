import Stripe from 'npm:stripe'

export const stripe = new Stripe(Deno.env.get('SECRET_STRIPE_KEY'))

export const price = Deno.env.get('SECRET_STRIPE_PRICE')

export const provider = Stripe.createSubtleCryptoProvider()