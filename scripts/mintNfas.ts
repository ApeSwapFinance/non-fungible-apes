import { ethers } from 'ethers';
import NonFungibleApesV2Artifact from "../build/contracts/NonFungibleApesV2.json";
import { getSigner } from './networks';
import nfaDataArray from '../info/apesData.json';
import { writeJSONToFileWithDate } from './helpers/fileHandler';
import { getNfaOwnerArray } from './helpers/importApeData'

const owners: string[] = new Array(1000);
const unMintedTokens: any[] = [];
const txs: any[] = [];

// const mintNfa = async (nonce) => {
const mintNfa = async (nfaContract: ethers.Contract, id: number, toAddress: string, nonce?: number) => {
    const currentNfaDetails = nfaDataArray[id];
    const currentNfaAttributes = currentNfaDetails.attributes;

    let isAlreadyTokenId = false;
    try {
        // This will fail if it's not a valid id
        isAlreadyTokenId = await nfaContract.ownerOf(id);
    } catch (e) {
        // If the token has not been created the call will fail b/c it requires that the id has been created
    }

    if (isAlreadyTokenId) {
        unMintedTokens.push(id);
        throw new Error(`$NFA id ${id} has already been minted!`);
    }

    /// @notice mint a new NFA to an address
    /// @dev must be called by an account with MINTER_ROLE
    /// @param to Address to mint the NFA to
    /// @param uri The uri link to a JSON schema defining the NFA
    /// @param name Name of the NFA
    /// @param rarities Array of rarity details
    ///   rarities[0] rarityTier
    ///   rarities[1] rarityOverall
    /// @param attributes Array of string values which represent the attributes of the NFA
    ///   attributes[0] faceColor
    ///   attributes[1] baseColor
    ///   attributes[2] frame
    ///   attributes[3] mouth
    ///   attributes[4] eyes
    ///   attributes[5] hat
    try {
        const tx = await nfaContract.mint(
            toAddress,
            currentNfaDetails.name,
            [
                currentNfaAttributes.rarityTierNumber,
                currentNfaAttributes.rarityOverallRank,
            ],
            [
                currentNfaAttributes.faceColor,
                currentNfaAttributes.baseColor,
                currentNfaAttributes.frames,
                currentNfaAttributes.mouths,
                currentNfaAttributes.eyes,
                currentNfaAttributes.hats,
            ],
            {
                // TODO: set gas price in config
                gasPrice: 7000000000,
                gasLimit: 1000000,
                ...(nonce ? { nonce } : {})
            }
        );

        const receipt = await tx.wait();
        const status = receipt.status ? 'SUCCESS' : 'REVERT'
        console.log(`Received receipt for id ${id} ${status}: ${receipt.transactionHash}`)

        tx.gasPrice = tx.gasPrice.toNumber();
        tx.gasLimit = tx.gasLimit.toNumber();
        tx.value = tx.value.toNumber();
        tx.nfaId = id;
        txs.push(tx);
    } catch (e) {
        unMintedTokens.push({
            id,
            error: e,
        });
        throw new Error(`${id} mint tx error: ${e})`);
    }


    try {
        const nfaDetails = await nfaContract.getNFADetailsById(id);

        // Double check that the minted NFAs match the data by reverse checking output with a diff
        const apeDataCheck = {
            index: id,
            name: nfaDetails.name,
            image: currentNfaDetails.image,
            uri: currentNfaDetails.uri,
            attributes: {
                faceColor: nfaDetails.faceColor,
                baseColor: nfaDetails.baseColor,
                frames: nfaDetails.frame,
                mouths: nfaDetails.mouth,
                eyes: nfaDetails.eyes,
                hats: nfaDetails.hat,
                rarityScore: currentNfaDetails.attributes.rarityScore,
                rarityTierNumber: nfaDetails.rarityTier.toNumber(),
                rarityTierName: currentNfaDetails.attributes.rarityTierName,
                rarityOverallRank: nfaDetails.rarityOverall.toNumber(),
            }

        }

        const ownerAddress = await nfaContract.ownerOf(id);
        owners[id] = ownerAddress;

        return apeDataCheck;
    } catch (e) {
        unMintedTokens.push({
            id,
            error: e,
        });
        return `${id} getNFADetailsById tx error`;
    }
}

interface ApeData {
    index: number;
    name: any;
    image: string;
    uri: string;
    attributes: {
        faceColor: any;
        baseColor: any;
        frames: any;
        mouths: any;
        eyes: any;
        hats: any;
        rarityScore: string;
        rarityTierNumber: any;
        rarityTierName: string;
        rarityOverallRank: any;
    }
}

const mintAllNfas = async (chainId: number, nfaContractAddress: string, batchSize = 30) => {
    const nfaOwnerArray = await getNfaOwnerArray(`../input/nfaOwners.json`);

    // Nonce manager encapsules a signer. It can be used to manually increment the nonce on each tx
    const signer = getSigner(chainId);
    const signerAddress = await signer.getAddress();
    console.dir({ signerAddress });


    const nfaContract = new ethers.Contract(
        nfaContractAddress,
        NonFungibleApesV2Artifact.abi,
        signer
    ) as any

    let apeDataChecks: Array<string | ApeData> = [];
    let batch = [];
    let nonce = await signer.getTransactionCount();
    for (let i = 361; i < nfaDataArray.length; i++) {
        batch.push(mintNfa(nfaContract, i, nfaOwnerArray[i], nonce));
        nonce++;
        if (i > 0 && (i % batchSize == 0 || i == nfaDataArray.length - 1)) {
            const batchData = await Promise.all(batch);
            apeDataChecks.push(...batchData as any);
            batch = []
        }
    };

    // Write output: 
    await writeJSONToFileWithDate(__dirname + '/output/ownersOfNfaId', Object.assign({}, owners));
    await writeJSONToFileWithDate(__dirname + '/output/apeDataCheck', apeDataChecks.sort((apeA, apeB) => (apeA as any).index > (apeB as any).index ? 1 : -1)); // Sort acs
    await writeJSONToFileWithDate(__dirname + '/output/txs', txs.sort((txA, txB) => txA.nfaId > txB.nfaId ? 1 : -1)); // Sort acs
    await writeJSONToFileWithDate(__dirname + '/output/unmintedTokens', unMintedTokens.sort((indexA, indexB) => indexA > indexB ? 1 : -1)); // Sort acs
};

(async function () {
    try {
        // TODO: Set chainIds
        // await mintAllNfas(0, "0xFe14FA95364A8B74f0d3F5b90426229Ea22a6874", 100); // dev
        // await mintAllNfas(97, '0x34E9F595c4E00bF3b9149224e3109C9311267620', 30); // bsc-testnet //TODO: Fresh contract deployed
        await mintAllNfas(56, '0x6afC012783e3a6eF8C5f05F8EeE2eDeF6a052Ec4', 30); // bsc-testnet //TODO: Fresh contract deployed
        console.log('🎉');
        process.exit(0);
    } catch (e) {
        throw new Error(`Top level await: ${e}`);
    }
}());
