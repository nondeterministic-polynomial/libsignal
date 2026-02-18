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
const fingerprint_generator_1 = require("../fingerprint-generator");
const Internal = __importStar(require("../internal"));
describe('NumericFingerprint', function () {
    const ALICE_IDENTITY = [
        0x05, 0x06, 0x86, 0x3b, 0xc6, 0x6d, 0x02, 0xb4, 0x0d, 0x27, 0xb8, 0xd4, 0x9c, 0xa7, 0xc0, 0x9e, 0x92, 0x39,
        0x23, 0x6f, 0x9d, 0x7d, 0x25, 0xd6, 0xfc, 0xca, 0x5c, 0xe1, 0x3c, 0x70, 0x64, 0xd8, 0x68,
    ];
    const BOB_IDENTITY = [
        0x05, 0xf7, 0x81, 0xb6, 0xfb, 0x32, 0xfe, 0xd9, 0xba, 0x1c, 0xf2, 0xde, 0x97, 0x8d, 0x4d, 0x5d, 0xa2, 0x8d,
        0xc3, 0x40, 0x46, 0xae, 0x81, 0x44, 0x02, 0xb5, 0xc0, 0xdb, 0xd9, 0x6f, 0xda, 0x90, 0x7b,
    ];
    const FINGERPRINT = '300354477692869396892869876765458257569162576843440918079131';
    const alice = {
        identifier: '+14152222222',
        key: new Uint8Array(ALICE_IDENTITY).buffer,
    };
    const bob = {
        identifier: '+14153333333',
        key: new Uint8Array(BOB_IDENTITY).buffer,
    };
    test('returns the correct fingerprint', () => __awaiter(this, void 0, void 0, function* () {
        jest.setTimeout(20000);
        const generator = new fingerprint_generator_1.FingerprintGenerator(5200);
        const t = Date.now();
        const f = yield generator.createFor(alice.identifier, alice.key, bob.identifier, bob.key);
        console.log(`import crypto time:`, { time: Date.now() - t });
        expect(f).toBe(FINGERPRINT);
    }));
    test('alice and bob results match', () => __awaiter(this, void 0, void 0, function* () {
        jest.setTimeout(10000);
        const generator = new fingerprint_generator_1.FingerprintGenerator(1024);
        const a = yield generator.createFor(alice.identifier, alice.key, bob.identifier, bob.key);
        const b = yield generator.createFor(bob.identifier, bob.key, alice.identifier, alice.key);
        expect(a).toBe(b);
    }));
    test('alice and !bob results mismatch', () => __awaiter(this, void 0, void 0, function* () {
        jest.setTimeout(10000);
        const generator = new fingerprint_generator_1.FingerprintGenerator(1024);
        const a = yield generator.createFor(alice.identifier, alice.key, '+15558675309', bob.key);
        const b = yield generator.createFor(bob.identifier, bob.key, alice.identifier, alice.key);
        expect(a).not.toBe(b);
    }));
    test('alice and mitm results mismatch', () => __awaiter(this, void 0, void 0, function* () {
        jest.setTimeout(10000);
        const mitm = Internal.crypto.getRandomBytes(33);
        const generator = new fingerprint_generator_1.FingerprintGenerator(1024);
        const a = yield generator.createFor(alice.identifier, alice.key, bob.identifier, mitm);
        const b = yield generator.createFor(bob.identifier, bob.key, alice.identifier, alice.key);
        expect(a).not.toBe(b);
    }));
    test('inject alternate crypto', () => __awaiter(this, void 0, void 0, function* () {
        jest.setTimeout(20000);
        const oldcrypto = Internal.crypto.webcrypto;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const newcrypto = require('../../lib/msrcrypto');
        Internal.setWebCrypto(newcrypto);
        const t = Date.now();
        const generator = new fingerprint_generator_1.FingerprintGenerator(5200);
        const f = yield generator.createFor(alice.identifier, alice.key, bob.identifier, bob.key);
        console.log(`injected crypto time:`, { time: Date.now() - t });
        expect(f).toBe(FINGERPRINT);
        Internal.setWebCrypto(oldcrypto);
    }));
});
