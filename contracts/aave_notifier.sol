// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IHederaNotificationServiceReceiver {
    function notify(string memory _message) external;
}

contract AaveNotifier {
    function notify(address addr, string memory _message) public {
        // Message Format
        //"To:'x.x.xxxxxx', Message:'<Your message>'"
        return IHederaNotificationServiceReceiver(addr).notify(_message);
    }
}
