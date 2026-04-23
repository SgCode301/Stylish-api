const mongoose = require("mongoose");

const TransactionType = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  INITIATE: 'initiate',
};

const TransactionStatus = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
};

const TransactionSource = {
  WALLET_RECHARGE: 'wallet_recharge',
  CHAT_PAYMENT: 'chat_payment',
  CALL_PAYMENT: 'call_payment',
  VIDEO_PAYMENT: 'video_payment',
  REFERRAL_BONUS: 'referral_bonus',
  ADMIN_ADJUSTMENT: 'admin_adjustment',
};

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  psychologist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Psychologist (if the transaction is for a consultation)
  },

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorBookingSlot', // Reference to the DoctorBookingSlot model
  },

  amount: {
    type: Number,
    required: true,
  },

  phoneNo: { type: String },
  userName: { type: String },
  psychologistName: { type: String },

  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true,
  },
  role: {
      type: String,
      enum: ["user", "psychologist", "counsellor"],
      default: "user",
    },
  status: {
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.PENDING,
  },

  source: {
    type: String,
    enum: Object.values(TransactionSource),
    required: true,
  },

  message: {
    type: String,
  },

  orderId: {
    type: String,
    required: true,
  },

  paymentReferenceNumber: {
    type: String,
  },
  isSettlementRequested: { type: Boolean, default: false },
  isSettled: { type: Boolean, default: false },
  settledAt: { type: Date },
  initiatedBy: { type: String, enum: ['user', 'admin', 'system'], default: 'user' },
  failureReason: { type: String },
  settlementData: {
    settlementAmount: { type: Number },
    transactionId: { type: String },
    userName: { type: String }, // Admin Name or ID
    settledOn: { type: Date }
  },
  adminEarning: { type: Number, default: 0 },
  psychologistEarning: { type: Number, default: 0 },

}, { timestamps: true });

/**
 * Helper: generate "ORD-{timestamp}-{6digits}"
 */
function generateOrderId() {
  const ts = Date.now(); // ms since epoch
  return `ORD${ts}`;
}

/**
 * Pre-validate hook:
 * - Ensures orderId is present before required validation kicks in.
 * - Generates only for new docs or when orderId is missing.
 * - Retries a few times to avoid rare collisions.
 */
TransactionSchema.pre('validate', async function(next) {
  try {
    if (!this.isNew && this.orderId) return next();

    let attempts = 0;
    while (attempts < 5) {
      const candidate = generateOrderId();
      const exists = await this.constructor.exists({ orderId: candidate });
      if (!exists) {
        this.orderId = candidate;
        return next();
      }
      attempts++;
    }
    return next(new Error('Failed to generate unique orderId after retries'));
  } catch (err) {
    return next(err);
  }
});

TransactionSchema.index({ orderId: 'text', userName: 'text', psychologistName: 'text', phoneNo: 'text' });

module.exports = mongoose.model("Transaction", TransactionSchema);
