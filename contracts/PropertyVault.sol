// contracts/PropertyVault.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PropertyVault {
    address public owner;
    
    struct Property {
        address tenant;
        string roomLabel;
        uint256 rentAmount;     // in USDC (6 decimals)
        uint256 savingsPercent; // 0-100
        uint256 totalSaved;
        uint256 savingsGoal;
    }

    Property[] public properties;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function createProperty(
        address _tenant,
        string memory _roomLabel,
        uint256 _rentAmount,
        uint256 _savingsPercent,
        uint256 _savingsGoal
    ) external onlyOwner {
        properties.push(Property({
            tenant: _tenant,
            roomLabel: _roomLabel,
            rentAmount: _rentAmount,
            savingsPercent: _savingsPercent,
            totalSaved: 0,
            savingsGoal: _savingsGoal
        }));
    }

    function getAllProperties() external view returns (Property[] memory) {
        return properties;
    }

    function getPropertyCount() external view returns (uint256) {
        return properties.length;
    }
}