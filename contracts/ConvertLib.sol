pragma solidity ^0.4.4;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


library ConvertLib{
	using SafeMath for uint256;
	function convert(uint amount,uint conversionRate) returns (uint convertedAmount)
	{
		return SafeMath.mul(amount, conversionRate);
	}
}
