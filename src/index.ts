import * as core from '@actions/core';
import * as fs from "fs";
import collectStats from "gh-action-stats";

import { getBumperOptions, getBumperState } from "./utils/options";
import BumperOptionsFile, { VersionFile } from "./lib/types/OptionsFile.types";
import BumperState from "./lib/types/BumperState.type";
import * as readline from "readline";
import { commitAndPush, configureGit } from "./utils/gitUtils";
import { CommitOptions } from "./lib/types/Git.types";
import Git from './lib/Git';


const SUCCESS = 0,
  FAILURE = 1;

async function main() {

  if (!core.getInput('github-token')) {
    core.error("Github token required");
    return FAILURE;
  }

  try {
    let options: BumperOptionsFile = await getBumperOptions();

    let state: BumperState = await getBumperState(options);

    if (state.curVersion === state.newVersion) {
      core.info('No bump rules applicable');
      return SUCCESS;
    }

    const GIT_OPTIONS: CommitOptions = {
      userName: 'version-bumper',
      userEmail: 'bumper@boringday.co',
      message: state.skip ? '[SKIP] ' : '' + `Updated version ${state.curVersion} -> ${state.newVersion}.`,
      tag: state.tag ? { name: state.newVersion } : undefined,
      token: core.getInput('github-token'),
      branch: state.branch
    };

    const git = await configureGit(GIT_OPTIONS);
    await (await git.fetchRemoteBranch(state.branch)).checkoutBranch(state.branch);
    await bump(state);


    await commitAndPush(GIT_OPTIONS);

    return SUCCESS;
  } catch (e: any) {
    const message = e.message + "/n" + e.stack;
    core.error(e.message);
    core.setFailed(`Error: ${e.message}, Validate options file or create an issue if this persists`);
    throw new Error(message);
  }
}

async function bump(state: BumperState) {
  let { files, curVersion, newVersion } = state;
  let wbArray: (() => Promise<void>)[] = []; // write back array

  for (const file of files) {
    try {
      wbArray.push(await setNewVersion(file, curVersion, newVersion));
    } catch (e: any) {
      core.error(`Error setting new version for file with path ${file.path}`);
      core.error(e.message);
    }
  }
  for (const wb of wbArray) {
    try {
      await wb();
    } catch (e: any) {
      core.error(`Write back error`);
      core.error(e.message);
    }
  }

}

async function setNewVersion(file: VersionFile, curVersion: string, newVersion: string) {
  const rl = readline.createInterface({ input: fs.createReadStream(file.path), crlfDelay: Infinity });
  const numMatches = 1;
  let counter = 1, // line counter
    matches = 0, // matches counter
    update = ""; // string representation of the new file with updated version

  if (!fs.existsSync(file.path))
    throw new Error(`File with path ${file.path} cannot be bumped as it cannot be found.`);

  for await (let ln of rl) {
    if (ln.indexOf(curVersion) !== -1
      && matches < numMatches && !file.line) {
      matches += 1;
      ln = ln.replace(curVersion, newVersion);
    } else if (file.line && counter === file.line) {
      if (ln.indexOf(curVersion) === -1) throw new Error(`Current Version not found on line ${file.line} in file with path ${file.path}.`);
      matches += 1;
      ln = ln.replace(curVersion, newVersion);
    }
    update += ln + '\n';
    counter++; // increment line counter
  }

  return async () => { // write back method
    await fs.writeFileSync(file.path, update, { encoding: 'utf8', flag: 'w' });
  };
}

collectStats(main);

