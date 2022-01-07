"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitAndPush = exports.commit = exports.configureGit = void 0;
const core = __importStar(require("@actions/core"));
const Git_1 = __importDefault(require("../lib/Git"));
/**
 * Configure Git for our use case
 * @param {CommitOptions} gitOptions
 * @param {string} remoteName
 * @param {Git} gitInterface
 * @returns {Promise<Git>}
 */
function configureGit(gitOptions, remoteName = 'github', gitInterface) {
    return __awaiter(this, void 0, void 0, function* () {
        const { GITHUB_ACTOR, GITHUB_REPOSITORY } = process.env;
        const ORIGIN = `https://${GITHUB_ACTOR}:${gitOptions.token}@github.com/${GITHUB_REPOSITORY}.git`;
        const EXEC_OPTIONS = {
            cwd: process.env.GITHUB_WORKSPACE,
            listeners: {
                stdline: core.debug,
                stderr: (data) => {
                    core.debug(data.toString());
                },
                debug: core.debug,
            },
        };
        const git = gitInterface !== null && gitInterface !== void 0 ? gitInterface : new Git_1.default({ execOptions: EXEC_OPTIONS });
        // Configure git
        yield git.configUserName(gitOptions.userName);
        yield git.configUserEmail(gitOptions.userEmail);
        // Add remote
        yield git.addRemote(ORIGIN);
        return git;
    });
}
exports.configureGit = configureGit;
/**
 * Configure and commit all changes
 * @param {CommitOptions} commitOptions
 * @param {Git} gitInterface to use git commands
 * @returns {Promise<Git>}
 */
function commit(commitOptions, gitInterface) {
    return __awaiter(this, void 0, void 0, function* () {
        const EXEC_OPTIONS = {
            cwd: process.env.GITHUB_WORKSPACE,
            listeners: {
                stdline: core.debug,
                stderr: (data) => {
                    core.debug(data.toString());
                },
                debug: core.debug,
            },
        };
        const git = gitInterface !== null && gitInterface !== void 0 ? gitInterface : new Git_1.default({ execOptions: EXEC_OPTIONS });
        // Add all new modifications and deletions
        yield git.stageNewModifications();
        // Commit all staged changes
        yield git.commitStagedChanges(commitOptions.message);
        // Tag the commit if tag info is passed
        if (commitOptions.tag) {
            yield git.tagLatestCommit(commitOptions.tag);
        }
        return git;
    });
}
exports.commit = commit;
/**
 * Commit and push all changed to the remote github repository
 * @param {CommitOptions} options
 * @returns {Promise<void>}
 */
function commitAndPush(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const git = yield commit(options);
        yield git.pushBranch(options.branch);
    });
}
exports.commitAndPush = commitAndPush;
