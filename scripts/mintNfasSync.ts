import { ethers } from 'ethers';
import NonFungibleApesArtifact from "../build/contracts/NonFungibleApes.json";
import { getSigner } from './networks';
import nfaDataArray from '../info/apesData.json';
import { writeJSONToFileWithDate } from '../lib/fileHandler';

// TODO: This needs to be updated for each mint
// const NFA_CONTRACT_ADDRESS = '0xFe14FA95364A8B74f0d3F5b90426229Ea22a6874'; // dev
const NFA_CONTRACT_ADDRESS = '0x79c941F7909840a8ABd27aE0c8E64c6E680AC51a'; // testnet


const unMintedTokens: any[] = [];
const txs: any[] = [];

// const mintNfa = async (nonce) => {
const mintNfa = async (nfaContract: ethers.Contract, id: number, toAddress: string, nonce?: number) => {
    const currentNfaDetails = nfaDataArray[id];
    const currentNfaAttributes = currentNfaDetails.attributes;

    try {
        // This will fail if it's not a valid id
        const totalSupply = await nfaContract.totalSupply();
        if (totalSupply != id) {
            unMintedTokens.push(id);
            throw new Error(`Next token id: ${totalSupply} does not match id ${id}.`);
        }
    } catch (e) {
        // If the token has not been created the call will fail b/c it requires that the id has been created
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
                gasPrice: 30000000000,
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

        return apeDataCheck;
    } catch (e) {
        unMintedTokens.push({
            id,
            error: e,
        });
        return `${id} getNFADetailsById tx error`;
    }
}

const mintAllNfas = async () => {
    // Nonce manager encapsules a signer. It can be used to manually increment the nonce on each tx
    // TODO: This needs to be updated for the specific chainId
    // const signer = getSigner(0); // dev
    const signer = getSigner(97); // testnet
    const signerAddress = await signer.getAddress();
    console.dir({ signerAddress });


    const nfaContract = new ethers.Contract(
        NFA_CONTRACT_ADDRESS,
        NonFungibleApesArtifact.abi,
        signer
    ) as any


    let apeDataChecks = []
    for (let i = 0; i < nfaDataArray.length; i++) {
        const apeDataCheck = await mintNfa(nfaContract, i, signerAddress);
        apeDataChecks.push(apeDataCheck);
    };

    // Write output: 
    await writeJSONToFileWithDate(__dirname + '/output/apeDataCheck', apeDataChecks);
    await writeJSONToFileWithDate(__dirname + '/output/txs', txs);
    await writeJSONToFileWithDate(__dirname + '/output/unmintedTokens', unMintedTokens);
};

(async function () {
    try {
        await mintAllNfas();
        console.log('🎉');
        process.exit(0);
    } catch (e) {
        throw new Error(`Top level await: ${e}`);
    }
}());
