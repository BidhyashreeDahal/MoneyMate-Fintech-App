import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema(
    {
        // The user who initiated this transfer
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Source account for the transfer
        fromAccountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true,
        },
        // Destination account for the transfer
        toAccountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true,
        },
        // Amount of money being transferred
        amount: {
            type: Number,
            required: true,
        },
        // Currency code (CAD by default)
        currency: {
            type: String,
            default: "CAD",
        },
        // Optional note for the transfer
        note: {
            type: String,
        },
        // Date of the transfer
        date: {
            type: Date,
            default: Date.now,
        },
        // Status of the transfer
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "completed",

        },
        // Optional failure reason
        failureReason: {
            type: String,
        },
    },
        { timestamps: true }
);
export default mongoose.model("Transfer", transactionSchema);




