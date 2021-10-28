
interface NfaOwnerDetails {
    address: string;
    nfts: number[];
}

export function getNfaOwnerAllocation(filePath = '../input/nfaOwners.json'): NfaOwnerDetails[] {
    const nfaAllocation = require(filePath);
    return nfaAllocation;
}

export function getNfaOwnerArray(filePath?: string) {
    const nfaAllocation: NfaOwnerDetails[]  = getNfaOwnerAllocation();
    let nfaOwners: any[] = Array.from(Array(1000).keys());
    // Loop through each address
    for (let i = 0; i < nfaAllocation.length; i++) {
        let account = nfaAllocation[i];
        // Loop through each nft associated with each address
        for (let j = 0; j < account.nfts.length; j++) {
            // Assign the index to the address that owns the nfa
            nfaOwners[account.nfts[j]] = account.address;
        }
    }
    return nfaOwners;
};

export function getNfaOwnerObject(filePath?: string) {
    const nfaOwnerArray = getNfaOwnerArray(filePath);
    return Object.assign({}, nfaOwnerArray);
}