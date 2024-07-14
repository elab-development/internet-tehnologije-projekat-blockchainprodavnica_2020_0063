pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TokenMaster is ERC721 {
    address public owner;
    uint256 public totalOccasions;
    uint256 public totalSupply;

    struct Occasion {
        uint256 id;
        string name;
        uint256 cost;
        uint256 tickets;
        uint256 maxTickets;
        string date;
        string time;
        string location;
    }

    struct Purchase {
        address buyer;
        uint256 occasionId;
        uint256 seat;
        uint256 amount;
    }

    Purchase public lastPurchase;

    mapping(uint256 => Occasion) occasions;
    mapping(uint256 => mapping(address => bool)) public hasBought;
    mapping(uint256 => mapping(uint256 => address)) public seatTaken;
    mapping(uint256 => uint256[]) seatsTaken;

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
        string memory _date,
        string memory _time,
        string memory _location
    ) public onlyOwner {
        totalOccasions++;
        occasions[totalOccasions] = Occasion(
            totalOccasions,
            _name,
            _cost,
            _maxTickets,
            _maxTickets,
            _date,
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
            _seat <= occasions[_id].maxTickets,
            "Seat number exceeds max tickets"
        );

        occasions[_id].tickets -= 1;
        hasBought[_id][msg.sender] = true;
        seatTaken[_id][_seat] = msg.sender;
        seatsTaken[_id].push(_seat);

        lastPurchase = Purchase(msg.sender, _id, _seat, msg.value);

        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    function refund() public {
        require(
            lastPurchase.buyer == msg.sender,
            "You are not the buyer of the last purchase"
        );

        uint256 occasionId = lastPurchase.occasionId;
        uint256 seat = lastPurchase.seat;
        uint256 amount = lastPurchase.amount;

        require(
            seatTaken[occasionId][seat] == msg.sender,
            "You do not own this seat"
        );

        // Mark the seat as available
        seatTaken[occasionId][seat] = address(0);
        hasBought[occasionId][msg.sender] = false;
        occasions[occasionId].tickets += 1;

        // Remove seat from the taken seats array
        uint256[] storage seats = seatsTaken[occasionId];
        for (uint256 i = 0; i < seats.length; i++) {
            if (seats[i] == seat) {
                seats[i] = seats[seats.length - 1];
                seats.pop();
                break;
            }
        }

        // Refund the buyer
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Refund failed");

        // Burn the NFT
        _burn(totalSupply);

        totalSupply--;
        delete lastPurchase;
    }

    function getOccasion(uint256 _id) public view returns (Occasion memory) {
        return occasions[_id];
    }

    function getSeatsTaken(uint _id) public view returns (uint256[] memory) {
        return seatsTaken[_id];
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
