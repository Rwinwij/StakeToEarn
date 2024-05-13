import { useState,useEffect,useContext } from "react";
import Web3Context from "../../context/Web3Context";
import StakingContext from "../../context/StakingContext";
import {ethers} from "ethers"
import { toast } from "react-hot-toast";
import "./DisplayPannel.css";


const StakedAmount = ()=>{
   const {stakingContract,selectedAccount}=useContext(Web3Context);
   const {isReload}=useContext(StakingContext)
   const [stakedAmount,setStakedAmount]=useState("0");

   useEffect(()=>{
     const fetchStakedBalance = async()=>{
        try{
           var amountStakedWei = await stakingContract.methods.userTokenBalance(selectedAccount).call();
           amountStakedWei = Number(amountStakedWei);
           const amountStakedEth = ethers.formatUnits(amountStakedWei.toString(),0);
           setStakedAmount(amountStakedEth)
        }catch(error){
         toast.error("Error fetching user staked amount");
         console.error(error.message)
        }
     }
     stakingContract && fetchStakedBalance()

     // Set up interval to fetch staked balance every 5 seconds
    const intervalId = setInterval(async () => {
      if (stakingContract) {
        fetchStakedBalance();
      }
    }, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);

   },[stakingContract,selectedAccount,isReload])
   

   return(
      <div className="staked-amount">
       <p>Staked Amount: </p> <span>{stakedAmount} ELROND</span>
      </div>
   )
}
export default StakedAmount;