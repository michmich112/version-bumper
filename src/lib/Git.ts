import { exec, ExecOptions } from '@actions/exec';
import { Tag } from './types/Git.types';

export default class Git {
  private readonly execOptions?: ExecOptions;
  private readonly remoteName: string;

  constructor(params?: { execOptions?: ExecOptions, remoteName?: string }) {
    this.execOptions = params?.execOptions;
    this.remoteName = params?.remoteName ?? 'github';
  }

  /**
   * Checkout branch
   * @param branch
   * @returns {Promise<Git>}
   */
  async checkoutBranch(branch: string): Promise<Git> {
    await exec('git', ['checkout', branch], this.execOptions);
    return this;
  }

  /**
   * Config git with the user's name
   * @param {string} userName
   * @returns {Promise<Git>}
   */
  async configUserName(userName: string): Promise<Git> {
    await exec('git', ['config', 'user.name', `"${userName}"`], this.execOptions);
    return this;
  }

  /**
   * Config git with the user's email
   * @param {string} email
   * @returns {Promise<Git>}
   */
  async configUserEmail(email: string): Promise<Git> {
    await exec('git', ['config', 'user.email', `"${email}"`], this.execOptions);
    return this;
  }

  /**
   * Add remote to the current git repo
   * @param {string} remoteUrl
   * @returns {Promise<Git>}
   */
  async addRemote(remoteUrl: string): Promise<Git> {
    await exec('git', ['remote', 'add', this.remoteName, remoteUrl], this.execOptions);
    return this;
  }

  /**
   * Stage all new modifications
   * @returns {Promise<Git>}
   */
  async stageNewModifications(): Promise<Git> {
    await exec('git', ['add', '-u'], this.execOptions);
    return this;
  }

  /**
   * Commit all staged changes
   * @param {string} message
   * @returns {Promise<Git>}
   */
  async commitStagedChanges(message: string): Promise<Git> {
    await exec('git', ['commit', '-v', '-m', `"${message}"`], this.execOptions);
    return this;
  }

  /**
   * Tag the latest commit that was made
   * @param {Tag} tag
   * @returns {Promise<Git>}
   */
  async tagLatestCommit(tag: Tag): Promise<Git> {
    const { name, message } = tag;
    await exec('git', ['tag', '-a', name, '-m', (message || name)], this.execOptions);
    return this;
  }

  /**
   * Push branch to remote origin if set up
   * @param branch
   * @return {Promise<Git>}
   */
  async pushBranch(branch: string): Promise<Git> {
    await exec('git', ['push', '-u', '--tags', this.remoteName, branch], this.execOptions);
    return this;
  }

}
