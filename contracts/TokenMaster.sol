pragma solidity ^0.8.9;

// SPDX Licence-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TokenMaster is ERC721 {
    address public owner;
    uint256 public totalOccasions;
    uint256 public totalSupply;

    struct Occasion {
        uint256 id;
        string name;
        uint256 cost;
        uint256 maxTickets;
        uint256 ticketsSold;
        uint256 eventTimestamp;
        string time;
        string location;
    }

    struct Purchase {
        address buyer;
        uint256 occasionId;
        uint256 seat;
        uint256 amount;
    }

    mapping(uint256 => Occasion) public occasions;
    mapping(uint256 => mapping(address => bool)) public hasBought;
    mapping(uint256 => mapping(uint256 => address)) public seatTaken;
    mapping(uint256 => uint256[]) seatsTaken;
    mapping(address => uint256[]) public userPurchases;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        owner = msg.sender;
    }

    function list(
        string memory _name,
        uint256 _cost,
        uint256 _maxTickets,
        uint256 _eventTimestamp,
        string memory _time,
        string memory _location
    ) public onlyOwner {
        totalOccasions++;
        occasions[totalOccasions] = Occasion(
            totalOccasions,
            _name,
            _cost,
            _maxTickets,
            0, // ticketsSold starts at 0
            _eventTimestamp,
            _time,
            _location
        );
    }

    function mint(uint256 _id, uint256 _seat) public payable {
        require(_id != 0, "Invalid occasion ID");
        require(_id <= totalOccasions, "Occasion does not exist");
        require(msg.value >= occasions[_id].cost, "Insufficient ETH sent");
        require(seatTaken[_id][_seat] == address(0), "Seat already taken");
        require(
            occasions[_id].ticketsSold < occasions[_id].maxTickets,
            "All tickets sold"
        );

        // Update ticket sales
        occasions[_id].ticketsSold++;
        hasBought[_id][msg.sender] = true;
        seatTaken[_id][_seat] = msg.sender;
        seatsTaken[_id].push(_seat);
        userPurchases[msg.sender].push(_id);

        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    function refund(uint256 _id, uint256 _seat) public {
        require(hasBought[_id][msg.sender], "You have not bought this ticket");
        require(
            seatTaken[_id][_seat] == msg.sender,
            "You do not own this seat"
        );

        uint256 currentTime = block.timestamp;
        uint256 eventTime = occasions[_id].eventTimestamp;
        uint256 refundAmount = occasions[_id].cost;

        // Refund logic based on days before the event
        if (currentTime > eventTime) {
            revert("Cannot refund after the event");
        } else if (eventTime - currentTime > 30 days) {
            refundAmount = occasions[_id].cost; // Full refund
        } else if (eventTime - currentTime > 15 days) {
            refundAmount = occasions[_id].cost / 2; // 50% refund
        } else {
            revert("Refund not allowed within 15 days of the event");
        }

        // Update ticket sales
        occasions[_id].ticketsSold--;
        seatTaken[_id][_seat] = address(0);
        hasBought[_id][msg.sender] = false;

        // Remove seat from the taken seats array
        uint256[] storage seats = seatsTaken[_id];
        for (uint256 i = 0; i < seats.length; i++) {
            if (seats[i] == _seat) {
                seats[i] = seats[seats.length - 1];
                seats.pop();
                break;
            }
        }

        // Refund the calculated amount
        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund failed");
    }

    function getOccasion(uint256 _id) public view returns (Occasion memory) {
        return occasions[_id];
    }

    function getSeatsTaken(uint256 _id) public view returns (uint256[] memory) {
        return seatsTaken[_id];
    }

    function getUserPurchases(
        address _user
    ) public view returns (uint256[] memory) {
        return userPurchases[_user];
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
