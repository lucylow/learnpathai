// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title LearnPathBadge
 * @dev NFT contract for verifiable learning achievements on LearnPath AI
 * Features: Role-based minting, proof anchoring, revocation, Merkle verification
 */
contract LearnPathBadge is ERC721URIStorage, ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant REVOKER_ROLE = keccak256("REVOKER_ROLE");

    // Token metadata and proof anchoring
    mapping(uint256 => bytes32) public tokenProof;
    mapping(uint256 => bool) public revokedTokens;
    mapping(uint256 => uint256) public mintedAt;
    
    // Merkle root for batch verification
    bytes32 public merkleRoot;
    string public baseContractURI;

    // Events
    event BadgeMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string tokenURI,
        bytes32 proofHash,
        uint256 timestamp
    );
    
    event BadgeRevoked(uint256 indexed tokenId, address indexed revokedBy, uint256 timestamp);
    event MerkleRootUpdated(bytes32 indexed newRoot, uint256 timestamp);

    constructor(
        string memory name,
        string memory symbol,
        string memory contractURI
    ) ERC721(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(REVOKER_ROLE, msg.sender);
        baseContractURI = contractURI;
    }

    /**
     * @dev Mint a new achievement badge with proof anchoring
     * @param recipient Address to receive the badge
     * @param tokenURI IPFS URI containing badge metadata
     * @param proofHash Hash of the achievement evidence (non-PII)
     */
    function mintBadge(
        address recipient,
        string calldata tokenURI,
        bytes32 proofHash
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        
        _safeMint(recipient, newId);
        _setTokenURI(newId, tokenURI);
        
        tokenProof[newId] = proofHash;
        mintedAt[newId] = block.timestamp;
        
        emit BadgeMinted(newId, recipient, tokenURI, proofHash, block.timestamp);
        return newId;
    }

    /**
     * @dev Batch mint badges (gas-optimized for multiple recipients)
     */
    function batchMintWithMerkle(
        address[] calldata recipients,
        string[] calldata tokenURIs,
        bytes32[] calldata proofHashes
    ) external onlyRole(MINTER_ROLE) returns (uint256[] memory) {
        require(
            recipients.length == tokenURIs.length && 
            recipients.length == proofHashes.length,
            "Arrays length mismatch"
        );
        
        uint256[] memory tokenIds = new uint256[](recipients.length);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = mintBadge(recipients[i], tokenURIs[i], proofHashes[i]);
        }
        
        return tokenIds;
    }

    /**
     * @dev Revoke a badge (mark as invalid, does not burn)
     */
    function revoke(uint256 tokenId) external onlyRole(REVOKER_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        require(!revokedTokens[tokenId], "Token already revoked");
        
        revokedTokens[tokenId] = true;
        emit BadgeRevoked(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @dev Check if a badge has been revoked
     */
    function isRevoked(uint256 tokenId) public view returns (bool) {
        return revokedTokens[tokenId];
    }

    /**
     * @dev Verify badge proof against stored hash
     */
    function verifyProof(
        uint256 tokenId,
        bytes32 computedHash
    ) external view returns (bool) {
        return 
            _exists(tokenId) && 
            !revokedTokens[tokenId] && 
            tokenProof[tokenId] == computedHash;
    }

    /**
     * @dev Update Merkle root for batch verification
     */
    function setMerkleRoot(bytes32 newRoot) external onlyRole(DEFAULT_ADMIN_ROLE) {
        merkleRoot = newRoot;
        emit MerkleRootUpdated(newRoot, block.timestamp);
    }

    /**
     * @dev Verify Merkle proof for privacy-preserving batch verification
     */
    function verifyMerkleProof(
        bytes32 leaf,
        bytes32[] calldata proof
    ) external view returns (bool) {
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    /**
     * @dev Get all badges owned by an address
     */
    function getBadgesByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory badges = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            badges[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return badges;
    }

    /**
     * @dev Get badge details including proof and revocation status
     */
    function getBadgeDetails(uint256 tokenId) external view returns (
        address owner,
        string memory uri,
        bytes32 proof,
        bool revoked,
        uint256 timestamp
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        return (
            ownerOf(tokenId),
            tokenURI(tokenId),
            tokenProof[tokenId],
            revokedTokens[tokenId],
            mintedAt[tokenId]
        );
    }

    /**
     * @dev Contract metadata URI for marketplaces (OpenSea, etc.)
     */
    function contractURI() public view returns (string memory) {
        return baseContractURI;
    }

    /**
     * @dev Update contract URI
     */
    function setContractURI(string memory newURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        baseContractURI = newURI;
    }

    // Override required functions for multiple inheritance
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

