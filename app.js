import fetch from "node-fetch";
import express from "express";
import mongoose from "mongoose";
import { usersModel, cryptosModel } from "./models.js";

const apiToken = '839ZZN5PY98XRDHAKZBQ5K7SR83YAT2NZ8';
const port = process.env.PORT || 3001;

const app = express();

mongoose.connect("mongodb+srv://sachanashutosh15:Ashutosh_99@cluster0.agcck.mongodb.net/KoinX?retryWrites=true&w=majority")
.then(() => {
   console.log("Successfully connected to database")
})
.catch((error) => {
   console.log(error)
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const getInfo = async (userAddress) => {
	const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${apiToken}`;
   const rawData = await fetch(url);
   return rawData.json();
}
// getInfo("0xce94e5621a5f7068253c42558c147480f38b5e0d");

const getEthereumBalance = async (userAddress) => {
   const url = `https://api.etherscan.io/api?module=account&action=balance&address=${userAddress}&tag=latest&apikey=${apiToken}`;
   const rawData = await fetch(url);
   return rawData.json();
}

const getEthereumPrice = async () => {
   const url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&amp;vs_currencies=inr";
   const rawData = await fetch(url);
   return rawData.json();
}

setInterval(async () => {
   const etherPriceInfo = await getEthereumPrice();
   const cryptosInfo = await cryptosModel.find({ cryptoName: "ethereum" });
   console.log(cryptosInfo);
   if (cryptosInfo.length === 0) {
      const newCryptosModel = new cryptosModel({
         cryptoName: "ethereum",
         cryptoPrice: etherPriceInfo.ethereum.inr,
      })
      const result = await newCryptosModel.save();
      console.log(result);
   } else {
      const result = await cryptosModel.updateOne({ cryptoName: "ethereum" },
      {$set: { cryptoPrice: etherPriceInfo.ethereum.inr }})
      console.log(result);
   }
}, 10 * 60 * 1000);

app.post("/getTxnList", async (req, res) => {
   const { userAddress } = req.body;
   console.log(userAddress);
   try {
      if (!userAddress) throw new Error("Please provide userAddress");
      const userInfo = await getInfo(userAddress);
      if (userInfo.message !== "OK") throw new Error("Please provide a valid address");
      console.log(userInfo.result);
      const userTransactions = JSON.stringify(userInfo.result);
      console.log(userTransactions);
      const newUsersModel = new usersModel({userAddress: userAddress, transactions: userInfo.result});
      const result = await newUsersModel.save();
      res.status(200).send(result);
   } catch (error) {
      res.send({
         error: `${error.message}`,
      })
   }
})

app.get("/getBalanceAndPrice", async (req, res) => {
   const { userAddress } = req.body;
   console.log(userAddress);
   try {
      const userBalInfo = await getEthereumBalance(userAddress);
      if (userBalInfo.message !== "OK") throw new Error("Please check the userAddress");
      const result = {};
      result.etherBalance = userBalInfo.result;
      const ethereumInfo = await getEthereumPrice();
      result.etherPrice = ethereumInfo.ethereum.inr;
      res.status(200).send(result);
   } catch (error) {
      res.send({
         error: `${error.message}`,
      })
   }
})

app.listen(port, () => {
   console.log(`Server started on port ${port}...`)
})