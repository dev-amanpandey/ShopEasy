import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      default: 'Card',
    },
    status: {
      type: String,
      enum: ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    trackingNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    returnRequest: {
      type: new mongoose.Schema({
        status: { type: String, enum: ['Requested'], required: true },
        requestedAt: { type: Date, required: true },
      }, { _id: false }),
      default: undefined,
    },
  },
  { timestamps: true }
);

orderSchema.pre('validate', function preValidate(next) {
  if (this.status === 'Delivered' && !this.deliveredAt && this.isModified('status')) {
    this.deliveredAt = new Date();
  }
  if (!this.trackingNumber) {
    this.trackingNumber = `SE-${Date.now().toString().slice(-8)}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
  }
  next();
});

orderSchema.pre('findOneAndUpdate', function setDeliveredAt(next) {
  const update = this.getUpdate() || {};
  const status = update.status || update.$set?.status;
  const deliveredAt = update.deliveredAt || update.$set?.deliveredAt;
  if (status === 'Delivered' && !deliveredAt) {
    this.setUpdate({ ...update, $set: { ...update.$set, deliveredAt: new Date() } });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
