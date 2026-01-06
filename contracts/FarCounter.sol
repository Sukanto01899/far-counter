// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title FarCounter
/// @notice Counter with 6 hour cooldown per fid and offchain signatures for auth.
/// @dev Server signs an EIP712 Increment struct; contract verifies and pays reward tokens.
contract FarCounter is EIP712, Ownable {
    using SafeERC20 for IERC20;

    struct IncrementRequest {
        address user;
        uint256 fid;
        uint256 nonce;
        uint256 deadline;
    }

    bytes32 public constant INCREMENT_TYPEHASH =
        keccak256(
            "Increment(address user,uint256 fid,uint256 nonce,uint256 deadline)"
        );

    uint256 public constant COOLDOWN = 6 hours;

    address public signer;
    address public immutable rewardToken;
    uint256 public rewardPerTap;
    uint256 public totalIncrements;

    mapping(uint256 => uint256) public userIncrements; // fid => count
    mapping(uint256 => uint256) public lastIncrementAt; // fid => last timestamp
    mapping(address => mapping(uint256 => bool)) public nonceUsed; // user => nonce => used

    event Incremented(
        address indexed user,
        uint256 indexed fid,
        uint256 nonce,
        uint256 reward,
        uint256 totalIncrements,
        uint256 userTotal
    );

    event SignerUpdated(address indexed newSigner);

    constructor(
        address initialOwner,
        address initialSigner,
        address rewardToken_,
        uint256 rewardPerTap_
    ) EIP712("FarCounter", "1") Ownable(initialOwner) {
        require(initialOwner != address(0), "Owner cannot be zero");
        require(initialSigner != address(0), "Signer cannot be zero");
        require(rewardToken_ != address(0), "Reward token required");
        require(rewardPerTap_ > 0, "Reward cannot be zero");
        signer = initialSigner;
        rewardToken = rewardToken_;
        rewardPerTap = rewardPerTap_;
    }

    function setSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Signer cannot be zero");
        signer = newSigner;
        emit SignerUpdated(newSigner);
    }

    function setRewardPerTap(uint256 newReward) external onlyOwner {
        require(newReward > 0, "Reward cannot be zero");
        rewardPerTap = newReward;
    }

    function increment(IncrementRequest calldata req, bytes calldata signature)
        external
    {
        require(msg.sender == req.user, "Sender must match request user");
        require(req.deadline >= block.timestamp, "Request expired");
        require(!nonceUsed[req.user][req.nonce], "Nonce already used");

        uint256 last = lastIncrementAt[req.fid];
        require(
            last == 0 || block.timestamp >= last + COOLDOWN,
            "Cooldown active"
        );

        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    INCREMENT_TYPEHASH,
                    req.user,
                    req.fid,
                    req.nonce,
                    req.deadline
                )
            )
        );

        address recovered = ECDSA.recover(digest, signature);
        require(recovered == signer, "Bad signature");

        nonceUsed[req.user][req.nonce] = true;
        lastIncrementAt[req.fid] = block.timestamp;

        unchecked {
            totalIncrements += 1;
            userIncrements[req.fid] += 1;
        }

        uint256 reward = rewardPerTap;
        if (reward > 0) {
            IERC20(rewardToken).safeTransfer(req.user, reward);
        }

        emit Incremented(
            req.user,
            req.fid,
            req.nonce,
            reward,
            totalIncrements,
            userIncrements[req.fid]
        );
    }

    function nextAvailableAt(uint256 fid) public view returns (uint256) {
        uint256 last = lastIncrementAt[fid];
        if (last == 0) return 0;
        return last + COOLDOWN;
    }

    function getUserData(uint256 fid)
        external
        view
        returns (uint256 count, uint256 availableAt)
    {
        return (userIncrements[fid], nextAvailableAt(fid));
    }

    function rescueTokens(address to, uint256 amount) external onlyOwner {
        IERC20(rewardToken).safeTransfer(to, amount);
    }
}
