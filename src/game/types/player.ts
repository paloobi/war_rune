import type { Card } from "./card"

// hand is a tuple with up 0-4 cards (both null at game start)
export type Hand =  [Card | null, Card | null, Card | null, Card | null];

export interface Player {
    playerNum: 1 | 2,
    deck: Card[],
    hand: Hand,
    selectedCard: Card | null,
    war: {
        sacrifices: Card[],
        hero: Card | null
    },
    hp: number,
    wins: number
}