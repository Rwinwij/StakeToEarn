import {ethers} from "ethers";
import ELROND_ABI from "../ABI/Elrond.json"
import STAKE_TO_EARN_ABI from "../ABI/StakeToEarn.json";

import { Web3 } from 'web3';

//const web3 = new Web3('https://ethereum-sepolia.publicnode.com');


export const connectWallet = async()=>{
    try{
       let [signer,provider,chainId]=[null,null,null];
       if(window.ethereum===null){
          throw new Error("Metamask is not installed");
       }
       const accounts = await window.ethereum.request({
        method:'eth_requestAccounts'
       })

       let chainIdHex= await window.ethereum.request({
        method:'eth_chainId'
       })
       chainId= parseInt(chainIdHex,16)
       
       let selectedAccount =accounts[0];
       if(!selectedAccount){
        throw new Error("There isn't any ethereum acc is available")
       } 

       provider = new ethers.BrowserProvider(window.ethereum);
       signer = await provider.getSigner();

       const StakeToEarnAddress="0x316714f28559d3bF232e5E8A82F372C86F9Ff076"
       const ElrondAddress="0xd21550cA1Eb4972258eA2CEA5b5fca990D83Dc5e"

       const web3 = new Web3(window.ethereum);

       const stakingContract = new web3.eth.Contract(STAKE_TO_EARN_ABI, StakeToEarnAddress);
       const stakeTokenContract = new web3.eth.Contract(ELROND_ABI, ElrondAddress);

       return {provider,selectedAccount,stakeTokenContract,stakingContract,chainId}

    }catch(error){
        console.error(error);
        throw error
    }
    
}