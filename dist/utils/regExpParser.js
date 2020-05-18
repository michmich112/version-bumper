"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * scheme must be of form <tag><seperator>[<tag><seperator>]
 * tag will be used to generate commands
 *   - strstatus is a reserved tag that inserts the status as a string, also mapped to the status command
 * seperators are used to seperate tags. allowed seperators are: .,;-_><
 * brackets define optional tags. they wont be displayed if there are no tags after them and if they are = to 0
 * generated regex will identify the scheme in the passed options file
 * @param scheme
 */
function generateSchemeRegexp(scheme) {
    let seperators = new Set(scheme.match(/[.,;:\-_><]+/gm) || []), tags = new Set(scheme.split(/[.,;:\-_><\]\[]+/g).filter((tag) => tag !== "")), 
    // regExp = scheme.replace(/[\[\]]/gm, "");
    regExp = scheme.replace(/\[/gm, '(').replace(/\]/gm, ')?');
    seperators.forEach((sep) => regExp = regExp.replace(new RegExp('\\' + sep.split('').join('\\'), 'g'), '\\' + sep.split('').join('\\')));
    tags.forEach((tag) => regExp = regExp.replace(tag, '[0-9]'));
    return new RegExp(regExp);
}
exports.generateSchemeRegexp = generateSchemeRegexp;
