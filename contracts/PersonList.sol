pragma solidity ^0.4.18;

// -----------------------------------------------------------------------------
// ID Blockchain PoC - Principal contract
// -----------------------------------------------------------------------------
// File name:   PersonList.sol
// File type:   Solidity Contract
// Version:     0.1.0
// Author:      Marcel Buob
// Creation:    09-FEB-2018
//
// Updates:     20-FEB-2018 | v0.1.0 | Basic fonctionality release
//
// Description: This is the principal contract for the 'ID Blockchain PoC'
//              application.
//
// -----------------------------------------------------------------------------


// Import of other needed contracts
import "./Ownable.sol";
import "./Structures.sol";
import "./Events.sol";
import "./Validations.sol";
import "./Autorizations.sol";


contract PersonList is Ownable, Structures, Events, Validations, Autorizations {


  // ---------------------------------------------------------------------------
  // Person structure Functions
  // ---------------------------------------------------------------------------
  // Info:  Everyone can add a person and than push the item to validation.
  //        For a valid person Item, it shuld have all validation item checked.
  //        FingerPrint infos can only be done by autorized user and phase.
  //        Before phose 0, only the creator can modify the Person Item.
  //        The Ids list can only be show if admin or Read right.
  //        The creator can show hes own entry (or a readRight).
  //        Simple user (not admin) can not have access to other's entry.


  // fetch the number of persons in the contract list --------------------------
  // Only if sys read right (Admin have readRight)
  function getNumberOfPersons() public view returns (uint) {
    require(IsReadPerson());
    return PersonCounter;
  }


  // fetch and return all person IDs in a (0 based) array ----------------------
  // Only if sys read right (Admin have readRight)
  function getPersonIds() public view returns (uint[]) {

    require(IsReadPerson());

    // prepare output array in memory
    uint[] memory personIds = new uint[](PersonCounter);

    // iterate over persons and return the personIds array
    for(uint i = 0; i < PersonCounter;  i++) {
        personIds[i] = persons[i].id;
    }

    return personIds;
  }


  // return ids of the current address Person Item created ---------------------
  // Only for the current creator
  function getMyPersonIds() public view returns (uint[]) {

    // prepare output array in memory
    uint[] memory personIds = new uint[](PersonCounter);

    // iterate over persons and return the personIds array
    uint incr = 0;
    for(uint i = 0; i < PersonCounter;  i++) {
      if(persons[i].creator == msg.sender){
        personIds[incr] = persons[i].id;
        incr++;
      }
    }

    uint[] memory MyPersonIds = new uint[](incr);
    for(uint j = 0; j < incr;  j++) {
      MyPersonIds[j] = personIds[j];
    }

    return MyPersonIds;
  }


  // return ids of the current address Person Item created ---------------------
  // Only for the current creator
  function SearchPersonIdsByName(string _name) public view returns (uint[]) {

    // prepare output array in memory
    uint[] memory personIds = new uint[](PersonCounter);

    // iterate over persons and return the personIds array
    uint incr = 0;
    for(uint i = 0; i < PersonCounter;  i++) {



      if(keccak256(persons[i].Name) == keccak256(_name)){
        personIds[incr] = persons[i].id;
        incr++;
      }
    }

    uint[] memory MyPersonIds = new uint[](incr);
    for(uint j = 0; j < incr;  j++) {
      MyPersonIds[j] = personIds[j];
    }

    return MyPersonIds;
  }


  // Add a new person in the list ----------------------------------------------
  // Everyone can do
  function addPerson(string _name, string _givenName,
                      string _gender, string _birthDate) public {

    // store the person
    persons[PersonCounter] = Person(PersonCounter,  msg.sender,
                                    _name, _givenName, _gender, _birthDate);

    // Add log
    LogAddPerson(PersonCounter);
    PersonCounter++;
  }


  // Modify the Person Item informations ---------------------------------------
  // Only the creator can modify it (or WriteRight if validation 0 / or owner)
  function modifyPerson(uint _ref_Person, string _name, string _givenName,
    string _gender, string _birthDate) public {

    require((keccak256(persons[_ref_Person].creator) == keccak256(msg.sender) &&
              getValidation(_ref_Person) == -1) ||
              (getValidation(_ref_Person) == 0 && IsWritePerson()) || IsOwner());

    // store the new info
    persons[_ref_Person] = Person(_ref_Person,
      persons[_ref_Person].creator, _name, _givenName, _gender, _birthDate);

    // Add log
    LogModifyPerson(_ref_Person);
  }


  // Get Person info by id -----------------------------------------------------
  // Only the creator or sys read right
  function GetPerson(uint _ref_Person) public view returns (uint, address,
    string, string, string, string, int) {

    require(keccak256(persons[_ref_Person].creator) == keccak256(msg.sender) || IsReadPerson());

    int validationInt =getValidation(persons[_ref_Person].id);

    return (persons[_ref_Person].id, persons[_ref_Person].creator,
       persons[_ref_Person].Name, persons[_ref_Person].givenName,
       persons[_ref_Person].gender, persons[_ref_Person].birthDate,validationInt);
  }





  // ---------------------------------------------------------------------------
  // Photo structure Functions
  // ---------------------------------------------------------------------------
  // Info:


  // fetch the number of photo in the contract list --------------------------
  // Only if sys read right (Admin have readRight)
  function getNumberOfPhoto() public view returns (uint) {
    require(IsReadPerson());
    return PhotoCounter;
  }


  // fetch and return all photo IDs in a (0 based) array ----------------------
  // Only if sys read right (Admin have readRight)
  function getPhotoIds() public view returns (uint[]) {

    require(IsReadPerson());

    // prepare output array in memory
    uint[] memory photoIds = new uint[](PhotoCounter);

    // iterate over persons and return the personIds array
    for(uint i = 0; i < PhotoCounter;  i++) {
        photoIds[i] = photos[i].id;
    }

    return photoIds;
  }


  // return ids of the current address Photo Item created ---------------------
  // Only for the current creator
  function getMyPhotoIds() public view returns (uint[]) {

    // prepare output array in memory
    uint[] memory photoIds = new uint[](PhotoCounter);

    // iterate over persons and return the personIds array
    uint incr = 0;
    for(uint i = 0; i < PhotoCounter;  i++) {
      if(photos[i].creator == msg.sender){
        photoIds[incr] = photos[i].id;
        incr++;
      }
    }

    uint[] memory MyPhotoIds = new uint[](incr);
    for(uint j = 0; j < incr;  j++) {
      MyPhotoIds[j] = photoIds[j];
    }

    return MyPhotoIds;
  }


  // Add a new photo in the list ----------------------------------------------
  // Everyone can do, but is not validated by owner
  function addPhoto(uint _ref_Person, string _PhotoEncoding,
                                      string _PhotoBlob) public {

    // store the photo
    photos[PhotoCounter] = Photo(PhotoCounter,
      msg.sender, _ref_Person, _PhotoEncoding, _PhotoBlob, false);

    // Add log
    LogAddPhoto(_ref_Person);
    PhotoCounter++;
  }


  // Modify the phot Item informations ---------------------------------------
  // Only the creator can modify it (or WriteRight if validation 0 / or owner)
  function modifyPhoto(uint _ref_photo, string _PhotoEncoding,
                                        string _PhotoBlob) public {

    var _ref_Person=photos[_ref_photo].ref_Person;
    require((keccak256(photos[_ref_photo].creator) == keccak256(msg.sender) &&
              getValidation(_ref_Person) == -1) || (getValidation(_ref_Person) == 0 && IsWritePerson())
              || IsOwner());

    // store the new info
    photos[_ref_photo] = Photo(_ref_photo,
      msg.sender, _ref_Person, _PhotoEncoding, _PhotoBlob, false);

    // Add log
    LogModifyPhoto(_ref_Person);
  }


  // Get Photo info by id -----------------------------------------------------
  // Only the creator (or owner) can see the pic before validated.
  function GetPhoto(uint _ref_Photo) public view
            returns (uint, address, uint, string, string, bool) {

    if(keccak256(photos[_ref_Photo].creator) == keccak256(msg.sender) ||
       IsReadPerson() && photos[_ref_Photo].ownerValidate || IsOwner()  ){

       return (photos[_ref_Photo].id, photos[_ref_Photo].creator,
          photos[_ref_Photo].ref_Person, photos[_ref_Photo].PhotoEncoding,
          photos[_ref_Photo].PhotoBlob, photos[_ref_Photo].ownerValidate);

     } else {
       return (photos[_ref_Photo].id, photos[_ref_Photo].creator,
          photos[_ref_Photo].ref_Person, photos[_ref_Photo].PhotoEncoding,
          "", photos[_ref_Photo].ownerValidate);

     }
  }

  // Get Photo info by person id -----------------------------------------------------
  // Only the creator (or owner) can see the pic before validated.
  function GetPhotoByPerson(uint _ref_Person) public view
            returns (uint, address, uint, string, string, bool) {



    uint _ref_Photo = 9999999999999;
    // iterate over persons and return the personIds array
    for(uint i = 0; i < PhotoCounter;  i++) {
        if(photos[photos[i].id].ref_Person==_ref_Person){
          _ref_Photo=photos[i].id;
        }
    }

    if(_ref_Photo==9999999999999){
      return (9999999999999, photos[_ref_Photo].creator,
         9999999999999, photos[_ref_Photo].PhotoEncoding,
         photos[_ref_Photo].PhotoBlob, photos[_ref_Photo].ownerValidate);
    }


    if(keccak256(photos[_ref_Photo].creator) == keccak256(msg.sender) ||
       photos[_ref_Photo].ownerValidate || IsOwner()  ){

       return (photos[_ref_Photo].id, photos[_ref_Photo].creator,
          photos[_ref_Photo].ref_Person, photos[_ref_Photo].PhotoEncoding,
          photos[_ref_Photo].PhotoBlob, photos[_ref_Photo].ownerValidate);

     } else {
       return (photos[_ref_Photo].id, photos[_ref_Photo].creator,
          photos[_ref_Photo].ref_Person, photos[_ref_Photo].PhotoEncoding,
          "", photos[_ref_Photo].ownerValidate);

     }
  }











  // ---------------------------------------------------------------------------
  // Validation structure Functions
  // ---------------------------------------------------------------------------
  // Info:
  //
  //


  // Push to validation the person item in phase 0 -----------------------------
  // Only the creator can push it (or sys write right)
  function PuchPersonToValidation(uint _ref_Person, string _ValDate) public {

    require((keccak256(persons[_ref_Person].creator) == keccak256(msg.sender) &&
              getValidation(_ref_Person) == -1) || IsWritePerson());

    // store the validation phase '0'
    validations[ValidationCounter] = Validation(ValidationCounter,
        _ref_Person, 0, msg.sender, _ValDate);

    // Add log
    LogAddValidation(_ref_Person, 0);
    ValidationCounter++;
  }

  // Validate the person item in phase 1 ---------------------------------------
  // Only admin can validate
  function FinalPersonValidation(uint _ref_Person, string _ValDate) public {

    require(IsAdmin() && getValidation(_ref_Person) == 0 );

    // store the validation phase '0'
    validations[ValidationCounter] = Validation(ValidationCounter,
        _ref_Person, 1, msg.sender, _ValDate);

    // Add log
    LogAddValidation(_ref_Person, 1);
    ValidationCounter++;
  }

  // Validate the photo
  // The photo can only be viewed by the creator until it's validated by owner.
  function ValidatePhoto(uint _ref_photo) public {
    //require(IsOwner());

    var _ref_Person=photos[_ref_photo].ref_Person;

    // store the new info
    photos[_ref_photo] = Photo(_ref_photo,
      photos[_ref_photo].creator, photos[_ref_photo].ref_Person,
       photos[_ref_photo].PhotoEncoding, photos[_ref_photo].PhotoBlob, true);

    // Add log
    LogValidePhoto(_ref_Person);
  }











  // Get Contract owner info ---------------------------------------------------
  function GetContractOwner() public view returns (address) {
    return owner;
  }



  // deactivate the contract
  function kill() public onlyOwner {
    selfdestruct(owner);
  }

}
