App = {


  web3Provider: null,
  contracts: {},
  account: 0x0,
  //loading: false,

  globalIsAdmin: false,
  globalIsOwner: false,

  ShowNextElem: 4,
  PersonModifID: -1,
  TimeShowInfo: 3500,

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
          App.globalIsOwner=true;
          $('.btn-add-admin').attr('style','visibility: visible;');
          $('.btn-admin-remove').attr('style','visibility: visible;');
          $('#adminToAdd').attr('style','visibility: visible;');

        } else {
          App.globalIsOwner=false;
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
                App.globalIsAdmin=true;
                $('#ConectedAsLabel').text("Connected as Admin");
                $('#ConectedAsLabel').css('color', 'red');
                $('.adminTab').show();
              } else {
                App.globalIsAdmin=false;
                $('#ConectedAsLabel').text("Connected as User");
                $('#ConectedAsLabel').css('color', 'blue');
              }

              return chainListInstance.GetContractOwner();
            }).then(function(addr) {
              $('#ContractOwnerAddress').text(addr);
              if(App.globalIsOwner){
                $('#ConectedAsLabel').text("Connected as Owner");
                $('#ConectedAsLabel').css('color', 'red');
                $('.adminTab').show();
              }

            });



          }// end if
        })
      } // end if
    });
  }, // ------------------------------------------------------------------------




  //----------------------------------------------------------------------------
  // ------------------------- reload person ------------------------------
  //----------------------------------------------------------------------------
  reloadPerson: function() {

    $('#DataLoadingProgress').val(0);




    App.displayAccountInfo();
    $('#DataLoadingProgress').val(2);



    App.contracts.PersonList.deployed().then(async function(chainListInstance) {

      $('#MyPersonsRow').empty();
      $('#personsRow').empty();
      $('#personsRowToValidate').empty();
      $('#ValidatedpersonsRow').empty();
      $('#DataLoadingProgress').val(5);


      // My items only
      await chainListInstance.getMyPersonIds().then(async function(personIds) {

        var incToProgress = (22/personIds.length);
        var IncStop = personIds.length-1-App.ShowNextElem;
        if(IncStop<0) {IncStop=0;}
        for(var IncInv = personIds.length-1; IncInv >= IncStop; IncInv--) {
          await chainListInstance.GetPerson(personIds[IncInv].toNumber()).then(function(data) {
            MyPersonData=data;
            App.displayPerson(MyPersonData[0],MyPersonData[1],MyPersonData[2],MyPersonData[3],
                              MyPersonData[4],MyPersonData[5],1,MyPersonData[6],true);


          });

          $('#DataLoadingProgress').val($('#DataLoadingProgress').val()+incToProgress);
        } // End for

        return personIds;
      }).then(async function(personIds) {

        var incToProgress = (22/personIds.length);
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
          $('#DataLoadingProgress').val($('#DataLoadingProgress').val()+incToProgress);
        } // End for




      }).catch(function(err) {
        console.error(err.message);
      }); // END All items loop (admin)



      // All items loop (admin)
      $('#DataLoadingProgress').val(50);
      await chainListInstance.getPersonIds().then(async function(personIds) {

        var incToProgress = (22/personIds.length);
        var IncStop = personIds.length-1-App.ShowNextElem;
        if(IncStop<0) {IncStop=0;}
        for(var IncInv = personIds.length-1; IncInv >= IncStop; IncInv--) {
          await chainListInstance.GetPerson(personIds[IncInv].toNumber()).then(function(data) {
            MyPersonData=data;
            App.displayPerson(MyPersonData[0],MyPersonData[1],MyPersonData[2],MyPersonData[3],
                              MyPersonData[4],MyPersonData[5],0,MyPersonData[6],true);
          });

          $('#DataLoadingProgress').val($('#DataLoadingProgress').val()+incToProgress);
        } // End for

        return personIds;
      }).then(async function(personIds) {

        var incToProgress = (22/personIds.length);
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
          $('#DataLoadingProgress').val($('#DataLoadingProgress').val()+incToProgress);
        } // End for




      }).catch(function(err) {
        console.error(err.message);
      }); // END All items loop (admin)











      //App.loading = false;
      $('#DataLoadingProgress').val(100);
      return ;
    }).catch(function(err) {
      console.error(err.message);
    });

  }, // ------------------------------------------------------------------------
  reloadOnePerson: function() {

    App.displayAccountInfo();


    App.contracts.PersonList.deployed().then(async function(chainListInstance) {

      await chainListInstance.GetPerson(App.PersonModifID).then(async function(MyPersonData) {
        await App.displayPerson(MyPersonData[0],MyPersonData[1],MyPersonData[2],MyPersonData[3],
                          MyPersonData[4],MyPersonData[5],1,MyPersonData[6],false);

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

        await App.displayPhotoAttribute(MyPersonData[0],photoString,photoStatus,MyPersonData[6],photoID);


      }).catch(function(err) {
        console.error(err.message);
      });


      await chainListInstance.GetPerson(App.PersonModifID).then(async function(PersonData) {
          await App.displayPerson(PersonData[0],PersonData[1],PersonData[2],PersonData[3],
                            PersonData[4],PersonData[5],0,PersonData[6],false);

        return PersonData;
      }).then(async function(PersonData) {

        var photoString="";
        var photoStatus=0;
        var photoID=0;

        var MyPhotoData = await chainListInstance.GetPhotoByPerson(PersonData[0]);

        if(MyPhotoData[2].toNumber()==PersonData[0].toNumber()){

          photoString=MyPhotoData[4];
          photoID=MyPhotoData[0];
          if(MyPhotoData[5]){
            photoStatus=2;
          } else {
            photoStatus=1;
          }
        }

        await App.displayPhotoAttribute(PersonData[0],photoString,photoStatus,PersonData[6],photoID);


      }).catch(function(err) {
        console.error(err.message);
      });



    }).catch(function(err) {
      console.error(err.message);
      App.PersonModifID=-1;
    });







  }, // ------------------------------------------------------------------------
  searchPersonByName: async function() {

    App.displayAccountInfo();

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
                              MyPersonData[4],MyPersonData[5],2,MyPersonData[6]);
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
  displayPerson: function(_id, _creator, _name , _givenName, _gender, _birthDate, isMyOnly, _status, appendItem) {

    // isMyOnly 0=all, 1=isMyOnly, 2=Search


    if((App.globalIsAdmin==false && App.globalIsOwner==false) && isMyOnly == 0){
      return;
    }

    // Check if add or update existing
    var personTemplate = $("#personTemplate");
    var AddPersonAction = true;
    if(isMyOnly==1){
      if ($(".panel-personID_"+_id).length>0){
       personTemplate = $(".panel-personID_"+_id);
       AddPersonAction = false;
      }
    }
    if(isMyOnly==0){
      if ($(".panel-personID_"+_id).length>1){
       personTemplate = $(".panel-personID_"+_id);
       AddPersonAction = false;
      }
    }
    //alert(AddPersonAction+ " " + isMyOnly + " " + _id);

    // Set Text
    personTemplate.find('.panel-title').html("ID: " + _id + " | <strong>" + _name.toUpperCase() + "</strong> " + _givenName);
    personTemplate.find('.person-gender').text(_gender);
    personTemplate.find('.person-birthdate').text(_birthDate);
    personTemplate.find('.person-name').text(_name);
    personTemplate.find('.person-givenName').text(_givenName);


    // change button attributes and hidde all
    function SetBTNattr(sBTNclass) {
       personTemplate.find(sBTNclass).attr('data-id', _id);
       personTemplate.find(sBTNclass).attr('data-name', _name);
       personTemplate.find(sBTNclass).attr('data-givenName', _givenName);
       personTemplate.find(sBTNclass).attr('data-gender', _gender);
       personTemplate.find(sBTNclass).attr('data-birthDate', _birthDate);
       personTemplate.find(sBTNclass).attr('style','visibility: hidden;')
    };
    SetBTNattr(".btn-modify-Person");
    SetBTNattr(".btn-add-photo");
    SetBTNattr(".btn-push-validation");
    SetBTNattr(".btn-push-finalValidation");
    SetBTNattr(".btn-modify-photo");
    SetBTNattr(".btn-validate-photo");

    // Set default image and pannel call attr.
    personTemplate.find('.person-photo-validate').html("Loading...");
    personTemplate.find('.person-photo').attr('src', "img/empty-profile-pic.png");
    personTemplate.find('.panel-person').attr('class', "panel panel-default panel-person"+" panel-personID_"+_id);


    // Check if address owner of _creator
    if (_creator == App.account) {personTemplate.find('.person-creator').text("You");}
    else {                        personTemplate.find('.person-creator').text(_creator);};

    // Check person status label
    if (_status==-1){     personTemplate.find('.person-Status').text("New entry");}
    else if (_status==0){ personTemplate.find('.person-Status').text("Awaiting validation");}
    else if (_status==1){ personTemplate.find('.person-Status').text("Validated");}




    // Check user right for modif & validation btn
    if (App.globalIsOwner){
      if (_status==-1){
        personTemplate.find(".btn-modify-Person").attr('style','visibility: visible;');
        personTemplate.find(".btn-push-validation").attr('style','visibility: visible;');
      } else if (_status==0){
        personTemplate.find(".btn-push-finalValidation").attr('style','visibility: visible;');
        personTemplate.find(".btn-modify-Person").attr('style','visibility: visible;');
      } else if (_status==1){
        personTemplate.find(".btn-modify-Person").attr('style','visibility: visible;');
      };
    } else if (App.globalIsAdmin){
      if (_status==-1){
        personTemplate.find(".btn-modify-Person").attr('style','visibility: visible;');
        if (_creator==App.account){personTemplate.find(".btn-push-validation").attr('style','visibility: visible;');}
      } else if (_status==0){
        personTemplate.find(".btn-push-finalValidation").attr('style','visibility: visible;');
        personTemplate.find(".btn-modify-Person").attr('style','visibility: visible;');
      };
    } else {
      if (_status==-1){
        personTemplate.find(".btn-push-validation").attr('style','visibility: visible;');
        personTemplate.find(".btn-modify-Person").attr('style','visibility: visible;');
      };
    };




    // set id attributs
    if(isMyOnly==0){ // All
      personsRow = $('#personsRow');
      personTemplate.find('.person-photo').attr('id', 'PhotoPersonID_' + _id);
      personTemplate.find('.person-photo-validate').attr('id', 'PhotoPersonValidate_' + _id);
      personTemplate.find('.btn-add-photo').attr('id', 'btn-add-photo_PersonID_' + _id);
      personTemplate.find('.btn-modify-photo').attr('id', 'btn-modify-photo_PersonID_' + _id);
      personTemplate.find('.btn-validate-photo').attr('id', 'btn-validate-photo_PersonID_' + _id);
    } else if(isMyOnly==1){
      personsRow = $('#MyPersonsRow');
      personTemplate.find('.person-photo').attr('id', 'isMyOnly_PhotoPersonID_' + _id);
      personTemplate.find('.person-photo-validate').attr('id', 'isMyOnly_PhotoPersonValidate_' + _id);
      personTemplate.find('.btn-add-photo').attr('id', 'isMyOnly_btn-add-photo_PersonID_' + _id);
      personTemplate.find('.btn-modify-photo').attr('id', 'isMyOnly_btn-modify-photo_PersonID_' + _id);
      personTemplate.find('.btn-validate-photo').attr('id', 'isMyOnly_btn-validate-photo_PersonID_' + _id);
    } else if(isMyOnly==2){ // Search
      personsRow = $('#SearchPersonsRow');
      personTemplate.find('.person-photo').attr('id', 'search_PhotoPersonID_' + _id);
      personTemplate.find('.person-photo-validate').attr('id', 'search_PhotoPersonValidate_' + _id);
      personTemplate.find('.btn-add-photo').attr('id', 'search_btn-add-photo_PersonID_' + _id);
      personTemplate.find('.btn-modify-photo').attr('id', 'search_btn-modify-photo_PersonID_' + _id);
      personTemplate.find('.btn-validate-photo').attr('id', 'search_btn-validate-photo_PersonID_' + _id);

      personsRow.append(personTemplate.html());
      personTemplate.find('.panel-person').attr('class', "panel panel-default panel-person");
      return;
    }


    if (AddPersonAction){
      if(appendItem){personsRow.append(personTemplate.html())}
      else {personsRow.prepend(personTemplate.html())}
    };



    // add it to admin filters...
    if((App.globalIsAdmin || App.globalIsOwner) && isMyOnly == 0){

        if(_status==0){
          personTemplate.find('.person-photo').attr('id', 'toValidate_PhotoPersonID_' + _id);
          personTemplate.find('.person-photo-validate').attr('id', 'toValidate_PhotoPersonValidate_' + _id);
          personTemplate.find('.btn-add-photo').attr('id', 'toValidate_btn-add-photo_PersonID_' + _id);
          personTemplate.find('.btn-modify-photo').attr('id', 'toValidate_btn-modify-photo_PersonID_' + _id);
          personTemplate.find('.btn-validate-photo').attr('id', 'toValidate_btn-validate-photo_PersonID_' + _id);

          personsRow = $('#personsRowToValidate');
          if (AddPersonAction){
            if(appendItem){personsRow.append(personTemplate.html())}
            else {personsRow.prepend(personTemplate.html())}
          };
        }

        if(_status==1){
          personTemplate.find('.person-photo').attr('id', 'validated_PhotoPersonID_' + _id);
          personTemplate.find('.person-photo-validate').attr('id', 'validated_PhotoPersonValidate_' + _id);
          personTemplate.find('.btn-add-photo').attr('id', 'validated_btn-add-photo_PersonID_' + _id);
          personTemplate.find('.btn-modify-photo').attr('id', 'validated_btn-modify-photo_PersonID_' + _id);
          personTemplate.find('.btn-validate-photo').attr('id', 'validated_btn-validate-photo_PersonID_' + _id);

          personsRow = $('#ValidatedpersonsRow');
          if (AddPersonAction){
            if(appendItem){personsRow.append(personTemplate.html())}
            else {personsRow.prepend(personTemplate.html())}
          };
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
      } else if (photoStatus==1){
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
    if(App.globalIsAdmin){
      if (photoStatus==0 && personStatus==0){
        $("#btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#isMyOnly_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#toValidate_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#validated_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#search_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
      }else if (photoStatus==1 && personStatus==0){
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
    if(App.globalIsOwner){
      if (photoStatus==0){
        $("#btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#isMyOnly_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#toValidate_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#validated_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
        $("#search_btn-add-photo_PersonID_"+ref_person).attr('style','visibility: visible;');
      } else if (photoStatus==1 || photoStatus==2) {
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
      if (photoStatus==1) {
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

    App.BtnWaitingStart("#btn_addPerson",'#Progress_addPerson');



    App.contracts.PersonList.deployed().then(function(instance) {
      return instance.addPerson( _person_name, _person_givenName,
        _person_gender, _person_birthdate,{gasPrice: web3.toWei(10,'gwei')});




    }).then(function(result) {
      App.BtnWaitingDone("#btn_addPerson",'#Progress_addPerson',"Add new person");
    }).catch(function(err) {
      App.BtnWaitingErr("#btn_addPerson",'#Progress_addPerson',"Add new person");
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

    App.BtnWaitingStart(".btn-modify-Person",'#Progress_modifyPerson');

    App.contracts.PersonList.deployed().then(function(instance){



      return instance.modifyPerson(_person_id, _person_name, _person_givenName,
        _person_gender, _person_birthdate,{gasPrice: web3.toWei(10,'gwei')});

    }).then(function(result) {
      App.BtnWaitingDone(".btn-modify-Person",'#Progress_modifyPerson',"Modify Info");
    }).catch(function(error) {
      App.BtnWaitingErr(".btn-modify-Person",'#Progress_modifyPerson',"Modify Info");
      console.error(error);
    });



  }, // ------------------------------------------------------------------------



  //----------------------------------------------------------------------------
  // ------------------------- Push Person to validation process ---------------
  //----------------------------------------------------------------------------
  PuchPersonToValidation: function(_ref_person) {
    event.preventDefault();
    var ref = _ref_person.attr("data-id");

      App.BtnWaitingStart(".btn-push-validation",'#Progress_pushValidation');

    App.contracts.PersonList.deployed().then(function(instance){
      return instance.PuchPersonToValidation(ref,"",{gasPrice: web3.toWei(10,'gwei')});

    }).then(function(result) {
      App.BtnWaitingDone(".btn-push-validation",'#Progress_pushValidation',"Ask for validation");
    }).catch(function(error) {
      App.BtnWaitingErr(".btn-push-validation",'#Progress_pushValidation',"Ask for validation");
      console.error(error);
    });
  }, // ------------------------------------------------------------------------



  //----------------------------------------------------------------------------
  // ------------------------- Final person validation -------------------------
  //----------------------------------------------------------------------------
  FinalPersonValidation: function(_ref_person) {
    event.preventDefault();
    var ref = _ref_person.attr("data-id");

    App.BtnWaitingStart(".btn-push-finalValidation",'#Progress_finalValidation');

    App.contracts.PersonList.deployed().then(function(instance){
      return instance.FinalPersonValidation(ref,"",{gasPrice: web3.toWei(10,'gwei')});

    }).then(function(result) {
      App.BtnWaitingDone(".btn-push-finalValidation",'#Progress_finalValidation',"Final Validation");
    }).catch(function(error) {
        App.BtnWaitingErr(".btn-push-finalValidation",'#Progress_finalValidation',"Final Validation");
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

    App.BtnWaitingStart(".btn-add-photo",'#Progress_addPhoto');


    App.contracts.PersonList.deployed().then(function(instance) {
      return instance.addPhoto(_ref_person, _PhotoEncoding, _PhotoBlob, {
      from: App.account,
      gas: 7000000,
      gasPrice: web3.toWei(10,'gwei')
    });

    }).then(function(result) {
      App.BtnWaitingDone(".btn-add-photo",'#Progress_addPhoto',"Add Photo");
    }).catch(function(err) {
      App.BtnWaitingErr(".btn-add-photo",'#Progress_addPhoto',"Add Photo");
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

    App.BtnWaitingStart(".btn-modify-photo",'#Progress_modifyPhoto',"Modify Photo");

    App.contracts.PersonList.deployed().then(function(instance) {
      return instance.modifyPhoto(_ref_photo, _PhotoEncoding, _PhotoBlob, {
      from: App.account,
      gas: 7000000,
      gasPrice: web3.toWei(10,'gwei')
    });






    }).then(function(result) {
      App.BtnWaitingDone(".btn-modify-photo",'#Progress_modifyPhoto',"Modify Photo");
    }).catch(function(err) {
      App.BtnWaitingErr(".btn-modify-photo",'#Progress_modifyPhoto',"Modify Photo");
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
      return instance.ValidatePhoto(_ref_photo, {
      from: App.account,
      gas: 7000000,
      gasPrice: web3.toWei(10,'gwei')
    });






    }).then(function(result) {
      //alert('Photo is now Validate!\n(automatique view update will hapen once block is mined.)');
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
      gas: 7500000,
      gasPrice: web3.toWei(10,'gwei')
    });

    }).then(function(result) {
      //alert('Admin added!');
    }).catch(function(err) {
      console.error(err);
    });

  },
  RemoveAdministrator: function(_ref_admin){
    event.preventDefault();
    var ref = _ref_admin.attr("data-id");

    App.contracts.PersonList.deployed().then(function(instance){
      return instance.modifyAdministrator(ref, {
      from: App.account,
      gas: 7500000,
      gasPrice: web3.toWei(10,'gwei')
    });

    }).then(function(result) {
      //alert('Admin removed!');
    }).catch(function(error) {
      console.error(error);
    });

  },






  BtnWaitingStart: function(_btn, _Progress){

    $(_btn).prop("disabled",true);
    $(_btn).html("Wait, 0%");
    $(_Progress).val(0);
    function doSetTimeoutThis(i) {
      setTimeout(function() {
        if ($(_Progress).val()<70){
          $(_Progress).val(i);
          $(_btn).text("Wait, "+i+"%");
        }
      }, (700*i));
    }
    for(var IncProgress = 1; IncProgress <= 70; IncProgress++) {
      doSetTimeoutThis(IncProgress);
    }


  },
  BtnWaitingDone: function(_btn, _Progress, _title){

    function doSetTimeout(j) {
      setTimeout(function() {
        if($(_Progress).val()<100){
          $(_Progress).val(j);
          $(_btn).html("Wait, "+j+"%");

          if(j==100){
            $(_btn).prop("disabled",false);
            $(_btn).text(_title);
          }
        }


      }, (100*j));
    }

    for(var IncProgress = 70; IncProgress <= 100; IncProgress++) {
      doSetTimeout(IncProgress);
    }

  },
  BtnWaitingErr: function(_btn, _Progress, _title){
    $(_Progress).val(100);
    $(_btn).prop("disabled",false);
    $(_btn).text(_title);
  }



};





$(function() {

  $(window).load(function() {


    App.init();

    var checkIfExists = setInterval(function() {
        var exists = $(".bn-branding-adplacement");
        if (exists) {
            clearInterval(checkIfExists);
            document.location.hash = '';
        }
    }, 25);


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




$(document).ready(function() {


    $('#btnBrowsPhoto').change(function(evt) {

        var files = evt.target.files;
        var file = files[0];

        if (file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('imgPersonPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        ResizeImage("btnBrowsPhoto", "imgPerson");
    });

    $('#modify_btnBrowsPhoto').change(function(evt) {

        var files = evt.target.files;
        var file = files[0];

        if (file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('modify_imgPersonPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        ResizeImage("modify_btnBrowsPhoto", "modify_imgPerson");
    });


});

function ResizeImage(btnUp,imgUp) {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        var filesToUploads = document.getElementById(btnUp).files;
        var file = filesToUploads[0];
        if (file) {

            var reader = new FileReader();
            // Set the image once loaded into file reader
            reader.onload = function(e) {

                var img = document.createElement("img");
                img.src = e.target.result;

                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                var MAX_WIDTH = 100;
                var MAX_HEIGHT = 120;
                var width = img.width;
                var height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;



                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                dataurl = canvas.toDataURL(file.type,0.3);
                document.getElementById(imgUp).src = dataurl;
            }
            reader.readAsDataURL(file);

        }

    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
}
