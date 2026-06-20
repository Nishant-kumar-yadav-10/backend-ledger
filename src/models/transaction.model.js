const mongoose=require("mongoose")
const transactionSchema= new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Account",
        required:[true,"transaction must be assocated with an From account"],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Account",
        required:[true,"transaction must be assocated with an To account"],
        index:true
    },
    status:{
        type:String,
        enum:{values:["pending","success","failed","reversed"],
        message:"status must be either pending,success or failed",},
    default:"pending",
    },

    amount:{
        type:Number,
        required:[true,"transaction must have an amount"],
        min:[0,"amount must be a positive number"]
    },
    idempotencyKey:{
        type:String,
        required:[true,"transaction must have an idempotency key"],
        index:true,
        uniquie:true
    
},},{timestamps:true})

const transactionModel=mongoose.model("Transaction",transactionSchema)
module.exports=transactionModel