import { useState,useEffect,useContext } from "react";
import Web3Context from "../../context/Web3Context";
import {ethers} from "ethers"
import { toast } from "react-hot-toast";
import "./DisplayPannel.css";
const AvailableTokenPool = ()=>{
  const {stakeTokenContract,stakingContract,selectedAccount}=useContext(Web3Context);
  const [availableTokenPool,setAvailableTokenPool]=useState("0");

  useEffect(()=>{
    const fetchRewardRate = async()=>{
       try{
          var rewardRateWei = await stakeTokenContract.methods.balanceOf(stakingContract._address).call();
          const rewardRateEth = ethers.formatUnits(rewardRateWei.toString(),18);
          setAvailableTokenPool(rewardRateEth)
        }catch(error){
          toast.error("Error fetching reward rate");
          console.error(error.message)
       }
    }
    stakingContract && fetchRewardRate()
  },[stakingContract,selectedAccount])

  return(
    <div className="available-token-pool">
      <p>Contract Token Balance:</p>
      <span>{availableTokenPool} ELROND </span>
  </div>
  )
}
export default AvailableTokenPool;