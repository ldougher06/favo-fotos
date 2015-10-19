var FIREBASE_URL = 'https://favofotos.firebaseio.com';
var fb = new Firebase(FIREBASE_URL);
var fotos;
var initLoad = true;

$('.onLoggedIn form').submit(function () {
  var url = $('.onLoggedIn input[type="url"]').val();

  fotos.push(url, function(err){
    console.log(err);
  })

  event.preventDefault();
});

$('.onTempPassword form').submit(function () {
  var email = fb.getAuth().password.email;
  var oldPw = $('.onTempPassword input:nth-child(1)').val();
  var newPw = $('.onTempPassword input:nth-child(2)').val();

  fb.changePassword({
    email: email,
    oldPassword: oldPw,
    newPassword: newPw
  }, function(err) {
    if (err) {
      alert(err.toString());
    } else {
      fb.unauth();
    }
  });

  event.preventDefault();
});

$('.doResetPassword').click(function () {
  var email = $('.onLoggedOut input[type="email"]').val();

  fb.resetPassword({
    email: email
  }, function (err) {
    if (err) {
      alert(err.toString());
    } else {
      alert('Check your email!');
    }
  });
});

$('.doLogout').click(function () {
  fb.unauth(function () {
    // window.location.reload();
  });
})

$('.doRegister').click(function () {
  var email = $('.onLoggedOut input[type="email"]').val();
  var password = $('.onLoggedOut input[type="password"]').val();

  fb.createUser({
    email: email,
    password: password
  }, function (err, userData) {
    if (err) {
      alert(err.toString());
    } else {
      clearForms();
      doLogin(email, password, function () {
        // window.location.reload();
      });
    }
  });

  event.preventDefault();
});

$('.onLoggedOut form').submit(function () {
  var email = $('.onLoggedOut input[type="email"]').val();
  var password = $('.onLoggedOut input[type="password"]').val();

  doLogin(email, password, function () {
     //window.location.reload();
  });
  event.preventDefault();
});

function clearForms () {
  $('input[type="text"], input[type="url"]').val('');
}

function saveAuthData (authData) {
  var ref = fb.child(`users/${authData.uid}/profile`);
  ref.set(authData);
}

function doLogin (email, password, cb) {
  fb.authWithPassword({
    email: email,
    password: password
  }, function (err, authData) {
    if (err) {
      alert(err.toString());
    } else {
      saveAuthData(authData);
      typeof cb === 'function' && cb(authData);
    }
  });
}

function addPhotoToDom (photo) {
  if (photo) {
    var uuid = Object.keys(photo)[0];
    $(`<img src="${photo[uuid]}" data-uid="${uuid}">`).appendTo($('.favFotos'));
  }
}

fb.onAuth(function (authData) {
  if (initLoad) {
    var onLoggedOut = $('.onLoggedOut');
    var onLoggedIn = $('.onLoggedIn');
    var onTempPassword = $('.onTempPassword');

    if (authData && authData.password.isTemporaryPassword) {
      // temporary log in
      onTempPassword.removeClass('hidden');
      onLoggedIn.addClass('hidden');
      onLoggedOut.addClass('hidden');
    } else if (authData) {
      // logged in
      onLoggedIn.removeClass('hidden');
      onLoggedOut.addClass('hidden');
      onTempPassword.addClass('hidden');
      $('.onLoggedIn h1').text(`Hello ${authData.password.email}`);

      fotos = fb.child(`users/${fb.getAuth().uid}/fotos`);
      fotos.on('child_added', function (snapshot) {
        var obj = {};
        obj[snapshot.key()] = snapshot.val();
        addPhotoToDom(obj);
      });

    } else {
      // on logged out
      onLoggedOut.removeClass('hidden');
      onLoggedIn.addClass('hidden');
      onTempPassword.addClass('hidden');
    }
  }

  initLoad = false;
});
