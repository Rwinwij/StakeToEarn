import {ethers,Contract} from "ethers";
import stakingAbi from "../ABI/StakeToEarn.json"
import stakeTokenAbi from "../ABI/Elrond.json";

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

       stakingContract= new Contract(StakeToEarnAddress,stakingAbi,signer);
       stakeTokenContract=new Contract(ElrondAddress,stakeTokenAbi,signer);

       return {provider,selectedAccount,stakeTokenContract,stakingContract,chainId}

    }catch(error){
        console.error(error);
        throw error
    }
    
}