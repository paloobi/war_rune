import type { RuneClient } from "rune-games-sdk/multiplayer"
import type { GameState } from "./game/types/game";
import { PlayerClass } from "./game/types/class";
import { GameStage } from "./game/types/game";
import { Card } from "./game/types/card";
import { buildDeck, getCardValueFromRank, getTwoRandomCardsFromDeck, shuffle } from "./game/utils";
import { Player } from "./game/types/player";

export const MAX_HP = 50;

type GameActions = {
  setStage: (params: { stage: GameStage }) => void
  selectClass: (playerClass: PlayerClass) => void,
  dealCards: () => void,
  joker: () => void,
  drawCards: () => void,
  selectCard: (params: { playerId: "one" | "two", card: Card, cardIndex: number }) => void,
  revealCards: () => void,
  scoreCards: () => void
  useClericAbility: () => void
  stealCard: (params: { playerId: "one" | "two", index: number }) => void 
  doNotUseClericAbility: () => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

const getInitialState = (allPlayerIds: string[]): GameState => {
  return {
    stage: GameStage.ClassSelect,
    players: {
      one: {
        playerId: allPlayerIds[0],
        playerNum: 1,
        selectedClass: null,
        usingAbility: false,
        rogueStealCardOptions: [],
        deck: [],
        hand: [null, null, null, null],
        war: {
          sacrifices: [],
          hero: null
        },
        selectedCard: null,
        hp: MAX_HP,
        wins: 0,
      },
      two: {
        playerId: allPlayerIds[1],
        playerNum: 2,
        selectedClass: null,
        usingAbility: false,
        rogueStealCardOptions: [],
        deck: [],
        hand: [null, null, null, null],
        selectedCard: null,
        war: {
          sacrifices: [],
          hero: null
        },
        hp: MAX_HP,
        wins: 0,
      },
    },
  }
}

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  setup: (allPlayerIds): GameState => {
    return getInitialState(allPlayerIds);
  },
  actions: {
    setStage: ({ stage }, { game }) => {
      game.stage = stage;
    },

    selectClass: (playerClass, {playerId, game}) => {
      if (game.stage !== GameStage.ClassSelect) {
        throw Rune.invalidAction();
      }

      const playerOne = game.players.one;
      const playerTwo = game .players.two;

      if (playerOne.playerId === playerId) {
          playerOne.selectedClass = playerClass;
        } else if (playerTwo.playerId === playerId) {
          playerTwo.selectedClass = playerClass
        } else {
          throw Rune.invalidAction()
        }

        //TODO: make mage always have property usingAbility set to true (passive ability)

      if (playerOne.selectedClass && playerTwo.selectedClass){
        game.stage = GameStage.Start;
      }
        
    },

    dealCards: (_, {game}) => {
      if (game.stage !== GameStage.Deal) {
        throw Rune.invalidAction();
      }

      const deck = buildDeck();
      
      // deal the deck between the two player decks
      deck.forEach((card, index) => {
        if (index % 2 === 0) {
          game.players.one.deck.push(card);
        } else {
          game.players.two.deck.push(card);
        }
      });

      game.stage = GameStage.Draw;
    },

    drawCards: (_, {game}) => {
      if (game.stage !== GameStage.Draw) {
        console.log(`Skipping draw for now, it's ${game.stage} stage`);
        return;
      }

      const playerOne = game.players.one;
      const playerOneHand = playerOne.hand;
      for (let i = 0; i < playerOneHand.length; i++) {
          if (!playerOneHand[i]) {
            const cardToDraw = playerOne.deck.shift();
            if (cardToDraw) {
              playerOneHand[i] = cardToDraw;
              cardToDraw.isHidden = false;
            } else {
              game.stage = GameStage.End;
              Rune.gameOver({
                players: {
                  [game.players.two.playerId]: "WON",
                  [game.players.one.playerId]: "LOST",
                }
              })
            }
          }
        }

      const playerTwo = game.players.two;
      const playerTwoHand = playerTwo.hand;
      for (let i = 0; i < playerTwoHand.length; i++) {
        if (!playerTwoHand[i]) {
          const cardToDraw = playerTwo.deck.shift();
          if (cardToDraw) {
            playerTwoHand[i] = cardToDraw;
            cardToDraw.isHidden = false;
          } else {
            game.stage = GameStage.End;
            Rune.gameOver({
              players: {
                [game.players.one.playerId]: "WON",
                [game.players.two.playerId]: "LOST",
              }
            })
          }
        }
      }

      if (game.stage !== GameStage.End) {
        game.stage = GameStage.Select;
      }
    },

    joker: (_, {game}) => {
      if (game.stage !== GameStage.Joker) {
        console.log("Not the joker stage, skipping joker action");
        return;
      }
      console.log("performing joker action");

      // put each players hand and selected card into their deck
      const playerOne = game.players.one;
      const playerTwo = game.players.two;

      for (let i = 0; i < playerOne.hand.length; i++) {
        const card = playerOne.hand[i];
        if (card) {
          // push card into other players deck
          playerTwo.deck.push(card)
        
          // remove card from players hand
          playerOne.hand[i] = null;
        }
      }
      const playerOneCard = playerOne.selectedCard ? playerOne.selectedCard : null;
      if (playerOneCard) playerTwo.deck.push(playerOneCard)
      playerOne.selectedCard = null;

      for (let i = 0; i < playerTwo.hand.length; i++) {
        const card = playerTwo.hand[i];
        if (card) {
          // push card into other players deck
          playerOne.deck.push(card)
          // remove card from players hand
          playerTwo.hand[i] = null;
        }
      }
      const playerTwoCard = playerTwo.selectedCard ? playerTwo.selectedCard : null;
      if (playerTwoCard) playerOne.deck.push(playerTwoCard)
      playerTwo.selectedCard = null;

      // shuffle each players deck
      console.log("shuffling the deck");
      shuffle(playerOne.deck)
      shuffle(playerTwo.deck)
      // move to draw phase
      game.stage = GameStage.Draw;
      // call draw action
    },

    selectCard: (
      {playerId, card, cardIndex},
      {game}
    ) => {
      const player = game.players[playerId];
      const opposingPlayer = playerId === "one" ? game.players.two : game.players.one;

      if (game.stage !== GameStage.Select && game.stage !== GameStage.WarSelect) {
        console.log("skipping SelectCard for now because stage was not Select or WarSelect")
        console.log("game stage: ", game.stage)
      }

      if (game.stage === GameStage.Select) {
        if (!player.selectedCard) {
          player.selectedCard = {...card, isHidden: true};
          player.hand[cardIndex] = null;
        }
        // if both players have selected cards
        if ( 
          Object.values(game.players).every(
            (player: Player) => !!player.selectedCard
          )
        ) {
  
          game.stage = GameStage.Reveal;
          console.log("stage changed to: ", game.stage )

          }
        } else {
          if (player.war.sacrifices.length < 2) {
            player.war.sacrifices.push({...card, isHidden: true});
          } else if (!player.war.hero) {
            player.war.hero = {...card, isHidden: true};
          } else {
            throw new Error('The tie-breaker already ended');
          }
          // remove card from hand
          player.hand[cardIndex] = null;
        }
          if (game.players.one.war.hero && game.players.two.war.hero) {
            game.stage = GameStage.WarReveal;
            console.log("stage changed to: ", game.stage )
            if (game.players.one.selectedClass === "cleric" || game.players.two.selectedClass === "cleric") {
              game.stage = GameStage.ClericAbility;
              console.log("stage changed to: ", game.stage )

            } 
          }
    },

    // TODO: change to work only when selecting card of certain suit
    useClericAbility: (_, {playerId, game}) => {
      if (game.stage !== GameStage.ClericAbility) {
        console.log("Cannot use cleric ability if not in ClericAbility game stage")
        throw Rune.invalidAction()
      }

      const playerOne = game.players.one;
      const playerTwo = game.players.two;

        if (playerOne.playerId === playerId && playerOne.selectedClass === "cleric") {
          playerOne.usingAbility = true;
        }

        if (playerTwo.playerId === playerId && playerTwo.selectedClass === "cleric") {
          playerTwo.usingAbility = true;
        }

        if (playerOne.war.hero && playerTwo.war.hero) {
          game.stage = GameStage.WarReveal;
          console.log("stage changed to: ", game.stage )
        } else {
          game.stage = GameStage.Reveal;
          console.log("stage changed to: ", game.stage )
        }
    },

    doNotUseClericAbility: (_, {game}) => {
      const playerOne = game.players.one;
      const playerTwo = game.players.two;

      if (playerOne.war.hero && playerTwo.war.hero) {
        game.stage = GameStage.WarReveal
        console.log("stage changed to: ", game.stage )
      } else {
        game.stage = GameStage.Reveal;          
        console.log("stage changed to: ", game.stage )
      }
    },

    revealCards: (_, {game}) => {
      if (game.stage !== GameStage.WarReveal && game.stage !== GameStage.Reveal) {
        console.log("skipping scoring for now, the stage isn't Score or WarScore yet")
        console.log("STAGE: ", game.stage);
        return;
      }
      const playerOne = game.players.one;
      const playerTwo = game.players.two;
      if (!playerOne.selectedCard || !playerTwo.selectedCard) {
        throw Rune.invalidAction();
      }
      // reveal all selected cards
      playerOne.selectedCard = {...playerOne.selectedCard, isHidden: false};
      playerTwo.selectedCard = {...playerTwo.selectedCard, isHidden: false};

      if (game.stage === GameStage.WarReveal && playerOne.war.hero && playerTwo.war.hero) {
        // reveal player one's war cards
        playerOne.war.hero = {...playerOne.war.hero, isHidden: false};
        playerOne.war.sacrifices = playerOne.war.sacrifices.map(card => ({...card, isHidden: false}))

        // reveal player two's war cards
        playerTwo.war.hero = {...playerTwo.war.hero, isHidden: false};
        playerTwo.war.sacrifices = playerTwo.war.sacrifices.map(card => ({...card, isHidden: false}))
      }

      if (game.stage === GameStage.Reveal) {
        game.stage = GameStage.Score;
        console.log("stage changed to: ", game.stage )
      }
      if (game.stage === GameStage.WarReveal) {
        game.stage = GameStage.WarScore;
        console.log("stage changed to: ", game.stage )
      }
    },

    scoreCards: (_, {game}) => {

      if (game.stage !== GameStage.Score && game.stage !== GameStage.WarScore) {
        console.log("skipping scoring for now, the stage isn't Score or WarScore yet")
        console.log("STAGE: ", game.stage);
        return;
      }

      const playerOne = game.players.one;
      const playerTwo = game.players.two;

      const playerOneCard = game.stage === GameStage.WarScore
        ? playerOne.war.hero
        : playerOne.selectedCard;
      
      const playerTwoCard = game.stage === GameStage.WarScore
        ? playerTwo.war.hero
        : playerTwo.selectedCard;

      if (!playerOneCard || !playerTwoCard) {
        throw new Error("Both players must have a selected card");
      }
     
      const playerOneValue = getCardValueFromRank(playerOneCard, playerOne.selectedClass === "mage");
      const playerTwoValue = getCardValueFromRank(playerTwoCard, playerTwo.selectedClass === "mage");

      const didKnightPlaySpade = (
        playerOne.selectedClass === "knight" && 
        playerOne.selectedCard &&
        playerOne.selectedCard.suit === "spades") ||
      (
       playerTwo.selectedClass === "knight" && 
        playerTwo.selectedCard &&
        playerTwo.selectedCard.suit === "spades");

      let winner: 'one' | 'two' | null = null;
      // if either player plays a joker, initiate joker phase
      if (playerOneCard.suit === 'joker' || playerTwoCard.suit === 'joker') { 
        game.stage = GameStage.Joker;
      
      // player 1 wins, player 2 loses HP
      } else if (didKnightPlaySpade && game.stage === GameStage.Score) {
        // move to a war if initial card selections are a tie
        if (game.stage === GameStage.Score) {
          game.stage = GameStage.WarSelect;
          console.log("stage changed to: ", game.stage )
        }
      } else if (playerOneValue > playerTwoValue) {
        // player 1 wins...
        winner = 'one';
        playerOne.wins++;
        // if winner is cleric using ability
        if (
          playerOne.selectedClass === "cleric" && 
          playerOne.usingAbility &&
          playerOneCard.suit === "hearts"
        ) {
          // player 1 heals hp
          playerOne.hp += playerOneValue - playerTwoValue;
        } else {
          // ...player 2 loses HP
          playerTwo.hp -= playerOneValue - playerTwoValue;
        }

        // GAME OVER: If player 2 is reduced to 0 HP
        if (game.players.two.hp < 1) {
          game.stage = GameStage.End;
          Rune.gameOver({
            players: {
              [game.players.one.playerId]: "WON",
              [game.players.two.playerId]: "LOST"
            },
            delayPopUp: false
          })
        }

        game.stage = GameStage.Discard;

      // player 2 wins, player 1 loses HP
      } else if (playerOneValue < playerTwoValue) {
        // player 2 wins... 
        winner = 'two';
        playerTwo.wins++;

        // if winner is cleric using ability
        if (
          playerTwo.selectedClass === "cleric" && 
          playerTwo.usingAbility &&
          playerTwoCard.suit === "hearts"
        ) {
          // player 2 heals hp
          playerTwo.hp += playerTwoValue - playerOneValue;
        } else {
          // ...player 1 loses HP
          playerOne.hp -= playerTwoValue - playerOneValue;
        }

        // GAME OVER: If player 1 is reduced to 0 HP
        if (game.players.one.hp < 1) {
          game.stage = GameStage.End;
          Rune.gameOver({
            players: {
              [game.players.two.playerId]: "WON",
              [game.players.one.playerId]: "LOST"
            },
            delayPopUp: false
          })
        }
        
        game.stage = GameStage.Discard;

      } else {
        // move to a war if initial card selections are a tie
        if (game.stage === GameStage.Score) {
          game.stage = GameStage.WarSelect;
          console.log("stage changed to: ", game.stage )
        }

        // If already in a war and tie, then move to discard stage to split cards
        if (game.stage === GameStage.WarScore) {
          game.stage = GameStage.Discard;
          console.log("stage changed to: ", game.stage )
        }
      }

      // after resolving scoring, discard the cards
      // TODO: move this into a separate action so we can allow
      // more time to view score before discard occurs
      if (game.stage === GameStage.Discard && winner) {
        game.players[winner].deck.push(
          playerOneCard,
          playerTwoCard
        );

        if (playerOne.war.hero && playerTwo.war.hero) {
          // if War winner was a rogue who played a club
          if (
            game.players[winner].selectedClass === "rogue" &&
            game.players[winner].war.hero?.suit === "clubs"
          ) {
            game.stage = GameStage.Steal;
            console.log("stage changed to: ", game.stage )
          } else {
            game.stage = GameStage.Draw;
            console.log("stage changed to: ", game.stage )
          }
          // in a tie, all the cards go to the winner
          game.players[winner].deck.push(
            playerOne.war.hero,
            playerTwo.war.hero,
            ...playerOne.war.sacrifices,
            ...playerTwo.war.sacrifices
          );
          playerOne.war = {
            hero: null,
            sacrifices: [],
          };
          playerTwo.war = {
            hero: null,
            sacrifices: [],
          }
        } else {
          // if winner was a rogue who played a club
          if (
            game.players[winner].selectedClass === "rogue" &&
            game.players[winner].selectedCard?.suit === "clubs"
          ) {
            game.stage = GameStage.Steal;
            console.log("stage changed to: ", game.stage )
          } else {
            game.stage = GameStage.Draw;
            console.log("stage changed to: ", game.stage )
          }
        }

        // reset selected cards to null
        playerOne.selectedCard = null;
        playerTwo.selectedCard = null;

        // Stop using cleric or knight ability
        if (playerOne.selectedClass === "cleric") {
          playerOne.usingAbility = false;
        }

        if (playerTwo.selectedClass === "cleric") {
          playerTwo.usingAbility = false;
        }
      }

      // select two random cards from opponent's deck in reserve for a rogue steal ability
      playerOne.rogueStealCardOptions = getTwoRandomCardsFromDeck(playerTwo.deck);
      playerTwo.rogueStealCardOptions = getTwoRandomCardsFromDeck(playerOne.deck);
      
      // if there is no winner (tie) when playing a war hero card (i.e., in a war)
      if (
        playerOne.war.hero && 
        playerTwo.war.hero && 
        playerOne.selectedCard &&
        playerTwo.selectedCard &&
        !winner) {
        // Player 1 gets their cards back
        playerOne.deck.push(
          {...playerOne.selectedCard, isHidden: true}
        );

          playerOne.deck.push(
            {...playerOne.war.hero, isHidden: true},
            ...playerOne.war.sacrifices.map(card => ({...card, isHidden: true}))
          );

          playerOne.war = {
            hero: null,
            sacrifices: [],
          };
        
        // reset selected cards to null
        playerOne.selectedCard = null;


        // Player 2 gets their cards back
        playerTwo.deck.push(
          {...playerTwo.selectedCard, isHidden: true}
        );

          playerTwo.deck.push(
            {...playerTwo.war.hero, isHidden: true},
            ...playerTwo.war.sacrifices.map(card => ({...card, isHidden: true}))
          );

          playerTwo.war = {
            hero: null,
            sacrifices: [],
          };
        
        // reset selected cards to null
        playerTwo.selectedCard = null;

        console.dir(playerOne.deck);
        console.dir(playerTwo.deck)

        game.stage = GameStage.Draw;
        console.log("stage changed to: ", game.stage )
      }

       // Stop using cleric or knight ability
      if (playerOne.selectedClass === "cleric" || playerOne.selectedClass === "knight") {
        playerOne.usingAbility = false;
      }

      if (playerTwo.selectedClass === "cleric" || playerTwo.selectedClass === "knight") {
        playerTwo.usingAbility = false;
      }

      // select two random cards from opponent's deck in reserve for a rogue steal ability
      playerOne.rogueStealCardOptions = getTwoRandomCardsFromDeck(playerTwo.deck);
      playerTwo.rogueStealCardOptions = getTwoRandomCardsFromDeck(playerOne.deck);

    },

    stealCard: ({playerId, index}, {game}) => {
      if (game.stage !== GameStage.Steal) {
        console.log("skipping steal for now, the stage isn't Steal")
        console.log("STAGE: ", game.stage);
        return;
      }

      const player = game.players[playerId];
      const opposingPlayer = playerId === "one" ? game.players.two : game.players.one;

      //steal card
      player.deck.push(player.rogueStealCardOptions[index]);

      // give opponent new deck without stolen card
      const newOpponentDeck = opposingPlayer.deck.filter(card => {
        const cardValues = Object.values(card);
        console.log(cardValues)
        const stolenCardValues = Object.values(player.rogueStealCardOptions[index])
        console.log(stolenCardValues)

        console.log(!cardValues.includes(stolenCardValues[0]), !cardValues.includes(stolenCardValues[1]))
        if (!cardValues.includes(stolenCardValues[0]) && !cardValues.includes(stolenCardValues[1])) {
          return true;
        }
      });

      
      opposingPlayer.deck = newOpponentDeck;

      game.stage = GameStage.Draw
    }

  },
})
