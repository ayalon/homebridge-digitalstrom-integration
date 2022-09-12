import axios, { Axios } from 'axios';
import { Logger, PlatformConfig } from 'homebridge';

export class DSSConnector {
  private appToken = '';
  private token = '';
  private client: Axios;

  constructor(public readonly log: Logger, public readonly config: PlatformConfig) {
    this.appToken = this.config.appToken;

    this.client = axios.create({
      baseURL: this.config.url + '/json',
    });
  }

  login() {
    this.client
      .get('/system/loginApplication?loginToken=' + this.appToken)
      .then((response) => {
        this.log.info(`dSS - Login digitalSTROM-Server '${response.request.host}' successful`);
        this.token = response.data.token;
      })
      .catch((error) => {
        this.log.error(`dSS - Login failed: ${error.message}`);
      });
  }
}
