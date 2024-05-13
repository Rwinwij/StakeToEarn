import { useContext,useRef } from "react";
import {ethers} from "ethers"
import Web3Context from "../../context/Web3Context";
import StakingContext from "../../context/StakingContext";
import Button from "../Button/Button";
import { toast } from "react-hot-toast";
import "./Withdraw.css"

const WithdrawStakeAmount =()=>{
 const {stakingContract,selectedAccount}=useContext(Web3Context);
 const {isReload,setIsReload}=useContext(StakingContext)
 const withdrawStakeAmountRef = useRef();


 const withdrawStakeToken=async(e)=>{
   e.preventDefault();
   const amount = withdrawStakeAmountRef.current.value.trim();
   console.log(amount)
   if(isNaN(amount) || amount<=0){
    console.error("Please enter a valid positive number");
    return;
   }
   const amountToWithdraw = ethers.parseUnits(amount,18).toString();
   console.log(amountToWithdraw)
   try{
    const transaction = await stakingContract.methods.unstake(amountToWithdraw).send({ from: selectedAccount });
    await toast.promise(transaction.wait(),
    {
      loading: "Transaction is pending...",
      success: 'Transaction successful 👌',
      error: 'Transaction failed 🤯'
    });
    withdrawStakeAmountRef.current.value = "";
    setIsReload(!isReload);
    // const receipt = await transaction.wait();
    // if (receipt.status === 1) {
    //     setIsReload(!isReload);
    //     withdrawStakeAmountRef.current.value = "";
    //   } else {
    //       toast.error("Transaction failed. Please try again.")
    //   }
    } catch (error) {
      //toast.error("Unstake Error");
      console.error(error.message)
    }
  };
    return (
        <form className="withdraw-form" onSubmit={withdrawStakeToken}>
            <label>Unstake Amount:</label>
            <input type="text" ref={withdrawStakeAmountRef} />
            <Button
            onClick={withdrawStakeToken}
            type="submit"
            label="Unstake"
            />
      </form>
       )
}
export default WithdrawStakeAmount;