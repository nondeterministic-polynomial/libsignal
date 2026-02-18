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
const utils_1 = require("../__test-utils__/utils");
const Internal = __importStar(require("../internal"));
const helpers_1 = require("../helpers");
describe('New Crypto Tests 2020', function () {
    const alice_bytes = (0, utils_1.hexToArrayBuffer)('77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a');
    const alice_priv = (0, utils_1.hexToArrayBuffer)('70076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c6a');
    const alice_pub = (0, utils_1.hexToArrayBuffer)('058520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a');
    const bob_bytes = (0, utils_1.hexToArrayBuffer)('5dab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e0eb');
    const bob_priv = (0, utils_1.hexToArrayBuffer)('58ab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e06b');
    const bob_pub = (0, utils_1.hexToArrayBuffer)('05de9edb7d7b7dc1b4d35b61c2ece435373f8343c85b78674dadfc7e146f882b4f');
    const shared_sec = (0, utils_1.hexToArrayBuffer)('4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742');
    test(`createKeyPair converts alice's private keys to a keypair`, () => __awaiter(this, void 0, void 0, function* () {
        const alicekeypair = yield Internal.crypto.createKeyPair(alice_bytes);
        (0, utils_1.assertEqualArrayBuffers)(alicekeypair.privKey, alice_priv);
        (0, utils_1.assertEqualArrayBuffers)(alicekeypair.pubKey, alice_pub);
        const bobkeypair = yield Internal.crypto.createKeyPair(bob_bytes);
        (0, utils_1.assertEqualArrayBuffers)(bobkeypair.privKey, bob_priv);
        (0, utils_1.assertEqualArrayBuffers)(bobkeypair.pubKey, bob_pub);
    }));
    test(`createKeyPair generates a key if not provided`, () => __awaiter(this, void 0, void 0, function* () {
        const keypair = yield Internal.crypto.createKeyPair();
        expect(keypair.privKey.byteLength).toStrictEqual(32);
        expect(keypair.pubKey.byteLength).toStrictEqual(33);
        expect(new Uint8Array(keypair.pubKey)[0]).toStrictEqual(5);
    }));
    test(`ECDHE computes the shared secret for alice`, () => __awaiter(this, void 0, void 0, function* () {
        const secret = yield Internal.crypto.ECDHE(bob_pub, alice_priv);
        (0, utils_1.assertEqualArrayBuffers)(shared_sec, secret);
    }));
    test(`ECDHE computes the shared secret for bob`, () => __awaiter(this, void 0, void 0, function* () {
        const secret = yield Internal.crypto.ECDHE(alice_pub, bob_priv);
        (0, utils_1.assertEqualArrayBuffers)(shared_sec, secret);
    }));
    const priv = (0, utils_1.hexToArrayBuffer)('48a8892cc4e49124b7b57d94fa15becfce071830d6449004685e387c62409973');
    const pub = (0, utils_1.hexToArrayBuffer)('0555f1bfede27b6a03e0dd389478ffb01462e5c52dbbac32cf870f00af1ed9af3a');
    const msg = (0, utils_1.hexToArrayBuffer)('617364666173646661736466');
    const sig = (0, utils_1.hexToArrayBuffer)('2bc06c745acb8bae10fbc607ee306084d0c28e2b3bb819133392473431291fd0dfa9c7f11479996cf520730d2901267387e08d85bbf2af941590e3035a545285');
    test(`Ed25519Sign works`, () => __awaiter(this, void 0, void 0, function* () {
        const sigCalc = yield Internal.crypto.Ed25519Sign(priv, msg);
        (0, utils_1.assertEqualArrayBuffers)(sig, sigCalc);
    }));
    test(`Ed25519Verify throws on bad signature`, () => __awaiter(this, void 0, void 0, function* () {
        const badsig = sig.slice(0);
        new Uint8Array(badsig).set([0], 0);
        try {
            yield Internal.crypto.Ed25519Verify(pub, msg, badsig);
        }
        catch (e) {
            if (e.message === 'Invalid signature') {
                return;
            }
        }
        console.error('Sign did not throw on bad input');
    }));
    test(`Ed25519Verify does not throw on good signature`, () => __awaiter(this, void 0, void 0, function* () {
        const result = yield Internal.crypto.Ed25519Verify(pub, msg, sig);
        // These functions return false on valid signature! The async ones
        // throw an error on invalid signature.  The synchronous ones return
        // true on invalid signature.
        expect(result).toBe(false);
    }));
});
describe('Crypto', function () {
    describe('Encrypt AES-CBC', function () {
        test('works', () => __awaiter(this, void 0, void 0, function* () {
            const key = (0, utils_1.hexToArrayBuffer)('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4');
            const iv = (0, utils_1.hexToArrayBuffer)('000102030405060708090a0b0c0d0e0f');
            const plaintext = (0, utils_1.hexToArrayBuffer)('6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e5130c81c46a35ce411e5fbc1191a0a52eff69f2445df4f9b17ad2b417be66c3710');
            const ciphertext = (0, utils_1.hexToArrayBuffer)('f58c4c04d6e5f1ba779eabfb5f7bfbd69cfc4e967edb808d679f777bc6702c7d39f23369a9d9bacfa530e26304231461b2eb05e2c39be9fcda6c19078c6a9d1b3f461796d6b0d6b2e0c2a72b4d80e644');
            const result = yield Internal.crypto.encrypt(key, plaintext, iv);
            (0, utils_1.assertEqualArrayBuffers)(result, ciphertext);
        }));
    });
    describe('Decrypt AES-CBC', function () {
        test('works', () => __awaiter(this, void 0, void 0, function* () {
            const key = (0, utils_1.hexToArrayBuffer)('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4');
            const iv = (0, utils_1.hexToArrayBuffer)('000102030405060708090a0b0c0d0e0f');
            const plaintext = (0, utils_1.hexToArrayBuffer)('6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e5130c81c46a35ce411e5fbc1191a0a52eff69f2445df4f9b17ad2b417be66c3710');
            const ciphertext = (0, utils_1.hexToArrayBuffer)('f58c4c04d6e5f1ba779eabfb5f7bfbd69cfc4e967edb808d679f777bc6702c7d39f23369a9d9bacfa530e26304231461b2eb05e2c39be9fcda6c19078c6a9d1b3f461796d6b0d6b2e0c2a72b4d80e644');
            const result = yield Internal.crypto.decrypt(key, ciphertext, iv);
            (0, utils_1.assertEqualArrayBuffers)(result, plaintext);
        }));
    });
    describe('HMAC SHA-256', function () {
        test('works', () => __awaiter(this, void 0, void 0, function* () {
            const key = (0, utils_1.hexToArrayBuffer)('6f35628d65813435534b5d67fbdb54cb33403d04e843103e6399f806cb5df95febbdd61236f33245');
            const input = (0, utils_1.hexToArrayBuffer)('752cff52e4b90768558e5369e75d97c69643509a5e5904e0a386cbe4d0970ef73f918f675945a9aefe26daea27587e8dc909dd56fd0468805f834039b345f855cfe19c44b55af241fff3ffcd8045cd5c288e6c4e284c3720570b58e4d47b8feeedc52fd1401f698a209fccfa3b4c0d9a797b046a2759f82a54c41ccd7b5f592b');
            const mac = (0, utils_1.hexToArrayBuffer)('05d1243e6465ed9620c9aec1c351a186');
            const result = yield Internal.crypto.sign(key, input);
            (0, utils_1.assertEqualArrayBuffers)(result.slice(0, mac.byteLength), mac);
        }));
    });
    describe('HKDF', function () {
        test('works', () => __awaiter(this, void 0, void 0, function* () {
            // HMAC RFC5869 Test vectors
            const T1 = (0, utils_1.hexToArrayBuffer)('3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf');
            const T2 = (0, utils_1.hexToArrayBuffer)('34007208d5b887185865');
            const IKM = new Uint8Array(new ArrayBuffer(22));
            for (let i = 0; i < 22; i++)
                IKM[i] = 11;
            const salt = new Uint8Array(new ArrayBuffer(13));
            for (let i = 0; i < 13; i++)
                salt[i] = i;
            const info = new Uint8Array(new ArrayBuffer(10));
            for (let i = 0; i < 10; i++)
                info[i] = 240 + i;
            const OKM = yield Internal.crypto.HKDF((0, helpers_1.uint8ArrayToArrayBuffer)(IKM), (0, helpers_1.uint8ArrayToArrayBuffer)(salt), (0, helpers_1.uint8ArrayToArrayBuffer)(info));
            (0, utils_1.assertEqualArrayBuffers)(OKM[0], T1);
            (0, utils_1.assertEqualArrayBuffers)(OKM[1].slice(0, 10), T2);
        }));
    });
});
