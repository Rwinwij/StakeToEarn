import { useState,useEffect,useContext } from "react";
import Web3Context from "../../context/Web3Context";
import {ethers} from "ethers"
import { toast } from "react-hot-toast";
import "./DisplayPannel.css";
const RewardRate = ()=>{
  const {stakingContract,selectedAccount}=useContext(Web3Context);
  const [rewardRate,setRewardRate]=useState("0");

  useEffect(()=>{
    const fetchRewardRate = async()=>{
       try{
          var rewardRateWei = await stakingContract.methods.DAILY_EMISSION().call();
          rewardRateWei = Number(rewardRateWei);
          console.log (rewardRateWei)
          const rewardRateEth = ethers.formatUnits(rewardRateWei.toString(),0);
          setRewardRate(rewardRateEth)
        }catch(error){
          toast.error("Error fetching reward rate");
          console.error(error.message)
       }
    }
    stakingContract && fetchRewardRate()
  },[stakingContract,selectedAccount])

  return(
    <div className="reward-rate">
      <p>Reward Rate:</p>
      <span>{rewardRate} token/day </span>
  </div>
  )
}
export default RewardRate;