const axios = require('axios');

class SetuClient {
  static instance = null;

  constructor() {
    if (SetuClient.instance) {
      return SetuClient.instance;
    }
    this.token = null;
    this.tokenExpiry = null;
    this.clientId = process.env.SETU_CLIENT_ID;
    this.clientSecret = process.env.SETU_CLIENT_SECRET;
    this.oauthUrl = process.env.SETU_OAUTH_URL;
    this.scope = process.env.SETU_OAUTH_SCOPE;
    this.baseUrl = process.env.SETU_BASE_URL;
    SetuClient.instance = this;
  }

  async getToken() {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) { // Refresh 1 min before expiry
      return this.token;
    }
    try {
      const response = await axios.post(this.oauthUrl, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: this.scope
      });
      this.token = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      return this.token;
    } catch (error) {
      throw new Error('Failed to obtain OAuth token: ' + error.message);
    }
  }

  async request(method, url, data = null) {
    const token = await this.getToken();
    const config = {
      method,
      url: this.baseUrl + url,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    if (data) config.data = data;
    return axios(config);
  }
}

module.exports = SetuClient;