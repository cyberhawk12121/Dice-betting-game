import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';

import Dice from "../abis/Dice.json";

const web3= new Web3(window.ethereum);
class App extends Component {

  constructor(props){
    super(props);
    this.state={
      balance: null,
      account: null,
      network:null,
      badNetwork: null,
      contractAddress: null,
      event: null,
      maxBet:0,
      minBet:0,
      loading:false,
      contract: null,
    }

    this.onChange= this.onChange.bind();
    this.setState= this.setState.bind();
    this.makeBet= this.makeBet.bind();
  }

  async ComponentWillMount(){
    await this.loadWeb3();
    await this.chainData();
  }

  async chainData(){
    const netid= await web3.eth.net.getId();
    const dice= Dice.networks[netId];
    if(dice){
      // Getting the smart contract using the address and ABI (ABI: Is the binary formatted metadata of the contract)
      const diceGame= new web3.eth.Contract(Dice.abi, dice.address);
      this.setState({contract: diceGame});
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
  }

  render() {
    return (
      <div>
        <h1>Hello</h1>
        <Navbar account={this.state.account} />
        <form>
          <input type="number" />
        </form>      
      </div>
    );
  }
}

export default App;
