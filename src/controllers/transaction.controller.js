const transactionModel=require('../models/transaction.model.js')
const ledgerModel=require("../models/ledger.model.js")
const accountModel=require("../models/account.model.js")
const emailService=require('../services/email.service.js')
const mongoose =require("mongoose")
async function createTransaction(req,res){
 const {fromAccount,toAccount,amount,idempotencyKey}=req.body
 if(!fromAccount||!toAccount||!amount||!idempotencyKey){
    return res.status(400).json({
        message:"fromaccount toaccount amount idempotencykey are required "

    })
 }
 const fromUserAccount =await accountModel.findOne({
    _id:fromAccount
 })

 const toUserAccount=await accountModel.findOne({
    _id:toAccount
 })
 if(!fromUserAccount || !toUserAccount){
    return res.status(400).json({
        message:"invalid fromAccount or toAccount"
    })
 }

 const isTransactionAlreadyExists=await transactionModel.findOne({
    idempotencyKey:idempotencyKey
 })

 if(isTransactionAlreadyExists){
    if(isTransactionAlreadyExists.status=="success"){
      return  res.status(200).json({
            message:"Transation already processed",
            transaction: isTransactionAlreadyExists
        })
    }

    if(isTransactionAlreadyExists.status=="pending"){
       return res.status(200).json({
            message:"transaction is procssing",
            transaction:isTransactionAlreadyExists
        })
    }
     if(isTransactionAlreadyExists.status=="failed"){
       return res.status(500).json({
            message:"transaction procssing failed previously,please retry",
        })

    }
    if(isTransactionAlreadyExists.status=="reversed"){
       return res.status(500).json({
            message:"transaction was reversed,please retry",
        })
        
    }
 }
 if(fromUserAccount.status!=="active" || toUserAccount.status!== "active"){
    return res.status(400).json({
        message:"Both fromAccount and toAccount must be active to process transaction"
    })
 }

 const balance=await fromUserAccount.getBalance()
 if(balance<amount){
    return res.status(400).json({
        message:`insufficient balance. Current Balance is ${balance} Requested amount is ${amount}`
 })
 }

const session = await mongoose.startSession()
session.startTransaction()

const transaction=new transactionModel({
   fromAccount,
   toAccount,
   amount,
   idempotencyKey,
   status:"pending"


})
const debitLedgerEntry=await ledgerModel.create([{
   account:fromAccount,
   amount:amount,
   transaction:transaction._id,
   type:"debit"

}],{session})
const creditLedgerEntry=await ledgerModel.create([{
account:toAccount,
amount:amount,
transaction:transaction._id,
type:"credit"
}],{session})
transaction.status="success"
await transaction.save({session})

await session.commitTransaction()
session.endSession()

await emailService.sendingTransactionEmail(req.user.email,req.user.name,amount,toAccount)
return res.status(200).json({
   message:"Transaction completed successfully",
   transaction:transaction
})

}
async function createInitialFundsTransaction(req,res){
   try{
const {toAccount,amount,idempotencyKey}=req.body
if(!toAccount||!amount||!idempotencyKey){
   return res.status(400).json({
        message:"fromaccount toaccount amount idempotencykey are required "

    })
 }
 console.log("1")

 const toUserAccount=await accountModel.findOne({
   _id:toAccount,
 })

 if(!toUserAccount){
   return res.status(400).json({
      message:"Invalid toAccount" 
   })
 }
 console.log("2")
 const fromUserAccount= await accountModel.findOne({
   user: req.user._id
 }) 
 if(!fromUserAccount){
   return res.status(400).json({
      message:"System user account not found"
   })
 }
 console.log("3")
 const session=await mongoose.startSession()
 session.startTransaction()
 const transaction = new transactionModel({
   fromAccount: fromUserAccount._id,
   toAccount,
   amount,
   idempotencyKey,
   status: "pending"
 })
 console.log("4")

 const debitLedgerEntry=await ledgerModel.create([{
   account:fromUserAccount._id,
   amount:amount,
   transaction:transaction._id,
   type:"debit"

}],{session})
console.log("5")
const creditLedgerEntry=await ledgerModel.create([{
account:toAccount,
amount:amount,
transaction:transaction._id,
type:"credit"
}],{session})

transaction.status="success"
console.log("6")
await transaction.save({session})
console.log("7")
await session.commitTransaction()
session.endSession()
console.log("8")

return res.status(201).json({
   message:"Initial funds transaction completed successdully",
   transaction:transaction
})
   }catch(err){
console.log(err)
return res.status(500).json({
            message: err.message
        });
   }
}
module.exports={
   createTransaction,
   createInitialFundsTransaction
}
