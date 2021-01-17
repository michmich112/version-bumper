"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Business rule to verify if the rule has to be applied or not
 * @param {BumpRule} rule
 * @param {RuleTrigger} trigger : current trigger for the action
 * @param {string} branch : current branch
 * @returns {boolean}
 */
function isRuleApplicable(rule, trigger, branch) {
    var _a, _b;
    const triggerMatch = rule.trigger === trigger;
    const branchRegExpMatches = (_b = branch.match(new RegExp((_a = rule.branch) !== null && _a !== void 0 ? _a : '.*'))) !== null && _b !== void 0 ? _b : ['']; // get RegExp matches
    const branchMatch = branchRegExpMatches[0] === branch; // first match should be a full match
    return triggerMatch && branchMatch;
}
exports.default = isRuleApplicable;
