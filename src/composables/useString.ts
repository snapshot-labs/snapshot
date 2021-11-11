export function useString() {
  function toFirstUpperCase(value: Array<string>) {
    return value.map(word => word[0].toUpperCase() + word.substr(1));
  }

  function toFirstLowerCase(value: Array<string>) {
    return value.map(word => word[0].toLowerCase() + word.substr(1));
  }

  return {
    toFirstUpperCase,
    toFirstLowerCase
  };
}
