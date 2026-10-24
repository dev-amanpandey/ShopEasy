import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
const findOwnedOrder = (orderId, userId) => {
  if (!mongoose.isValidObjectId(orderId)) return null;
  return Order.findOne({ _id: orderId, user: userId });
};

router.get('/mine', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/all', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, total, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ message: 'Shipping details are required' });
    }

    const order = await Order.create({
      user: req.user._id,
      items: items.map((item) => ({
        id: String(item.id),
        name: item.name,
        image: item.image || '',
        price: Number(item.price),
        quantity: Number(item.quantity),
        category: item.category || '',
      })),
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: shippingAddress.email,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        phone: shippingAddress.phone || '',
      },
      total: Number(total),
      paymentMethod: paymentMethod || 'Card',
    });

    res.status(201).json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await findOwnedOrder(req.params.id, req.user._id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['Processing', 'Packed'].includes(order.status)) {
      return res.status(409).json({ message: 'This order can no longer be cancelled because it has shipped or is already complete' });
    }

    const cancelledOrder = await Order.findOneAndUpdate(
      { _id: order._id, user: req.user._id, status: { $in: ['Processing', 'Packed'] } },
      { $set: { status: 'Cancelled', cancelledAt: new Date() } },
      { new: true, runValidators: true }
    );
    if (!cancelledOrder) return res.status(409).json({ message: 'This order can no longer be cancelled' });
    res.json({ order: cancelledOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not cancel order' });
  }
});

router.post('/:id/return', protect, async (req, res) => {
  try {
    const order = await findOwnedOrder(req.params.id, req.user._id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'Delivered' || !order.deliveredAt) {
      return res.status(409).json({ message: 'A return can be requested only after delivery' });
    }
    const requestedAt = new Date();
    const earliestEligibleDelivery = new Date(requestedAt.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (new Date(order.deliveredAt) < earliestEligibleDelivery) {
      return res.status(409).json({ message: 'The 7-day return window has closed' });
    }
    if (order.returnRequest) {
      return res.status(409).json({ message: 'A return request already exists for this order' });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        user: req.user._id,
        status: 'Delivered',
        deliveredAt: { $gte: earliestEligibleDelivery },
        returnRequest: { $exists: false },
      },
      { $set: { returnRequest: { status: 'Requested', requestedAt } } },
      { new: true, runValidators: true }
    );
    if (!updatedOrder) return res.status(409).json({ message: 'The return request could not be saved because the order changed' });
    res.status(201).json({ order: updatedOrder, message: 'Return request created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not create return request' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await findOwnedOrder(req.params.id, req.user._id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
