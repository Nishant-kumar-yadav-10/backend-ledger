const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose=require('mongoose');
function connectDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('MongoDB connected successfully');

    })
    .catch((err)=>{
        console.log('MongoDB connection error:', err);
        process.exit(1);
    })
        
}
module.exports=connectDB;