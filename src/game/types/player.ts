import type { Card } from "./card"
import { PlayerClass } from "./class";

// hand is a tuple with up 0-4 cards (both null at game start)
export type Hand =  [Card | null, Card | null, Card | null, Card | null];

export interface Player {
    playerId: string,
    playerNum: 1 | 2,
    selectedClass: PlayerClass | null,
    usingAbility: boolean,
    rogueStealCardOptions: Card[],
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