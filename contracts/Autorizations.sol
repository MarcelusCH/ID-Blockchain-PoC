pragma solidity ^0.4.24;


import "./Ownable.sol";
import "./Structures.sol";

contract Autorizations is Ownable, Structures {




  // Check if read right -------------------------------------------------------
  function IsReadPerson() public view returns (bool) {

    if(IsWritePerson()){return true;}


    // iterate over Sys storage and return 1 if read andress listed
    for(uint i = 0; i < SystemAutorizationCounter;  i++) {
      if(keccak256(msg.sender) == keccak256(Sys_autorizations[i].autorizedAddress) &&
          Sys_autorizations[i].ref_AutorizationType == 1 ){
        return true;
      }
    }
    return false;
  }

  // Check if write right -------------------------------------------------------
  function IsWritePerson() public view returns (bool) {

    if(IsAdmin()){return true;}


    // iterate over Sys storage and return 1 if read andress listed
    for(uint i = 0; i < SystemAutorizationCounter;  i++) {
      if(keccak256(msg.sender) == keccak256(Sys_autorizations[i].autorizedAddress) &&
          Sys_autorizations[i].ref_AutorizationType == 2  ){
        return true;
      }
    }
    return false;
  }

  // Check if admin ------------------------------------------------------------
  function IsAdmin() public view returns (bool) {

    if(msg.sender == owner){return true;}


    // iterate over Sys storage and return 1 if admin andress listed
    for(uint i = 0; i < SystemAutorizationCounter;  i++) {
      if(keccak256(msg.sender) == keccak256(Sys_autorizations[i].autorizedAddress) &&
          Sys_autorizations[i].ref_AutorizationType == 9){
        return true;
      }
    }
    return false;
  }

  // Check if owner ------------------------------------------------------------
  function IsOwner() public view returns (bool) {
    if(msg.sender == owner){return true;}
    return false;
  }




  function addAdministrator(address _addr) public onlyOwner {

    // store the person
    Sys_autorizations[SystemAutorizationCounter] = SystemAutorization(
      SystemAutorizationCounter,  9, _addr);

    // Add log
    //LogAddAdministrator(PersonCounter, msg.sender, _name, _givenName);
    SystemAutorizationCounter++;
  }

  function modifyAdministrator(uint _id) public onlyOwner {

    address _addr = Sys_autorizations[_id].autorizedAddress;
    // store the person
    Sys_autorizations[_id] = SystemAutorization(
      _id,  99, _addr);

    // Add log
    //LogAddAdministrator(PersonCounter, msg.sender, _name, _givenName);
    SystemAutorizationCounter++;
  }

  function getAdministratorsIds() public view returns (uint[]) {

    // prepare output array in memory
    uint[] memory admiIds = new uint[](SystemAutorizationCounter);

    // iterate over persons and return the personIds array
    for(uint i = 0; i < SystemAutorizationCounter;  i++) {
        admiIds[i] = Sys_autorizations[i].id;
    }
    return admiIds;
  }

  function GetAdministrator(uint _ref_Admin) public view returns (uint, uint, address) {

    return (  Sys_autorizations[_ref_Admin].id,
              Sys_autorizations[_ref_Admin].ref_AutorizationType,
              Sys_autorizations[_ref_Admin].autorizedAddress);
  }









}
