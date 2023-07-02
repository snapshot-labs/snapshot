import { StandardConfig } from './standardConfig';
import { CompoundGovernorConfig } from './compound';

export function createStandardConfig(standard: string): StandardConfig {
  switch (standard) {
    case 'compound-governor':
      return new CompoundGovernorConfig();

    default:
      throw new Error(`Unsupported standard: ${standard}`);
  }
}

export { StandardConfig };
