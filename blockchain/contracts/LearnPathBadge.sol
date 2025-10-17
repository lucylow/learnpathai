// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title LearnPathBadge
 * @dev NFT Badge system for LearnPathAI with proof anchoring and revocation
 */
contract LearnPathBadge is ERC721URIStorage, AccessControl, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant REVOKER_ROLE = keccak256("REVOKER_ROLE");

    // Mapping from tokenId to proof hash (evidence anchor)
    mapping(uint256 => bytes32) public tokenProof;
    
    // Mapping from tokenId to revocation status
    mapping(uint256 => bool) public isRevoked;
    
    // Mapping from tokenId to mint timestamp
    mapping(uint256 => uint256) public mintTimestamp;
    
    // Mapping from tokenId to badge type
    mapping(uint256 => string) public badgeType;

    // Events
    event BadgeMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string tokenURI,
        bytes32 proofHash,
        string badgeType,
        uint256 timestamp
    );
    
    event BadgeRevoked(
        uint256 indexed tokenId,
        address indexed revoker,
        string reason,
        uint256 timestamp
    );

    constructor(string memory name, string memory symbol) 
        ERC721(name, symbol) 
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(REVOKER_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new badge NFT to a recipient
     * @param recipient Address to receive the badge
     * @param uri IPFS URI containing badge metadata
     * @param proofHash Hash of evidence/proof data for verification
     * @param badgeTypeName Type/category of badge being awarded
     * @return tokenId The newly minted token ID
     */
    function mintBadge(
        address recipient,
        string calldata uri,
        bytes32 proofHash,
        string calldata badgeTypeName
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(uri).length > 0, "URI cannot be empty");
        require(proofHash != bytes32(0), "Proof hash cannot be empty");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, uri);
        
        tokenProof[newTokenId] = proofHash;
        mintTimestamp[newTokenId] = block.timestamp;
        badgeType[newTokenId] = badgeTypeName;

        emit BadgeMinted(
            newTokenId,
            recipient,
            uri,
            proofHash,
            badgeTypeName,
            block.timestamp
        );

        return newTokenId;
    }

    /**
     * @dev Batch mint multiple badges (gas efficient)
     * @param recipients Array of recipient addresses
     * @param uris Array of IPFS URIs
     * @param proofHashes Array of proof hashes
     * @param badgeTypeNames Array of badge types
     */
    function batchMintBadges(
        address[] calldata recipients,
        string[] calldata uris,
        bytes32[] calldata proofHashes,
        string[] calldata badgeTypeNames
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(
            recipients.length == uris.length &&
            recipients.length == proofHashes.length &&
            recipients.length == badgeTypeNames.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            mintBadge(recipients[i], uris[i], proofHashes[i], badgeTypeNames[i]);
        }
    }

    /**
     * @dev Revoke a badge (mark as revoked, don't burn)
     * @param tokenId Token to revoke
     * @param reason Reason for revocation
     */
    function revokeBadge(uint256 tokenId, string calldata reason) 
        external 
        onlyRole(REVOKER_ROLE) 
    {
        require(_exists(tokenId), "Token does not exist");
        require(!isRevoked[tokenId], "Already revoked");

        isRevoked[tokenId] = true;
        emit BadgeRevoked(tokenId, msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Burn a badge (permanent removal)
     * @param tokenId Token to burn
     */
    function burnBadge(uint256 tokenId) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_exists(tokenId), "Token does not exist");
        _burn(tokenId);
    }

    /**
     * @dev Verify a badge's proof hash
     * @param tokenId Token to verify
     * @param providedProof Proof hash to check against
     * @return bool True if proof matches
     */
    function verifyProof(uint256 tokenId, bytes32 providedProof) 
        external 
        view 
        returns (bool) 
    {
        require(_exists(tokenId), "Token does not exist");
        return tokenProof[tokenId] == providedProof && !isRevoked[tokenId];
    }

    /**
     * @dev Get all token IDs owned by an address
     * @param owner Address to query
     * @return Array of token IDs
     */
    function tokensOfOwner(address owner) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                tokenIds[index] = i;
                index++;
            }
        }

        return tokenIds;
    }

    /**
     * @dev Get badge info
     * @param tokenId Token to query
     */
    function getBadgeInfo(uint256 tokenId) 
        external 
        view 
        returns (
            address owner,
            string memory uri,
            bytes32 proof,
            string memory bType,
            uint256 minted,
            bool revoked
        ) 
    {
        require(_exists(tokenId), "Token does not exist");
        
        return (
            ownerOf(tokenId),
            tokenURI(tokenId),
            tokenProof[tokenId],
            badgeType[tokenId],
            mintTimestamp[tokenId],
            isRevoked[tokenId]
        );
    }

    /**
     * @dev Pause minting (emergency use)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause minting
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Get total number of badges minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }

    // Required overrides
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
