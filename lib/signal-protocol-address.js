"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalProtocolAddress = void 0;
class SignalProtocolAddress {
    constructor(_name, _deviceId) {
        this._name = _name;
        this._deviceId = _deviceId;
    }
    static fromString(s) {
        // if (!s.match(/.*\.\d+/))
        // TODO: make test cases follow this new regex rule
        if (!s.match(/^([0-9a-fA-F]{24})\.([0-9a-fA-F]{24})$/)) {
            // this would fail test cases but since the system's deviceId is always an ObjectId so this is much better for the check
            throw new Error(`Invalid SignalProtocolAddress string: ${s}`);
        }
        const parts = s.split('.');
        return new SignalProtocolAddress(parts[0], parts[1]);
    }
    // Readonly properties
    get name() {
        return this._name;
    }
    get deviceId() {
        return this._deviceId;
    }
    // Expose properties as fuynctions for compatibility
    getName() {
        return this._name;
    }
    getDeviceId() {
        return this._deviceId;
    }
    toString() {
        return `${this._name}.${this._deviceId}`;
    }
    equals(other) {
        return other.name === this._name && other.deviceId === this._deviceId;
    }
}
exports.SignalProtocolAddress = SignalProtocolAddress;
