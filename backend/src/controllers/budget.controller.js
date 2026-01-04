/** 
Create and manage user budgets
Prevent duplicate budgets for the same category & period
Calculate current spending from transactions
Return budget status (spent, remaining, alert level)
*/
import mongoose, { Schema }  from "mongoose";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";

//Allow user to set a monthly spending limit for a category.
export const createBudget = async (req, res) => {
    try{
         const userId = req.user.id;
         const{category, limitAmount, startDate, endDate, alertThreshold}= req.body;

         // Validation
         if(!category|| !limitAmount || !startDate ||!endDate){
            return res.status(400).json({
                message: "Missing required budget field"
            })
         };

         if(limitAmount <= 0){
            return res.status(400).json({
               message: "Budget limit must be greater than 0"
            });
         }
         

         // Create Budget
         const budget = await Budget.create({
            userId,
            category,
            limitAmount,
            startDate,
            endDate,
           alertThreshold
         });
         return res.status(201).json({
            message:"Budget created successfully",
            budget,
         });
    }
     catch(error)
    {
        if(error.code ===11000){
          return res.status(400).json({
            message:"Budget already exist for this category and period"
          })
        }

        console.error("Create Budget error",error);
        res.status(500).json({message:"Server error creating budget"});
    }
}
// Get all budget with spending calculation
export const getBudgets = async(req, res) =>{
    try{
        const userId = req.user.id;
        const budgets = await Budget.find({
            userId,
            archived:false,
        });

        const results = [];
        for(const budget of budgets){
            // Sum expenses for this category in the budget period
            const spending = await Transaction.aggregate([
                {
                    $match:{
                       userId: new mongoose.Types.ObjectId(userId),
                        type: "expense",
                        category:budget.category,
                        date:{
                            $gte: budget.startDate,
                            $lte:budget.endDate,
                        },
                        archived: false,
                    },
                },
                {
                    $group:{
                        _id:null,
                        totalSpend:{$sum:"$amount"},
                    },

                },

            ]);

            const spendAmount = spending[0]?.totalSpend || 0;
            const remaining = budget.limitAmount - spendAmount;
            const percentUsed = Math.round(
                (spendAmount/ budget.limitAmount) *100
            );

            results.push({
                budget,
                spendAmount,
                remaining,
                percentUsed,
                alertTriggered: percentUsed >= budget.alertThreshold,
            });
        }
        res.status(200).json({budgets: results});
    }catch(error){
        console.error("Set Budgets Error:", error);
        res.status(500).json({message: "Server error fetching budgets"});
    }
};

export const deleteBudget = async (req, res) =>{
    try{
        const userId = req.user.id;
        const budgetId = req.params.id;
        const budget = await Budget.finsone({
            _id: budgetId,
            userId,
        });

        if(!budget){
            return res.status(404).json({message: "Budget not found."})
        }

        budget.archived =true;
        await budget.save();

        res.status(200).json({message: "Budget archived successfully"});
    } catch(error){
        console.error("Delete Budget Error:", error);
        res.status(500).json({message: "Server error deleting budget"});
    }
};
