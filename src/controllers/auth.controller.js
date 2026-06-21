const { json } = require("express");
const userModel = require("../models/user.model");
const tokenBlackListModel=require("../models/blackList.model")
const jwt=require("jsonwebtoken")
const emailService=require("../services/email.service")
async function userRegisterController(req, res) {
  const { email, password, name } = req.body;
  const isExists = await userModel.findOne({
    email: email,
  });
  if (isExists) {
    return res.status(422).json({
      message: "User already exists with this email",
      status: "failed",
    });
  }
  const user = await userModel.create({
    email,password,name
  });
  const token=jwt.sign({userId:user._id},process.env.JwT_SECRET,{expiresIn:"3d"})
  res.cookie("token",token)
  res.status(201).json({
user:{
    _id:user._id,
    email:user.email,
    name:user.name
},
token
  })
  await emailService.sendingRegistrationEmail(user.email,user.name) 
}

async function userLoginController(req,res){
  const {email,password}=req.body
  const user=await userModel.findOne({email}).select("+password")
  if(!user){
    return res.status(404).json({
      messagee:"User not found with this email",
  })
}
const isValidPassword=await user.comparePassword(password)
if(!isValidPassword){
  return res.status(401).json({
    message:"Invalid password"
  })
}
const token=jwt.sign({userId:user._id},process.env.JwT_SECRET,{expiresIn:"3d"})
res.cookie("token",token)
res.status(200).json({
  user:{
    _id:user._id,
    email:user.email,
    name:user.name
  },
  token
},)


}

async function userLogoutController(req,res){
  const token=req.cookies.token||req.headers.authorization?.split("")[1]
  if(!token){
    return res.status(200).json({
      message:"user already logged out "
    })
  }
  res.cookie("token","")
await tokenBlackListModel.create({
  token:token
})
res.clearCookie("token")
res.status(200).json({
  message:"user logged out successfully"
})
}

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController
};
