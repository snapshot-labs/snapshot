export interface Strategy {
  id: string;
  spacesCount: number;
  author: string;
  version: string;
  about?: string;
  schema?: StrategySchema | null;
  examples?: StrategyExample[];
}

interface StrategyExample {
  name: string;
  strategy: Record<string, any>;
  network: string;
  addresses: string[];
  snapshot: number;
}

interface StrategySchema {
  $schema: string;
  $ref: string;
  definitions: {
    Strategy: Record<string, unknown>;
  };
}

export interface StrategyDefinitionProperties {
  type: string;
  title: string;
  default?: any;
  examples?: string[];
  description?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}
export interface StrategyDefinition {
  title: string;
  type: string;
  default?: any;
  description?: string;
  required?: string[];
  additionalProperties?: boolean;
  properties?: StrategyDefinitionProperties;
}

export interface ProfileActivity {
  id: string;
  created: number;
  type: string;
  title: string;
  space: { id: string; avatar: string };
  vote?: { proposalId: string; choice: string; type: string };
}
