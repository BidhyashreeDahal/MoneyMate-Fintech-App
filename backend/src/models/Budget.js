/**
 * Purpose:
- Represents a user-defined spending limit for a specific category
- Used to track and control expenses over a defined time period
- Enables alerts, warnings, and analytics when spending approaches or exceeds limits
 */
import mongoose from "mongoose";
const budgetSchema = new mongoose.Schema({
    // Owner of the budget
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index:true
    },
    category: {
        type:String,
        required :true
    },
    limitAmount:{
        type:Number,
        required: true,
        min :0
    },
    period:{
        type:String,
        enum:["monthly"],
        default:"monthly"

    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    // Alert threshold (percentage)
    // Example: 80 → alert when 80% of limit is used
    alertThreshold:{
        type: Number,
        default: 80,
        min: 1,
        max: 100
    },
    // Soft Delete
    archived:{
        type:Boolean,
        default: false,   
    },
},
    {
        timestamps: true,
    }
)
// Enforce one budget per category, per period per user
budgetSchema.index(
    { userId: 1, category: 1, startDate: 1, endDate: 1 },
     { unique: true }
)
export default mongoose.model("Budget", budgetSchema);







    
