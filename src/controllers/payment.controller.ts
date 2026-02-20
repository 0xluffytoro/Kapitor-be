import { Request, Response, NextFunction } from 'express';
import { sendError, sendSuccess } from '../utils/response';
import Razorpay from 'razorpay';
import { RazorpayOrders } from '../models/RazorpayOrders.model';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { getInrAmountInUsdc, mintTo } from '../services/payment.service';
import { Transaction } from '../models/Transaction.model';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { amount, currency, receipt, notes } = req.body;

    const options = {
      amount: amount * 100, // Convert amount to paise
      currency,
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);

    await RazorpayOrders.create({
      order_id: order.id,
      amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status ?? 'created',
      payment_id: undefined,
    });
    sendSuccess(
      res,
      {
        order,
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

export async function paymentSuccess(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { amount, address, userId } = req.body;
    if (!userId) {
      sendError(res, 'userId is required', 400);
      return;
    }
    const usdAmount = await getInrAmountInUsdc(amount);
    const result = await mintTo(
      address || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      usdAmount.toString()
    );
    if (result?.txHash) {
      await Transaction.create({
        userId,
        txHash: result.txHash,
        toAddress: address || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        inrAmount: Number(amount),
        usdcAmount: Number(usdAmount),
        source: 'payment-success',
      });
    }
    sendSuccess(
      res,
      { message: 'Kapitor Token Payment successful', result },
      200
    );
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  try {
    const isValidSignature = validateWebhookSignature(
      body,
      razorpay_signature,
      secret
    );
    if (isValidSignature) {
      // Update the order with payment details
      const orders = await RazorpayOrders.find({});
      const order = orders.find(o => o.order_id === razorpay_order_id);
      if (order) {
        order.status = 'paid';
        order.payment_id = razorpay_payment_id;
        await RazorpayOrders.findByIdAndUpdate(order._id, order);
      }
      const message = 'Payment verification successful';
      sendSuccess(res, { message }, 200);
      console.log(message);
    } else {
      sendError(res, 'Payment verification failed', 400);
      console.log('Payment verification failed');
    }
  } catch (error) {
    next(error);
  }
}
