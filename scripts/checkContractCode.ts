import { EtherscanService, getConfig } from '@defifofum/etherscan-sdk';
import { getNfaOwnerAllocation } from './helpers/importApeData';
import { writeJSONToFileWithDate } from './helpers/fileHandler'

function sleep(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function checkNfaAddressesForCode() {
    // Get details from Etherscan service
    const config = getConfig('bsc');
    const etherscanService = new EtherscanService(config.baseUrl, config.apiKey);

    const nfaOwnerAllocation = getNfaOwnerAllocation();
    const accountTypes: any = {};
    for (let i = 0; i < nfaOwnerAllocation.length; i++) {
        const allocation = nfaOwnerAllocation[i];
        const fullContractDetails = await getContractDetailsSafe(etherscanService, allocation.address);
        accountTypes[allocation.address] = fullContractDetails;
        if (i > 0 && i % 10 == 0) {
            sleep(100)
        }
    }
    console.table(accountTypes);
    await writeJSONToFileWithDate(__dirname + '/output/accountTypes', accountTypes);
}

async function getContractDetailsSafe(etherscanService: EtherscanService, address: string) {
    try {
        const fullContractDetails = await etherscanService.getFullContractDetails(address);
        return fullContractDetails.ContractName;
    } catch (e) {
        return 'EOA';
    }
}


(async function () {
    try {
        await checkNfaAddressesForCode();
        console.log('🎉');
        process.exit(0);
    } catch (e) {
        throw new Error(`Top level await: ${e}`);
    }
}());


