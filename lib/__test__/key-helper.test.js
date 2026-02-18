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
const key_helper_1 = require("../key-helper");
const Internal = __importStar(require("../internal"));
describe('KeyHelper', function () {
    function validateKeyPair(keyPair) {
        expect(keyPair.pubKey).toBeDefined();
        expect(keyPair.privKey).toBeDefined();
        expect(keyPair.privKey.byteLength).toStrictEqual(32);
        expect(keyPair.pubKey.byteLength).toStrictEqual(33);
        expect(new Uint8Array(keyPair.pubKey)[0]).toStrictEqual(5);
    }
    describe('generateIdentityKeyPair', function () {
        test(`works`, () => __awaiter(this, void 0, void 0, function* () {
            const keyPair = yield key_helper_1.KeyHelper.generateIdentityKeyPair();
            validateKeyPair(keyPair);
        }));
    });
    describe('generateRegistrationId', function () {
        test(`works`, () => {
            const registrationId = key_helper_1.KeyHelper.generateRegistrationId();
            expect(typeof registrationId).toBe('number');
            expect(registrationId).toBeGreaterThanOrEqual(0);
            expect(registrationId).toBeLessThan(16384);
            expect(registrationId).toStrictEqual(Math.round(registrationId));
        });
    });
    describe('generatePreKey', function () {
        test(`generates a PreKey`, () => __awaiter(this, void 0, void 0, function* () {
            const pk = yield key_helper_1.KeyHelper.generatePreKey(1337);
            validateKeyPair(pk.keyPair);
            expect(pk.keyId).toStrictEqual(1337);
        }));
        test(`throws on bad ID`, () => __awaiter(this, void 0, void 0, function* () {
            yield expect(() => __awaiter(this, void 0, void 0, function* () {
                yield key_helper_1.KeyHelper.generatePreKey(-7);
            })).rejects.toThrow();
        }));
    });
    describe('generateSignedPreKey', function () {
        test(`generates a PreKey`, () => __awaiter(this, void 0, void 0, function* () {
            const identityKey = yield key_helper_1.KeyHelper.generateIdentityKeyPair();
            const spk = yield key_helper_1.KeyHelper.generateSignedPreKey(identityKey, 1337);
            validateKeyPair(spk.keyPair);
            expect(spk.keyId).toStrictEqual(1337);
            yield expect(Internal.crypto.Ed25519Verify(identityKey.pubKey, spk.keyPair.pubKey, spk.signature)).resolves.toBe(false);
        }));
        test(`throws on bad ID`, () => __awaiter(this, void 0, void 0, function* () {
            const identityKey = yield key_helper_1.KeyHelper.generateIdentityKeyPair();
            yield expect(() => __awaiter(this, void 0, void 0, function* () {
                yield key_helper_1.KeyHelper.generateSignedPreKey(identityKey, -7);
            })).rejects.toThrow();
        }));
    });
});
