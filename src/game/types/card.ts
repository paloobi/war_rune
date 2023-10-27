// NOTE: All naming in here is based on the file names for the images
// to make it easier to load the correct image based on suit and rank

// create an array of available suits, so we can use it to generate the deck
export const cardSuits = ['hearts', 'diamonds', 'clubs', 'spades', 'joker'] as const;

// create a type of 'heart' | 'diamonds' | 'clubs' | 'spades'
// to be able to use it as a type-constrained string union type
// we use number in the [] because that comes from the index of the array
// more info here: https://steveholgado.com/typescript-types-from-arrays/
export type CardSuit = typeof cardSuits[number];

export const cardRanks = ['A', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'red', 'black']
export type CardRank = typeof cardRanks[number];

export interface Card {
    suit: CardSuit,
    rank: CardRank,
}

