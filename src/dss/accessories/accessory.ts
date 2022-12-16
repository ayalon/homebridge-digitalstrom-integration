import * as _ from 'lodash';
import * as i18n from 'i18n';
import { EventEmitter } from 'events';

export class Accessory extends EventEmitter {
    public scenePresets: object;
    public homebridge: any;
    public accessory: any;
    public UUID: string;
    public displayName: string;
    public logPrefix: string;
    public platformAccessory: any;
    public Service: any;
    public Characteristic: any;
    public CustomTypes: any;
    public ApplicationGroupsById: any;
    public ApplicationGroupsByName: any;

    constructor(homebridge: any, accessory: any, category: any) {
        super();

        // Initialize accessory
        this.scenePresets = {};
        this.homebridge = homebridge;
        this.accessory = accessory;
        this.UUID = homebridge.UUIDGen.generate(String(this.id));
        this.displayName = this.name;

        this.logPrefix = `${this.constructor.name} - ${this.name} (${this.id})`;

        if(!this.displayName) {
            this.displayName =  this.UUID;
        }

        // Initialize platformAccessory
        this.platformAccessory = this.platform.cachedAccessories[this.UUID] || new homebridge.PlatformAccessory(this.displayName, this.UUID, category);
        // New accessory is always reachable
        this.platformAccessory.updateReachability(true);

        // Initialize service
        this.platformAccessory.getService(this.Service.AccessoryInformation)
            .setCharacteristic(this.Characteristic.Manufacturer, "homebridge-digitalSTROM")
            .setCharacteristic(this.Characteristic.Name, this.name)
            .setCharacteristic(this.Characteristic.SerialNumber, this.id);

        // Initialize event's
        this.platformAccessory
            .on('identify', this.identifyEvent.bind(this));
    }

    // Define getter/setter
    public get platform(): any { return this.homebridge.platform }
    public get log(): any { return this.homebridge.platform.log }

    public get Service(): any { return this.homebridge.Service }
    public get Characteristic(): any { return this.homebridge.Characteristic }
    public get CustomTypes(): any { return this.homebridge.CustomTypes }
    public get ApplicationGroupsById(): any { return ApplicationGroups }
    public get ApplicationGroupsByName(): any { return _.invert(ApplicationGroups) }

    public get id(): any { throw Error('Subclass responsibility') }
    public get name(): any { throw Error('Subclass responsibility') }

    public identifyEvent(paired: any, callback: any): void {
        this.log.info(`Accessory - ${this.name} identified`);
        callback();
    }

    public refreshEvent(event: any): void {
        //! this.log.debug(`${this.logPrefix} Event  - refreshEvent received`);
    }
