const fetch = require('isomorphic-fetch');

/**
 * Facebook API
 *
 * @descrpition Limited class to handle Facebook API Graph, only get tokens and publish on a page
 *
 * @class
 *
 */
class FacebookAPI {
  /**
   * @constructor
   *
   * @param {Object<AppID, AppSecret>}
   */
  constructor(data) {
    this.appID = data.appID;
    this.appSecret = data.appSecret;
  }

  /**
   * Get Access Token
   *
   * @public
   *
   * @return {Promise<AccessToken>}
   */
  async getAccessToken() {
    try {
      const fetchToken = await fetch(`https://graph.facebook.com/oauth/access_token?client_id=${this.appID}&client_secret=${this.appSecret}&grant_type=client_credentials`);
      const { access_token: token } = await fetchToken.json();

      return Promise.resolve(token);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Get Long Live Access Token
   *
   * @description Exchange an access token by a long live access token
   * @public
   *
   * @param {String} shortLiveAccessToken
   *
   * @return {Promise<AccessToken>}
   *
   */
  async getLongLiveAccessToken(shortLiveAccessToken) {
    try {
      const req = await fetch(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appID}&client_secret=${this.appSecret}&fb_exchange_token=${shortLiveAccessToken}`);

      const { access_token: token } = await req.json();

      return Promise.resolve(token);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Get Page Access Token
   *
   * @description Exchange an access token by a Page Access Token
   * @public
   *
   * @param{String} accessToken
   * @param{String|Number} pageID
   *
   * @return {Promise<AccessToken>}
   *
   */
  async getPageAccessToken(accessToken, pageID) {
    try {
      const req = await fetch(`https://graph.facebook.com/${pageID}?fields=access_token&access_token=${accessToken}`);

      if (req.status >= 400) { return Promise.resolve('fetch-error'); }

      const { access_token: token } = await req.json();

      return Promise.resolve(token);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   *
   * Return {
   *    data: [
   *      {
   *        "name": "Facebook Page 1",
   *        "access_token": "{page-access-token-for-Page-1}",
   *        "id": "{page-1-id}"
   *      }
   *    ]
   *  }
   *
   * @return {Promise<Array>}
   *
   */
  async getUserPagesAccessTokens(accessToken, userID) {
    try {
      const req = await fetch(`https://graph.facebook.com/${userID}/accounts?fields=name,photo&access_token=${accessToken}`);

      if (req.status >= 400) { return Promise.resolve('fetch-error'); }

      const { data } = await req.json();

      return Promise.resolve(data);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async publishOnPage(pageAccessToken, pageID, { message, link }) {
    try {
      const req = await fetch(`https://graph.facebook.com/${pageID}/feed`, {
        method: 'POST',
        body: `message=${message}${link ? `&link=${link}` : ''}&access_token=${pageAccessToken}`,
      });

      if (req.status >= 400) { return Promise.resolve('fetch-error'); }

      const { id } = await req.json();
      if (id) { return Promise.resolve('success'); }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async schedulePost(pageAccessToken, pageID, { message, date, link }) {
    try {
      const req = await fetch(`https://graph.facebook.com/${pageID}/feed`, {
        method: 'POST',
        body: `published=false&message=${message}${link ? `&link=${link}` : ''}&access_token=${pageAccessToken}&scheduled_publish_time=${date}`,
      });

      if (req.status >= 400) { return Promise.resolve('fetch-error'); }

      const { id } = await req.json();
      if (id) { return Promise.resolve('success'); }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

module.exports = FacebookAPI;
