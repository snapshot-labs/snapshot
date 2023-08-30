/**
 * Orders strategies by spaces count and returns a list of strategies
 * filtered by the search string (case insensitive).
 */

import { STRATEGIES_QUERY, EXTENDED_STRATEGY_QUERY } from '@/helpers/queries';
import { Strategy } from '@/helpers/interfaces';

const strategies = ref<Strategy[]>([]);
const extendedStrategies = ref<Strategy[]>([]);

export function useStrategies() {
  const isLoadingStrategies = ref(false);
  const extendedStrategy = ref<Strategy | null>(null);
  const loadingExtendedStrategy = ref(false);

  const strategyDefinition = computed(() => {
    console.log(extendedStrategy.value)
    if(extendedStrategy.value && extendedStrategy.value.id === 'contract-call') {
      extendedStrategy.value.schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$ref": "#/definitions/Strategy",
        "definitions": {
          "Strategy": {
            "title": "Strategy",
            "type": "object",
            "properties": {
              "symbol": {
                "type": "string",
                "title": "Symbol",
                "examples": ["e.g. ETH"],
                "maxLength": 16
              },
              "address": {
                "type": "string",
                "title": "Contract address",
                "examples": ["e.g. 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"],
                "pattern": "^0x[a-fA-F0-9]{40}$",
                "minLength": 42,
                "maxLength": 42
              },
              "decimals": {
                "type": "integer",
                "title": "Decimals",
                "examples": ["e.g. 18"]
              },
              "methodABI": {
                "type": "object",
                "title": "Method ABI",
                "properties": {
                  "name": {
                    "type": "string",
                    "title": "Name",
                    "examples": ["e.g. balanceOf"]
                  },
                  "inputs": {
                    "type": "array",
                    "title": "Inputs",
                    "items": {
                      "type": "object",
                      "properties": {
                        "name": {
                          "type": "string",
                          "title": "Name",
                          "examples": ["e.g. account"]
                        },
                        "type": {
                          "type": "string",
                          "title": "Type",
                          "examples": ["e.g. address"]
                        },
                        "internalType": {
                          "type": "string",
                          "title": "Internal type",
                          "examples": ["e.g. address"]
                        }
                      },
                      "required": ["name", "type"],
                      "additionalProperties": false
                    }
                  },
                  "outputs": {
                    "type": "array",
                    "title": "Outputs",
                    "items": {
                      "type": "object",
                      "properties": {
                        "name": {
                          "type": "string",
                          "title": "Name",
                          "examples": ["e.g. balance"]
                        },
                        "type": {
                          "type": "string",
                          "title": "Type",
                          "examples": ["e.g. uint256"]
                        },
                        "internalType": {
                          "type": "string",
                          "title": "Internal type",
                          "examples": ["e.g. uint256"]
                        }
                      },
                      "required": ["name", "type"],
                      "additionalProperties": false
                    }
                  }
                }
              },
              "output": {
                "type": "string",
                "title": "Output (Optional)",
                "examples": ["e.g. balance"]
              }
            },
            "required": [],
            "additionalProperties": false
          }
        }
      }
    }

    if(extendedStrategy.value && extendedStrategy.value.id === 'delegation') {
      extendedStrategy.value.schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$ref": "#/definitions/Strategy",
        "definitions": {
          "Strategy": {
            "title": "Strategy",
            "type": "object",
            "properties": {
              "symbol": {
                "type": "string",
                "title": "Symbol",
                "examples": [
                  "e.g. UNI"
                ],
                "maxLength": 16
              },
              "strategies": {
                "type": "array",
                "title": "Strategies",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "title": "Name"
                    },
                    "params": {
                      "type": "object"
                    },
                    "network": {
                      "type": "string",
                      "title": "Network (optional)"
                    }
                  },
                  "required": [
                    "name",
                    "params"
                  ]
                },
                "minItems": 1,
                "maxItems": 8,
                "uniqueItems": true
              },
              "delegationSpace": {
                "type": "string",
                "title": "Delegation space (optional)",
                "examples": [
                  "e.g. poh.eth"
                ]
              }
            },
            "required": [
              "strategies"
            ],
            "additionalProperties": false
          }
        }
      }
      
    }
    
    if (extendedStrategy.value?.schema?.$ref) {
      return extendedStrategy.value.schema.definitions.Strategy;
    }
    return false;
  });

  const filterStrategies = (q = '') =>
    strategies.value
      .filter(s => s.id.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spacesCount - a.spacesCount);

  const { apolloQuery } = useApolloQuery();

  // Get full list of strategies without about, schema and examples
  async function getStrategies() {
    if (strategies.value.length > 0) return;
    isLoadingStrategies.value = true;
    strategies.value = await apolloQuery(
      {
        query: STRATEGIES_QUERY
      },
      'strategies'
    );

    strategies.value = strategies.value.filter(
      strategy => strategy.id !== 'pagination'
    );

    isLoadingStrategies.value = false;
  }

  // Get extended strategy by Id and save it in extendedStrategies
  // don't load strategy if it's already loaded
  async function getExtendedStrategy(id: string) {
    if (extendedStrategies.value.some(st => st?.id === id)) {
      extendedStrategy.value =
        extendedStrategies.value.find(st => st?.id === id) ?? null;
      return;
    }
    loadingExtendedStrategy.value = true;
    const strategyObj = await apolloQuery(
      {
        query: EXTENDED_STRATEGY_QUERY,
        variables: { id }
      },
      'strategy'
    );

    if (strategyObj) {
      extendedStrategies.value.push(strategyObj);
      extendedStrategy.value = strategyObj;
    }

    loadingExtendedStrategy.value = false;
  }

  return {
    filterStrategies,
    getStrategies,
    getExtendedStrategy,
    strategies,
    isLoadingStrategies,
    extendedStrategy,
    strategyDefinition,
    loadingExtendedStrategy
  };
}
