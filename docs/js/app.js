App = {


  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  globalIsAdmin: false,
  globalIsOwner: false,

  ShowNextElem: 20,
  PersonModifID:-1,
  TimeShowInfo: 2500,

  init: function() {
    return App.initWeb3();
  },

  //----------------------------------------------------------------------------
  // -------------------------- Initialize web3 --------------------------------
  //----------------------------------------------------------------------------
  // reuse the provider of the Web3 object injected by Metamask
  // or create a new provider and plug it directly into our local node
  //----------------------------------------------------------------------------
  initWeb3: function() {
    if(typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('PersonList.json', function(chainListArtifact) {
      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.PersonList = TruffleContract(chainListArtifact);
      // set the provider for our contracts
      App.contracts.PersonList.setProvider(App.web3Provider);
      App.displayAdminInfo();
      // retrieve the article from the contract
      App.reloadPerson();

      // listen to events
      App.listenToEvents();

    });
  }, // ------------------------------------------------------------------------


  displayAdminInfo: function(){

    App.contracts.PersonList.deployed().then(function(instance) {
      chainListInstance = instance;

      chainListInstance.getAdministratorsIds().then(function(adminIds) {

        $('#AdministratorsList').empty();

        for(var i = 0; i < adminIds.length; i++) {

          chainListInstance.GetAdministrator(adminIds[i]).then(function(data) {
            AdminData=data;

            var adminTemplate = $("#adminTemplate");
            adminTemplate.find('.admin-addr').text(AdminData[2]);
            adminTemplate.find('.btn-admin-remove').attr('data-id',AdminData[0])

            adminRow = $('#AdministratorsList');
            if(AdminData[1]==9){adminRow.append(adminTemplate.html());}

          });

        } // End for

      }).catch(function(err) {
        console.error(err.message);
      });

      chainListInstance.IsOwner().then(function(IsOwner) {
        if(IsOwner){
          globalIsOwner=true;
          $('.btn-add-admin').attr('style','visibility: visible;');
          $('.btn-admin-remove').attr('style','visibility: visible;');
          $('#adminToAdd').attr('style','visibility: visible;');

        } else {
          globalIsOwner=false;
          $('.btn-add-admin').attr('style','visibility: hidden;');
          $('#adminToAdd').attr('style','visibility: hidden;');
          $('.btn-admin-remove').attr('style','visibility: hidden;');
        };
      });



      return ;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });

  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        if(account != null){$('#account').text(account);};
        web3.eth.getBalance(account, function(err, balance) {
          if(err === null) {
            $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");

            // Check if admin or user
            App.contracts.PersonList.deployed().then(function(chainListInstance) {
              return chainListInstance.IsAdmin();
            }).then(function(IsAdmin) {
              if(IsAdmin){
                globalIsAdmin=true;
                $('#ConectedAsLabel').text("Connected as Admin");
                $('#ConectedAsLabel').css('color', 'red');
              } else {
                globalIsAdmin=false;
                $('#ConectedAsLabel').text("Connected as User");
                $('#ConectedAsLabel').css('color', 'blue');
              }

              return chainListInstance.GetContractOwner();
            }).then(function(addr) {
              $('#ContractOwnerAddress').text(addr);

            });



          }// end if
        })
      } // end if
    });
  }, // ------------------------------------------------------------------------




  //----------------------------------------------------------------------------
  // ------------------------- reload person ------------------------------
  //----------------------------------------------------------------------------
  reloadPerson: async function() {

    // avoid reentry
    //App.loadingCycle +=1;
    //  if(App.loadingCycle >= 2) {
    //  App.loadingCycle=0;
    //  return;
    //}
    if(App.loading) {return;}
    App.loading = true;


    App.displayAccountInfo();





    App.contracts.PersonList.deployed().then(function(chainListInstance) {


      // My items only
      chainListInstance.getMyPersonIds().then(function(personIds) {

        $('#MyPersonsRow').empty();
        var IncStop = personIds.length-1-App.ShowNextElem;
        if(IncStop<0) {IncStop=0;}
        for(var IncInv = personIds.length-1; IncInv >= IncStop; IncInv--) {
          chainListInstance.GetPerson(personIds[IncInv].toNumber()).then(function(data) {
            MyPersonData=data;
            App.displayPerson(MyPersonData[0],MyPersonData[1],MyPersonData[2],MyPersonData[3],
                              MyPersonData[4],MyPersonData[5],1,MyPersonData[6],"",0, 0);
          });
        } // End for

        return personIds;
      }).then(async function(personIds) {

        var IncStop = personIds.length-1-App.ShowNextElem;
        if(IncStop<0) {IncStop=0;}
        for(var IncInv = personIds.length-1; IncInv >= IncStop; IncInv--) {

          var photoString="";
          var photoStatus=0;
          var photoID=0;

          var MyPersonData = await chainListInstance.GetPerson(personIds[IncInv]);
          var MyPhotoData = await chainListInstance.GetPhotoByPerson(personIds[IncInv]);

          if(MyPhotoData[2].toNumber()==MyPersonData[0].toNumber()){
            photoString=MyPhotoData[4];
            photoID=MyPhotoData[0];
            if(MyPhotoData[5]){
              photoStatus=2;
            } else {
              photoStatus=1;
            }
          }

          App.displayPhotoAttribute(personIds[IncInv],photoString,photoStatus,MyPersonData[6],photoID)

        } // End for




      }).catch(function(err) {
        console.error(err.message);
      }); // END All items loop (admin)



      // All items loop (admin)
      chainListInstance.getPersonIds().then(function(personIds) {

        $('#personsRow').empty();
        $('#personsRowToValidate').empty();
        $('#ValidatedpersonsRow').empty();
        var IncStop = personIds.length-1-App.ShowNextElem;
        if(IncStop<0) {IncStop=0;}
        for(var IncInv = personIds.length-1; IncInv >= IncStop; IncInv--) {
          chainListInstance.GetPerson(personIds[IncInv].toNumber()).then(function(data) {
            MyPersonData=data;
            App.displayPerson(MyPersonData[0],MyPersonData[1],MyPersonData[2],MyPersonData[3],
                              MyPersonData[4],MyPersonData[5],0,MyPersonData[6],"",0, 0);
          });
        } // End for

        return personIds;
      }).then(async function(personIds) {

        var IncStop = personIds.length-1-App.ShowNextElem;
        if(IncStop<0) {IncStop=0;}
        for(var IncInv = personIds.length-1; IncInv >= IncStop; IncInv--) {

          var photoString="";
          var photoStatus=0;
          var photoID=0;

          var MyPersonData = await chainListInstance.GetPerson(personIds[IncInv]);
          var MyPhotoData = await chainListInstance.GetPhotoByPerson(personIds[IncInv]);

          if(MyPhotoData[2].toNumber()==MyPersonData[0].toNumber()){
            photoString=MyPhotoData[4];
            photoID=MyPhotoData[0];
            if(MyPhotoData[5]){
              photoStatus=2;
            } else {
              photoStatus=1;
            }
          }

          App.displayPhotoAttribute(personIds[IncInv],photoString,photoStatus,MyPersonData[6],photoID)

        } // End for




      }).catch(function(err) {
        console.error(err.message);
      }); // END All items loop (admin)











      App.loading = false;
      return ;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });

  }, // ------------------------------------------------------------------------
  reloadOnePerson: async function() {

    //  alert(App.PersonModifID);

    App.displayAccountInfo();


    App.contracts.PersonList.deployed().then(async function(instance) {
      chainListInstance = instance;







      chainListInstance.GetPerson(App.PersonModifID).then(function(MyPersonData) {


        App.UpdateDisplayPerson(MyPersonData[0],MyPersonData[1],MyPersonData[2],MyPersonData[3],
                          MyPersonData[4],MyPersonData[5],0,MyPersonData[6]);



        return MyPersonData;
      }).then(function(MyPersonData) {

        App.UpdateDisplayPerson(MyPersonData[0],MyPersonData[1],MyPersonData[2],MyPersonData[3],
                          MyPersonData[4],MyPersonData[5],1,MyPersonData[6]);


        return MyPersonData;
      }).then(async function(MyPersonData) {


        var photoString="";
        var photoStatus=0;
        var photoID=0;

        var MyPhotoData = await chainListInstance.GetPhotoByPerson(MyPersonData[0]);

        if(MyPhotoData[2].toNumber()==MyPersonData[0].toNumber()){

          photoString=MyPhotoData[4];
          photoID=MyPhotoData[0];
          if(MyPhotoData[5]){
            photoStatus=2;
          } else {
            photoStatus=1;
          }
        }

        App.displayPhotoAttribute(MyPersonData[0],photoString,photoStatus,MyPersonData[6],photoID);


      }).catch(function(err) {
        console.error(err.message);
        App.loading = false;
      });








    }).catch(function(err) {
      console.error(err.message);
      App.PersonModifID=-1;
    });







  }, // ------------------------------------------------------------------------
  searchPersonByName: async function() {



    var _name = $('#SearchPersonName').val();

    // MY items only loop
    App.contracts.PersonList.deployed().then(function(instance) {
      chainListInstance = instance;


      // My items only
      chainListInstance.SearchPersonIdsByName(_name).then(function(personIds) {

        $('#SearchPersonsRow').empty();
        var IncStop = personIds.length-1-App.ShowNextElem;
        if(IncStop<0) {IncStop=0;}
        for(var IncInv = personIds.length-1; IncInv >= IncStop; IncInv--) {
          chainListInstance.GetPerson(personIds[IncInv].toNumber()).then(function(data) {
            MyPersonData=data;
            App.displayPerson(MyPersonData[0],MyPersonData[1],MyPersonData[2],MyPersonData[3],
                              MyPersonData[4],MyPersonData[5],2,MyPersonData[6],"",0, 0);
          });
        } // End for

        return personIds;
      }).then(async function(personIds) {

        var IncStop = personIds.length-1-App.ShowNextElem;
        if(IncStop<0) {IncStop=0;}
        for(var IncInv = personIds.length-1; IncInv >= IncStop; IncInv--) {

          var photoString="";
          var photoStatus=0;
          var photoID=0;

          var MyPersonData = await chainListInstance.GetPerson(personIds[IncInv]);
          var MyPhotoData = await chainListInstance.GetPhotoByPerson(personIds[IncInv]);

          if(MyPhotoData[2].toNumber()==MyPersonData[0].toNumber()){
            photoString=MyPhotoData[4];
            photoID=MyPhotoData[0];
            if(MyPhotoData[5]){
              photoStatus=2;
            } else {
              photoStatus=1;
            }
          }

          App.displayPhotoAttribute(personIds[IncInv],photoString,photoStatus,MyPersonData[6],photoID)

        } // End for




      }).catch(function(err) {
        console.error(err.message);
      }); // END All items loop (admin)




      App.loading = false;
      return ;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  }, // ------------------------------------------------------------------------









  //----------------------------------------------------------------------------
  // ------------------------- Display the person ------------------------------
  //----------------------------------------------------------------------------
  displayPerson: function(_id, _creator, _name ,
     _givenName, _gender, _birthDate, isMyOnly, _status, _photo, _photoStatus, _photoID) {

       //$(".panel-personID_"+_id).find('.panel-title').html("TEST")

       //if ($(".panel-personID_"+_id)[0]){
      //   personTemplate = $(".panel-personID_"+_id);
      //}
       // isMyOnly 0=all
       //          1=isMyOnly
       //          2=Search

     var personTemplate = $("#personTemplate");

     // Set Text
     personTemplate.find('.panel-title').html("ID: " + _id + " | <strong>" + _name.toUpperCase() + "</strong> " + _givenName);
     personTemplate.find('.person-gender').text(_gender);
     personTemplate.find('.person-birthdate').text(_birthDate);
     personTemplate.find('.person-name').text(_name);
     personTemplate.find('.person-givenName').text(_givenName);


     // Check the button status & attribut
     function SetBTNattr(sBTNclass) {
         personTemplate.find(sBTNclass).attr('data-id', _id);
         personTemplate.find(sBTNclass).attr('data-name', _name);
         personTemplate.find(sBTNclass).attr('data-givenName', _givenName);
         personTemplate.find(sBTNclass).attr('data-gender', _gender);
         personTemplate.find(sBTNclass).attr('data-birthDate', _birthDate);
         personTemplate.find(sBTNclass).attr('style','visibility: hidden;')
     };

    // change button attributes
    SetBTNattr(".btn-modify-Person");
    SetBTNattr(".btn-add-photo");
    SetBTNattr(".btn-push-validation");
    SetBTNattr(".btn-push-finalValidation");
    SetBTNattr(".btn-add-minutia");
    SetBTNattr(".btn-modify-photo");
    SetBTNattr(".btn-validate-photo");




    personTemplate.find('.person-photo').attr('src', "img/empty-profile-pic.png");
    personTemplate.find('.panel-person').attr('class', "panel panel-default panel-person"+" panel-personID_"+_id);

    // Check if address owner of _creator
    if (_creator == App.account) {
      personTemplate.find('.person-creator').text("You");
      if (_status==-1){
        personTemplate.find(".btn-push-validation").attr('style','visibility: visible;');
        personTemplate.find(".btn-modify-Person").attr('style','visibility: visible;');
      };
    } else {
      personTemplate.find('.person-creator').text(_creator);
    };


    if (_status==-1){
      personTemplate.find('.person-Status').text("New entry");
    }
    if (_status==0){
      personTemplate.find('.person-Status').text("Awaiting validation");
      if(globalIsAdmin){
        personTemplate.find(".btn-push-finalValidation").attr('style','visibility: visible;');
        personTemplate.find(".btn-modify-Person").attr('style','visibility: visible;');
      }
    }
    if (_status==1){
      personTemplate.find('.person-Status').text("Validated");
    }


    if (globalIsOwner){
      personTemplate.find(".btn-modify-Person").attr('style','visibility: visible;');
    }







    // add this new article
    personsRow = $('#personsRow');
    personTemplate.find('.person-photo').attr('id', 'PhotoPersonID_' + _id);
    personTemplate.find('.person-photo-validate').attr('id', 'PhotoPersonValidate_' + _id);
    personTemplate.find('.btn-add-photo').attr('id', 'btn-add-photo_PersonID_' + _id);
    personTemplate.find('.btn-modify-photo').attr('id', 'btn-modify-photo_PersonID_' + _id);
    personTemplate.find('.btn-validate-photo').attr('id', 'btn-validate-photo_PersonID_' + _id);



    if(isMyOnly==1){
      personsRow = $('#MyPersonsRow');
      personTemplate.find('.person-photo').attr('id', 'isMyOnly_PhotoPersonID_' + _id);
      personTemplate.find('.person-photo-validate').attr('id', 'isMyOnly_PhotoPersonValidate_' + _id);
      personTemplate.find('.btn-add-photo').attr('id', 'isMyOnly_btn-add-photo_PersonID_' + _id);
      personTemplate.find('.btn-modify-photo').attr('id', 'isMyOnly_btn-modify-photo_PersonID_' + _id);
      personTemplate.find('.btn-validate-photo').attr('id', 'isMyOnly_btn-validate-photo_PersonID_' + _id);
    }


    if(isMyOnly==2){
      personsRow = $('#SearchPersonsRow');
      personTemplate.find('.person-photo').attr('id', 'search_PhotoPersonID_' + _id);
      personTemplate.find('.person-photo-validate').attr('id', 'search_PhotoPersonValidate_' + _id);
      personTemplate.find('.btn-add-photo').attr('id', 'search_btn-add-photo_PersonID_' + _id);
      personTemplate.find('.btn-modify-photo').attr('id', 'search_btn-modify-photo_PersonID_' + _id);
      personTemplate.find('.btn-validate-photo').attr('id', 'search_btn-validate-photo_PersonID_' + _id);

      personsRow.append(personTemplate.html());
      return;
    }

    personsRow.append(personTemplate.html());







    // add it to admin filters...
    if(globalIsAdmin && isMyOnly == false){

        if(_status==0){
          personTemplate.find('.person-photo').attr('id', 'toValidate_PhotoPersonID_' + _id);
          personTemplate.find('.person-photo-validate').attr('id', 'toValidate_PhotoPersonValidate_' + _id);
          personTemplate.find('.btn-add-photo').attr('id', 'toValidate_btn-add-photo_PersonID_' + _id);
          personTemplate.find('.btn-modify-photo').attr('id', 'toValidate_btn-modify-photo_PersonID_' + _id);
          personTemplate.find('.btn-validate-photo').attr('id', 'toValidate_btn-validate-photo_PersonID_' + _id);

          personsRowToValidate = $('#personsRowToValidate');
          personsRowToValidate.append(personTemplate.html());
        }

        if(_status==1){
          personTemplate.find('.person-photo').attr('id', 'validated_PhotoPersonID_' + _id);
          personTemplate.find('.person-photo-validate').attr('id', 'validated_PhotoPersonValidate_' + _id);
          personTemplate.find('.btn-add-photo').attr('id', 'validated_btn-add-photo_PersonID_' + _id);
          personTemplate.find('.btn-modify-photo').attr('id', 'validated_btn-modify-photo_PersonID_' + _id);
          personTemplate.find('.btn-validate-photo').attr('id', 'validated_btn-validate-photo_PersonID_' + _id);

          ValidatedpersonsRow = $('#ValidatedpersonsRow');
          ValidatedpersonsRow.append(personTemplate.html());
        }

    }



  },// ------------------------------------------------------------------------
  UpdateDisplayPerson: function(_id, _creator, _name , _givenName, _gender, _birthDate, isMyOnly, _status) {





       //$(".panel-personID_"+_id).find('.panel-title').html("TEST")
       var personTemplate = $("#personTemplate");
       var AddPersonAction = true;
       if(isMyOnly==0){
         if ($(".panel-personID_"+_id).length>0){
           personTemplate = $(".panel-personID_"+_id);
           AddPersonAction = false;
         }
       } else if(isMyOnly==1){
         if ($(".panel-personID_"+_id).length>1){
           personTemplate = $(".panel-personID_"+_id);
           AddPersonAction = false;
         }
       }
       // isMyOnly 0=all
       //          1=isMyOnly
       //          2=Search



     // Set Text
     personTemplate.find('.panel-title').html("ID: " + _id + " | <strong>" + _name.toUpperCase() + "</strong> " + _givenName);
     personTemplate.find('.person-gender').text(_gender);
     personTemplate.find('.person-birthdate').text(_birthDate);
     personTemplate.find('.person-name').text(_name);
     personTemplate.find('.person-givenName').text(_givenName);


     // Check the button status & attribut
     function SetBTNattr(sBTNclass) {
         personTemplate.find(sBTNclass).attr('data-id', _id);
         personTemplate.find(sBTNclass).attr('data-name', _name);
         personTemplate.find(sBTNclass).attr('data-givenName', _givenName);
         personTemplate.find(sBTNclass).attr('data-gender', _gender);
         personTemplate.find(sBTNclass).attr('data-birthDate', _birthDate);
         personTemplate.find(sBTNclass).attr('style','visibility: hidden;')
     };

    // change button attributes
    SetBTNattr(".btn-modify-Person");
    SetBTNattr(".btn-add-photo");
    SetBTNattr(".btn-push-validation");
    SetBTNattr(".btn-push-finalValidation");
    SetBTNattr(".btn-add-minutia");
    SetBTNattr(".btn-modify-photo");
    SetBTNattr(".btn-validate-photo");




    personTemplate.find('.person-photo').attr('src', "img/empty-profile-pic.png");
    personTemplate.find('.panel-person').attr('class', "panel panel-default panel-person"+" panel-personID_"+_id);

    // Check if address owner of _creator
    if (_creator == App.account) {
      personTemplate.find('.person-creator').text("You");
      if (_status==-1){
        personTemplate.find(".btn-push-validation").attr('style','visibility: visible;');
        personTemplate.find(".btn-modify-Person").attr('style','visibility: visible;');
      };
    } else {
      personTemplate.find('.person-creator').text(_creator);
    };


    if (_status==-1){
      personTemplate.find('.person-Status').text("New entry");
    }
    if (_status==0){
      personTemplate.find('.person-Status').text("Awaiting validation");
      if(globalIsAdmin){
        personTemplate.find(".btn-push-finalValidation").attr('style','visibility: visible;');
        personTemplate.find(".btn-modify-Person").attr('style','visibility: visible;');
      }
    }
    if (_status==1){
      personTemplate.find('.person-Status').text("Validated");
    }


    if (globalIsOwner){
      personTemplate.find(".btn-modify-Person").attr('style','visibility: visible;');
    }







    // add this new article
    personsRow = $('#personsRow');
    personTemplate.find('.person-photo').attr('id', 'PhotoPersonID_' + _id);
    personTemplate.find('.person-photo-validate').attr('id', 'PhotoPersonValidate_' + _id);
    personTemplate.find('.btn-add-photo').attr('id', 'btn-add-photo_PersonID_' + _id);
    personTemplate.find('.btn-modify-photo').attr('id', 'btn-modify-photo_PersonID_' + _id);
    personTemplate.find('.btn-validate-photo').attr('id', 'btn-validate-photo_PersonID_' + _id);



    if(isMyOnly==1){
      personsRow = $('#MyPersonsRow');
      personTemplate.find('.person-photo').attr('id', 'isMyOnly_PhotoPersonID_' + _id);
      personTemplate.find('.person-photo-validate').attr('id', 'isMyOnly_PhotoPersonValidate_' + _id);
      personTemplate.find('.btn-add-photo').attr('id', 'isMyOnly_btn-add-photo_PersonID_' + _id);
      personTemplate.find('.btn-modify-photo').attr('id', 'isMyOnly_btn-modify-photo_PersonID_' + _id);
      personTemplate.find('.btn-validate-photo').attr('id', 'isMyOnly_btn-validate-photo_PersonID_' + _id);
    }


    if (AddPersonAction){personsRow.prepend(personTemplate.html())};







    // add it to admin filters...
    if(globalIsAdmin && isMyOnly == false){

        if(_status==0){
          personTemplate.find('.person-photo').attr('id', 'toValidate_PhotoPersonID_' + _id);
          personTemplate.find('.person-photo-validate').attr('id', 'toValidate_PhotoPersonValidate_' + _id);
          personTemplate.find('.btn-add-photo').attr('id', 'toValidate_btn-add-photo_PersonID_' + _id);
          personTemplate.find('.btn-modify-photo').attr('id', 'toValidate_btn-modify-photo_PersonID_' + _id);
          personTemplate.find('.btn-validate-photo').attr('id', 'toValidate_btn-validate-photo_PersonID_' + _id);

          personsRowToValidate = $('#personsRowToValidate');
          if (AddPersonAction){personsRow.prepend(personTemplate.html())};
        }

        if(_status==1){
          personTemplate.find('.person-photo').attr('id', 'validated_PhotoPersonID_' + _id);
          personTemplate.find('.person-photo-validate').attr('id', 'validated_PhotoPersonValidate_' + _id);
          personTemplate.find('.btn-add-photo').attr('id', 'validated_btn-add-photo_PersonID_' + _id);
          personTemplate.find('.btn-modify-photo').attr('id', 'validated_btn-modify-photo_PersonID_' + _id);
          personTemplate.find('.btn-validate-photo').attr('id', 'validated_btn-validate-photo_PersonID_' + _id);

          ValidatedpersonsRow = $('#ValidatedpersonsRow');
          if (AddPersonAction){personsRow.prepend(personTemplate.html())};
        }

    }

    if (AddPersonAction){personTemplate.find('.panel-person').attr('class', "panel panel-default panel-person");}
    return;

  },// ------------------------------------------------------------------------
  displayPhotoAttribute: function(ref_person,photoString,photoStatus,personStatus,photoID) {


    // Set Photo pic
    if(photoString==""){
      $('#PhotoPersonID_'+ref_person).attr('src', "img/empty-profile-pic.png");
      $('#toValidate_PhotoPersonID_'+ref_person).attr('src', "img/empty-profile-pic.png");
      $('#validated_PhotoPersonID_'+ref_person).attr('src', "img/empty-profile-pic.png");
      $('#isMyOnly_PhotoPersonID_'+ref_person).attr('src', "img/empty-profile-pic.png");
      $('#search_PhotoPersonID_'+ref_person).attr('src', "img/empty-profile-pic.png");
    } else {
      $('#PhotoPersonID_'+ref_person).attr('src', photoString);
      $('#toValidate_PhotoPersonID_'+ref_person).attr('src', photoString);
      $('#isMyOnly_PhotoPersonID_'+ref_person).attr('src', photoString);
      $('#validated_PhotoPersonID_'+ref_person).attr('src', photoString);
      $('#search_PhotoPersonID_'+ref_person).attr('src', photoString);
    }

    // Set Pic comment
    if (photoStatus==0){
      $('#PhotoPersonValidate_'+ref_person).text("Img not present!");
      $('#isMyOnly_PhotoPersonValidate_'+ref_person).text("Img not present!");
      $('#toValidate_PhotoPersonValidate_'+ref_person).text("Img not present!");
      $('#validated_PhotoPersonValidate_'+ref_person).text("Img not present!");
      $('#search_PhotoPersonValidate_'+ref_person).text("Img not present!");
    } else if (photoStatus==1){
      $('#PhotoPersonValidate_'+ref_person).text("Img not validated!");
      $('#isMyOnly_PhotoPersonValidate_'+ref_person).text("Img not validated!");
      $('#toValidate_PhotoPersonValidate_'+ref_person).text("Img not validated!");
      $('#validated_PhotoPersonValidate_'+ref_person).text("Img not validated!");
      $('#search_PhotoPersonValidate_'+ref_person).text("Img not validated!");
    } else if (photoStatus==2){
      $('#PhotoPersonValidate_'+ref_person).text("Img validates!");
      $('#isMyOnly_PhotoPersonValidate_'+ref_person).text("Img validates!");
      $('#toValidate_PhotoPersonValidate_'+ref_person).text("Img validates!");
      $('#validated_PhotoPersonValidate_'+ref_person).text("Img validates!");
      $('#search_PhotoPersonValidate_'+ref_person).text("Img validates!");
    }

    // Set Photo Add or modify BTN for all if not in validation phase
    if(personStatus==-1){
      if (photoStatus==0){
        $("#btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#isMyOnly_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#toValidate_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#validated_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#search_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
      }else {
        $("#btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#isMyOnly_btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#isMyOnly_btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#toValidate_btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#toValidate_btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#validated_btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#validated_btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#search_btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#search_btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
      }
    }

    // Set Photo Add or modify BTN for admin in first validation phase
    if(globalIsAdmin){
      if (photoStatus==0){
        $("#btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#isMyOnly_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#toValidate_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#validated_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#search_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
      }else {
        $("#btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#isMyOnly_btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#isMyOnly_btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#toValidate_btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#toValidate_btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#validated_btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#validated_btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#search_btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#search_btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
      }

    }


    // Set Photo Add or modify BTN for owner
    if(globalIsOwner){
      if (photoStatus==0){
        $("#btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#isMyOnly_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#toValidate_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#validated_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#search_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
      } else if (photoStatus==1) {
        $("#btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#isMyOnly_btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#isMyOnly_btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#toValidate_btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#toValidate_btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#validated_btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#validated_btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#search_btn-modify-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#search_btn-modify-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);

        $("#btn-validate-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#btn-validate-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#isMyOnly_btn-validate-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#isMyOnly_btn-validate-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#toValidate_btn-validate-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#toValidate_btn-validate-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#validated_btn-validate-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#validated_btn-validate-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);
        $("#search_btn-validate-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#search_btn-validate-photo_PersonID_"+ref_person).attr('data-photo-id',photoID);

      }

    }



  },// ------------------------------------------------------------------------



  //----------------------------------------------------------------------------
  // ------------------------- Add New Person ----------------------------------
  //----------------------------------------------------------------------------
  addPerson: function() {
    event.preventDefault();

    var _person_name = $('#person_name').val();
    var _person_givenName = $('#person_givenName').val();
    var _person_gender = $('#person_gender').val();
    var _person_birthdate = $('#person_birthdate').val();

    if((_person_name.trim() == '') || (_person_givenName.trim() == '')) {
      return false;
    }

    App.contracts.PersonList.deployed().then(function(instance) {
      return instance.addPerson( _person_name, _person_givenName,
        _person_gender, _person_birthdate);

    }).then(function(result) {
      alert('Item added!\n(automatique view update will hapen once block is mined.)');
    }).catch(function(err) {
      console.error(err);
    });
  }, // ------------------------------------------------------------------------




  //----------------------------------------------------------------------------
  // ------------------------- Modify Person -----------------------------------
  //----------------------------------------------------------------------------
  modifyPerson: function() {
    event.preventDefault();

    var _person_id = $('#modifyPerson_id').val();
    var _person_name = $('#modifyPerson_name').val();
    var _person_givenName = $('#modifyPerson_givenName').val();
    var _person_gender = $('#modifyPerson_gender').val();
    var _person_birthdate = $('#modifyPerson_birthDate').val();

    if((_person_name.trim() == '') || (_person_givenName.trim() == '')) {
      return false;
    }

    App.contracts.PersonList.deployed().then(function(instance){
      return instance.modifyPerson(_person_id, _person_name, _person_givenName,
        _person_gender, _person_birthdate);
    }).then(function(result) {
      App.loadingCycle=0;
      alert('Item modified!\n(automatique view update will hapen once block is mined.)');
    }).catch(function(error) {
      console.error(error);
    });
  }, // ------------------------------------------------------------------------



  //----------------------------------------------------------------------------
  // ------------------------- Push Person to validation process ---------------
  //----------------------------------------------------------------------------
  PuchPersonToValidation: function(_ref_person) {
    event.preventDefault();
    var ref = _ref_person.attr("data-id");

    App.contracts.PersonList.deployed().then(function(instance){
      return instance.PuchPersonToValidation(ref,"");

    }).then(function(result) {
      App.loadingCycle=0;
      alert('Item awaiting now validation!\n(automatique view update will hapen once block is mined.)');
    }).catch(function(error) {
      console.error(error);
    });
  }, // ------------------------------------------------------------------------



  //----------------------------------------------------------------------------
  // ------------------------- Final person validation -------------------------
  //----------------------------------------------------------------------------
  FinalPersonValidation: function(_ref_person) {
    event.preventDefault();
    var ref = _ref_person.attr("data-id");

    App.contracts.PersonList.deployed().then(function(instance){
      return instance.FinalPersonValidation(ref,"");

    }).then(function(result) {
      App.loadingCycle=0;
      alert('Item now validated!\n(automatique view update will hapen once block is mined.)');
    }).catch(function(error) {
      console.error(error);
    });
  }, // ------------------------------------------------------------------------






  //----------------------------------------------------------------------------
  // ------------------------- Add New Photo ----------------------------------
  //----------------------------------------------------------------------------
  addPhoto: function() {
    event.preventDefault();

    var _ref_person = $('#imgPerson_id').val();
    var _PhotoBlob = document.getElementById('imgPerson').src;
    var _PhotoEncoding = "data:image/jpeg;base64";

    if(_PhotoBlob.trim() == '') {
      return false;
    }

    App.contracts.PersonList.deployed().then(function(instance) {
      return instance.addPhoto(_ref_person, _PhotoEncoding, _PhotoBlob);

    }).then(function(result) {
      App.loadingCycle=0;
      alert('Item added!\n(automatique view update will hapen once block is mined.)');
    }).catch(function(err) {
      console.error(err);
    });
  }, // ------------------------------------------------------------------------




  //----------------------------------------------------------------------------
  // ------------------------- Modify Photo ----------------------------------
  //----------------------------------------------------------------------------
  modifyPhoto: function() {
    event.preventDefault();


    var _ref_photo = $('#modify_imgPhoto_id').val();
    var _PhotoBlob = document.getElementById('modify_imgPerson').src;
    var _PhotoEncoding = "data:image/jpeg;base64";


    if(_PhotoBlob.trim() == '') {
      return false;
    }

    App.contracts.PersonList.deployed().then(function(instance) {
      return instance.modifyPhoto(_ref_photo, _PhotoEncoding, _PhotoBlob);






    }).then(function(result) {
      App.loadingCycle=0;
      alert('Item modified!\n(automatique view update will hapen once block is mined.)');
    }).catch(function(err) {
      console.error(err);
    });
  }, // ------------------------------------------------------------------------



  //----------------------------------------------------------------------------
  // ------------------------- Validate Photo ----------------------------------
  //----------------------------------------------------------------------------
  PhotoValidation: function(Btn) {
    event.preventDefault();


    var _ref_photo = Btn.attr('data-photo-id');
    //alert(_ref_photo);

    App.contracts.PersonList.deployed().then(function(instance) {
      return instance.ValidatePhoto(_ref_photo);






    }).then(function(result) {
      App.loadingCycle=0;
      alert('Photo is now Validate!\n(automatique view update will hapen once block is mined.)');
    }).catch(function(err) {
      console.error(err);
    });
  }, // ------------------------------------------------------------------------








  //----------------------------------------------------------------------------
  // listen to events triggered by the contract
  //----------------------------------------------------------------------------
  EventInfoUpdate: function(_txt,_id) {

    App.contracts.PersonList.deployed().then(async function(chainListInstance) {
      chainListInstance.GetPerson(_id).then(function(MyPersonData) {

        $("#UpdateInfoBox").find('.modal-title').html("<img src='img/blockchain.gif' style='width:70px;'>Blockchain Update Event");
        $("#UpdateInfoBox").find('.modal-footer').html(_txt+MyPersonData[2]+" "+MyPersonData[3]+", "+MyPersonData[4]+", "+MyPersonData[5]);
        $("#UpdateInfoBox").modal();
        setTimeout(function(){$('#UpdateInfoBox').modal('hide')}, App.TimeShowInfo);
        App.PersonModifID=_id;
        App.reloadOnePerson();


      }).catch(function(err) {
        $("#UpdateInfoBox").find('.modal-title').html("<img src='img/blockchain.gif' style='width:70px;'>Blockchain Update Event");
        $("#UpdateInfoBox").find('.modal-footer').html(_txt+"Not authorized to see details.");
        $("#UpdateInfoBox").modal();
        setTimeout(function(){$('#UpdateInfoBox').modal('hide')}, App.TimeShowInfo);
        App.PersonModifID=_id;
        App.reloadOnePerson();
      });
    }).catch(function(err){console.error(err);});

  },
  listenToEvents: function() {
    App.contracts.PersonList.deployed().then(function(instance) {

      instance.LogAddPerson({}, {}).watch(function(error, event) {
        if (!error) {
          App.EventInfoUpdate("<strong>Person added: </strong></br>ID: "+
                      event.args._ref_Person+" | ", event.args._ref_Person);
        } else {
          console.error(error);
        }
      });

      instance.LogModifyPerson({}, {}).watch(function(error, event) {
        if (!error) {
          App.EventInfoUpdate("<strong>Person modified: </strong></br>ID: "+
                      event.args._ref_Person+" | ", event.args._ref_Person);
        } else {
          console.error(error);
        }
      });

      instance.LogAddValidation({}, {}).watch(function(error, event) {
        if (!error) {
          if(event.args._status==0){
            App.EventInfoUpdate("<strong>Validation initied: </strong></br>ID: "+
                        event.args._ref_Person+" | ", event.args._ref_Person);
          } else if(event.args._status==1) {
            App.EventInfoUpdate("<strong>Person validated: </strong></br>ID: "+
                        event.args._ref_Person+" | ", event.args._ref_Person);
          }
        } else {
          console.error(error);
        }
      });

      instance.LogAddPhoto({}, {}).watch(function(error, event) {
        if (!error) {
          App.EventInfoUpdate("<strong>Image added: </strong></br>ID: "+
                      event.args._ref_Person+" | ", event.args._ref_Person);
        } else {
          console.error(error);
        }
      });

      instance.LogModifyPhoto({}, {}).watch(function(error, event) {
        if (!error) {
          App.EventInfoUpdate("<strong>Image modified: </strong></br>ID: "+
                      event.args._ref_Person+" | ", event.args._ref_Person);
        } else {
          console.error(error);
        }
      });

      instance.LogValidePhoto({}, {}).watch(function(error, event) {
        if (!error) {
          App.EventInfoUpdate("<strong>Image validated: </strong></br>ID: "+
                      event.args._ref_Person+" | ", event.args._ref_Person);
        } else {
          console.error(error);
        }
      });

    });
  },






  AddAdministrator: function(){

    var _adminAddr = $('#adminToAdd').val();

    if((_adminAddr.trim() == '')) {
      return false;
    }
    App.contracts.PersonList.deployed().then(function(instance) {
      return instance.addAdministrator(_adminAddr, {
        from: App.account,
        gas: 500000
      });

    }).then(function(result) {
      alert('Admin added!');
    }).catch(function(err) {
      console.error(err);
    });

  },
  RemoveAdministrator: function(_ref_admin){
    event.preventDefault();
    var ref = _ref_admin.attr("data-id");

    App.contracts.PersonList.deployed().then(function(instance){
      return instance.modifyAdministrator(ref);

    }).then(function(result) {
      alert('Admin removed!');
    }).catch(function(error) {
      console.error(error);
    });

  },




};





$(function() {

  $(window).load(function() {
    App.init();
  });
});






// Reload data in template before modify
function OpenModifyPerson(thisAttr){
  $("#modifyPerson_name").val(thisAttr.attr("data-name"));
  $("#modifyPerson_givenName").val(thisAttr.attr("data-givenName"));
  $("#modifyPerson_gender").val(thisAttr.attr("data-gender"));
  $("#modifyPerson_birthDate").val(thisAttr.attr("data-birthDate"));
  $("#modifyPerson_id").val(thisAttr.attr("data-id"));
}

function OpenAddPerson(thisAttr){
  $("#person_name").val("");
  $("#person_givenName").val("");
  $("#person_gender").val("");
  $("#person_birthDate").val("");
}


function OpenModifyPhoto(thisAttr){
  $("#modify_imgPhoto_id").val(thisAttr.attr("data-photo-id"));
}

function OpenAddPhoto(thisAttr){
  $("#imgPerson_id").val(thisAttr.attr("data-id"));
}