const Web3 = require("web3");
const {
  Client,
  PrivateKey,
  ContractCreateTransaction,
  FileCreateTransaction,
  AccountId,
  ContractId,
  Hbar,
  ContractExecuteTransaction,
  ContractCallQuery
} = require("@hashgraph/sdk");
require("dotenv").config()
const fs = require("fs")
const axios = require("axios")

const web3 = new Web3();
const client = Client.forTestnet()
  .setOperator(
    AccountId.fromString(process.env.OPERATOR_ID),
    PrivateKey.fromString(process.env.OPERATOR_KEY)
  )
  .setDefaultMaxTransactionFee(new Hbar(5))
  .setMaxQueryPayment(new Hbar(5));

function encodeFunctionCall(abi, functionName, parameters) {
    const functionAbi = abi.find(
      (func) => func.name === functionName && func.type === "function"
    );
    const encodedParametersHex = web3.eth.abi
      .encodeFunctionCall(functionAbi, parameters)
      .slice(2);
    return Buffer.from(encodedParametersHex, "hex");
  }

async function NotificationSender(abi, senderContractID, receiverContractID, message) {
    console.log("Calling Notification Sender function ");
    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionCall(abi, "notify", ["0x".concat(receiverContractID.toSolidityAddress()), message]);
    // console.log("senderContractID", senderContractID);
    // console.log("receiverContractID", receiverContractID);
    // query the contract
    const transaction = await new ContractExecuteTransaction()
      .setContractId(senderContractID)
      .setFunctionParameters(functionCallAsUint8Array)
    //   .setQueryPayment(new Hbar(2))
      .setGas(100000)
      .execute(client);
  
      const receipt = await transaction.getReceipt(client);
      console.log("Notification Sender Receipt: ", receipt.status)
  }

const main = () => {
    const ookiAbiPath = "./contracts/ooki_notifier_sol_ookiNotifier.abi";
    const aaveAbiPath = "./contracts/aave_notifier_sol_AaveNotifier.abi";

    const aaveAbi = JSON.parse(fs.readFileSync(aaveAbiPath));
    const ookiAbi = JSON.parse(fs.readFileSync(ookiAbiPath));

    const receiverContractId = ContractId.fromString("0.0.34812000"); //HNS
    const aaveContractId = ContractId.fromString("0.0.34827089"); // AAVE
    const ookiContractId = ContractId.fromString("0.0.34827092"); // OOKI
    const aaveMessages = [
      "To:'0.0.34279919', Message:'Health Factor of you loan (1.25) is near liquidation threshold of 1.00. Please deposit funds to avoid liquidation'",
      "To:'0.0.34279919', Message:'Health Factor of you loan (0.99) is below threshold. Liquidation triggered.'",
      "To:'0.0.34279919', Message:'Staking rewards are deposited into our account'",
      "To:'0.0.34817768', Message:'Health Factor of you loan (1.25) is near liquidation threshold of 1.00. Please deposit funds to avoid liquidation'",
      "To:'0.0.34817768', Message:'Health Factor of you loan (0.99) is below threshold. Liquidation triggered.'",
      "To:'0.0.34817768', Message:'Staking rewards are deposited into our account'"
    ]
    const ookiMessages = [
      "To:'0.0.34279919', Message:'Your margin loan is nearing collateralization threshold. Please deposit funds to avoid liquidation'",
      "To:'0.0.34279919', Message:'Your margin loan is back to healty ratio. No action required.'",
      "To:'0.0.34279919', Message:'Staking rewards are deposited into our account'",
      "To:'0.0.34817768', Message:''Your margin loan is nearing collateralization threshold. Please deposit funds to avoid liquidation'",
      "To:'0.0.34817768', Message:'Your margin loan is back to healty ratio. No action required.'",
      "To:'0.0.34817768', Message:'Staking rewards are deposited into our account'"
    ]
    for (let message of aaveMessages){
      NotificationSender(aaveAbi, aaveContractId, receiverContractId, message)
    }
    for (let message of ookiMessages)
    NotificationSender(ookiAbi, ookiContractId, receiverContractId, message)
}

main();