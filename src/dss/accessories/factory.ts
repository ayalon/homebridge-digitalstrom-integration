import _ from 'lodash'
import { Accessory, Service, Characteristic } from 'homebridge'

import ApartmentScenes from './scenes/apartment-scenes'
import ZoneScenes from './scenes/zone-scenes'
import GroupScenes from './scenes/group-scenes'
import DeviceScenes from './scenes/device-scenes'
import DummyDevice from './devices/dummy-device'
import LightDevice from './devices/light-device'
import ShadeDevice from './devices/shade-device'
import EnergyMeter from './devices/energy-meter'

export default class Factory {
  homebridge: any
  platform: any
  log: any

  constructor(homebridge: any) {
    this.homebridge = homebridge
  }

  // Define getter/setter
  get platform() {
    return this.homebridge.platform
  }
  get log() {
    return this.homebridge.platform.log
  }

  createApartment(apartment: any) {
    let accessory: any

    // Create energyMeter-sensors
    // _.forEach(apartment.dSMeters, dSMeter => {
    //     accessory = new EnergyMeter(this.homebridge, dSMeter);
    //     this.log.debug(`Sensor - ${accessory.constructor.name} - ${accessory.displayName} (${accessory.id}) created`);
    //     this.platform.addAccessory(accessory);
    // });

    // Create apartment-scenes
    accessory = new ApartmentScenes(this.homebridge)

    this.log.debug(
      `Scene - ${accessory.constructor.name} - ${accessory.displayName} (${accessory.id}) created`
    )
    this.platform.addAccessory(accessory)

    for (let zoneID in apartment.zones) {
      const zone = apartment.zones[zoneID]
      const zoneName = zone.name

      // JMI: Unbenutze (17) ignorieren.
      if (zoneID == 17) {
        continue
      }

      // Create zone-scenes
      accessory = new ZoneScenes(this.homebridge, { zoneID, zoneName })

      // JMI: Zone ohne Namen
      if (accessory.accessory.zoneID == '65534') {
        continue
      }

      this.log.debug(
        `Scene - ${accessory.constructor.name} - ${accessory.displayName} (${accessory.id}) created`
      )
      this.platform.addAccessory(accessory)

      for (const groupID in zone.groups) {
        const group = zone.groups[groupID]
        if (group.devices.length == 0 || group.applicationType == 0) {
          continue
        }

        // Create group-scenes
        accessory = new GroupScenes(this.homebridge, {
          zoneID,
          zoneName,
          group,
        })

        // JMI: Joker ignorieren.
        if (accessory.accessory.group.color == 8) {
          continue
        }
      }

      this.log.debug(
        `Scene - ${accessory.constructor.name} - ${accessory.displayName} (${accessory.id}) created`
      )
      this.platform.addAccessory(accessory)
    }
    return apartment
  }

  createDevices(devices: any) {
    _.forEach(devices, (device) => {
      this.createDevice(device)
    })
  }

  createDevice(device: any) {
    let deviceAccessory: any, sceneAccessory: any

    const dSUID = device.dSUID
    const zoneID = device.zoneID
    const zoneName = (device.zoneName =
      this.platform.apartment.zones[zoneID].name)

    switch (true) {
      case device.hwInfo.includes('-TK'): // NOP - Push button interface (all)
        break
      case device.hwInfo.includes('GE-'): // lights (yellow-group)
        //deviceAccessory = new LightDevice(this.homebridge, device);
        break
      case device.hwInfo.includes('GR-'): // shades (gray-group)
        //deviceAccessory = new ShadeDevice(this.homebridge, device);
        break
      default:
        deviceAccessory = new DummyDevice(this.homebridge, device)
        this.log.warn(
          `Device - DummyDevice - ${deviceAccessory.name} (${device.hwInfo} Mode-${device.outputMode}) not implemented`
        )
    }
    if (deviceAccessory && !(deviceAccessory instanceof DummyDevice)) {
      // Create DeviceScenes
      let device = deviceAccessory
      sceneAccessory = new DeviceScenes(this.homebridge, {
        zoneID,
        zoneName,
        dSUID,
        device,
      })

      this.log.debug(
        `Device - ${deviceAccessory.constructor.name} - ${deviceAccessory.name} (${deviceAccessory.device.hwInfo} Mode-${deviceAccessory.device.outputMode}) created - ${deviceAccessory.id}`
      )

      // Add Accessories
      this.platform.addAccessory(deviceAccessory)
      this.platform.addAccessory(sceneAccessory)
    }

    return
  }
}
