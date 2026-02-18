import { SignalProtocolAddressType } from './';
export declare class SignalProtocolAddress implements SignalProtocolAddressType {
    static fromString(s: string): SignalProtocolAddress;
    private _name;
    private _deviceId;
    constructor(_name: string, _deviceId: string);
    get name(): string;
    get deviceId(): string;
    getName(): string;
    getDeviceId(): string;
    toString(): string;
    equals(other: SignalProtocolAddressType): boolean;
}
