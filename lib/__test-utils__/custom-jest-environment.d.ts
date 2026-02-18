export = MyEnvironment;
declare class MyEnvironment extends NodeEnvironment {
    constructor(config: any);
}
import NodeEnvironment = require("jest-environment-node");
