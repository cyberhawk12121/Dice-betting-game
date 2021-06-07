pragma solidity 0.6.6;


import "https://raw.githubusercontent.com/smartcontractkit/chainlink/master/evm-contracts/src/v0.6/VRFConsumerBase.sol";
import "https://github.com/smartcontractkit/chainlink/blob/master/evm-contracts/src/v0.6/interfaces/AggregatorV3Interface.sol"; /* !UPDATE, import aggregator contract */

contract Dice{
    // State variables
    uint256 public gameId;
    address payable public admin;

    uint256 internal fee;

    // mappings
    mapping(uint256=>Bet) public game;


    // Save the details of the current Bet game
    struct Bet{
        uint256 ID;
        uint256 bet;    // You bet that the dice will give this number
        uint256 seed;   // This is used in RNG
        address payable player; // Person playing the game
    }

    // Rinkeby Address for VRF link
    address constant VRF_addr = 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B; // VRF Coordinator
    address constant LINK_addr = 0x01BE23585060835E02B77ef475b0Cc51aA1e0709; // LINK token

    // Events
    event Withdraw(address admin, uint256 amount);
    event Received(address indexed sender, uint256 amount);
    event Result(uint256 id, uint256 bet, uint256 randomSeed, uint256 amount, address player, uint256 winAmount, uint256 randomResult, uint256 time);

    /* Allows this contract to receive payments */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    modifier onlyVRF() {
        require(msg.sender == VRF_addr, 'only VFR consumer can call this function');
        _;
    }
    
    constructor() 
        VRFConsumerBase(
            VRF_addr,
            LINK_addr
        ) public
    {
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10 ** 18; // 0.1 LINK (Varies by network)
    }
    
    function getRandomNumber(uint256 userProvidedSeed) public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint randomResult = randomness.mod(6).add(1);
        result(randomResult);
    }

    function bet(uint256 betValue, uint256 seed) public payable returns(bool){
        // The ether value to bet should be between 0 and 1 (Like 0.1 eth)
        require(msg.value>0, "msg.value must be greater than 0");
        require(betValue>=1 && betValue<=6, "the bet must be between 1 and 6 inclusive");
        require(address(this).balance > msg.value, "Contract doesnt't have sufficient balance for this bet, maybe lower the amount!");
        game[gameId]=Game(gameId, betValue, seed, msg.sender);

        gameId+=1;

        getRandomNumber(seed);

        return true;
    }

    function result(uint _result) public payable onlyVRF{
        for(uint i=lastGameId; i<gameId;i++){
            uint amountWon=0;
            if(_result == games[i].bet){
                amountWon= game[i].amount;
                game[i].player.transfer(amountWon);                  
            }
            emit Result(game[i].ID, game[i].bet, games[id], game[i].amount, player, winAmount, randomResult, time);
        }
        lastGameId=gameId;
    }
}