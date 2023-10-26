import type { Card } from "./card"
import { Class } from "../../components/ClassImage";

// hand is a tuple with up 0-4 cards (both null at game start)
export type Hand =  [Card | null, Card | null, Card | null, Card | null];

export interface Player {
    playerId: string,
    playerNum: 1 | 2,
    selectedClass: Class | null,
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