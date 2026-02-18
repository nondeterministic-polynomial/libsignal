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
const session_builder_1 = require("../session-builder");
const session_cipher_1 = require("../session-cipher");
const session_record_1 = require("../session-record");
const signal_protocol_address_1 = require("../signal-protocol-address");
const storage_type_1 = require("./storage-type");
const utils_1 = require("../__test-utils__/utils");
const utils = __importStar(require("../helpers"));
const key_helper_1 = require("../key-helper");
jest.setTimeout(30000);
const ALICE_ADDRESS = new signal_protocol_address_1.SignalProtocolAddress('+14151111111', '1');
const BOB_ADDRESS = new signal_protocol_address_1.SignalProtocolAddress('+14152222222', '1');
describe('basic prekey v3', function () {
    const aliceStore = new storage_type_1.SignalProtocolStore();
    const bobStore = new storage_type_1.SignalProtocolStore();
    const bobPreKeyId = 1337;
    const bobSignedKeyId = 1;
    beforeAll(() => __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([(0, utils_1.generateIdentity)(aliceStore), (0, utils_1.generateIdentity)(bobStore)]);
        const preKeyBundle = yield (0, utils_1.generatePreKeyBundle)(bobStore, bobPreKeyId, bobSignedKeyId);
        const builder = new session_builder_1.SessionBuilder(aliceStore, BOB_ADDRESS);
        return builder.processPreKey(preKeyBundle);
    }));
    const originalMessage = utils.binaryStringToArrayBuffer("L'homme est condamné à être libre");
    const nextMessage = (utils.binaryStringToArrayBuffer("condamné parce qu'il ne s'est pas crée lui-même, et par ailleurs cependant libre parce qu'une fois jeté dans le monde, il est responsable de tout ce qu'il fait."));
    const aliceSessionCipher = new session_cipher_1.SessionCipher(aliceStore, BOB_ADDRESS);
    const bobSessionCipher = new session_cipher_1.SessionCipher(bobStore, ALICE_ADDRESS);
    test('basic prekey v3: creates a session', () => __awaiter(this, void 0, void 0, function* () {
        const record = yield aliceStore.loadSession(BOB_ADDRESS.toString());
        expect(record).toBeDefined();
        const sessionRecord = session_record_1.SessionRecord.deserialize(record);
        expect(sessionRecord.haveOpenSession()).toBeTruthy();
        expect(sessionRecord.getOpenSession()).toBeDefined();
    }));
    test('basic prekey v3: the session can encrypt', () => __awaiter(this, void 0, void 0, function* () {
        const ciphertext = yield aliceSessionCipher.encrypt(originalMessage);
        expect(ciphertext.type).toBe(3); // PREKEY_BUNDLE
        const plaintext = yield bobSessionCipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary');
        (0, utils_1.assertEqualArrayBuffers)(plaintext, originalMessage); // assertEqualArrayBuffers(plaintext, originalMessage)
    }));
    test('basic v3 NO PREKEY: the session can decrypt multiple v3 messages', () => __awaiter(this, void 0, void 0, function* () {
        const ciphertext0 = yield aliceSessionCipher.encrypt(originalMessage);
        expect(ciphertext0.type).toBe(3); // PREKEY_BUNDLE
        const ciphertext1 = yield aliceSessionCipher.encrypt(nextMessage);
        expect(ciphertext1.type).toBe(3); // PREKEY_BUNDLE
        const plaintext0 = yield bobSessionCipher.decryptPreKeyWhisperMessage(ciphertext0.body, 'binary');
        (0, utils_1.assertEqualArrayBuffers)(plaintext0, originalMessage);
        const plaintext1 = yield bobSessionCipher.decryptPreKeyWhisperMessage(ciphertext1.body, 'binary');
        (0, utils_1.assertEqualArrayBuffers)(plaintext1, nextMessage);
    }));
    test('basic prekey v3: the session can decrypt', () => __awaiter(this, void 0, void 0, function* () {
        const ciphertext = yield bobSessionCipher.encrypt(originalMessage);
        const plaintext = yield aliceSessionCipher.decryptWhisperMessage(ciphertext.body, 'binary');
        (0, utils_1.assertEqualArrayBuffers)(plaintext, originalMessage);
    }));
    test('basic prekey v3: accepts a new preKey with the same identity', () => __awaiter(this, void 0, void 0, function* () {
        const preKeyBundle = yield (0, utils_1.generatePreKeyBundle)(bobStore, bobPreKeyId + 1, bobSignedKeyId + 1);
        const builder = new session_builder_1.SessionBuilder(aliceStore, BOB_ADDRESS);
        yield builder.processPreKey(preKeyBundle);
        const record = yield aliceStore.loadSession(BOB_ADDRESS.toString());
        expect(record).toBeDefined();
        const sessionRecord = session_record_1.SessionRecord.deserialize(record);
        expect(sessionRecord.haveOpenSession()).toBeTruthy();
        expect(sessionRecord.getOpenSession()).toBeDefined();
    }));
    test('basic prekey v3: rejects untrusted identity keys', () => __awaiter(this, void 0, void 0, function* () {
        const newIdentity = yield key_helper_1.KeyHelper.generateIdentityKeyPair();
        const builder = new session_builder_1.SessionBuilder(aliceStore, BOB_ADDRESS);
        yield expect(() => __awaiter(this, void 0, void 0, function* () {
            yield builder.processPreKey({
                identityKey: newIdentity.pubKey,
                registrationId: 12356,
                signedPreKey: {
                    keyId: 2,
                    publicKey: new Uint8Array(33).buffer,
                    signature: new Uint8Array(32).buffer,
                },
            });
        })).rejects.toThrow('Identity key changed');
    }));
});
describe('basic v3 NO PREKEY', function () {
    const aliceStore = new storage_type_1.SignalProtocolStore();
    const bobStore = new storage_type_1.SignalProtocolStore();
    const bobPreKeyId = 1337;
    const bobSignedKeyId = 1;
    beforeAll(() => __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([(0, utils_1.generateIdentity)(aliceStore), (0, utils_1.generateIdentity)(bobStore)]);
        const preKeyBundle = yield (0, utils_1.generatePreKeyBundle)(bobStore, bobPreKeyId, bobSignedKeyId);
        delete preKeyBundle.preKey;
        const builder = new session_builder_1.SessionBuilder(aliceStore, BOB_ADDRESS);
        return builder.processPreKey(preKeyBundle);
    }));
    const originalMessage = utils.binaryStringToArrayBuffer("L'homme est condamné à être libre");
    const nextMessage = (utils.binaryStringToArrayBuffer("condamné parce qu'il ne s'est pas crée lui-même, et par ailleurs cependant libre parce qu'une fois jeté dans le monde, il est responsable de tout ce qu'il fait."));
    const aliceSessionCipher = new session_cipher_1.SessionCipher(aliceStore, BOB_ADDRESS);
    const bobSessionCipher = new session_cipher_1.SessionCipher(bobStore, ALICE_ADDRESS);
    test('basic v3 NO PREKEY: creates a session', () => __awaiter(this, void 0, void 0, function* () {
        const record = yield aliceStore.loadSession(BOB_ADDRESS.toString());
        expect(record).toBeDefined();
        const sessionRecord = session_record_1.SessionRecord.deserialize(record);
        expect(sessionRecord.haveOpenSession()).toBeTruthy();
        expect(sessionRecord.getOpenSession()).toBeDefined();
    }));
    test('basic v3 NO PREKEY: the session can encrypt', () => __awaiter(this, void 0, void 0, function* () {
        const ciphertext = yield aliceSessionCipher.encrypt(originalMessage);
        expect(ciphertext.type).toBe(3); // PREKEY_BUNDLE
        const plaintext = yield bobSessionCipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary');
        (0, utils_1.assertEqualArrayBuffers)(plaintext, originalMessage);
    }));
    test('basic v3 NO PREKEY: the session can decrypt multiple v3 messages', () => __awaiter(this, void 0, void 0, function* () {
        const ciphertext0 = yield aliceSessionCipher.encrypt(originalMessage);
        expect(ciphertext0.type).toBe(3); // PREKEY_BUNDLE
        const ciphertext1 = yield aliceSessionCipher.encrypt(nextMessage);
        expect(ciphertext1.type).toBe(3); // PREKEY_BUNDLE
        const plaintext0 = yield bobSessionCipher.decryptPreKeyWhisperMessage(ciphertext0.body, 'binary');
        (0, utils_1.assertEqualArrayBuffers)(plaintext0, originalMessage);
        const plaintext1 = yield bobSessionCipher.decryptPreKeyWhisperMessage(ciphertext1.body, 'binary');
        (0, utils_1.assertEqualArrayBuffers)(plaintext1, nextMessage);
    }));
    test('basic v3 NO PREKEY: the session can decrypt', () => __awaiter(this, void 0, void 0, function* () {
        const ciphertext = yield bobSessionCipher.encrypt(originalMessage);
        const plaintext = yield aliceSessionCipher.decryptWhisperMessage(ciphertext.body, 'binary');
        (0, utils_1.assertEqualArrayBuffers)(plaintext, originalMessage);
    }));
    test('basic v3 NO PREKEY: accepts a new preKey with the same identity', () => __awaiter(this, void 0, void 0, function* () {
        const preKeyBundle = yield (0, utils_1.generatePreKeyBundle)(bobStore, bobPreKeyId + 1, bobSignedKeyId + 1);
        delete preKeyBundle.preKey;
        const builder = new session_builder_1.SessionBuilder(aliceStore, BOB_ADDRESS);
        yield builder.processPreKey(preKeyBundle);
        const record = yield aliceStore.loadSession(BOB_ADDRESS.toString());
        expect(record).toBeDefined();
        const sessionRecord = session_record_1.SessionRecord.deserialize(record);
        expect(sessionRecord.haveOpenSession()).toBeTruthy();
        expect(sessionRecord.getOpenSession()).toBeDefined;
    }));
    test('basic v3 NO PREKEY: rejects untrusted identity keys', () => __awaiter(this, void 0, void 0, function* () {
        const newIdentity = yield key_helper_1.KeyHelper.generateIdentityKeyPair(); //.then(function (newIdentity) {
        const builder = new session_builder_1.SessionBuilder(aliceStore, BOB_ADDRESS);
        yield expect(() => __awaiter(this, void 0, void 0, function* () {
            yield builder.processPreKey({
                identityKey: newIdentity.pubKey,
                registrationId: 12356,
                signedPreKey: {
                    keyId: 2,
                    publicKey: new Uint8Array(33).buffer,
                    signature: new Uint8Array(32).buffer,
                },
            });
        })).rejects.toThrow('Identity key changed');
    }));
});
