const transactionModel=require('../models/transaction.model.js')
const ledgerModel=require("../models/ledger.model.js")
const accountModel=require("../models/account.model.js")
const emailService=require('../services/email.service.js')
const mongoose =require("mongoose")
async function createTransaction(req,res){
 const {fromAccount,toAccount,amount,idempotencyKey}=req.body
 if(!fromAccount||!toAccount||!amount||!idempotencyKey){
    res.status(400).json({
        message:"fromaccount toaccount amount idempotencykey are required "

    })
 }
 const fromUserAccount =await accountModel.findOne({
    _id:fromAccount
 })

 const toUserAccount=await accountModel.findOne({
    _id:toAccount
 })
 if(!fromAccount || !toUserAccount){
    return res.status(400).json({
        message:"invalid fromAccount or toAccount"
    })
 }

 const isTransactionAlreadyExists=await transactionModel.findOne({
    idempotencyKey:idempotencyKey
 })

 if(isTransactionAlreadyExists){
    if(isTransactionAlreadyExists.status=="complete"){
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
    res.status(400).json({
        message:`insufficient balance. Current Balance is ${balance} Requested amount is ${amount}`
 })
 }

const session = await mongoose.startSession()
session.startTransaction()

const transaction=await transactionModel

}