/* eslint-disable @typescript-eslint/no-empty-function */
// __test-utils__/custom-jest-environment.js
// Stolen from: https://github.com/ipfs/jest-environment-aegir/blob/master/src/index.js
// Overcomes error from jest internals.. this thing: https://github.com/facebook/jest/issues/6248
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NodeEnvironment = require('jest-environment-node');
class XMLHttpRequest {
}
class MyEnvironment extends NodeEnvironment {
    constructor(config) {
        super(Object.assign({}, config, {
            globals: Object.assign({}, config.globals, {
                Uint32Array: Uint32Array,
                Uint16Array: Uint16Array,
                Uint8Array: Uint8Array,
                ArrayBuffer: ArrayBuffer,
                window: {},
                XMLHttpRequest: XMLHttpRequest,
            }),
        }));
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    teardown() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
module.exports = MyEnvironment;
