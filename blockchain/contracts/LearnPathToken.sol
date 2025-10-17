// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title LearnPathToken
 * @dev ERC-20 token for gamified learning rewards on LearnPath AI
 * Features: Minting for achievements, optional transfer restrictions (soulbound), burning
 */
contract LearnPathToken is ERC20, ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18; // 10 million tokens
    
    mapping(address => bool) public transferWhitelist;
    bool public transfersRestricted = false; // Can be enabled for soulbound-like behavior

    event TokensMinted(
        address indexed to,
        uint256 amount,
        string reason,
        uint256 timestamp
    );
    
    event TransferRestrictionUpdated(bool restricted, uint256 timestamp);
    event WhitelistUpdated(address indexed account, bool whitelisted);

    constructor() ERC20("LearnPath Token", "LPTH") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        
        // Mint initial supply to deployer for distribution
        _mint(msg.sender, 1_000_000 * 10**18);
    }

    /**
     * @dev Mint tokens with a reason (for transparency and auditing)
     */
    function mint(
        address to, 
        uint256 amount, 
        string calldata reason
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount, reason, block.timestamp);
    }

    /**
     * @dev Reward tokens for specific achievements (convenience function)
     * Converts points to token amount (1 point = 1 token)
     */
    function rewardAchievement(
        address student,
        uint256 points,
        string calldata achievement
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        uint256 tokenAmount = points * 10**18; // 1 point = 1 token with 18 decimals
        require(totalSupply() + tokenAmount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(student, tokenAmount);
        emit TokensMinted(student, tokenAmount, achievement, block.timestamp);
    }

    /**
     * @dev Batch reward multiple students (gas-optimized)
     */
    function batchRewardAchievements(
        address[] calldata students,
        uint256[] calldata points,
        string[] calldata achievements
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(
            students.length == points.length && 
            students.length == achievements.length,
            "Arrays length mismatch"
        );
        
        for (uint256 i = 0; i < students.length; i++) {
            uint256 tokenAmount = points[i] * 10**18;
            require(totalSupply() + tokenAmount <= MAX_SUPPLY, "Exceeds max supply");
            
            _mint(students[i], tokenAmount);
            emit TokensMinted(students[i], tokenAmount, achievements[i], block.timestamp);
        }
    }

    /**
     * @dev Enable/disable transfer restrictions (soulbound behavior)
     */
    function setTransferRestriction(bool restricted) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        transfersRestricted = restricted;
        emit TransferRestrictionUpdated(restricted, block.timestamp);
    }

    /**
     * @dev Add address to transfer whitelist (e.g., marketplace contracts)
     */
    function addToWhitelist(address account) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        transferWhitelist[account] = true;
        emit WhitelistUpdated(account, true);
    }

    /**
     * @dev Remove address from transfer whitelist
     */
    function removeFromWhitelist(address account) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        transferWhitelist[account] = false;
        emit WhitelistUpdated(account, false);
    }

    /**
     * @dev Check if an address can transfer tokens
     */
    function canTransfer(address account) public view returns (bool) {
        if (!transfersRestricted) return true;
        return transferWhitelist[account] || hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    /**
     * @dev Pause token operations (emergency)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token operations
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Override transfer to enforce restrictions if enabled
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
        
        // Skip check for minting and burning
        if (from == address(0) || to == address(0)) {
            return;
        }
        
        // Enforce transfer restrictions if enabled
        if (transfersRestricted) {
            require(
                canTransfer(from),
                "Transfers are restricted - not whitelisted"
            );
        }
    }
}

