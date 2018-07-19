pragma solidity ^0.4.18;


import "./Ownable.sol";
import "./Structures.sol";


contract Validations is Ownable, Structures  {











  // Check the actual Validation phase -----------------------------------------
  function getValidation(uint _ref_Person) public view returns (int){

    int RetVal = -1;

    // iterate over Validation storage
    for(uint i = 0; i < ValidationCounter;  i++) {
      if(validations[i].ref_Person == _ref_Person ){
        RetVal = validations[i].ref_ValidationFlow;
      }
    }
    return RetVal;

  }



}
