import { useState,useEffect,useContext } from "react";
import Web3Context from "../../context/Web3Context";
import {ethers} from "ethers"
import { toast } from "react-hot-toast";
import "./DisplayPannel.css";
const TotalTokensStaked = ()=>{
  const {stakingContract,selectedAccount}=useContext(Web3Context);
  const [totalStaked,setTotalStaked]=useState("0");

  useEffect(()=>{
    const fetchRewardRate = async()=>{
       try{
          var rewardRateWei = await stakingContract.methods.totalStakedTokens().call();
          const rewardRateEth = ethers.formatUnits(rewardRateWei.toString(),0);
          setTotalStaked(rewardRateEth)
        }catch(error){
          toast.error("Error fetching reward rate");
          console.error(error.message)
       }
    }
    stakingContract && fetchRewardRate()
  },[stakingContract,selectedAccount])

  return(
    <div className="total-tokens-staked">
      <p>Total Tokens Staked:</p>
      <span>{totalStaked} ELROND </span>
  </div>
  )
}
export default TotalTokensStaked;
