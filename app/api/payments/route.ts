import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { jobPostId, amount } = await request.json();

    if (!jobPostId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        jobPostId,
        userId,
      },
    });

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        amount,
        jobPostId,
        status: 'pending',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobPostId = searchParams.get('jobPostId');

    if (!jobPostId) {
      return NextResponse.json(
        { error: 'Missing job post ID' },
        { status: 400 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        jobPostId: parseInt(jobPostId),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Webhook handler for Stripe events
export async function PUT(request: Request) {
  try {
    const sig = request.headers.get('stripe-signature');
    if (!sig) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { jobPostId } = paymentIntent.metadata;

      // Update payment status in database
      await prisma.payment.updateMany({
        where: {
          jobPostId: parseInt(jobPostId),
          status: 'pending',
        },
        data: {
          status: 'completed',
        },
      });

      // Update job post status
      await prisma.jobPost.update({
        where: { id: parseInt(jobPostId) },
        data: { status: 'in-progress' },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 