// create an array of available classes to be used in CLass object for player state
export const playerClasses = ["cleric", "mage", "rogue", "knight"] as const;

// create a type of 'cleric' | 'knight' | 'mage' | 'rogue'
// to be able to use it as a type-constrained string union type
// we use number in the [] because that comes from the index of the array
// more info here: https://steveholgado.com/typescript-types-from-arrays/
export type PlayerClass = typeof playerClasses[number];

export interface classSuitMapType {
    [cleric: string]: string
    mage: string
    rogue: string
    knight: string
}

export const getSuitFromClass = (playerClass: string) => {
    const classSuitMap: classSuitMapType= {
        cleric: "hearts",
        mage: "diamonds",
        rogue: "clubs",
        knight: "spades"
    }

    return classSuitMap[playerClass];
}