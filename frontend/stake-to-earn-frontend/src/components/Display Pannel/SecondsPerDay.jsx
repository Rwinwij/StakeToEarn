import { useState,useEffect,useContext } from "react";
import Web3Context from "../../context/Web3Context";
import {ethers} from "ethers"
import { toast } from "react-hot-toast";
import "./DisplayPannel.css";
const SecondsPerDay = ()=>{
  const {stakingContract,selectedAccount}=useContext(Web3Context);
  const [secsPerDay,setSecsPerDay]=useState("0");

  useEffect(()=>{
    const fetchRewardRate = async()=>{
       try{
          var rewardRateWei = await stakingContract.methods.SECONDS_PER_DAY().call();
          const rewardRateEth = ethers.formatUnits(rewardRateWei.toString(),0);
          setSecsPerDay(rewardRateEth)
        }catch(error){
          toast.error("Error fetching reward rate");
          console.error(error.message)
       }
    }
    stakingContract && fetchRewardRate()
  },[stakingContract,selectedAccount])

  return(
    <div className="seconds-per-day">
      <p>Seconds Per Day:</p>
      <span>{secsPerDay} secs/day ( *for demo purpose)</span>
  </div>
  )
}
export default SecondsPerDay;