// ApeSwap's NonFungibleApes

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NonFungibleApes is Context, AccessControlEnumerable, ERC721Enumerable, ERC721Burnable {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    Counters.Counter private _tokenIdTracker;

    string private _baseTokenURI;

    struct NFADetails {
        uint256 rarity;
        string name;
        string face;
        string faceColor;
        string baseColor;
        string frame;
        string mouth;
        string eyes;
        string hat;
    }

    mapping(uint256 => NFADetails) getNFADetailsById;

    constructor(string memory name, string memory symbol, string memory baseTokenURI) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function checkNFARarity(uint256 tokenId, uint256 rarity) external view returns (bool) {
        if(rarity > 5 || tokenId >= _tokenIdTracker.current()) {
            return false;
        }
        NFADetails memory currentNFADetails = getNFADetailsById[tokenId];
        return currentNFADetails.rarity == rarity;
    }

    function mint(address to, uint256 rarity, string memory name, string[7] memory attributes) public virtual {
        require(hasRole(MINTER_ROLE, _msgSender()), "NonFungibleApes: must have minter role to mint");

        _mint(to, _tokenIdTracker.current());
        getNFADetailsById[_tokenIdTracker.current()] = NFADetails(
            rarity,
            name,
            attributes[0], // face
            attributes[1], // faceColor
            attributes[2], // baseColor
            attributes[3], // frame
            attributes[4], // mouth
            attributes[5], // eyes
            attributes[6]  // hat
        );
        _tokenIdTracker.increment();
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControlEnumerable, ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}