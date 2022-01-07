"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Business rule to verify if the rule has to be applied or not
 * @param {BumpRule} rule
 * @param {RuleTrigger} trigger : current trigger for the action
 * @param {string} branch : current branch
 * @returns {boolean}
 */
function isRuleApplicable(rule, trigger, branch, destBranch) {
    var _a, _b, _c, _d;
    if (!destBranch && trigger !== 'pull-request')
        destBranch = branch; // normalize for commit case where destBranch = branch;
    const triggerMatch = rule.trigger === trigger;
    const branchRegExpMatches = (_b = branch.match(new RegExp((_a = rule.branch) !== null && _a !== void 0 ? _a : '.*'))) !== null && _b !== void 0 ? _b : ['']; // get RegExp matches
    const branchMatch = branchRegExpMatches[0] === branch; // first match should be a full match
    const destBranchRegExpMatches = (_d = (destBranch || '').match(new RegExp((_c = rule.destBranch) !== null && _c !== void 0 ? _c : '.*'))) !== null && _d !== void 0 ? _d : ['']; // get RegExp matches
    const destBranchMatch = destBranchRegExpMatches[0] === destBranch; // first match should be a full match
    return triggerMatch && branchMatch && destBranchMatch;
}
exports.default = isRuleApplicable;
