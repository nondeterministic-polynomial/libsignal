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
const session_lock_1 = require("../session-lock");
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
describe('session-lock', function () {
    test('return something', () => __awaiter(this, void 0, void 0, function* () {
        let value = '';
        yield Promise.all([
            session_lock_1.SessionLock.queueJobForNumber('channel1', () => __awaiter(this, void 0, void 0, function* () {
                yield sleep(10);
                value += 'xyz';
                return Promise.resolve();
            })),
        ]);
        expect(value).toBe('xyz');
    }));
    test('return longshort', () => __awaiter(this, void 0, void 0, function* () {
        let value = '';
        yield Promise.all([
            session_lock_1.SessionLock.queueJobForNumber('channel1', () => __awaiter(this, void 0, void 0, function* () {
                yield sleep(3000);
                value += 'long';
            })),
            session_lock_1.SessionLock.queueJobForNumber('channel1', () => __awaiter(this, void 0, void 0, function* () {
                yield sleep(1);
                value += 'short';
            })),
        ]);
        expect(value).toBe('longshort');
    }));
    test('return shortlong', () => __awaiter(this, void 0, void 0, function* () {
        let value = '';
        yield Promise.all([
            session_lock_1.SessionLock.queueJobForNumber('channel1', () => __awaiter(this, void 0, void 0, function* () {
                yield sleep(1);
                value += 'short';
            })),
            session_lock_1.SessionLock.queueJobForNumber('channel1', () => __awaiter(this, void 0, void 0, function* () {
                yield sleep(2000);
                value += 'long';
            })),
        ]);
        expect(value).toBe('shortlong');
    }));
    test('multichannel', () => __awaiter(this, void 0, void 0, function* () {
        let value = '';
        yield Promise.all([
            session_lock_1.SessionLock.queueJobForNumber('channel1', () => __awaiter(this, void 0, void 0, function* () {
                yield sleep(4000);
                value += 'long';
            })),
            session_lock_1.SessionLock.queueJobForNumber('channel2', () => __awaiter(this, void 0, void 0, function* () {
                yield sleep(1);
                value += 'ch2';
            })),
            session_lock_1.SessionLock.queueJobForNumber('channel1', () => __awaiter(this, void 0, void 0, function* () {
                yield sleep(1);
                value += 'short';
            })),
        ]);
        const re = /ch2/gi;
        const newstr = value.replace(re, '');
        expect(newstr).toBe('longshort');
    }));
    test('clear queue', () => __awaiter(this, void 0, void 0, function* () {
        let value = '';
        session_lock_1.SessionLock.queueJobForNumber('channel1', () => __awaiter(this, void 0, void 0, function* () {
            yield sleep(4000);
            value += 'long';
        }));
        session_lock_1.SessionLock.queueJobForNumber('channel2', () => __awaiter(this, void 0, void 0, function* () {
            yield sleep(1);
            value += 'ch2';
        }));
        session_lock_1.SessionLock.queueJobForNumber('channel1', () => __awaiter(this, void 0, void 0, function* () {
            yield sleep(1);
            value += 'short';
        }));
        yield session_lock_1.SessionLock.clearQueue();
        const re = /ch2/gi;
        const newstr = value.replace(re, '');
        expect(newstr).toBe('longshort');
    }));
});
