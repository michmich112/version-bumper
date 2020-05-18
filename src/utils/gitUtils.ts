import {CommitOptions} from "../lib/Git.types";
import * as core from '@actions/core';
import {exec} from "@actions/exec";

const EXEC_OPTIONS = {
        cwd: process.env.GITHUB_WORKSPACE,
        listeners: {
            stdline: core.debug,
            stderr: core.error,
            debug: core.debug,
        },
    } as any,
    REMOTE_TAG = 'github';

/**
 * Checkout branch
 * @param branch
 */
export async function checkout(branch: string) {
    await exec('git', ['checkout', branch], EXEC_OPTIONS);
}

/**
 * Commit changes
 * @param options
 */
export async function commit(options: CommitOptions) {
    const {GITHUB_ACTOR, GITHUB_REPOSITORY} = process.env,
        ORIGIN = `https://${GITHUB_ACTOR}:${options.token}@github.com/${GITHUB_REPOSITORY}.git`;


    // Configure git
    await exec('git', ['config', 'user.name', `"${options.userName}"`], EXEC_OPTIONS);
    await exec('git', ['config', 'user.email', `"${options.userEmail}"`], EXEC_OPTIONS);

    // Add remote
    await exec('git', ['remote', 'add', REMOTE_TAG, ORIGIN], EXEC_OPTIONS);

    // Add all new modifications and deletions
    await exec('git', ['add', '-u'], EXEC_OPTIONS);

    // Commit all staged changes
    await exec('git', ['commit', '-v', '-m', `"${options.message}"`], EXEC_OPTIONS);

    // Tag the commit if tag info is passed
    if(options.tag){
        let {name, message } = options.tag;
        await exec('git', ['tag', '-a', ...(message ? [name,'-m',message]:[name])]);
    }

}

/**
 * Push to remote
 * @param branch
 */
export async function push(branch: string) {
    await exec('git', ['push', REMOTE_TAG, branch], EXEC_OPTIONS);
}

export async function commitAndPush(options:CommitOptions) {
    await commit(options);
    await push(options.branch);
}