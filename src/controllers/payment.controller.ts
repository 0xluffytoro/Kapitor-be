import { Response, NextFunction } from 'express';
import { sendError, sendSuccess } from '../utils/response.js';
import Razorpay from 'razorpay';
import { RazorpayOrders } from '../models/RazorpayOrders.model.js';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils.js';
import {
  canFulfillPayment,
  getInrAmountInUsdc,
  mintTo,
} from '../services/payment.service.js';
import { Transaction } from '../models/Transaction.model.js';
import { AuthRequest } from '../middleware/auth.js';
import { findAccountById } from '../services/account.service.js';

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

    const treasuryReadiness = await canFulfillPayment(Number(amount));
    if (!treasuryReadiness.ok) {
      sendError(
        res,
        treasuryReadiness.message ??
          'Treasury cannot fulfill this payment right now',
        400
      );
      return;
    }

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
    console.info('[payment.verifyPayment] Request received', {
      uid,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

    const isValidSignature = validateWebhookSignature(
      body,
      razorpay_signature,
      secret
    );

    console.info('[payment.verifyPayment] Signature validation completed', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      isValidSignature,
    });

    if (isValidSignature) {
      // Update the order with payment details
      const order = await RazorpayOrders.findOne({
        order_id: razorpay_order_id,
      });

      console.info('[payment.verifyPayment] Razorpay order lookup completed', {
        orderId: razorpay_order_id,
        orderFound: Boolean(order),
      });

      if (order) {
        if (
          order.status === 'paid' &&
          order.payment_id === razorpay_payment_id
        ) {
          console.info(
            '[payment.verifyPayment] Duplicate verification ignored',
            {
              orderId: razorpay_order_id,
              paymentId: razorpay_payment_id,
            }
          );
          sendSuccess(
            res,
            { message: 'Payment already verified', result: null },
            200
          );
          return;
        }

        const account = await findAccountById(String(order.userId));
        const walletAddress = account?.walletAddress;
        if (!walletAddress) {
          console.error('[payment.verifyPayment] Wallet address missing', {
            orderId: razorpay_order_id,
            userId: String(order.userId),
          });
          sendError(res, 'Wallet address not found', 403);
          return;
        }

        console.info('[payment.verifyPayment] Converting INR to token amount', {
          orderId: razorpay_order_id,
          inrAmount: order.amount,
          walletAddress,
        });

        const usdAmount = await getInrAmountInUsdc(order.amount);
        console.info('[payment.verifyPayment] INR conversion completed', {
          orderId: razorpay_order_id,
          inrAmount: order.amount,
          usdcAmount: usdAmount,
        });

        const result = await mintTo(walletAddress, usdAmount.toString());

        console.info('[payment.verifyPayment] Token distribution completed', {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          txHash: result?.txHash,
          method: result?.method,
        });

        order.status = 'paid';
        order.payment_id = razorpay_payment_id;
        await RazorpayOrders.findByIdAndUpdate(order._id, order);

        console.info('[payment.verifyPayment] Razorpay order updated', {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          status: 'paid',
        });

        if (result?.txHash) {
          await Transaction.create({
            userId: uid,
            txHash: result.txHash,
            toAddress: walletAddress,
            inrAmount: Number(order.amount),
            usdcAmount: Number(usdAmount),
            source: 'payment-success',
          });

          console.info('[payment.verifyPayment] Transaction record created', {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            txHash: result.txHash,
          });
        }

        sendSuccess(res, { message: 'Payment successful', result }, 200);
        return;
      }

      console.error('[payment.verifyPayment] Razorpay order not found', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      sendError(res, 'Order not found', 404);
      return;
    } else {
      sendError(res, 'Payment verification failed', 400);
      console.error('[payment.verifyPayment] Signature verification failed', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return;
    }
  } catch (error) {
    console.error('[payment.verifyPayment] Verification flow failed', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      error: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
}
