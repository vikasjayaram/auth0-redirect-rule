function redirectToEmailForm (user, context, callback) {
  var hasEmail = (user.email || user.emails);

  // redirect to consent form if user has not yet consented
  if (!hasEmail && context.protocol !== 'redirect-callback') {
    var auth0Domain = auth0.baseUrl.match(/([^:]*:\/\/)?([^\/]+\.[^\/]+)/)[2];

    context.redirect = {
      url: configuration.EMAIL_FORM_URL +
        (configuration.EMAIL_FORM_URL.indexOf('?') === -1 ? '?' : '&') +
        'auth0_domain=' + encodeURIComponent(auth0Domain)
    };
  }

  if (context.protocol === 'redirect-callback') {
    if (context.request.body.email) {
      user.email = context.request.body.email;
      user.app_metadata = user.app_metadata || {};

      var request = require('request@2.56.0');
      var userApiUrl = auth0.baseUrl + '/users';
      request.patch({
        url: userApiUrl + '/' + user.user_id,
        headers: {
          Authorization: 'Bearer ' + auth0.accessToken
        },
        json: { email: context.request.body.email}
      }, function(err, response, body) {
        if (response.statusCode >= 400) {
          callback(new Error('Error updating account: ' + response.statusMessage));  
        } else {
          callback(null, user, context);
        }           
      });
    } else {
      callback(new UnauthorizedError('User did not provide Email!'));
    }
  }

  callback(null, user, context);
}