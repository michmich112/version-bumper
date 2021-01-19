"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("@actions/exec");
class Git {
    constructor(params) {
        var _a;
        this.execOptions = params === null || params === void 0 ? void 0 : params.execOptions;
        this.remoteName = (_a = params === null || params === void 0 ? void 0 : params.remoteName) !== null && _a !== void 0 ? _a : 'github';
    }
    /**
     * Checkout branch
     * @param branch
     * @returns {Promise<Git>}
     */
    checkoutBranch(branch) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exec_1.exec('git', ['checkout', branch], this.execOptions);
            return this;
        });
    }
    /**
     * Config git with the user's name
     * @param {string} userName
     * @returns {Promise<Git>}
     */
    configUserName(userName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exec_1.exec('git', ['config', 'user.name', `"${userName}"`], this.execOptions);
            return this;
        });
    }
    /**
     * Config git with the user's email
     * @param {string} email
     * @returns {Promise<Git>}
     */
    configUserEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exec_1.exec('git', ['config', 'user.email', `"${email}"`], this.execOptions);
            return this;
        });
    }
    /**
     * Add remote to the current git repo
     * @param {string} remoteUrl
     * @returns {Promise<Git>}
     */
    addRemote(remoteUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exec_1.exec('git', ['remote', 'add', this.remoteName, remoteUrl], this.execOptions);
            return this;
        });
    }
    /**
     * Stage all new modifications
     * @returns {Promise<Git>}
     */
    stageNewModifications() {
        return __awaiter(this, void 0, void 0, function* () {
            yield exec_1.exec('git', ['add', '-u'], this.execOptions);
            return this;
        });
    }
    /**
     * Commit all staged changes
     * @param {string} message
     * @returns {Promise<Git>}
     */
    commitStagedChanges(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exec_1.exec('git', ['commit', '-v', '-m', `"${message}"`], this.execOptions);
            return this;
        });
    }
    /**
     * Tag the latest commit that was made
     * @param {Tag} tag
     * @returns {Promise<Git>}
     */
    tagLatestCommit(tag) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, message } = tag;
            yield exec_1.exec('git', ['tag', '-a', name, '-m', (message || name)], this.execOptions);
            return this;
        });
    }
    /**
     * Push branch to remote origin if set up
     * @param branch
     * @return {Promise<Git>}
     */
    pushBranch(branch) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exec_1.exec('git', ['push', '-u', '--tags', this.remoteName, branch], this.execOptions);
            return this;
        });
    }
}
exports.default = Git;
