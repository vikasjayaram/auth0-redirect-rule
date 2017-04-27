# Redirect Rule: Simple Example with a Webtask

This sample demonstrates a minimal implementation of the `redirect` protocol. It contains an Auth0 [rule](http://auth0.com/docs/rules) that will redirect the user to a simple email consent form:

If the user checks the enters the email on this form and clicks the **Submit** button, they are then redirected back to Auth0 to complete the authentication flow. On future logins they will no longer be prompted since the consent action is stored in their user profile.

The email consent form is hosted using a simple [Webtask](https://webtask.io/) that you can easily modify and provision and use in your version of the rule.

## Rule Setup

To try this rule out with your own Auth0 account using an existing instance of the consent form webtask, follow these steps:

1. Create a new Auth0 rule using the contents of the [`rule.js`](rule.js) script.
1. In your account's [Rules](https://manage.auth0.com/#/rules) screen, add a setting that has the key `EMAIL_FORM_URL` and the following value:  
  ```
  https://vjayaram.au.webtask.io/consent
  ```

  > The above URL renders a form that we've hosted for you using a webtask, but in the [Consent Form Setup](#consent-form-setup) section below we'll show how to host your own version of this form (with your own URL) that you can enhance for your specific use case.

1. If you have any other active rules, make sure they account for the fact that they could be executed during a redirect protocol continuation (i.e. when `context.protocol === 'redirect-callback'`). For more information, see the [Redirect protocol in rules](https://auth0.com/docs/protocols#redirect-protocol-in-rules) docs page.

1. Try the rule by following the steps in the next section.

## Run the Rule

Try the rule with one of the apps in your account. A simple way to do this is to add `http://jwt.io` as an **Allowed Callback URL** to your app and browse to the following link:  
```
https://AUTH0_DOMAIN/authorize?response_type=token&scope=openid%20profile&client_id=CLIENT_ID&redirect_uri=http://jwt.io&connection=CONNECTION
```

where:
* `AUTH0_DOMAIN` is your Auth0 account's tenant domain (e.g. `your-account.auth0.com`)
* `CLIENT_ID` is the **Client ID** of your app
* `CONNECTION` is the name of the Auth0 Connection you'd like to log in with (e.g. `Username-Password-Authentication`)


If you don't agree to the consent form, but still submit, you will still end up at http://jwt.io, but the URL will contain the authorization error generated by the rule:

```
http://jwt.io/#error=unauthorized&error_description=User%20did%20not%20consent!
```

## Email Form Setup

If you'd like to play around with your own implementation of the consent form webtask, you can host your own version of the [`webtask.js`](webtask.js) script by following these steps:

1. If you haven't done so already, install the Webtask CLI and configure a container for your Auth0 account by following the steps in the [Webtasks](https://manage.auth0.com/#/account/webtasks) tab of your account settings.
1. While you're in the same directory as the `webtask.js` script, run the following command to create your webtask instance:  
  ```bash
  $ wt create -n consent webtask.js -p "WEBTASK_PROFILE"
  ```

  where:
  * `WEBTASK_PROFILE` is the name of the profile you set up in the previous step

  The output of this command will contain the URL of your new webtask.

1. In your account's [Rules](https://manage.auth0.com/#/rules) screen, delete the existing `EMAIL_FORM_URL` setting and recreate it with the value that is the URL that was output in the previous step.

1. Try the rule along with your instance of the webtask by the following the steps in the [Run the Rule](#rule-the-rule) section.

1. If you want make changes to the webtask, you can upload a new version simply by running the same `wt create` command you did before.

### Data Integrity

As stated, this is a very basic example of using a redirect rule to invoke a consent form. The `email` field (which has the value of `email`) that is being passed back to the Auth0 redirect rule is in plain text.

There are scenarios where you need better assurances of the integrity of the data being returned by the external website (in this case the webtask). For example, if you want to be sure that the data truly came from a trusted source, then it should be signed. If the data is sensitive, then it should be encrypted. A good mechanism for doing this is to use a [JWT](http://jwt.io/) (JSON Web Token). You can build a JWT with claims (that you can optionally encrypt) and then sign it with either a secret shared with your Auth0 rule or with a private key, whose public key is known by the rule. The rule can then verify that the claims are legit and decrypt them, if necessary.
