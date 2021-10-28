
interface NfaOwnerDetails {
    address: string;
    nfts: number[];
}

export const APE_DATA_PATH = '../input/nfaOwners.json';

export function getNfaOwnerAllocation(filePath = APE_DATA_PATH): NfaOwnerDetails[] {
    const nfaAllocation = require(filePath);
    return nfaAllocation;
}

export function getNfaOwnerArray(filePath?: string): string[] {
    const nfaAllocation: NfaOwnerDetails[] = getNfaOwnerAllocation(filePath);
    let nfaOwners: any[] = Array.from(Array(1000).keys());
    let nfaCount = 0;
    // Loop through each address
    for (let i = 0; i < nfaAllocation.length; i++) {
        let account = nfaAllocation[i];
        // Loop through each nft associated with each address
        for (let j = 0; j < account.nfts.length; j++) {
            // Assign the index to the address that owns the nfa
            nfaOwners[account.nfts[j]] = account.address;
            nfaCount++;
        }
    }
    if (nfaCount != 1000) {
        throw new Error(`getNfaOwnerArray::NFA count does not equal 1000`);
    }
    return nfaOwners;
};

export function getNfaOwnerObject(filePath?: string): { [key: number]: string } {
    const nfaOwnerArray = getNfaOwnerArray(filePath);
    return Object.assign({}, nfaOwnerArray);
}