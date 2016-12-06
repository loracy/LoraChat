$(document).ready(function(){
  // Initialize Firebase
    var config = {
    apiKey: "AIzaSyA9Xn5ju-BIuaF1ToPdqXFg-redAXodK6I",
    authDomain: "lorachat-87d15.firebaseapp.com",
    databaseURL: "https://lorachat-87d15.firebaseio.com",
    storageBucket: "lorachat-87d15.appspot.com",
    messagingSenderId: "609350109495"
  };
  firebase.initializeApp(config);
  // Firebase database reference
  var dbChatRoom = firebase.database().ref().child('chatroom');
  var dbUser = firebase.database().ref().child('user');

  var photoURL;
  var $img = $('img');

  // REGISTER DOM ELEMENTS
  const $email = $('#email');
  const $password = $('#password');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignUp = $('#btnSignUp');
  const $btnSignOut = $('#btnSignOut');
  const $btnEdit = $('#btnEdit');
  const $hovershadow = $('.hover-shadow');
  const $btnSubmit = $('#btnSubmit');
  const $signInfo = $('#sign-info');
  const $file = $('#file');
  const $profileName = $('#profile-name');
  const $profileEmail = $('#profile-email');
  const $profileAge = $('#profile-age');
  const $profileJob = $('#profile-job');
  const $profileDescribe = $('#profile-describe');
  const $messageField = $('#messageInput');
  const $messageList = $('#example-messages2');
  const $message = $('#example-messages');
  const $btnChat = $('#btnChat');
  const $age = $('#age');
  const $job = $('#job');
  const $des = $('#describe');

  // Hovershadow
  $hovershadow.hover(
    function(){
      $(this).addClass("mdl-shadow--4dp");
    },
    function(){
      $(this).removeClass("mdl-shadow--4dp");
    }
  );

  var storageRef = firebase.storage().ref();

  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];

    var metadata = {
      'contentType': file.type
    };

    // Push to child path.
    // [START oncomplete]
    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      photoURL = snapshot.metadata.downloadURLs[0];
      console.log('File available at', photoURL);
    }).catch(function(error) {
      // [START onfailure]
      console.error('Upload failed:', error);
      // [END onfailure]
    });
    // [END oncomplete]
  }

  window.onload = function() {
    $file.change(handleFileSelect);
    // $file.disabled = false;
  }

  // SignIn/SignUp/SignOut Button status
  var user = firebase.auth().currentUser;
  if (user) {
    $btnSignIn.attr('disabled', 'disabled');
    $btnSignUp.attr('disabled', 'disabled');
    $btnSignOut.removeAttr('disabled');
    $btnChat.removeAttr('disabled')
  } else {
    $btnSignOut.attr('disabled', 'disabled');
    $btnChat.attr('disabled','disabled');
    $btnSignIn.removeAttr('disabled');
    $btnSignUp.removeAttr('disabled')
  }

  // Sign In
  $btnSignIn.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signIn
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(){
      console.log('SignIn User');
       window.location.href='profile.html';
      
    });
  });

  // SignUp
  $btnSignUp.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signUp
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(user){
      console.log("SignUp user is "+user.email);
      const dbUserid = dbUser.child(user.uid);
      dbUserid.push({email:user.email});
       window.location.href='profile.html';
    });
  });


  // Listening Login User
  firebase.auth().onAuthStateChanged(function(user){
    var use =firebase.auth().currentUser;
    if(user) {
      console.log(user);
      const dbUserid = dbUser.child(use.uid);
      const loginName = user.displayName || user.email;
      var $age = dbUserid.child('Age');
      var $job = dbUserid.child('Job');
      var $des = dbUserid.child('Descriptions');
      $signInfo.html(loginName+" is login...");
      $btnSignIn.attr('disabled', 'disabled');
      $btnSignUp.attr('disabled', 'disabled');
      $btnSignOut.removeAttr('disabled')
      $profileName.html(user.displayName);
      $profileEmail.html(user.email);
      $img.attr("src",user.photoURL);

      //--
       $job.on('value', function(snap){
          $profileJob.html(snap.val());
        }); 
        $age.on('value', function(snap){
          $profileAge.html(snap.val());
        });
        $des.on('value', function(snap){
          $profileDescribe.html(snap.val());
        });
      // Add a callback that is triggered for each chat message.
      dbChatRoom.limitToLast(10).on('child_added', function (snapshot) {
        //GET DATA
        var data = snapshot.val();
        var username = data.name || "anonymous" ;
        // data.name 
        var message = data.text;

        //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
        var $messageElement = $("<li>");
        var $nameElement = $("<strong class='example-chat-username'></strong>");
        $nameElement.text(username);

        $messageElement.text(message).prepend($nameElement);
        $nameElement.prepend($('<img>',{class:'personalpic',src:data.image}));;

        //ADD MESSAGE
        $messageList.append($messageElement);
        //SCROLL TO BOTTOM OF MESSAGE LIST
        $messageList[0].scrollTop = $messageList[0].scrollHeight;
      });//child_added callback
    } else {
      console.log("not logged in");
      $profileName.html("N/A");
      $profileEmail.html('N/A');
      $img.attr("src","");
    }
  });

  // SignOut
  $btnSignOut.click(function(){
    firebase.auth().signOut();
    console.log('LogOut');
    $signInfo.html('No one login...');
    $btnSignOut.attr('disabled', 'disabled');
    $btnEdit.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $btnSignUp.removeAttr('disabled')
    window.location.href='index.html';
  });

  $btnChat.click(function(){
    window.location.href='profile.html';
  })


  // Submit
  $btnSubmit.click(function(){
    var user = firebase.auth().currentUser;
    const $userName = $('#userName').val();
    const dbUserid = dbUser.child(user.uid);

    // get data
    var age = $age.val();
    var job = $job.val();
    var des = $des.val();

     dbUserid.set({
      Age:age, 
      Descriptions:des, 
      Job:job
    });
     var $age_on = dbUserid.child('Age');
     var $job_on = dbUserid.child('Job');
     var $des_on = dbUserid.child('Descriptions');

     $job_on.on('value', function(snap){
        $profileJob.html(snap.val());
      });
     $age_on.on('value', function(snap){
        $profileAge.html(snap.val());
      });
     $des_on.on('value',function(snap){
      $profileDescribe.html(snap.val());
     });

    const promise = user.updateProfile({
      displayName: $userName,
      photoURL: photoURL
    });
    promise.then(function() {
      console.log("Update successful.");
      user = firebase.auth().currentUser;
      if (user) {
        $profileName.html(user.displayName);
        $profileEmail.html(user.email);
        const loginName = user.displayName || user.email;
        $signInfo.html(loginName+" is login...");
        window.location.href='chat.html';
      }
    });
  });
  $messageField.keypress(function (e) {
    if (e.keyCode == 13) {
      //FIELD VALUES
      user = firebase.auth().currentUser;
      var username = user.displayName;
      var message = $messageField.val();
      var picture = user.photoURL;

      console.log(username);
      console.log(message);

      //SAVE DATA TO FIREBASE AND EMPTY FIELD
      dbChatRoom.push({image:picture, name:username, text:message});
      $messageField.val('');
    }
  });
  $btnEdit.click(function(){
    window.location.href='profile.html';
  });

});
