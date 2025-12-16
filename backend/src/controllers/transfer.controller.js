/*
Handles secure account-to-account money transfers.
Uses Mongo db session to avoid partial transfers
 */
import mongoose from "mongoose";
import Transfer from "../models/Transfer.js";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";

// Controller to handle money transfers between accounts
export const createTransfer = async (req, res) =>{
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const userId = req.user.id;
        const {fromAccountId, toAccountId, amount, currency, note, date} = req.body;

        // Validate Input
        if(!fromAccountId || !toAccountId || !amount){
            return res.status(400).json({message: "Missing required fields"})
        }
        if(fromAccountId === toAccountId){
            return res.status(400).json({message:"Source and destination accounts must be different"})
        }

        if(amount <= 0){
            return res.status(400).json({message:"Transfer amount must be positive"})
        }

        // Check if accounts belong to the user
        const fromAccount = await Account.findOne({
            _id: fromAccountId,
            userId,
        }).session(session);

        const toAccount = await Account.findOne({
            _id: toAccountId,
            userId,
        }).session(session);

        if(!fromAccount || !toAccount){
            return res.status(404).json({message:"One or both accounts not found"})
        }

        if (fromAccount.balance < amount){
            return res.status(400).json({message:"Insufficient funds in source account"})
        }
        session.startTransaction();

        // Create Transfer Record
        const transfer = new Transfer([
            {
            userId,
            fromAccountId,
            toAccountId,
            amount,
            currency: fromAccount.currency,
            note,
            status: "pending",
            },
        ], {session});

        await Transaction.create(
            [
                {
                    userId,
                    accountId: fromAccountId,
                    type: "expense",
                    amount,
                    category : "Transfer Out",
                    date: new Date(),
                    transferId: transfer._id,
                },
            ],
            {session}
        );

        // Create Transaction for destination account
        await Transaction.create(
            [
                {
                userId,
                accountId: toAccountId,
                type: "income",
                amount,
                category : "Transfer In",
                date: new Date(),
                transferId: transfer._id,
                },
            ],
            {session}    
        ) ;
        // Update Account Balances
        fromAccount.balance -= amount;
        toAccount.balance +=amount;
        await fromAccount.save({session});
        await toAccount.save({session});

        // Complete Transfer
        transfer.status = "completed";
        await transfer.save({session});

        await session.commitTransaction();
        res.status(201).json({message:"Transfer completed successfully", 
        transfer : transfer[0]});
    } catch (error){
        await session.abortTransaction();
        console.error("Error creating transfer:", error);
        res.status(500).json({message:"Internal server error"});   
    }
    finally {
  session.endSession();
}
}