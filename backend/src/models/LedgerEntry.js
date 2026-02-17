import mongoose from "mongoose";

const LedgerEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },

    direction: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("LedgerEntry", LedgerEntrySchema);
