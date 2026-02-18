import { StorageType, Direction, SessionRecordType, PreKeyPairType, SignedPreKeyPairType } from '../types';
export declare function isKeyPairType(kp: any): kp is KeyPairType;
export declare function isPreKeyType(pk: any): pk is PreKeyPairType;
export declare function isSignedPreKeyType(spk: any): spk is SignedPreKeyPairType;
interface KeyPairType {
    pubKey: ArrayBuffer;
    privKey: ArrayBuffer;
}
interface PreKeyType {
    keyId: number;
    keyPair: KeyPairType;
}
interface SignedPreKeyType extends PreKeyType {
    signature: ArrayBuffer;
}
declare type StoreValue = KeyPairType | string | number | KeyPairType | PreKeyType | SignedPreKeyType | ArrayBuffer | undefined;
export declare class SignalProtocolStore implements StorageType {
    private _store;
    constructor();
    get(key: string, defaultValue: StoreValue): StoreValue;
    remove(key: string): void;
    put(key: string, value: StoreValue): void;
    getIdentityKeyPair(): Promise<KeyPairType | undefined>;
    getLocalRegistrationId(): Promise<number | undefined>;
    isTrustedIdentity(identifier: string, identityKey: ArrayBuffer, _direction: Direction): Promise<boolean>;
    loadPreKey(keyId: string | number): Promise<KeyPairType | undefined>;
    loadSession(identifier: string): Promise<SessionRecordType | undefined>;
    loadSignedPreKey(keyId: number | string): Promise<KeyPairType | undefined>;
    removePreKey(keyId: number | string): Promise<void>;
    saveIdentity(identifier: string, identityKey: ArrayBuffer): Promise<boolean>;
    storeSession(identifier: string, record: SessionRecordType): Promise<void>;
    loadIdentityKey(identifier: string): Promise<ArrayBuffer | undefined>;
    storePreKey(keyId: number | string, keyPair: KeyPairType): Promise<void>;
    storeSignedPreKey(keyId: number | string, keyPair: KeyPairType): Promise<void>;
    removeSignedPreKey(keyId: number | string): Promise<void>;
    removeSession(identifier: string): Promise<void>;
    removeAllSessions(identifier: string): Promise<void>;
}
export {};
