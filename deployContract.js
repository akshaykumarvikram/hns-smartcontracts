const {deployContract} = require('./utils');

const main = async () => {
    const contractPath = "./contracts/ooki_notifier_sol_ookiNotifier.bin"
    await deployContract(contractPath);
}

main();