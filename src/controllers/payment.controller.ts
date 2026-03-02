import { Response, NextFunction } from 'express';
import { sendError, sendSuccess } from '../utils/response';
import Razorpay from 'razorpay';
import { RazorpayOrders } from '../models/RazorpayOrders.model';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { getInrAmountInUsdc, mintTo } from '../services/payment.service';
import { Transaction } from '../models/Transaction.model';
import { AuthRequest } from '../middleware/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function createOrder(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const uid = req.uid;
    if (!uid) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
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
      userId: uid,
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

export async function verifyPayment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const uid = req.uid;
  if (!uid) {
    sendError(res, 'Unauthorized', 401);
    return;
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    sendError(
      res,
      'razorpay_order_id, razorpay_payment_id and razorpay_signature are required',
      401
    );
    return;
  }

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
      const order = await RazorpayOrders.findOne({
        _id: razorpay_order_id,
      }).populate('userId', 'walletAddress');
      if (order) {
        const walletAddress = (order.userId as { walletAddress?: string })
          ?.walletAddress;
        if (!walletAddress) {
          sendError(res, 'Wallet address not found', 403);
          return;
        }
        order.status = 'paid';
        order.payment_id = razorpay_payment_id;
        await RazorpayOrders.findByIdAndUpdate(order._id, order);
        const usdAmount = await getInrAmountInUsdc(order.amount);
        const result = await mintTo(walletAddress, usdAmount.toString());
        if (result?.txHash) {
          await Transaction.create({
            userId: uid,
            txHash: result.txHash,
            toAddress: walletAddress,
            inrAmount: Number(order.amount),
            usdcAmount: Number(usdAmount),
            source: 'payment-success',
          });
        }
        sendSuccess(res, { message: 'Payment successful', result }, 200);
      }
    } else {
      sendError(res, 'Payment verification failed', 400);
      console.log('Payment verification failed');
    }
  } catch (error) {
    next(error);
  }
}
