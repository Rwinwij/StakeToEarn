import RewardRate from "./RewardRate";
import StakedAmount from "./StakedAmount";
import EarnedReward from "./EarnedReward";
import SecondsPerDay from "./SecondsPerDay";
import AvailableTokenPool from "./AvailableTokenPool"; 
import TotalTokensStaked from "./TotalTokensStaked"; 

const DisplayPannel = () => {
  return (   
    <div className="top-wrapper">
      <StakedAmount />
      <RewardRate />
      <EarnedReward />
      <SecondsPerDay />
      <AvailableTokenPool /> 
      <TotalTokensStaked />
    </div>
  );
}
export default DisplayPannel;
