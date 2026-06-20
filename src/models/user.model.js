const mongoose= require('mongoose')
const bcrypt=require("bcryptjs")
const userSchema=new mongoose.Schema({
    email:{
    type:String,
    required:[true,"email is required"],
    trim:true,
    lowercase:true,
    match:[/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,"Please fill a valid email address"],
    unique:[true,"Email already Exists"]
},
name:{
    type:String,
    required:[true,"email is required"]
},

password:{
type:String,
required:[true,"password is required"],
minlength:[6,"password should contain more than 6 characters"],
select:false,
},

systemUser:{
    type:Boolean,
    default:false,
    immutable:true,
    select:false
}


},
{
    timestamps:true
})

userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        return 
    }
    const hash=await bcrypt.hash(this.password,10)
    this.password=hash
    return
})
userSchema.methods.comparePassword=async function(password){
    return bcrypt.compare(password,this.password)
}
const userModel=mongoose.model("user",userSchema)
module.exports=userModel
