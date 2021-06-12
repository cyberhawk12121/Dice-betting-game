import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import Navbar from "./Navbar.js"


import Dice from "../abis/Dice.json";

const web3= new Web3(window.ethereum);
class App extends Component {

  constructor(props){
    super(props);
    this.state={
      bet: null,
      balance: null,
      account: null,
      network:null,
      badNetwork: null,
      contractAddress: null,
      event: null,
      maxBet:0,
      // minBet:0,
      loading:false,
      contract: null,
      amount:null
    }

    this.onChange= this.onChange.bind();
    this.setState= this.setState.bind();
    this.makeBet= this.makeBet.bind();
  }

  async componentWillMount(){
    await this.loadWeb3();
    await this.chainData();
  }

  async chainData(){
    let accounts, balance, maxBet, minBet;

    const netid= await web3.eth.net.getId();
    const dice= Dice.networks[netid];
    if(dice){
      // Getting the smart contract using the address and ABI (ABI: Is the binary formatted metadata of the contract)
      const diceGame= new web3.eth.Contract(Dice.abi, dice.address);
      this.setState({contract: diceGame});
    }

    accounts= await web3.eth.getAccounts();

    if(typeof accounts[0]!=='undefined' && accounts[0]!== null) // !== means not equal value or type
    {
      balance= await web3.eth.getBalance(accounts[0]);
      maxBet= await web3.eth.getBalance(dice.address)
      this.setState({
        account: accounts[0],
        balance: balance,
        maxBet:maxBet,
      })
    }
  }

  async loadWeb3(){
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.setState({account: accounts[0]});
      } catch (error) {
        if (error.code === 4001) {
          window.alert("Couldn't find any accounts to connect");
        }
        console.log(error);
      }
    } 
    else{
      alert("Install metamask!");
    }
    window.ethereum.autoRefreshOnNetworkChange = false;
  }

  onChange=({target})=>{
    this.setState({[target.name]: target.value});
  };

  async onSubmit(e){
    e.preventDefault();
    if(typeof this.state.account !=='undefined' && this.state.account !==null){
      var randomSeed = Math.floor(Math.random() * Math.floor(1e9))
    }

    this.state.contract.methods.bet(this.state.bet, randomSeed).send({from:this.state.account, value:this.state.amount}).on('transactionHash', (hash)=>{
      this.state.contract.events.Result({}, async (error, event)=>{
        const result= event.returnValues.winAmount;
        if(result==='0'){
          window.alert("You lose!");
        }else{
          window.alert("WIN");
        }
      })
    })
    
  }

  render() {
    return (
      <div>
        <h1>Hello</h1>
        <Navbar account={this.state.account} />
        <form onSubmit={this.onSubmit}>
          Number to Bet<input type="number" name="bet" value={this.state.bet} onChange={this.handleChange} />
          <br/>
          Amount you're betting<input type="number" name="amount" value={this.state.amount} onChange={this.handleChange} />
          <input type="submit"  value="Roll it!" className="btn btn-outline-danger" />
        </form>      
      </div>
    );
  }
}

export default App;
