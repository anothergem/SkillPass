// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SkillPassRegistry
/// @notice Stores only the SHA-256 hash of a credential (no personal data), who issued it and when.
///         Issuers can revoke their own credentials. Anyone can verify by reading `records`.
contract SkillPassRegistry {
    struct Record {
        address issuer;
        uint64 issuedAt;
        bool revoked;
    }

    mapping(bytes32 => Record) public records;

    event CredentialIssued(bytes32 indexed hash, address indexed issuer, address indexed student, uint64 issuedAt);
    event CredentialRevoked(bytes32 indexed hash, address indexed issuer);

    error AlreadyIssued();
    error NotFound();
    error NotIssuer();
    error AlreadyRevoked();

    /// @param hash    SHA-256 of the canonical credential JSON
    /// @param student optional student wallet (address(0) if unknown) - only emitted in the event
    function issue(bytes32 hash, address student) external {
        if (records[hash].issuer != address(0)) revert AlreadyIssued();
        uint64 ts = uint64(block.timestamp);
        records[hash] = Record(msg.sender, ts, false);
        emit CredentialIssued(hash, msg.sender, student, ts);
    }

    function revoke(bytes32 hash) external {
        Record storage r = records[hash];
        if (r.issuer == address(0)) revert NotFound();
        if (r.issuer != msg.sender) revert NotIssuer();
        if (r.revoked) revert AlreadyRevoked();
        r.revoked = true;
        emit CredentialRevoked(hash, msg.sender);
    }
}
