import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  userAddress: String,
  transactions: Array,
})

const cryptoSchema = mongoose.Schema({
  cryptoName: String,
  cryptoPrice: Number,
})

const usersModel = mongoose.model("users", userSchema);
const cryptosModel = mongoose.model("cryptoPrices", cryptoSchema);

export { usersModel, cryptosModel };