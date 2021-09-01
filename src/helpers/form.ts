import Ajv from 'ajv';
import { isAddress } from '@ethersproject/address';

export function abiToDefinition(abi) {
  const definition = {
    title: abi.name,
    type: 'object',
    properties: {},
    additionalProperties: false
  };
  abi.inputs.forEach(input => {
    definition.properties[input.name] = {};
    let type = 'string';
    if (input.type === 'uint256') type = 'number';
    if (input.type === 'bool') type = 'boolean';
    if (input.type === 'address') {
      definition.properties[input.name].format = 'address';
    }
    definition.properties[input.name].type = type;
    definition.properties[input.name].title = input.name;
  });
  return definition;
}

export function isValid(schema, value) {
  const ajv = new Ajv({ allErrors: true });
  ajv.addFormat('address', {
    type: 'string',
    validate: str => isAddress(str.toLowerCase())
  });
  const validate = ajv.compile(schema);
  const valid = validate(value);
  return valid ? valid : validate.errors;
}
