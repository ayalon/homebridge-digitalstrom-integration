import { PlatformConfig } from 'homebridge';

export interface DSSConfig extends PlatformConfig {
    url: string;
    appToken: string;
    lang: string;
}
