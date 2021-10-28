// SPDX-License-Identifier: MIT
pragma solidity 0.8.3;

/*
 * ApeSwap Finance
 * App:             https://apeswap.finance
 * Medium:          https://ape-swap.medium.com
 * Twitter:         https://twitter.com/ape_swap
 * Telegram:        https://t.me/ape_swap
 * Announcements:   https://t.me/ape_swap_news
 * GitHub:          https://github.com/ApeSwapFinance 
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NonFungibleApesV2 is Context, AccessControlEnumerable, ERC721Enumerable {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    Counters.Counter private _tokenIdTracker;

    string private _baseTokenURI;
    /// @notice Collection of NFA details to describe each NFA
    struct NFADetails {
        uint128 rarityTier;
        uint128 rarityOverall;
        string name;
        string faceColor;
        string baseColor;
        string frame;
        string mouth;
        string eyes;
        string hat;
    }
    /// @notice Use the NFA tokenId to read NFA details
    mapping(uint256 => NFADetails) public getNFADetailsById;

    event UpdateBaseURI(string indexed previousBaseUri, string indexed newBaseUri);

    constructor(string memory name, string memory symbol, string memory baseTokenURI) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
    }

    /// @notice Check if the NFA of a specific ID is of a specific rarityTier
    /// @param tokenId The ID of the NFA to check
    /// @param rarityTier The rarityTier to check against the tokenId
    /// @return (bool) 
    function isNfaOfRarityTier(uint256 tokenId, uint256 rarityTier) external view returns (bool) {
        if(!_exists(tokenId)) {
            return false;
        }
        NFADetails memory currentNFADetails = getNFADetailsById[tokenId];
        return currentNFADetails.rarityTier == rarityTier;
    }

    /// @notice Update the baseTokenURI of the NFT
    /// @dev The admin of this function is expected to renounce ownership once the base url has been tested and is working
    /// @param baseTokenURI The new bse uri for the contract
    function updateBaseTokenURI(string memory baseTokenURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emit UpdateBaseURI(_baseTokenURI, baseTokenURI);
        _baseTokenURI = baseTokenURI;
    }

    /// @notice mint a new NFA to an address
    /// @dev must be called by an account with MINTER_ROLE
    /// @param to Address to mint the NFA to
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
    function mint(
        address to, 
        string memory name, 
        uint128[2] memory rarities, 
        string[6] memory attributes
    ) public virtual onlyRole(MINTER_ROLE) {
        uint256 currentTokenId = _tokenIdTracker.current();
        _mint(to, currentTokenId);
        getNFADetailsById[currentTokenId] = NFADetails(
            rarities[0], // rarityTier
            rarities[1], // rarityOverall
            name,
            attributes[0], // faceColor
            attributes[1], // baseColor
            attributes[2], // frame
            attributes[3], // mouth
            attributes[4], // eyes
            attributes[5]  // hat
        );
        _tokenIdTracker.increment();
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControlEnumerable, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}