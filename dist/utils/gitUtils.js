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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
const EXEC_OPTIONS = {
    cwd: process.env.GITHUB_WORKSPACE,
    listeners: {
        stdline: core.debug,
        stderr: core.error,
        debug: core.debug,
    },
}, REMOTE_TAG = 'github';
/**
 * Checkout branch
 * @param branch
 */
function checkout(branch) {
    return __awaiter(this, void 0, void 0, function* () {
        yield exec_1.exec('git', ['checkout', branch], EXEC_OPTIONS);
    });
}
exports.checkout = checkout;
/**
 * Commit changes
 * @param options
 */
function commit(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { GITHUB_ACTOR, GITHUB_REPOSITORY } = process.env, ORIGIN = `https://${GITHUB_ACTOR}:${options.token}@github.com/${GITHUB_REPOSITORY}.git`;
        // Configure git
        yield exec_1.exec('git', ['config', 'user.name', `"${options.userName}"`], EXEC_OPTIONS);
        yield exec_1.exec('git', ['config', 'user.email', `"${options.userEmail}"`], EXEC_OPTIONS);
        // Add remote
        yield exec_1.exec('git', ['remote', 'add', REMOTE_TAG, ORIGIN], EXEC_OPTIONS);
        // Add all new modifications and deletions
        yield exec_1.exec('git', ['add', '-u'], EXEC_OPTIONS);
        // Commit all staged changes
        yield exec_1.exec('git', ['commit', '-v', '-m', `"${options.message}"`], EXEC_OPTIONS);
        // Tag the commit if tag info is passed
        if (options.tag) {
            let { name, message } = options.tag;
            yield exec_1.exec('git', ['tag', '-a', ...(message ? [name, '-m', message] : [name])]);
        }
    });
}
exports.commit = commit;
/**
 * Push to remote
 * @param branch
 */
function push(branch) {
    return __awaiter(this, void 0, void 0, function* () {
        yield exec_1.exec('git', ['push', REMOTE_TAG, branch], EXEC_OPTIONS);
    });
}
exports.push = push;
function commitAndPush(options) {
    return __awaiter(this, void 0, void 0, function* () {
        yield commit(options);
        yield push(options.branch);
    });
}
exports.commitAndPush = commitAndPush;
