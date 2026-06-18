const mongoose=require("mongoose")
const ledgerSchema= new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Ledger must be associated with an account"],
   index:true,
   immutable:true
    },
    amount:{
        type:Number,
        required:[true,"Ledger must have an amount"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Transaction",
        required:[true,"Ledger must be associated with a transaction"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{values:["debit","credit"],
        message:"Ledger type must be either debit or credit",},
    required:[true,"Ledger must have a type"],
    immutable:true
    }

})

function PreventLedgerUpdate(){
    throw new Error("Ledger entries cannot be updated")}
ledgerSchema.pre("findOneAndUpdate",PreventLedgerUpdate)
ledgerSchema.pre("remove",PreventLedgerUpdate)
ledgerSchema.pre("deleteOne",PreventLedgerUpdate)
ledgerSchema.pre("deleteMany",PreventLedgerUpdate)
ledgerSchema.pre("updateOne",PreventLedgerUpdate)
ledgerSchema.pre("updateMany",PreventLedgerUpdate)
const ledgerModel=mongoose.model("Ledger",ledgerSchema)
module.exports=ledgerModel