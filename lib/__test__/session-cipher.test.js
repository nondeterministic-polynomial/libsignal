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
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
const session_cipher_1 = require("../session-cipher");
const session_builder_1 = require("../session-builder");
const utils_1 = require("../__test-utils__/utils");
const storage_type_1 = require("./storage-type");
const signal_protocol_address_1 = require("../signal-protocol-address");
const session_record_1 = require("../session-record");
const testvectors_1 = require("./testvectors");
const Internal = __importStar(require("../internal"));
const utils = __importStar(require("../helpers"));
const libsignal_protocol_protobuf_ts_1 = require("@privacyresearch/libsignal-protocol-protobuf-ts");
const session_types_1 = require("../session-types");
const tv = (0, testvectors_1.TestVectors)();
const store = new storage_type_1.SignalProtocolStore();
const registrationId = 1337;
const address = new signal_protocol_address_1.SignalProtocolAddress('foo', '1');
const sessionCipher = new session_cipher_1.SessionCipher(store, address.toString());
const record = new session_record_1.SessionRecord(registrationId);
const session = {
    registrationId: registrationId,
    currentRatchet: {
        rootKey: new ArrayBuffer(32),
        lastRemoteEphemeralKey: new ArrayBuffer(32),
        previousCounter: 0,
    },
    indexInfo: {
        baseKey: new ArrayBuffer(32),
        baseKeyType: session_types_1.BaseKeyType.OURS,
        remoteIdentityKey: new ArrayBuffer(32),
        closed: -1,
    },
    oldRatchetList: [],
    chains: {},
};
record.updateSessionState(session);
const prep = store.storeSession(address.toString(), record.serialize());
test('getRemoteRegistrationId, when an open record exists, returns a valid registrationId', () => __awaiter(void 0, void 0, void 0, function* () {
    yield prep;
    const value = yield sessionCipher.getRemoteRegistrationId();
    expect(value).toBe(registrationId);
}));
test('getRemoteRegistrationId, when a record does not exist, returns undefined', () => __awaiter(void 0, void 0, void 0, function* () {
    yield prep;
    const sessionCipher = new session_cipher_1.SessionCipher(store, 'bar.1');
    const value = yield sessionCipher.getRemoteRegistrationId();
    expect(value).toBeUndefined();
}));
test('hasOpenSession returns true', () => __awaiter(void 0, void 0, void 0, function* () {
    yield prep;
    const value = yield sessionCipher.hasOpenSession();
    expect(value).toBeTruthy();
}));
it('hasOpenSession: no open session exists returns false', () => __awaiter(void 0, void 0, void 0, function* () {
    yield prep;
    const address = new signal_protocol_address_1.SignalProtocolAddress('bar', '1');
    const sessionCipher = new session_cipher_1.SessionCipher(store, address.toString());
    const record = new session_record_1.SessionRecord();
    yield store.storeSession(address.toString(), record.serialize());
    const value = yield sessionCipher.hasOpenSession();
    expect(value).toBeFalsy();
}));
test('hasOpenSession: when there is no session returns false', () => __awaiter(void 0, void 0, void 0, function* () {
    yield prep;
    const address = new signal_protocol_address_1.SignalProtocolAddress('baz', '1');
    const sessionCipher = new session_cipher_1.SessionCipher(store, address.toString());
    const value = yield sessionCipher.hasOpenSession();
    expect(value).toBeFalsy();
}));
//----------------------------------------------------------------------------------------------------
function setupReceiveStep(store, data, privKeyQueue) {
    return __awaiter(this, void 0, void 0, function* () {
        if (data.newEphemeralKey !== undefined) {
            privKeyQueue.push(data.newEphemeralKey);
        }
        if (data.ourIdentityKey === undefined) {
            return Promise.resolve();
        }
        const keyPair = yield Internal.crypto.createKeyPair(data.ourIdentityKey);
        store.put('identityKey', keyPair);
        const signedKeyPair = yield Internal.crypto.createKeyPair(data.ourSignedPreKey);
        yield store.storeSignedPreKey(data.signedPreKeyId, signedKeyPair);
        if (data.ourPreKey !== undefined) {
            const keyPair = yield Internal.crypto.createKeyPair(data.ourPreKey);
            yield store.storePreKey(data.preKeyId, keyPair);
        }
    });
}
function getPaddedMessageLength(messageLength) {
    const messageLengthWithTerminator = messageLength + 1;
    let messagePartCount = Math.floor(messageLengthWithTerminator / 160);
    if (messageLengthWithTerminator % 160 !== 0) {
        messagePartCount++;
    }
    return messagePartCount * 160;
}
function pad(plaintext) {
    const paddedPlaintext = new Uint8Array(getPaddedMessageLength(plaintext.byteLength + 1) - 1);
    paddedPlaintext.set(new Uint8Array(plaintext));
    paddedPlaintext[plaintext.byteLength] = 0x80;
    return utils.uint8ArrayToArrayBuffer(paddedPlaintext);
}
function unpad(paddedPlaintext) {
    const ppt = new Uint8Array(paddedPlaintext);
    for (let i = ppt.length - 1; i >= 0; i--) {
        if (ppt[i] == 0x80) {
            const plaintext = new Uint8Array(i);
            plaintext.set(ppt.subarray(0, i));
            return plaintext;
        }
        else if (ppt[i] !== 0x00) {
            throw new Error('Invalid padding');
        }
    }
    throw new Error('Invalid data: input empty or all 0x00s');
}
function doReceiveStep(store, data, privKeyQueue, address) {
    return __awaiter(this, void 0, void 0, function* () {
        yield setupReceiveStep(store, data, privKeyQueue);
        const sessionCipher = new session_cipher_1.SessionCipher(store, address);
        try {
            let plaintext;
            if (data.type == libsignal_protocol_protobuf_ts_1.IncomingPushMessageSignal_Type.CIPHERTEXT) {
                const dWS = new Uint8Array(yield sessionCipher.decryptWhisperMessage(data.message));
                plaintext = yield unpad(dWS);
            }
            else if (data.type == libsignal_protocol_protobuf_ts_1.IncomingPushMessageSignal_Type.PREKEY_BUNDLE) {
                const dPKWS = new Uint8Array(yield sessionCipher.decryptPreKeyWhisperMessage(data.message));
                plaintext = yield unpad(dPKWS);
            }
            else {
                throw new Error('Unknown data type in test vector');
            }
            const content = libsignal_protocol_protobuf_ts_1.PushMessageContentCompatible.decode(plaintext);
            if (data.expectTerminateSession) {
                if (content.flags == libsignal_protocol_protobuf_ts_1.PushMessageContent_Flags.END_SESSION) {
                    return true;
                }
                else {
                    return false;
                }
            }
            return content.body === data.expectedSmsText;
        }
        catch (e) {
            if (data.expectException) {
                return true;
            }
            console.error(e);
            throw e;
        }
    });
}
function setupSendStep(store, data, privKeyQueue) {
    return __awaiter(this, void 0, void 0, function* () {
        if (data.registrationId !== undefined) {
            store.put('registrationId', data.registrationId);
        }
        if (data.ourBaseKey !== undefined) {
            privKeyQueue.push(data.ourBaseKey);
        }
        if (data.ourEphemeralKey !== undefined) {
            privKeyQueue.push(data.ourEphemeralKey);
        }
        if (data.ourIdentityKey !== undefined) {
            try {
                const keyPair = yield Internal.crypto.createKeyPair(data.ourIdentityKey);
                store.put('identityKey', keyPair);
            }
            catch (e) {
                console.error({ e });
            }
        }
        return Promise.resolve();
    });
}
function doSendStep(store, data, privKeyQueue, address) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        yield setupSendStep(store, data, privKeyQueue);
        try {
            if (data.getKeys !== undefined) {
                const deviceObject = {
                    encodedNumber: address.toString(),
                    identityKey: data.getKeys.identityKey,
                    preKey: data.getKeys.devices[0].preKey,
                    signedPreKey: data.getKeys.devices[0].signedPreKey,
                    registrationId: data.getKeys.devices[0].registrationId,
                };
                const builder = new session_builder_1.SessionBuilder(store, address);
                yield builder.processPreKey(deviceObject);
            }
            const proto = libsignal_protocol_protobuf_ts_1.PushMessageContentCompatible.fromJSON({});
            if (data.endSession) {
                proto.flags = libsignal_protocol_protobuf_ts_1.PushMessageContent_Flags.END_SESSION;
            }
            else {
                proto.body = data.smsText;
            }
            const sessionCipher = new session_cipher_1.SessionCipher(store, address);
            const pt = libsignal_protocol_protobuf_ts_1.PushMessageContentCompatible.encode(proto).finish();
            if (data.endSession) {
                //      console.log(`END SESSION PROTO`, { proto, pt })
            }
            const msg = yield sessionCipher.encrypt(pad(utils.uint8ArrayToArrayBuffer(pt)));
            const msgbody = new Uint8Array(utils.binaryStringToArrayBuffer(msg.body.substring(1)));
            // NOTE: equivalent protobuf objects can have different binary encodings and still be accepted by our
            // parsers to produce quivalent objects.  Instead of testing binary identity of the entire
            // protobuf message, we parse it and check field-level identity.
            let res;
            if (msg.type === 1) {
                res = utils.isEqual(data.expectedCiphertext, utils.binaryStringToArrayBuffer(msg.body || ''));
            }
            else {
                if (new Uint8Array(data.expectedCiphertext)[0] !== ((_a = msg.body) === null || _a === void 0 ? void 0 : _a.charCodeAt(0))) {
                    throw new Error('Bad version byte');
                }
                //  console.log({
                //      expectedCiphertext: data.expectedCiphertext,
                //      msg: msgbody,
                //  })
                const ourpkwmsg = libsignal_protocol_protobuf_ts_1.PreKeyWhisperMessage.decode(msgbody);
                const datapkwmsg = libsignal_protocol_protobuf_ts_1.PreKeyWhisperMessage.decode(new Uint8Array(data.expectedCiphertext).slice(1));
                (0, utils_1.assertEqualUint8Arrays)(datapkwmsg.baseKey, ourpkwmsg.baseKey);
                (0, utils_1.assertEqualUint8Arrays)(datapkwmsg.identityKey, ourpkwmsg.identityKey);
                expect(datapkwmsg.preKeyId).toStrictEqual(ourpkwmsg.preKeyId);
                expect(datapkwmsg.signedPreKeyId).toStrictEqual(ourpkwmsg.signedPreKeyId);
                const ourencrypted = libsignal_protocol_protobuf_ts_1.WhisperMessage.decode(ourpkwmsg.message.slice(1, ourpkwmsg.message.length - 8));
                const dataencrypted = libsignal_protocol_protobuf_ts_1.WhisperMessage.decode(datapkwmsg.message.slice(1, datapkwmsg.message.length - 8));
                expect(ourencrypted.counter).toBe(dataencrypted.counter);
                expect(ourencrypted.previousCounter).toBe(dataencrypted.previousCounter);
                (0, utils_1.assertEqualUint8Arrays)(ourencrypted.ephemeralKey, dataencrypted.ephemeralKey);
                (0, utils_1.assertEqualUint8Arrays)(ourencrypted.ciphertext, dataencrypted.ciphertext);
                const expected = libsignal_protocol_protobuf_ts_1.PreKeyWhisperMessage.encode(datapkwmsg).finish();
                if (!utils.isEqual(utils.uint8ArrayToArrayBuffer(expected), utils.binaryStringToArrayBuffer(msg.body.substring(1)))) {
                    throw new Error('Result does not match expected ciphertext');
                }
                res = true;
            }
            if (data.endSession) {
                yield sessionCipher.closeOpenSessionForDevice();
                return res;
            }
            return res;
        }
        catch (e) {
            console.error(e, { store });
            throw e;
        }
    });
}
function getDescription(step) {
    const direction = step[0];
    const data = step[1];
    if (direction === 'receiveMessage') {
        if (data.expectTerminateSession) {
            return 'receive end session message';
        }
        else if (data.type === 3) {
            return 'receive prekey message ' + data.expectedSmsText;
        }
        else {
            return 'receive message ' + data.expectedSmsText;
        }
    }
    else if (direction === 'sendMessage') {
        if (data.endSession) {
            return 'send end session message';
        }
        else if (data.ourIdentityKey) {
            return 'send prekey message ' + data.smsText;
        }
        else {
            return 'send message ' + data.smsText;
        }
    }
    return '';
}
tv.forEach(function (test) {
    describe(test.name, () => {
        const privKeyQueue = [];
        const origCreateKeyPair = Internal.crypto.createKeyPair.bind(Internal.crypto);
        beforeAll(function () {
            // Shim createKeyPair to return predetermined keys from
            // privKeyQueue instead of random keys.
            Internal.crypto.createKeyPair = function (privKey) {
                if (privKey !== undefined) {
                    return origCreateKeyPair(privKey);
                }
                if (privKeyQueue.length == 0) {
                    throw new Error('Out of private keys');
                }
                else {
                    const privKey = privKeyQueue.shift();
                    return Internal.crypto.createKeyPair(privKey).then(function (keyPair) {
                        if (!privKey ||
                            utils.arrayBufferToString(keyPair.privKey) != utils.arrayBufferToString(privKey))
                            throw new Error('Failed to rederive private key!');
                        else
                            return keyPair;
                    });
                }
            };
        });
        afterAll(function () {
            Internal.crypto.createKeyPair = origCreateKeyPair;
            if (privKeyQueue.length != 0) {
                throw new Error('Leftover private keys');
            }
        });
        const store = new storage_type_1.SignalProtocolStore();
        const address = signal_protocol_address_1.SignalProtocolAddress.fromString('SNOWDEN.1');
        test.vectors.forEach(function (step) {
            it(getDescription(step), () => __awaiter(this, void 0, void 0, function* () {
                let doStep;
                if (step[0] === 'receiveMessage') {
                    doStep = doReceiveStep;
                }
                else if (step[0] === 'sendMessage') {
                    doStep = doSendStep;
                }
                else {
                    throw new Error('Invalid test');
                }
                yield expect(doStep(store, step[1], privKeyQueue, address)).resolves.toBeTruthy(); //.then(assert).then(done, done)
            }));
        });
    });
});
describe('key changes', function () {
    const ALICE_ADDRESS = new signal_protocol_address_1.SignalProtocolAddress('+14151111111', '1');
    const BOB_ADDRESS = new signal_protocol_address_1.SignalProtocolAddress('+14152222222', '1');
    const originalMessage = utils.binaryStringToArrayBuffer("L'homme est condamné à être libre");
    const aliceStore = new storage_type_1.SignalProtocolStore();
    const bobStore = new storage_type_1.SignalProtocolStore();
    const bobPreKeyId = 1337;
    const bobSignedKeyId = 1;
    const bobSessionCipher = new session_cipher_1.SessionCipher(bobStore, ALICE_ADDRESS);
    beforeAll(function (done) {
        Promise.all([aliceStore, bobStore].map(utils_1.generateIdentity))
            .then(function () {
            return (0, utils_1.generatePreKeyBundle)(bobStore, bobPreKeyId, bobSignedKeyId);
        })
            .then((preKeyBundle) => {
            const builder = new session_builder_1.SessionBuilder(aliceStore, BOB_ADDRESS);
            return builder
                .processPreKey(preKeyBundle)
                .then(function () {
                const aliceSessionCipher = new session_cipher_1.SessionCipher(aliceStore, BOB_ADDRESS);
                return aliceSessionCipher.encrypt(originalMessage);
            })
                .then(function (ciphertext) {
                return bobSessionCipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary');
            })
                .then(function () {
                done();
            })
                .catch(done);
        });
    });
    describe("When bob's identity changes", function () {
        let messageFromBob;
        beforeAll(() => __awaiter(this, void 0, void 0, function* () {
            const ciphertext = yield bobSessionCipher.encrypt(originalMessage);
            messageFromBob = ciphertext;
            yield (0, utils_1.generateIdentity)(bobStore);
            const idK = bobStore.get('identityKey', undefined);
            const pubK = idK.pubKey;
            yield aliceStore.saveIdentity(BOB_ADDRESS.toString(), pubK);
        }));
        test('alice cannot encrypt with the old session', () => __awaiter(this, void 0, void 0, function* () {
            const aliceSessionCipher = new session_cipher_1.SessionCipher(aliceStore, BOB_ADDRESS);
            yield expect(() => __awaiter(this, void 0, void 0, function* () {
                yield aliceSessionCipher.encrypt(originalMessage);
            })).rejects.toThrow('Identity key changed');
        }));
        test('alice cannot decrypt from the old session', () => __awaiter(this, void 0, void 0, function* () {
            const aliceSessionCipher = new session_cipher_1.SessionCipher(aliceStore, BOB_ADDRESS);
            yield expect(() => __awaiter(this, void 0, void 0, function* () {
                yield aliceSessionCipher.decryptWhisperMessage(messageFromBob.body, 'binary');
            })).rejects.toThrow('Identity key changed');
        }));
    });
});
