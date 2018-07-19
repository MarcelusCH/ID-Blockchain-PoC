var PersonList = artifacts.require("./PersonList.sol");

// test suite
contract('Person Check List', function(accounts){


  var chainListInstance;
  var admin = accounts[0];
  var creator = accounts[1];
  var creator2 = accounts[2];
  var personName1 = "Person 1";
  var personGivenName1 = "Given Name 1";
  var personGender1 = "M";
  var personBirthDate1 ="2002-12-28";
  var personName2 = "Person 2";
  var personGivenName2 = "Given Name 2";
  var personGender2 = "F";
  var personBirthDate2 ="1954-04-01";

  var InfoField1 ="Field Added 1";
  var InfoValue1 = "Value of field 1";
  var InfoField2 ="Field Added 2";
  var InfoValue2 = "Value of field 2";
  var InfoField3 ="Field Added 3";
  var InfoValue3 = "Value of field 3";


  // ---------------------------------------------------------------------------
  it("01 - Should be initialized with empty values.", function() {
    return PersonList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.getNumberOfPersons();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "number of persons must be zero");
      return chainListInstance.getPersonIds();
    }).then(function(data){
      assert.equal(data.length, 0, "there shouldn't be any person in the contract");
      return chainListInstance.getNumberOfInformations();
    }).then(function(data){
      assert.equal(data.toNumber(), 0, "there shouldn't be any info in the contract");
    });
  });

  // ---------------------------------------------------------------------------
  it("02 - Should throw an exception if try to add Info if no person exist.", function() {
    return PersonList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.addPersonInformation(0,"test","test", {from: creator});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return chainListInstance.getNumberOfInformations();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "number of info stil be 0");
    });
  });

  // ---------------------------------------------------------------------------
  it("03 - Should let us add a first person (with the account[1]).", function() {
    return PersonList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.addPerson(
        personName1, personGivenName1, personGender1, personBirthDate1,
        {from: creator}
      );
    }).then(function(receipt){ // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogAddPerson", "event should be LogAddPerson");
      assert.equal(receipt.logs[0].args._id.toNumber(), 0, "id must be 0");
      assert.equal(receipt.logs[0].args._creator, creator, "event creator must be " + creator);
      assert.equal(receipt.logs[0].args._name, personName1, "event person name must be " + personName1);
      assert.equal(receipt.logs[0].args._givenName, personGivenName1, "event person given name must be " + personGivenName1);

      return chainListInstance.getNumberOfPersons();
    }).then(function(data) {
      assert.equal(data, 1, "number of persons must be one");

      return chainListInstance.getPersonIds();
    }).then(function(data) {
      assert.equal(data.length, 1, "there must be one person in the list");
      assert.equal(data[0].toNumber(), 0, "returned data[0] must be 0");

      return chainListInstance.GetPerson(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 0, "person.id[0] must be 0");
      assert.equal(data[1], creator, "person.creator[0] must be " + creator);
      assert.equal(data[2], personName1, "person.Name[0] must be " + personName1);
      assert.equal(data[3], personGivenName1, "person.givenName[0] must be " + personGivenName1);
      assert.equal(data[4], personGender1, "person.gender[0] must be " + personGender1);
      assert.equal(data[5], personBirthDate1, "person.birthDate[0] must be " + personBirthDate1);
    });
  });

  // ---------------------------------------------------------------------------
  it("04 - Should let us add a second person (with the account[2]).", function() {
    return PersonList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.addPerson(
        personName2, personGivenName2, personGender2, personBirthDate2,
        {from: creator2}
      );
    }).then(function(receipt){ // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogAddPerson", "event should be LogAddPerson");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
      assert.equal(receipt.logs[0].args._creator, creator2, "event creator must be " + creator2);
      assert.equal(receipt.logs[0].args._name, personName2, "event person name must be " + personName2);
      assert.equal(receipt.logs[0].args._givenName, personGivenName2, "event person given name must be " + personGivenName2);

      return chainListInstance.getNumberOfPersons();
    }).then(function(data) {
      assert.equal(data, 2, "number of persons must be two");

      return chainListInstance.getPersonIds();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be two person in the list");
      assert.equal(data[1].toNumber(), 1, "returned data[1] must be 1");

      return chainListInstance.GetPerson(data[1]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "person.id[1] must be 1");
      assert.equal(data[1], creator2, "person.creator[1] must be " + creator2);
      assert.equal(data[2], personName2, "person.Name[1] must be " + personName2);
      assert.equal(data[3], personGivenName2, "person.givenName[1] must be " + personGivenName2);
      assert.equal(data[4], personGender2, "person.gender[1] must be " + personGender2);
      assert.equal(data[5], personBirthDate2, "person.birthDate[1] must be " + personBirthDate2);
    });
  });

  // ---------------------------------------------------------------------------
  it("05 - Should let us add a first info for person with id 0.", function() {
    return PersonList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.addPersonInformation(0,
        InfoField1, InfoValue1,
        {from: creator}
      );
    }).then(function(receipt){ // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogAddInformation", "event should be LogAddInformation");
      assert.equal(receipt.logs[0].args._id.toNumber(), 0, "id must be 0");
      assert.equal(receipt.logs[0].args._ref_Person.toNumber(), 0, "ref person must be 0");
      assert.equal(receipt.logs[0].args._creator, creator, "event creator must be " + creator);
      assert.equal(receipt.logs[0].args._fieldName, InfoField1, "event _fieldName name must be " + InfoField1);
      assert.equal(receipt.logs[0].args._fieldValue, InfoValue1, "event _fieldValue given name must be " + InfoValue1);

      return chainListInstance.getNumberOfInformations();
    }).then(function(data) {
      assert.equal(data, 1, "number of info must be one");

      return chainListInstance.getNumberOfInformationsByPerson(0);
    }).then(function(data) {
      assert.equal(data, 1, "number of info for person id 0 must be one");

      return chainListInstance.getPersonInfoIds(0);
    }).then(function(data) {
      assert.equal(data.length, 1, "there must be one info in the list returned");
      assert.equal(data[0].toNumber(), 0, "returned data[0] must be 0");

      return chainListInstance.informations(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 0, "Information.id[0] must be 0");
      assert.equal(data[1].toNumber(), 0, "Information.refPerson[0] must be 0");
      assert.equal(data[2], InfoField1, "Information.fieldName[0] must be " + InfoField1);
      assert.equal(data[3], InfoValue1, "Information.fildValue[0] must be " + InfoValue1);
    });
  });

  // ---------------------------------------------------------------------------
  it("06 - Should let us add a first info for person with id 1.", function() {
    return PersonList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.addPersonInformation(1,
        InfoField2, InfoValue2,
        {from: creator2}
      );
    }).then(function(receipt){ // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogAddInformation", "event should be LogAddInformation");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
      assert.equal(receipt.logs[0].args._ref_Person.toNumber(), 1, "ref person must be 1");
      assert.equal(receipt.logs[0].args._creator, creator2, "event creator must be " + creator2);
      assert.equal(receipt.logs[0].args._fieldName, InfoField2, "event _fieldName name must be " + InfoField2);
      assert.equal(receipt.logs[0].args._fieldValue, InfoValue2, "event _fieldValue given name must be " + InfoValue2);

      return chainListInstance.getNumberOfInformations();
    }).then(function(data) {
      assert.equal(data, 2, "number of info must be two");

      return chainListInstance.getNumberOfInformationsByPerson(1);
    }).then(function(data) {
      assert.equal(data, 1, "number of info for person id 1 must be one");

      return chainListInstance.getPersonInfoIds(1);
    }).then(function(data) {
      assert.equal(data.length, 1, "there must be one info in the list returned");
      assert.equal(data[0].toNumber(), 1, "returned data[1] must be 1");

      return chainListInstance.informations(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "Information.id[1] must be 1");
      assert.equal(data[1].toNumber(), 1, "Information.refPerson[1] must be 1");
      assert.equal(data[2], InfoField2, "Information.fieldName[1] must be " + InfoField2);
      assert.equal(data[3], InfoValue2, "Information.fildValue[1] must be " + InfoValue2);
    });
  });

  // ---------------------------------------------------------------------------
  it("07 - Should let us add a second info for person with id 1 (3 in total).", function() {
    return PersonList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.addPersonInformation(1,
        InfoField3, InfoValue3,
        {from: creator2}
      );
    }).then(function(receipt){ // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogAddInformation", "event should be LogAddInformation");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
      assert.equal(receipt.logs[0].args._ref_Person.toNumber(), 1, "ref person must be 1");
      assert.equal(receipt.logs[0].args._creator, creator2, "event creator must be " + creator2);
      assert.equal(receipt.logs[0].args._fieldName, InfoField3, "event _fieldName name must be " + InfoField3);
      assert.equal(receipt.logs[0].args._fieldValue, InfoValue3, "event _fieldValue given name must be " + InfoValue3);

      return chainListInstance.getNumberOfInformations();
    }).then(function(data) {
      assert.equal(data, 3, "number of info must be 3");

      return chainListInstance.getNumberOfInformationsByPerson(1);
    }).then(function(data) {
      assert.equal(data, 2, "number of info for person id 1 must be two");

      return chainListInstance.getPersonInfoIds(1);
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be 2 info in the list returned");
      assert.equal(data[1].toNumber(), 2, "returned data[2] must be 2");

      return chainListInstance.informations(data[1]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 2, "Information.id[2] must be 2");
      assert.equal(data[1].toNumber(), 1, "Information.refPerson[2] must be 1");
      assert.equal(data[2], InfoField3, "Information.fieldName[2] must be " + InfoField3);
      assert.equal(data[3], InfoValue3, "Information.fildValue[2] must be " + InfoValue3);
    });
  });

  // ---------------------------------------------------------------------------
  it("08 - Account[1] should modify the person id 0.", function() {
    return PersonList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.modifyPerson(0,
        personName2, personGivenName2, personGender2, personBirthDate2,
        {from: creator}
      );
    }).then(function(receipt){ // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogModifyPerson", "event should be LogModifyPerson");
      assert.equal(receipt.logs[0].args._ref_Person.toNumber(), 0, "ref person must be 0");
      assert.equal(receipt.logs[0].args._creator, creator, "event creator must be " + creator);


      return chainListInstance.getNumberOfPersons();
    }).then(function(data) {
      assert.equal(data, 2, "number of persons must be two");

      return chainListInstance.getPersonIds();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be two person in the list");
      assert.equal(data[0].toNumber(), 0, "returned data[0] must be 0");

      return chainListInstance.GetPerson(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 0, "person.id[0] must be 0");
      assert.equal(data[1], creator, "person.creator[0] must be " + creator);
      assert.equal(data[2], personName2, "person.Name[0] must be " + personName2);
      assert.equal(data[3], personGivenName2, "person.givenName[0] must be " + personGivenName2);
      assert.equal(data[4], personGender2, "person.gender[0] must be " + personGender2);
      assert.equal(data[5], personBirthDate2, "person.birthDate[0] must be " + personBirthDate2);
    });
  });

  // ---------------------------------------------------------------------------
  it("09 - Account[0] (admin) should modify the person id 0.", function() {
    return PersonList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.modifyPerson(0,
        personName1, personGivenName1, personGender1, personBirthDate1,
        {from: admin}
      );
    }).then(function(receipt){ // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogModifyPerson", "event should be LogModifyPerson");
      assert.equal(receipt.logs[0].args._ref_Person.toNumber(), 0, "ref person must be 0");
      assert.equal(receipt.logs[0].args._creator, admin, "event creator must be " + admin);


      return chainListInstance.getNumberOfPersons();
    }).then(function(data) {
      assert.equal(data, 2, "number of persons must be two");

      return chainListInstance.getPersonIds();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be two person in the list");
      assert.equal(data[0].toNumber(), 0, "returned data[0] must be 0");

      return chainListInstance.GetPerson(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 0, "person.id[0] must be 0");
      assert.equal(data[1], creator, "person.creator[0] must be " + creator);
      assert.equal(data[2], personName1, "person.Name[0] must be " + personName1);
      assert.equal(data[3], personGivenName1, "person.givenName[0] must be " + personGivenName1);
      assert.equal(data[4], personGender1, "person.gender[0] must be " + personGender1);
      assert.equal(data[5], personBirthDate1, "person.birthDate[0] must be " + personBirthDate1);
    });
  });

  // ---------------------------------------------------------------------------
  it("10 - Account[2] should NOT be able to modify the person id 0.", function() {
    return PersonList.deployed().then(function(instance) {
      chainListInstance = instance;

      return chainListInstance.ModifyPerson(0,
        personName2, personGivenName2, personGender2, personBirthDate2,
        {from: creator2}
      );

    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {

      return chainListInstance.getNumberOfPersons();
    }).then(function(data) {
      assert.equal(data, 2, "number of persons must be two");

      return chainListInstance.getPersonIds();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be two person in the list");
      assert.equal(data[0].toNumber(), 0, "returned data[0] must be 0");

      return chainListInstance.GetPerson(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 0, "person.id[0] must be 0");
      assert.equal(data[1], creator, "person.creator[0] must be " + creator);
      assert.equal(data[2], personName1, "person.Name[0] must be " + personName1);
      assert.equal(data[3], personGivenName1, "person.givenName[0] must be " + personGivenName1);
      assert.equal(data[4], personGender1, "person.gender[0] must be " + personGender1);
      assert.equal(data[5], personBirthDate1, "person.birthDate[0] must be " + personBirthDate1);
    });
  });

  // ---------------------------------------------------------------------------
  it("11 - Account[2] should NOT be able to puch the person id 0 in validation status.", function() {
    return PersonList.deployed().then(function(instance) {
      chainListInstance = instance;

      return chainListInstance.PuchPersonToValidation(0, "2018-07-11",
        {from: creator2}
      );

    }).then(assert.fail)
    .catch(function(error){
      assert(true);
      return chainListInstance.getValidation(0);
    }).then(function(data) {
      assert.equal(data, -1, "Status as to be -1");
    });
  });

  // ---------------------------------------------------------------------------
  it("12 - Account[1] should be able to puch the person id 0 in validation status.", function() {
    return PersonList.deployed().then(function(instance) {
      chainListInstance = instance;

      return chainListInstance.PuchPersonToValidation(0, "2018-07-11",
        {from: creator}
      );

    }).then(function(receipt){ // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogAddValidation", "event should be LogAddValidation");
      assert.equal(receipt.logs[0].args._ref_Person.toNumber(), 0, "ref person must be 0");
      assert.equal(receipt.logs[0].args._creator, creator, "event creator must be " + creator);

      return chainListInstance.getValidation(0);
    }).then(function(data) {
      assert.equal(data, 0, "Status as to be 0");

      return chainListInstance.getValidation(1);
    }).then(function(data) {
      assert.equal(data, -1, "Status as to be -1");
    });

  });

  // ---------------------------------------------------------------------------
  it("13 - Account[1] should now NOT be able to modify the person id 0.", function() {
    return PersonList.deployed().then(function(instance) {
      chainListInstance = instance;

      return chainListInstance.ModifyPerson(0,
        personName2, personGivenName2, personGender2, personBirthDate2,
        {from: creator}
      );

    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {

      return chainListInstance.getNumberOfPersons();
    }).then(function(data) {
      assert.equal(data, 2, "number of persons must be two");

      return chainListInstance.getPersonIds();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be two person in the list");
      assert.equal(data[0].toNumber(), 0, "returned data[0] must be 0");

      return chainListInstance.GetPerson(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 0, "person.id[0] must be 0");
      assert.equal(data[1], creator, "person.creator[0] must be " + creator);
      assert.equal(data[2], personName1, "person.Name[0] must be " + personName1);
      assert.equal(data[3], personGivenName1, "person.givenName[0] must be " + personGivenName1);
      assert.equal(data[4], personGender1, "person.gender[0] must be " + personGender1);
      assert.equal(data[5], personBirthDate1, "person.birthDate[0] must be " + personBirthDate1);
    });
  });

  // ---------------------------------------------------------------------------
  it("14 - Account[2] should now NOT be able to modify the person id 0.", function() {
    return PersonList.deployed().then(function(instance) {
      chainListInstance = instance;

      return chainListInstance.ModifyPerson(0,
        personName2, personGivenName2, personGender2, personBirthDate2,
        {from: creator2}
      );

    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {

      return chainListInstance.getNumberOfPersons();
    }).then(function(data) {
      assert.equal(data, 2, "number of persons must be two");

      return chainListInstance.getPersonIds();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be two person in the list");
      assert.equal(data[0].toNumber(), 0, "returned data[0] must be 0");

      return chainListInstance.GetPerson(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 0, "person.id[0] must be 0");
      assert.equal(data[1], creator, "person.creator[0] must be " + creator);
      assert.equal(data[2], personName1, "person.Name[0] must be " + personName1);
      assert.equal(data[3], personGivenName1, "person.givenName[0] must be " + personGivenName1);
      assert.equal(data[4], personGender1, "person.gender[0] must be " + personGender1);
      assert.equal(data[5], personBirthDate1, "person.birthDate[0] must be " + personBirthDate1);
    });
  });

  // ---------------------------------------------------------------------------
  it("15 - Account[0] (admin) should be able to modify the person id 0.", function() {
    return PersonList.deployed().then(function(instance) {
      chainListInstance = instance;

      return chainListInstance.modifyPerson(0,
        personName2, personGivenName2, personGender2, personBirthDate2,
        {from: admin}
      );

    }).then(function(receipt){ // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogModifyPerson", "event should be LogModifyPerson");
      assert.equal(receipt.logs[0].args._ref_Person.toNumber(), 0, "ref person must be 0");
      assert.equal(receipt.logs[0].args._creator, admin, "event creator must be " + admin);


      return chainListInstance.getNumberOfPersons();
    }).then(function(data) {
      assert.equal(data, 2, "number of persons must be two");

      return chainListInstance.getPersonIds();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be two person in the list");
      assert.equal(data[0].toNumber(), 0, "returned data[0] must be 0");

      return chainListInstance.GetPerson(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 0, "person.id[0] must be 0");
      assert.equal(data[1], creator, "person.creator[0] must be " + creator);
      assert.equal(data[2], personName2, "person.Name[0] must be " + personName2);
      assert.equal(data[3], personGivenName2, "person.givenName[0] must be " + personGivenName2);
      assert.equal(data[4], personGender2, "person.gender[0] must be " + personGender2);
      assert.equal(data[5], personBirthDate2, "person.birthDate[0] must be " + personBirthDate2);
    });
  });

  // ---------------------------------------------------------------------------
  it("16 - Account[1] should NOT be able to get Number of person.", function() {
    return PersonList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.getNumberOfPersons(
        {from: creator}
      );
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    })

  });

  // ---------------------------------------------------------------------------
  it("17 - Account[2] should NOT be able to get the person id's.", function() {
    return PersonList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.getPersonIds({from: creator});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    })

  });

  // ---------------------------------------------------------------------------
  it("18 - Account[2] should NOT be able to get the person id 0 info's,", function() {
    return PersonList.deployed().then(function(instance){
      chainListInstance = instance;

      return chainListInstance.GetPerson(0,{from: creator2});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    });

  });

  // ---------------------------------------------------------------------------
  it("19 - Account[1] should have access to the person id 0 info's,", function() {
    return PersonList.deployed().then(function(instance){
      chainListInstance = instance;

      return chainListInstance.GetPerson(0,{from: creator});
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 0, "person.id[0] must be 0");
      assert.equal(data[1], creator, "person.creator[0] must be " + creator);
      assert.equal(data[2], personName2, "person.Name[0] must be " + personName2);
      assert.equal(data[3], personGivenName2, "person.givenName[0] must be " + personGivenName2);
      assert.equal(data[4], personGender2, "person.gender[0] must be " + personGender2);
      assert.equal(data[5], personBirthDate2, "person.birthDate[0] must be " + personBirthDate2);
    });

  });

  // ---------------------------------------------------------------------------
  it("20 - Account[0] (admin) should have access to the person id 0 info's,", function() {
    return PersonList.deployed().then(function(instance){
      chainListInstance = instance;

      return chainListInstance.GetPerson(0,{from: admin});
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 0, "person.id[0] must be 0");
      assert.equal(data[1], creator, "person.creator[0] must be " + creator);
      assert.equal(data[2], personName2, "person.Name[0] must be " + personName2);
      assert.equal(data[3], personGivenName2, "person.givenName[0] must be " + personGivenName2);
      assert.equal(data[4], personGender2, "person.gender[0] must be " + personGender2);
      assert.equal(data[5], personBirthDate2, "person.birthDate[0] must be " + personBirthDate2);
    });

  });

  // ---------------------------------------------------------------------------
  it("21 - Should throw an exception if try to add Info for a person out of range. ", function() {
    return PersonList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.addPersonInformation(12,"test","test", {from: creator});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return chainListInstance.getNumberOfInformations();
    }).then(function(data) {
      assert.equal(data.toNumber(), 3, "number of info stil be 3");
    });
  });


});
