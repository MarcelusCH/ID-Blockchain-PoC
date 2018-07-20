pragma solidity ^0.4.24;


contract Structures {


  // ---------------------------------------------------------------------------
  // Profil informations structures
  // ---------------------------------------------------------------------------

  struct Person {         // Person Item storage
    uint id;              // 0 - Person Identifier / zero to infiny
    address creator;      // 1 - ETH Address of the creator
    string Name;          // 2 - "THE FULL FAMILLY ACTUAL NAME"
    string givenName;     // 3 - All given names ex.: "Name Second-Name"
    string gender;        // 4 - "F" or "M"
    string birthDate;     // 5 - "1954-12-18"
  }

  struct Photo {            // Photo informations storage
    uint id;
    address creator;
    uint ref_Person;
    string PhotoEncoding;   // Encoding information
    string PhotoBlob;
    bool ownerValidate;     //
  }





  // ---------------------------------------------------------------------------
  // Profil validation workflow
  // ---------------------------------------------------------------------------
  // Info:  The Person item will only be "valid" if all ValidationFlow are
  //        in the Validation storage (for each Person).
  //        'ValidationFlow' is hard coded yet !

  struct Validation{
    uint id;
    uint ref_Person;
    int ref_ValidationFlow;     // 0=In validation, 1=vaidated
    address CheckedBy;
    string ValDate;             //"2008-10-14"
  }

  struct ValidationFlow {      //  !!! Not used yet !!
    uint id;                   // The check begin by 0 and go to next until end
    string CheckName;
    string CheckDescription;

  }

  struct ValidationFlowChecker {  // Multi Checker possible for the flows
    uint id;
    uint ref_ValidationFlow  ;
    address Checker;
  }



  // ---------------------------------------------------------------------------
  // System & ITEM autorisation
  // ---------------------------------------------------------------------------

  struct SystemAutorization {    // Administrator storage
   uint id;
   // 0=Blacklisted, 1=Read Only, 2=R/W, 9=ADMIN
   uint ref_AutorizationType;   // Reference of an system autorization type
   address autorizedAddress;    // Autorized Address to make action
  }






  // ---------------------------------------------------------------------------
  // Storage/structure maping
  // ---------------------------------------------------------------------------
  // Info:  0 based - The first item as the id 0 and is stored at persons[0].id
  //        The structure 'Person', 'Photo' and 'SystemAutorization'
  //        are NOT public. Can only be called in the contract.
  //        The other table are not secure for now.

  mapping (uint => Person) persons;
  uint PersonCounter = 0;

  mapping (uint => Photo) photos;
  uint PhotoCounter = 0;

  mapping (uint => SystemAutorization) Sys_autorizations;
  uint SystemAutorizationCounter = 0;

  mapping (uint => Validation) validations;
  uint ValidationCounter = 0;



}
