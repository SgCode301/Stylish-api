const mongoose = require("mongoose");

const SettlementTransactionSchema = new mongoose.Schema({
  psychologist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Psychologist (if the SettlementTransaction is for a consultation)
  },
  paymentReferenceNumber: {
    type: String,
  },
  role: {
      type: String,
      enum: ["user", "psychologist", "counsellor"],
      default: "user",
    },
  isSettled: { type: Boolean, default: false },
  settledAt: { type: Date },
  settlementAmount: { type: Number },
  adminEarning: { type: Number, default: 0 },
  psychologistEarning: { type: Number, default: 0 },

}, { timestamps: true });


module.exports = mongoose.model("SettlementTransaction", SettlementTransactionSchema);
