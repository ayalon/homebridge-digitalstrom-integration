import axios, { AxiosInstance } from 'axios';
import {Logger, PlatformConfig} from 'homebridge';
import { DSSConfig } from './types/config';
import https from 'https';

export class DSSConnector {
  private appToken = '';
  private token = '';
  private config: DSSConfig;
  private client: AxiosInstance;
  private log: Logger;

  constructor(log: Logger, config: PlatformConfig) {
    this.log = log;

    this.config = config as DSSConfig;

    this.appToken = this.config.appToken;

    this.client = axios.create({
      baseURL: this.config.url + '/json',
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
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
