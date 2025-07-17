// src/app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server'; // Para obter o usuário autenticado do Clerk
import stripe from '@/lib/stripe'; // Importa a instância do cliente Stripe
import prisma from '@/lib/prisma'; // Importa a instância do Prisma Client

export async function POST(req: Request) {
  try {
    const user = await currentUser(); // Obtém o utilizador autenticado via Clerk

    // Verifica se o utilizador está autenticado e tem um ID e email
    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const userEmail = user.emailAddresses[0].emailAddress;

    // Usa upsert para encontrar ou criar o usuário no DB, baseado no ID do Clerk
    let dbUser = await prisma.user.upsert({
      where: { id: user.id }, // Tenta encontrar o usuário pelo ID do Clerk
      update: {
        // Se o usuário existir, pode-se atualizar o email se ele mudou no Clerk
        email: userEmail,
      },
      create: {
        // Se o usuário não existir, cria um novo com o ID e email do Clerk
        id: user.id,
        email: userEmail,
      },
    });

    // Verifica se o usuário já tem um customerId no Stripe
    let stripeCustomerId = dbUser.stripeCustomerId;

    if (!stripeCustomerId) {
      // Se não tiver, cria um novo cliente no Stripe
      const customer = await stripe.customers.create({
        email: userEmail,
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : userEmail,
        metadata: {
          userId: user.id, // Armazena o ID do utilizador do Clerk nos metadados do cliente Stripe
        },
      });
      stripeCustomerId = customer.id;

      // Atualiza o utilizador no seu DB com o novo customerId do Stripe
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: stripeCustomerId },
      });
    }

    // Cria uma sessão de checkout do Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId, // Usa o customerId existente ou recém-criado
      payment_method_types: ['card'], // Tipos de pagamento aceites
      mode: 'subscription', // Para subscrições recorrentes
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID, // ID do preço do seu plano PRO
          quantity: 1,
        },
      ],
      // URLs de redirecionamento após sucesso ou cancelamento
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pro?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pro?canceled=true`,
      metadata: {
        userId: user.id, // Passa o userId para o webhook
      },
    });

    // Retorna a URL da sessão de checkout para o frontend
    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error('[STRIPE_CHECKOUT_SESSION_ERROR]', error);
    // Para depuração, você pode retornar o erro completo, mas em produção,
    // é melhor retornar uma mensagem genérica por segurança.
    return new NextResponse('Erro Interno no Servidor', { status: 500 });
  }
}
