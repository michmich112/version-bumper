import {RuleTrigger, VersionFile} from "./OptionsFile.types";

export default interface BumperState {
    curVersion: string,
    newVersion: string,
    schemeRegExp: RegExp,
    schemeDefinition: string,
    trigger: RuleTrigger,
    branch: string
    files: VersionFile[]
}