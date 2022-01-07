import { BumpRule, RuleTrigger } from '../lib/types/OptionsFile.types';

/**
 * Business rule to verify if the rule has to be applied or not
 * @param {BumpRule} rule
 * @param {RuleTrigger} trigger : current trigger for the action
 * @param {string} branch : current branch
 * @returns {boolean}
 */
export default function isRuleApplicable(rule: BumpRule, trigger: RuleTrigger, branch: string, destBranch?: string): boolean {
  if (!destBranch && trigger !== 'pull-request') destBranch = branch; // normalize for commit case where destBranch = branch;
  const triggerMatch: boolean = rule.trigger === trigger;
  const branchRegExpMatches = branch.match(new RegExp(rule.branch ?? '.*')) ?? ['']; // get RegExp matches
  const branchMatch: boolean = branchRegExpMatches[0] === branch; // first match should be a full match
  const destBranchRegExpMatches = (destBranch || '').match(new RegExp(rule.destBranch ?? '.*')) ?? [''] // get RegExp matches
  const destBranchMatch: boolean = destBranchRegExpMatches[0] === destBranch; // first match should be a full match
  return triggerMatch && branchMatch && destBranchMatch;
}
