require("dotenv").config();
const {
  Client,
  PrivateKey,
  ContractCreateTransaction,
  FileCreateTransaction,
  AccountId,
  Hbar,
} = require("@hashgraph/sdk");

const fs = require("fs");
const client = Client.forTestnet()
  .setOperator(
    AccountId.fromString(process.env.OPERATOR_ID),
    PrivateKey.fromString(process.env.OPERATOR_KEY)
  )
  .setDefaultMaxTransactionFee(new Hbar(5))
  .setMaxQueryPayment(new Hbar(5));

const deployContract = async (contractPath) => {
  console.log("\nDeploying contract: ", contractPath);
  // Read Contact bytecode
  const contractByteCode = fs.readFileSync(contractPath);
  // Create file on Hedera
  const fileTransactionResponse = await new FileCreateTransaction()
    .setKeys([client.operatorPublicKey])
    .setMaxTransactionFee(new Hbar(10))
    .setContents(contractByteCode)
    .execute(client);
  // Fetch the receipt for transaction that created the file
  const fileReceipt = await fileTransactionResponse.getReceipt(client);

  // The file ID is located on the transaction receipt
  const fileId = fileReceipt.fileId;

  // Create the contract
  const contractTransactionResponse = await new ContractCreateTransaction()
    // Set the parameters that should be passed to the contract constructor
    // Set gas to create the contract
    .setGas(100_000)
    .setMaxTransactionFee(new Hbar(10))
    // The contract bytecode must be set to the file ID containing the contract bytecode
    .setBytecodeFileId(fileId)
    .execute(client);

  // Fetch the receipt for the transaction that created the contract
  const contractReceipt = await contractTransactionResponse.getReceipt(client);

  // The contract ID is located on the transaction receipt
  const contractId = contractReceipt.contractId;

  console.log(
    `new contract ID: ${contractId.toString()}, solidity address: 0x${contractId.toSolidityAddress()}`
  );
  return contractId;
};

module.exports = { deployContract }