"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signal_protocol_address_1 = require("../signal-protocol-address");
describe('SignalProtocolAddress', function () {
    const name = 'name';
    const deviceId = '42';
    const serialized = 'name.42';
    describe('getName', function () {
        test('returns the name', () => {
            const address = new signal_protocol_address_1.SignalProtocolAddress(name, '1');
            expect(address.getName()).toBe(name);
            expect(address.name).toBe(name);
        });
    });
    describe('getDeviceId', function () {
        test('returns the deviceId', () => {
            const address = new signal_protocol_address_1.SignalProtocolAddress(name, deviceId);
            expect(address.getDeviceId()).toBe(deviceId);
            expect(address.deviceId).toBe(deviceId);
        });
    });
    describe('toString', function () {
        test('returns the address', () => {
            const address = new signal_protocol_address_1.SignalProtocolAddress(name, deviceId);
            expect(address.toString()).toBe(serialized);
        });
    });
    describe('fromString', function () {
        test('throws on a bad inputs', () => {
            const bads = ['', null, {}];
            for (const bad of bads) {
                expect(() => {
                    // We are testing data that Typescript wouldn't allow
                    // because Javascript users might send it.
                    signal_protocol_address_1.SignalProtocolAddress.fromString(bad);
                }).toThrow();
            }
        });
        test('constructs the address', () => {
            const address = signal_protocol_address_1.SignalProtocolAddress.fromString(serialized);
            expect(address.getDeviceId()).toBe(deviceId);
            expect(address.deviceId).toBe(deviceId);
            expect(address.getName()).toBe(name);
            expect(address.name).toBe(name);
        });
    });
});
