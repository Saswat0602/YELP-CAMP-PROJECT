const mongoose = require ('mongoose')
const Schema = mongoose.Schema
const passportLocaalMongoose = require ('passport-local-mongoose')

const UserSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique: true
    }
});

UserSchema.plugin(passportLocaalMongoose)

module.exports = mongoose.model('User',UserSchema)