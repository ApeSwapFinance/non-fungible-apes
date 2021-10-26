// NOTE: This is semi-sudo code as it needs to run in a truffle script
const NonFungibleApes = artifacts.require("NonFungibleApes");
const nfaDataArray = require('../info/apesData.json');

const currentNfa = nfaDataArray[0];
const currentNfaAttributes = currentNfa.attributes;

const nfaContract = await NonFungibleApes.at(NonFungibleApes.address);

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
await nfaContract.mint(
    toAddress,
    '', // URI should be blank
    currentNfa.name,
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
    { from: deployerAccount }
);

const nfaDetails = await nfaContract.getNFADetailsById(0);
console.dir({ nfaDetails })