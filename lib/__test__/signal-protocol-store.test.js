"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const signal_protocol_address_1 = require("../signal-protocol-address");
const storage_type_1 = require("./storage-type");
const Internal = __importStar(require("../internal"));
const utils_1 = require("../__test-utils__/utils");
const types_1 = require("../types");
describe('SignalProtocolStore', function () {
    const store = new storage_type_1.SignalProtocolStore();
    const registrationId = 1337;
    const identityKey = {
        pubKey: Internal.crypto.getRandomBytes(33),
        privKey: Internal.crypto.getRandomBytes(32),
    };
    beforeAll(() => __awaiter(this, void 0, void 0, function* () {
        store.put('registrationId', registrationId);
        store.put('identityKey', identityKey);
    }));
    const keyPairPromise = Internal.crypto.createKeyPair();
    //     testIdentityKeyStore(store, registrationId, identityKey);
    describe('IdentityKeyStore', function () {
        const number = '+5558675309';
        const address = new signal_protocol_address_1.SignalProtocolAddress('+5558675309', '1');
        describe('getLocalRegistrationId', function () {
            test('retrieves my registration id', () => __awaiter(this, void 0, void 0, function* () {
                const reg = yield store.getLocalRegistrationId();
                expect(reg).toBe(registrationId);
            }));
        });
        describe('getIdentityKeyPair', function () {
            test('retrieves my identity key', () => __awaiter(this, void 0, void 0, function* () {
                const key = yield store.getIdentityKeyPair();
                expect(key).toBeDefined();
                if (key) {
                    // we know we get here by previous assertion
                    (0, utils_1.assertEqualArrayBuffers)(key.pubKey, identityKey.pubKey);
                    (0, utils_1.assertEqualArrayBuffers)(key.privKey, identityKey.privKey);
                }
            }));
        });
        describe('saveIdentity', function () {
            test('stores identity keys', () => __awaiter(this, void 0, void 0, function* () {
                const testKey = yield keyPairPromise;
                yield store.saveIdentity(address.toString(), testKey.pubKey);
                const key = yield store.loadIdentityKey(number);
                expect(key).toBeDefined();
                if (key) {
                    (0, utils_1.assertEqualArrayBuffers)(key, testKey.pubKey);
                }
            }));
        });
        describe('isTrustedIdentity', function () {
            test('returns true if a key is trusted', () => __awaiter(this, void 0, void 0, function* () {
                const testKey = yield keyPairPromise;
                yield store.saveIdentity(address.toString(), testKey.pubKey);
                const trusted = yield store.isTrustedIdentity(number, testKey.pubKey, types_1.Direction.RECEIVING);
                expect(trusted).toBeTruthy();
            }));
            test('returns false if a key is untrusted', () => __awaiter(this, void 0, void 0, function* () {
                const testKey = yield keyPairPromise;
                const newIdentity = Internal.crypto.getRandomBytes(33);
                yield store.saveIdentity(address.toString(), testKey.pubKey);
                const trusted = yield store.isTrustedIdentity(number, newIdentity, types_1.Direction.RECEIVING);
                expect(trusted).toBeFalsy();
            }));
        });
    });
    //    testPreKeyStore(store);
    describe('PreKeyStore', function () {
        const number = '+5558675309';
        describe('storePreKey', function () {
            test('stores prekeys', () => __awaiter(this, void 0, void 0, function* () {
                const testKey = yield keyPairPromise;
                const address = new signal_protocol_address_1.SignalProtocolAddress(number, '1');
                yield store.storePreKey(address.toString(), testKey);
                const key = yield store.loadPreKey(address.toString());
                expect(key).toBeDefined();
                if (key) {
                    (0, utils_1.assertEqualArrayBuffers)(key.pubKey, testKey.pubKey);
                    (0, utils_1.assertEqualArrayBuffers)(key.privKey, testKey.privKey);
                }
            }));
        });
        describe('loadPreKey', function () {
            test('returns prekeys that exist', () => __awaiter(this, void 0, void 0, function* () {
                const testKey = yield keyPairPromise;
                const address = new signal_protocol_address_1.SignalProtocolAddress(number, '1');
                yield store.storePreKey(address.toString(), testKey);
                const key = yield store.loadPreKey(address.toString());
                expect(key).toBeDefined();
                if (key) {
                    (0, utils_1.assertEqualArrayBuffers)(key.pubKey, testKey.pubKey);
                    (0, utils_1.assertEqualArrayBuffers)(key.privKey, testKey.privKey);
                }
            }));
            test('returns undefined for prekeys that do not exist', () => __awaiter(this, void 0, void 0, function* () {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const address = new signal_protocol_address_1.SignalProtocolAddress(number, '2');
                const key = yield store.loadPreKey('2');
                expect(key).toBeUndefined();
            }));
        });
        describe('removePreKey', function () {
            test('deletes prekeys', () => __awaiter(this, void 0, void 0, function* () {
                const testKey = yield keyPairPromise;
                const address = new signal_protocol_address_1.SignalProtocolAddress(number, '2');
                yield store.storePreKey(address.toString(), testKey);
                yield store.removePreKey(address.toString());
                const key = yield store.loadPreKey(address.toString());
                expect(key).toBeUndefined();
            }));
        });
    });
    describe('SignedPreKeyStore', function () {
        describe('storeSignedPreKey', function () {
            test('stores signed prekeys', () => __awaiter(this, void 0, void 0, function* () {
                const testKey = yield keyPairPromise;
                yield store.storeSignedPreKey(3, testKey);
                const key = yield store.loadSignedPreKey(3);
                expect(key).toBeDefined();
                if (key) {
                    (0, utils_1.assertEqualArrayBuffers)(key.pubKey, testKey.pubKey);
                    (0, utils_1.assertEqualArrayBuffers)(key.privKey, testKey.privKey);
                }
            }));
        });
        describe('loadSignedPreKey', function () {
            test('returns prekeys that exist', () => __awaiter(this, void 0, void 0, function* () {
                const testKey = yield keyPairPromise;
                yield store.storeSignedPreKey(1, testKey);
                const key = yield store.loadSignedPreKey(1);
                expect(key).toBeDefined();
                if (key) {
                    (0, utils_1.assertEqualArrayBuffers)(key.pubKey, testKey.pubKey);
                    (0, utils_1.assertEqualArrayBuffers)(key.privKey, testKey.privKey);
                }
            }));
            test('returns undefined for prekeys that do not exist', () => __awaiter(this, void 0, void 0, function* () {
                const testKey = yield keyPairPromise;
                yield store.storeSignedPreKey(1, testKey);
                const key = yield store.loadSignedPreKey(2);
                expect(key).toBeUndefined();
            }));
        });
        describe('removeSignedPreKey', function () {
            test('deletes signed prekeys', () => __awaiter(this, void 0, void 0, function* () {
                const testKey = yield keyPairPromise;
                yield store.storeSignedPreKey(4, testKey);
                yield store.removeSignedPreKey(4); //  testKey)
                const key = yield store.loadSignedPreKey(4);
                expect(key).toBeUndefined();
            }));
        });
    });
    //testSessionStore
    describe('SessionStore', function () {
        const address = new signal_protocol_address_1.SignalProtocolAddress('+5558675309', '1');
        const number = '+5558675309';
        const testRecord = 'an opaque string';
        describe('storeSession', function () {
            // ...this used to store sessions encoded as array buffers, but the SDK
            // always stores them as strings. Changed the tests accordingly
            test('stores sessions -- see comment in code', () => __awaiter(this, void 0, void 0, function* () {
                yield store.storeSession(address.toString(), testRecord);
                const record = yield store.loadSession(address.toString());
                expect(record).toBeDefined();
                if (record) {
                    expect(testRecord).toStrictEqual(record);
                }
            }));
        });
        describe('loadSession', function () {
            test('loadSession returns sessions that exist', () => __awaiter(this, void 0, void 0, function* () {
                const address = new signal_protocol_address_1.SignalProtocolAddress(number, '1');
                const testRecord = 'an opaque string';
                // const enc = new TextEncoder()
                yield store.storeSession(address.toString(), testRecord);
                const record = yield store.loadSession(address.toString());
                expect(record).toBeDefined();
                expect(record).toStrictEqual(testRecord);
            }));
            test('returns undefined for sessions that do not exist', () => __awaiter(this, void 0, void 0, function* () {
                const address = new signal_protocol_address_1.SignalProtocolAddress(number, '2');
                const record = yield store.loadSession(address.toString());
                expect(record).toBeUndefined();
            }));
        });
        describe('removeSession', function () {
            test('deletes sessions', () => __awaiter(this, void 0, void 0, function* () {
                const address = new signal_protocol_address_1.SignalProtocolAddress(number, '1');
                // const enc = new TextEncoder()
                yield store.storeSession(address.toString(), testRecord);
                yield store.removeSession(address.toString());
                const record = yield store.loadSession(address.toString());
                expect(record).toBeUndefined();
            }));
        });
        describe('removeAllSessions', function () {
            test('removes all sessions for a number', () => __awaiter(this, void 0, void 0, function* () {
                const devices = ['1', '2', '3'].map(function (deviceId) {
                    const address = new signal_protocol_address_1.SignalProtocolAddress(number, deviceId);
                    return address.toString();
                });
                yield devices.forEach(function (encodedNumber) {
                    // const enc = new TextEncoder()
                    store.storeSession(encodedNumber, testRecord + encodedNumber);
                });
                yield store.removeAllSessions(number);
                const records = yield Promise.all(devices.map(store.loadSession.bind(store)));
                for (const i in records) {
                    expect(records[i]).toBeUndefined();
                }
            }));
        });
    });
});
