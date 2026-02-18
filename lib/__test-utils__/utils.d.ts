import { DeviceType } from '..';
import { SignalProtocolStore } from '../__test__/storage-type';
export declare function hexToArrayBuffer(str: string): ArrayBuffer;
export declare function assertEqualArrayBuffers(ab1: ArrayBuffer, ab2: ArrayBuffer): void;
export declare function assertEqualUint8Arrays(a1: Uint8Array, a2: Uint8Array): void;
export declare function generateIdentity(store: SignalProtocolStore): Promise<void>;
export declare function generatePreKeyBundle(store: SignalProtocolStore, preKeyId: number, signedPreKeyId: number): Promise<DeviceType<ArrayBuffer>>;
