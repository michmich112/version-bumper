import { RuleTrigger, VersionFile } from "./OptionsFile.types";

export default interface BumperState {
  curVersion: string,         // current version
  newVersion: string,         // new bumped version
  skip: boolean,              // adds [SKIP] prefix to the commit message
  schemeRegExp: RegExp,       // schema for the version
  schemeDefinition: string,   // Schema definition
  tag: boolean,               // Tag commit flag
  trigger: RuleTrigger,       // trigger causing the action to be run
  branch: string,             // branch on which the action is run
  destBranch: string,         // destination branch for pull requests
  files: VersionFile[]        // branch on which the action is run
}
