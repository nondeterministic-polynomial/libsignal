import { SignalProtocolAddressType } from './'

export class SignalProtocolAddress implements SignalProtocolAddressType {
    static fromString(s: string): SignalProtocolAddress {
        // if (!s.match(/.*\.\d+/))
        // TODO: make test cases follow this new regex rule
        if (!s.match(/^([0-9a-fA-F]{24})\.([0-9a-fA-F]{24})$/)) {
            // this would fail test cases but since the system's deviceId is always an ObjectId so this is much better for the check
            throw new Error(`Invalid SignalProtocolAddress string: ${s}`)
        }
        const parts = s.split('.')
        return new SignalProtocolAddress(parts[0], parts[1])
    }

    private _name: string
    private _deviceId: string
    constructor(_name: string, _deviceId: string) {
        this._name = _name
        this._deviceId = _deviceId
    }

    // Readonly properties
    get name(): string {
        return this._name
    }

    get deviceId(): string {
        return this._deviceId
    }

    // Expose properties as fuynctions for compatibility
    getName(): string {
        return this._name
    }

    getDeviceId(): string {
        return this._deviceId
    }

    toString(): string {
        return `${this._name}.${this._deviceId}`
    }

    equals(other: SignalProtocolAddressType): boolean {
        return other.name === this._name && other.deviceId === this._deviceId
    }
}
