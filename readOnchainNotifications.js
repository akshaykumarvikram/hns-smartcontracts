
const fs = require("fs");
const axios = require("axios");
const Web3 = require("web3");
const web3 = new Web3();
const { AccountId } = require("@hashgraph/sdk");

function decodeEvent(abi, eventName, log, topics) {
    const eventAbi = abi.find(
      (event) => event.name === eventName && event.type === "event"
    );
    const decodedLog = web3.eth.abi.decodeLog(eventAbi.inputs, log, topics);
    return decodedLog;
  }

async function getEventsFromMirror(contractId, abi) {
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    console.log(`\nGetting event(s) from mirror`);
    console.log(`Waiting 10s to allow transaction propagation to mirror`);
    // await delay(10000);
  
    const url = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractId.toString()}/results/logs?order=desc`;
  
    axios
      .get(url)
      .then(function (response) {
        const jsonResponse = response.data;
  
        jsonResponse.logs.forEach((log) => {
          // decode the event data
          const event = decodeEvent(abi, "LogMessage", log.data, log.topics.slice(1));
  
          // output the from address and message stored in the event

          console.log(
              `Mirror event(s): from '${AccountId.fromSolidityAddress(
                event.from
              ).toString()}' update to '${event.message}'`
            );
        });
      })
      .catch(function (err) {
        console.error(err);
      });
  }

const main = async () => {
    const receiverAbiPath = "./contracts/hns_receiver_sol_HederaNotificationServiceReceiver.abi"
    const receiverAbi = JSON.parse(fs.readFileSync(receiverAbiPath));
    const receiverContractId = AccountId.fromString("0.0.34812000");
    await getEventsFromMirror(receiverContractId, receiverAbi);
}

main();