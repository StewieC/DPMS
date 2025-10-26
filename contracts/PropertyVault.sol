// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyVault is Ownable {
    struct Property {
        address tenant;
        uint256 rentAmount;
        uint256 savingsPercentage;
        uint256 lastPaymentTime;
        bool active;
        uint256 totalSaved;
        uint256 savingsGoal;
        uint256 savingsPoints;
        bool tenantEligibleForBonus;
    }

    struct EmergencyUnlock {
        uint256 propertyId;
        uint256 approvalCount;
        mapping(address => bool) approvals;
        address[] approvers;
        bool executed;
    }

    mapping(uint256 => Property) public properties;
    mapping(uint256 => EmergencyUnlock) public emergencyUnlocks;
    uint256 public nextPropertyId = 1;
    address[] public acceptedTokens;
    uint256 public tenantBonusPool;
    address public governanceAddress;

    uint256 public constant MONTH_IN_SECONDS = 30 days;
    uint256 public constant APPROVAL_THRESHOLD = 2;

    event PropertyCreated(uint256 indexed propertyId, address owner, address tenant, uint256 rent);
    event RentPaid(uint256 indexed propertyId, uint256 amount, uint256 saved, uint256 pointsEarned);
    event TenantBonusPaid(uint256 indexed propertyId, address tenant, uint256 amount);
    event SavingsWithdrawn(uint256 indexed propertyId, uint256 amount);
    event EmergencyUnlockRequested(uint256 indexed propertyId, address requester);
    event EmergencyUnlockApproved(uint256 indexed propertyId, address approver);
    event EmergencyUnlockExecuted(uint256 indexed propertyId, uint256 amount);

    constructor(address[] memory _acceptedTokens) Ownable(msg.sender) {
        acceptedTokens = _acceptedTokens;
        require(_acceptedTokens.length > 0, "At least one token required");
    }

    function createProperty(
        address _tenant,
        uint256 _rentAmount,
        uint256 _savingsPercentage,
        uint256 _savingsGoal
    ) external onlyOwner {
        require(_savingsPercentage <= 100, "Invalid savings %");
        require(_rentAmount > 0, "Rent must be > 0");
        require(_savingsGoal > 0, "Savings goal must be > 0");

        uint256 propertyId = nextPropertyId++;
        properties[propertyId] = Property({
            tenant: _tenant,
            rentAmount: _rentAmount,
            savingsPercentage: _savingsPercentage,
            lastPaymentTime: block.timestamp,
            active: true,
            totalSaved: 0,
            savingsGoal: _savingsGoal,
            savingsPoints: 0,
            tenantEligibleForBonus: false
        });

        emit PropertyCreated(propertyId, msg.sender, _tenant, _rentAmount);
    }

    function withdrawSavings(uint256 _propertyId) public onlyOwner {
        Property storage prop = properties[_propertyId];
        require(prop.active, "Property inactive");

        EmergencyUnlock storage unlock = emergencyUnlocks[_propertyId];
        if (unlock.approvalCount > 0 && !unlock.executed) {
            require(unlock.approvalCount >= APPROVAL_THRESHOLD, "Insufficient approvals");
            unlock.executed = true;
        }

        uint256 amount = prop.totalSaved;
        prop.totalSaved = 0;
        require(acceptedTokens.length > 0, "No tokens configured");
        IERC20 token = IERC20(acceptedTokens[0]);
        require(token.transfer(owner(), amount), "Withdraw failed");
        emit SavingsWithdrawn(_propertyId, amount);
    }

    function payRent(uint256 _propertyId, address _token) external {
        Property storage prop = properties[_propertyId];
        require(prop.active, "Property inactive");
        require(msg.sender == prop.tenant, "Not tenant");
        require(block.timestamp >= prop.lastPaymentTime + MONTH_IN_SECONDS, "Rent already paid");
        require(isAcceptedToken(_token), "Token not accepted");

        IERC20 token = IERC20(_token);
        uint256 savingsAmount = (prop.rentAmount * prop.savingsPercentage) / 100;
        uint256 ownerAmount = prop.rentAmount - savingsAmount;
        uint256 bonusAmount = (prop.rentAmount * 1) / 100;

        require(token.transferFrom(msg.sender, address(this), prop.rentAmount), "Payment failed");
        require(token.transfer(owner(), ownerAmount), "Owner transfer failed");

        prop.totalSaved += savingsAmount;
        prop.lastPaymentTime = block.timestamp;
        prop.savingsPoints += 10;
        prop.tenantEligibleForBonus = true;

        tenantBonusPool += bonusAmount;
        emit RentPaid(_propertyId, prop.rentAmount, savingsAmount, 10);

        if (tenantBonusPool >= bonusAmount) {
            tenantBonusPool -= bonusAmount;
            require(token.transfer(prop.tenant, bonusAmount), "Bonus transfer failed");
            emit TenantBonusPaid(_propertyId, prop.tenant, bonusAmount);
            prop.tenantEligibleForBonus = false;
        }
    }

    function requestEmergencyUnlock(uint256 _propertyId, address[] calldata _approvers) external onlyOwner {
        require(properties[_propertyId].active, "Property inactive");
        EmergencyUnlock storage unlock = emergencyUnlocks[_propertyId];
        require(!unlock.executed, "Already executed");

        unlock.propertyId = _propertyId;
        unlock.approvers = _approvers;
        unlock.approvalCount = 1;
        unlock.approvals[msg.sender] = true;
        emit EmergencyUnlockRequested(_propertyId, msg.sender);
    }

    function approveEmergencyUnlock(uint256 _propertyId) external {
        EmergencyUnlock storage unlock = emergencyUnlocks[_propertyId];
        require(unlock.propertyId == _propertyId, "Invalid property");
        require(!unlock.approvals[msg.sender], "Already approved");
        require(unlock.approvalCount < APPROVAL_THRESHOLD, "Threshold reached");

        unlock.approvals[msg.sender] = true;
        unlock.approvalCount++;
        emit EmergencyUnlockApproved(_propertyId, msg.sender);

        if (unlock.approvalCount >= APPROVAL_THRESHOLD) {
            withdrawSavings(_propertyId); // Now visible since defined above
            emit EmergencyUnlockExecuted(_propertyId, properties[_propertyId].totalSaved);
        }
    }

    function getSavingsProgress(uint256 _propertyId) external view returns (uint256) {
        Property memory prop = properties[_propertyId];
        if (prop.savingsGoal == 0) return 0;
        return (prop.totalSaved * 100) / prop.savingsGoal;
    }

    function isAcceptedToken(address _token) internal view returns (bool) {
        for (uint i = 0; i < acceptedTokens.length; i++) {
            if (acceptedTokens[i] == _token) return true;
        }
        return false;
    }

    function setGovernanceAddress(address _governance) external onlyOwner {
        governanceAddress = _governance;
    }
}