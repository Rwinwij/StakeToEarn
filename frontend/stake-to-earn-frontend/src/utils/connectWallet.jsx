import {ethers} from "ethers";
import STAKE_TO_EARN_ABI from "../ABI/StakeToEarn.json"
import ELROND_ABI from "../ABI/Elrond.json";

import { Web3 } from 'web3';

const web3 = new Web3('https://ethereum-sepolia.publicnode.com');

export const connectWallet = async()=>{
    try{
       let [signer,provider,stakingContract,stakeTokenContract,chainId]=[null,null,null,null,null];
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

       const StakeToEarnAddress="0xF85ea780B58438b47c92095a8C94110E31907dE0"
       const ElrondAddress="0xd21550cA1Eb4972258eA2CEA5b5fca990D83Dc5e"

       const stakeToEarnContract = new web3.eth.Contract(STAKE_TO_EARN_ABI, StakeToEarnAddress);
       const elrondContract = new web3.eth.Contract(ELROND_ABI, ElrondAddress);

       return {provider,selectedAccount,elrondContract,stakeToEarnContract,chainId}

    }catch(error){
        console.error(error);
        throw error
    }
    
}