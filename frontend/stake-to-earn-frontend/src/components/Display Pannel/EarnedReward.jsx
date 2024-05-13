import { useState,useContext,useEffect } from "react";
import {ethers} from "ethers"
import web3Context from "../../context/Web3Context"
import { toast } from "react-hot-toast";
import "./DisplayPannel.css";
const EarnedReward =()=>{
  const {stakingContract,selectedAccount}=useContext(web3Context);
  const [rewardVal,setRewardVal]=useState("0");

  useEffect(()=>{
    const fetchStakeRewardInfo =async()=>{
        try{
          //fetching earned amount of a user
          var rewardValueWei = await stakingContract.methods.userReward(selectedAccount).call();
          rewardValueWei = Number(rewardValueWei);
          const roundedReward = ethers.formatUnits(rewardValueWei.toString(),0);
          setRewardVal(roundedReward)

        }catch(error){
          toast.error("Error fetching the reward:");
          console.error(error.message)
        }
      }
      // Set up interval to fetch user reward every 2 seconds
      const intervalId = setInterval(async () => {
        if (stakingContract) {
          fetchStakeRewardInfo();
        }
      }, 2000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  },[stakingContract,selectedAccount])

  return(
    <div className="earned-reward">
      <p>Earned Reward:</p>
      <span>{rewardVal}</span>
  </div>
  )
}
export default EarnedReward;