// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UserRegistry {
    mapping(uint => address) private users;

    function registerUser(uint id, address addr) public {
        users[id] = addr;
    }

    function getUser(uint id) public view returns (address) {
        return users[id];
    }
}

interface IRepository {
    function save(uint id, bytes calldata data) external;
    function find(uint id) external view returns (bytes memory);
}

struct UserData {
    uint id;
    string name;
    address wallet;
}

enum UserRole {
    Admin,
    User,
    Guest
}

event UserRegistered(uint indexed id, address addr);
