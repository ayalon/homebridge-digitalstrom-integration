import { Accessory, Service, Characteristic } from 'homebridge';
import Device from '../accessory';

export default class Device extends Accessory {
  zoneID: any;
  zoneName: any;
  scenePresets: any;

  constructor(homebridge: any, device: any, category: any) {
    super(homebridge, device, category);

    this.zoneID = device.zoneID;
    this.zoneName = device.zoneName;
    this.scenePresets = scenePresets;

    // Initialize service
    this.platformAccessory.getService(this.Service.AccessoryInformation)
      .setCharacteristic(this.Characteristic.Model, this.device.hwInfo || 'none')
      .setCharacteristic(this.Characteristic.HardwareRevision, (this.device.productRevision).toString());

    // Initialize event's
    this.platform.dSS
      .on('callScene', this.callSceneEvent.bind(this));
  }

  // Define getter/setter
  get device() {
    return this.accessory;
  }

  get id() {
    return `DE-${this.device.dSUID}`;
  }

  get name() {
    return `${this.i18n(this.device.zoneName)}-${this.device.name}`;
  }

  identifyEvent(paired: any, callback: any) {
    this.dssRequest('/device/blink', () => {
      this.log.info(`${this.logPrefix} identified`);
      callback();
    });
  }

  isMySceneEvent(event: any) {
    return event.source.isDevice && event.source.dSUID === this.device.dSUID;
  }

  getOnState(callback: any) {
    this.dssRequest('/device/getOutputValue?offset=0', result => {
      this.state = result.value > 0;
      this.log.debug(`${this.logPrefix} getOnState: ${this.state}`);
      callback(null, this.state);
    });
  }

  setOnState(value: any, callback: any) {
    this.state = value ? true : false;
    this.dssRequest(`/device/turn${this.state ? 'On' : 'Off'}`, () => {
      this.log.info(`${this.logPrefix} setOnState: ${this.state}`);
      callback(null);
    });
  }

  dssRequest(url: string, callback: any) {
    const _url = (url.indexOf('?') < 0 ? url + '?' : url + '&') + 'dsid=' + this.device.id;
    return super.dssRequest(_url, callback);
  }
}

const scenePresets = {
  '13': 'Off',
  '14': 'On',
};
