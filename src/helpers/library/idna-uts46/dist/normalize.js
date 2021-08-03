"use strict";
/*
* https://github.com/jcranmer/idna-uts46/blob/master/uts46.js
*/
exports.__esModule = true;
var punycode_1 = require("punycode");
var idna_map_1 = require("./idna-map");
function validateLabel(label, useStd3ASCII, transitional) {
    // 2. The label must not contain a U+002D HYPHEN-MINUS character in both the
    // third position and fourth positions.
    if (label[2] == '-' && label[3] == '-')
        throw new Error("Failed to validate " + label);
    // 3. The label must neither begin nor end with a U+002D HYPHEN-MINUS
    // character.
    if (label.startsWith('-') || label.endsWith('-'))
        throw new Error("Failed to validate " + label);
    // 4. The label must not contain a U+002E ( . ) FULL STOP.
    if (label.includes('.'))
        throw new Error("Failed to validate " + label);
    if (mapLabel(label, useStd3ASCII, transitional) != label)
        throw new Error("Failed to validate " + label);
    // 5. The label must not begin with a combining mark, that is:
    // General_Category=Mark.
    var ch = label.codePointAt(0);
    if (idna_map_1["default"].mapChar(ch) & (0x2 << 23))
        throw new Error("Label contains illegal character: " + ch);
}
function mapLabel(label, useStd3ASCII, transitional) {
    var mapped = [];
    var chars = punycode_1["default"].ucs2.decode(label);
    for (var i = 0; i < chars.length; i++) {
        var cp = chars[i];
        var ch = punycode_1["default"].ucs2.encode([chars[i]]);
        var composite = idna_map_1["default"].mapChar(cp);
        var flags = (composite >> 23);
        var kind = (composite >> 21) & 3;
        var index = (composite >> 5) & 0xffff;
        var length = composite & 0x1f;
        var value = idna_map_1["default"].mapStr.substr(index, length);
        if (kind === 0 || (useStd3ASCII && (flags & 1))) {
            throw new Error('Illegal char ' + ch);
        }
        else if (kind === 1) {
            mapped.push(value);
        }
        else if (kind === 2) {
            mapped.push(transitional ? value : ch);
            /* istanbul ignore next */
        }
        else if (kind === 3) {
            mapped.push(ch);
        }
    }
    var newLabel = mapped.join('').normalize('NFC');
    return newLabel;
}
function process(domain, transitional, useStd3ASCII) {
    if (useStd3ASCII === undefined) {
        useStd3ASCII = false;
    }
    var mappedIDNA = mapLabel(domain, useStd3ASCII, transitional);
    // Step 3. Break
    var labels = mappedIDNA.split('.');
    // Step 4. Convert/Validate
    labels = labels.map(function (label) {
        if (label.startsWith('xn--')) {
            label = punycode_1["default"].decode(label.substring(4));
            validateLabel(label, useStd3ASCII, false);
        }
        else {
            validateLabel(label, useStd3ASCII, transitional);
        }
        return label;
    });
    return labels.join('.');
}
function toAscii(domain, options) {
    if (options === undefined) {
        options = {};
    }
    var transitional = 'transitional' in options ? options.transitional : true;
    var useStd3ASCII = 'useStd3ASCII' in options ? options.useStd3ASCII : false;
    var verifyDnsLength = 'verifyDnsLength' in options ? options.verifyDnsLength : false;
    var labels = process(domain, transitional, useStd3ASCII).split('.');
    var asciiLabels = labels.map(punycode_1["default"].toASCII);
    var asciiString = asciiLabels.join('.');
    var i;
    if (verifyDnsLength) {
        if (asciiString.length < 1 || asciiString.length > 253) {
            throw new Error('DNS name has wrong length: ' + asciiString);
        }
        for (i = 0; i < asciiLabels.length; i++) { // for .. of replacement
            var label = asciiLabels[i];
            if (label.length < 1 || label.length > 63) {
                throw new Error('DNS label has wrong length: ' + label);
            }
        }
    }
    return asciiString;
}
function normalize(name) {
    return name ? toAscii(name, { useStd3ASCII: true, transitional: false }) : name;
}
exports["default"] = normalize;
