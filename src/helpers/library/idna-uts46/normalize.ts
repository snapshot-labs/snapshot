/*
* https://github.com/jcranmer/idna-uts46/blob/master/uts46.js 
*/

import punycode from 'punycode';
import idnaMap from './idna-map';

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
  if (idnaMap.mapChar(ch) & (0x2 << 23))
    throw new Error("Label contains illegal character: " + ch);
}


function mapLabel (label, useStd3ASCII, transitional) {
    const mapped: any = []
    const chars = punycode.ucs2.decode(label)
    for (let i = 0; i < chars.length; i++) {
      const cp = chars[i]
      const ch = punycode.ucs2.encode([chars[i]])
      const composite = idnaMap.mapChar(cp)
      const flags = (composite >> 23)
      const kind = (composite >> 21) & 3
      const index = (composite >> 5) & 0xffff
      const length = composite & 0x1f
      const value = idnaMap.mapStr.substr(index, length)
      if (kind === 0 || (useStd3ASCII && (flags & 1))) {
        throw new Error('Illegal char ' + ch)
      } else if (kind === 1) {
        mapped.push(value)
      } else if (kind === 2) {
        mapped.push(transitional ? value : ch)
        /* istanbul ignore next */
      } else if (kind === 3) {
        mapped.push(ch)
      }
    }

    const newLabel = mapped.join('').normalize('NFC')
    return newLabel
  }


function process(domain, transitional, useStd3ASCII) {
    if (useStd3ASCII === undefined) {
        useStd3ASCII = false
    }
    const mappedIDNA = mapLabel(domain, useStd3ASCII, transitional)

    // Step 3. Break
    let labels = mappedIDNA.split('.')

    // Step 4. Convert/Validate
    labels = labels.map(function (label) {
        if (label.startsWith('xn--')) {
            label = punycode.decode(label.substring(4))
            validateLabel(label, useStd3ASCII, false)
        } else {
            validateLabel(label, useStd3ASCII, transitional)
        }
        return label
    })

    return labels.join('.')
}

function toAscii(domain, options) {
    if (options === undefined) {
        options = {}
    }
    const transitional = 'transitional' in options ? options.transitional : true
    const useStd3ASCII = 'useStd3ASCII' in options ? options.useStd3ASCII : false
    const verifyDnsLength = 'verifyDnsLength' in options ? options.verifyDnsLength : false
    const labels = process(domain, transitional, useStd3ASCII).split('.')
    const asciiLabels = labels.map(punycode.toASCII)
    const asciiString = asciiLabels.join('.')
    let i
    if (verifyDnsLength) {
        if (asciiString.length < 1 || asciiString.length > 253) {
            throw new Error('DNS name has wrong length: ' + asciiString)
        }
        for (i = 0; i < asciiLabels.length; i++) { // for .. of replacement
            const label = asciiLabels[i]
            if (label.length < 1 || label.length > 63) {
                throw new Error('DNS label has wrong length: ' + label)
            }
        }
    }
    return asciiString
}

export default function normalize(name) {
  return name ? toAscii(name, {useStd3ASCII: true, transitional: false}) : name
}
