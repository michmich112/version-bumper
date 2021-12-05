import { CommitOptions } from "../lib/types/Git.types";
import * as core from '@actions/core';
import Git from '../lib/Git';

/**
 * Configure Git for our use case
 * @param {CommitOptions} gitOptions
 * @param {string} remoteName
 * @param {Git} gitInterface
 * @returns {Promise<Git>}
 */
export async function configureGit(gitOptions: CommitOptions,
  remoteName: string = 'github',
  gitInterface?: Git): Promise<Git> {
  const { GITHUB_ACTOR, GITHUB_REPOSITORY } = process.env;
  const ORIGIN = `https://${GITHUB_ACTOR}:${gitOptions.token}@github.com/${GITHUB_REPOSITORY}.git`;
  const EXEC_OPTIONS = {
    cwd: process.env.GITHUB_WORKSPACE,
    listeners: {
      stdline: core.debug,
      stderr: (data: Buffer) => {
        core.warning(data.toString());
      },
      debug: core.debug,
    },
  };
  const git: Git = gitInterface ?? new Git({ execOptions: EXEC_OPTIONS });

  // Configure git
  await git.configUserName(gitOptions.userName);
  await git.configUserEmail(gitOptions.userEmail);

  // Add remote
  await git.addRemote(ORIGIN);

  return git;
}

/**
 * Configure and commit all changes
 * @param {CommitOptions} commitOptions
 * @param {Git} gitInterface to use git commands
 * @returns {Promise<Git>}
 */
export async function commit(commitOptions: CommitOptions, gitInterface?: Git): Promise<Git> {
  const EXEC_OPTIONS = {
    cwd: process.env.GITHUB_WORKSPACE,
    listeners: {
      stdline: core.debug,
      stderr: (data: Buffer) => {
        core.error(data.toString());
      },
      debug: core.debug,
    },
  };

  const git = gitInterface ?? new Git({ execOptions: EXEC_OPTIONS });

  // Add all new modifications and deletions
  await git.stageNewModifications();

  // Commit all staged changes
  await git.commitStagedChanges(commitOptions.message);

  // Tag the commit if tag info is passed
  if (commitOptions.tag) await git.tagLatestCommit(commitOptions.tag);

  return git;
}

/**
 * Commit and push all changed to the remote github repository
 * @param {CommitOptions} options
 * @returns {Promise<void>}
 */
export async function commitAndPush(options: CommitOptions): Promise<void> {
  //  let git = await configureGit(options);
  const git = await commit(options);
  await git.pushBranch(options.branch);
}
