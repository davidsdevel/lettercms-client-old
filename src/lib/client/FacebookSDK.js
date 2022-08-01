export default class FacebookSDK {
  static init() {
    let js;
    const fjs = document.getElementsByTagName('script')[0];

    if (!document.getElementById('facebook-jssdk')) {
      js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/es_LA/sdk.js';
      js.defer = true;

      fjs.parentNode.insertBefore(js, fjs);
    }

    if (!window.FB) {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: '337231497026333',
          xfbml: true,
          autoLogAppEvents: true,
          version: 'v4.0',
        });
        window.FB.AppEvents.logPageView();
      };
    } else {
      window.FB.XFBML.parse();
    }
  }
}