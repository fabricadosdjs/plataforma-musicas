// src/lib/stripe.ts
import Stripe from 'stripe';

// Verifica se a chave secreta do Stripe está definida.
// É crucial para a segurança que esta chave não seja exposta no frontend.
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
}

// Cria uma instância única do cliente Stripe.
// A API Version é importante para garantir compatibilidade.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil', // Use a versão mais recente da API do Stripe
});

export default stripe;