"use strict";
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
exports.generatePreKeyBundle = exports.generateIdentity = exports.assertEqualUint8Arrays = exports.assertEqualArrayBuffers = exports.hexToArrayBuffer = void 0;
const key_helper_1 = require("../key-helper");
function hexToArrayBuffer(str) {
    const ret = new ArrayBuffer(str.length / 2);
    const array = new Uint8Array(ret);
    for (let i = 0; i < str.length / 2; i++)
        array[i] = parseInt(str.substr(i * 2, 2), 16);
    return ret;
}
exports.hexToArrayBuffer = hexToArrayBuffer;
function assertEqualArrayBuffers(ab1, ab2) {
    const a1 = new Uint8Array(ab1);
    const a2 = new Uint8Array(ab2);
    expect(a1.length).toBe(a2.length);
    for (let i = 0; i < a1.length; ++i) {
        expect(a1[i]).toBe(a2[i]);
    }
}
exports.assertEqualArrayBuffers = assertEqualArrayBuffers;
function assertEqualUint8Arrays(a1, a2) {
    expect(a1.length).toBe(a2.length);
    for (let i = 0; i < a1.length; ++i) {
        expect(a1[i]).toBe(a2[i]);
    }
}
exports.assertEqualUint8Arrays = assertEqualUint8Arrays;
function generateIdentity(store) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.all([key_helper_1.KeyHelper.generateIdentityKeyPair(), key_helper_1.KeyHelper.generateRegistrationId()]).then(function (result) {
            store.put('identityKey', result[0]);
            store.put('registrationId', result[1]);
        });
    });
}
exports.generateIdentity = generateIdentity;
function generatePreKeyBundle(store, preKeyId, signedPreKeyId) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.all([store.getIdentityKeyPair(), store.getLocalRegistrationId()]).then(function (result) {
            const identity = result[0];
            const registrationId = result[1];
            return Promise.all([
                key_helper_1.KeyHelper.generatePreKey(preKeyId),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                key_helper_1.KeyHelper.generateSignedPreKey(identity, signedPreKeyId),
            ]).then(function (keys) {
                const preKey = keys[0];
                const signedPreKey = keys[1];
                store.storePreKey(preKeyId, preKey.keyPair);
                store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);
                return {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    identityKey: identity.pubKey,
                    registrationId: registrationId,
                    preKey: {
                        keyId: preKeyId,
                        publicKey: preKey.keyPair.pubKey,
                    },
                    signedPreKey: {
                        keyId: signedPreKeyId,
                        publicKey: signedPreKey.keyPair.pubKey,
                        signature: signedPreKey.signature,
                    },
                };
            });
        });
    });
}
exports.generatePreKeyBundle = generatePreKeyBundle;
