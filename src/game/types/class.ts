// create an array of available classes to be used in CLass object for player state
export const classNames = ["cleric", "knight", "mage", "rogue"] as const;

// create a type of 'cleric' | 'knight' | 'mage' | 'rogue'
// to be able to use it as a type-constrained string union type
// we use number in the [] because that comes from the index of the array
// more info here: https://steveholgado.com/typescript-types-from-arrays/
export type ClassName = typeof classNames[number];
