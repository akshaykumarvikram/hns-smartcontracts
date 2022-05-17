// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract HederaNotificationServiceReceiver {
    event LogMessage(address indexed from, string message);

    function notify(string memory _message) public {
        emit LogMessage(msg.sender, _message);
    }
}
