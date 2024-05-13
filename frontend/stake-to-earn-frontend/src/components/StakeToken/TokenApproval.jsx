import { useContext,useRef } from "react";
import {ethers} from "ethers"
import Web3Context from "../../context/Web3Context";
import Button from "../Button/Button";
import { toast } from "react-hot-toast";
const TokenApproval =()=>{
 const {stakeTokenContract,stakingContract, selectedAccount}=useContext(Web3Context);
 const approvedTokenRef = useRef();

 const approveToken=async(e)=>{
   e.preventDefault();
   const amount = approvedTokenRef.current.value.trim();
   if(isNaN(amount) || amount<=0){
    console.error("Please enter a valid positive number");
    return;
   }
   const amountToSend = ethers.parseUnits(amount,18).toString();
   try{
    const transaction = await stakeTokenContract.methods.
                                                 approve(stakingContract.target,amountToSend).
                                                 send({ from: selectedAccount });
    
    await toast.promise(transaction.wait(),
    {
      loading: "Transaction is pending...",
      success: 'Transaction successful 👌',
      error: 'Transaction failed 🤯'
    });
    approvedTokenRef.current.value = "";
    // const receipt = await transaction.wait();
    // if (receipt.status === 1) {
    //     toast.success("Transaction is successful")
    //     approvedTokenRef.current.value = "";
    //   } else {
    //       toast.error("Transaction failed. Please try again.")
    //   }
    } catch (error) {
      toast.error("ERC-20 Token Approve Failed");
      console.error(error.message)
    }
  };
 return (
  <div>
     <form onSubmit={approveToken} className="token-amount-form">
        <label className="token-input-label">Approve Token:</label>
        <input type="text" ref={approvedTokenRef} />
        <Button onClick={approveToken} type="submit" label="Approve Token" />
      </form>
 </div>
 )
}
export default TokenApproval;