import { GameStage, GameState } from "./types/game";
import { buildDeck, getCardValueFromRank, shuffle } from "./utils";

export const dealCards = (game: GameState) => {
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
}

export const drawCards = (game: GameState) => {
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
}

export const joker = (game: GameState) => {
  if (game.stage !== GameStage.Joker) {
    console.log("Not the joker stage, skipping joker action");
    return;
  }
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
}

export const revealCards = (game: GameState) => {
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
      }
      if (game.stage === GameStage.WarReveal) {
        game.stage = GameStage.WarScore;
      }
    }

export const scoreCards = (game: GameState) => {
  if (game.stage !== GameStage.Score && game.stage !== GameStage.WarScore) {
    console.log("skipping scoring for now, the stage isn't Score or WarScore yet")
    console.log("STAGE: ", game.stage);
    return;
  }
  const playerOneCard = game.stage === GameStage.WarScore
    ? game.players.one.war.hero
    : game.players.one.selectedCard;
  
  const playerTwoCard = game.stage === GameStage.WarScore
    ? game.players.two.war.hero
    : game.players.two.selectedCard;

  if (!playerOneCard || !playerTwoCard) {
    throw new Error("Both players must have a selected card");
  }
  
  const playerOneValue = getCardValueFromRank(playerOneCard.rank);
  const playerTwoValue = getCardValueFromRank(playerTwoCard.rank);

  let winner: 'one' | 'two' | null = null;
  // if either player plays a joker, initiate joker phase
  if (playerOneCard.suit === 'joker' || playerTwoCard.suit === 'joker') { 
    game.stage = GameStage.Joker;
  } else if (playerOneValue > playerTwoValue) {
    // player 1 wins, player 2 loses HP
    winner = 'one';
    game.players.one.wins++;
    game.players.two.hp -= playerOneValue - playerTwoValue;

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
  } else if (playerOneValue < playerTwoValue) {
    // player 2 wins, player 1 loses HP
    winner = 'two';
    game.players.two.wins++;
    game.players.one.hp -= playerTwoValue - playerOneValue;

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
    }

    // If already in a war and tie, then move to discard stage to split cards
    if (game.stage === GameStage.WarScore) {
      game.stage = GameStage.Discard;
    }
  }

  if (game.stage === GameStage.Discard && winner) {
    game.players[winner].deck.push(
      playerOneCard,
      playerTwoCard
    );

    if (game.players.one.war.hero && game.players.two.war.hero) {
      // in a tie, all the cards go to the winner
      game.players[winner].deck.push(
        game.players.one.war.hero,
        game.players.two.war.hero,
        ...game.players.one.war.sacrifices,
        ...game.players.two.war.sacrifices
      );
      game.players.one.war = {
        hero: null,
        sacrifices: [],
      };
      game.players.two.war = {
        hero: null,
        sacrifices: [],
      }
    }
    // reset selected cards to null
    game.players.one.selectedCard = null;
    game.players.two.selectedCard = null;
    game.stage = GameStage.Draw;
  }

  // if there is no winner (tie) when playing a war hero card (i.e., in a war)
  if (
    game.players.one.war.hero && 
    game.players.two.war.hero && 
    game.players.one.selectedCard &&
    game.players.two.selectedCard &&
    !winner) {
    // Player 1 gets their cards back
    game.players.one.deck.push(
      {...game.players.one.selectedCard, isHidden: true}
    );

      game.players.one.deck.push(
        {...game.players.one.war.hero, isHidden: true},
        ...game.players.one.war.sacrifices.map(card => ({...card, isHidden: true}))
      );

      game.players.one.war = {
        hero: null,
        sacrifices: [],
      };
    
    // reset selected cards to null
    game.players.one.selectedCard = null;


    // Player 2 gets their cards back
    game.players.two.deck.push(
      {...game.players.two.selectedCard, isHidden: true}
    );

      game.players.two.deck.push(
        {...game.players.two.war.hero, isHidden: true},
        ...game.players.two.war.sacrifices.map(card => ({...card, isHidden: true}))
      );

      game.players.two.war = {
        hero: null,
        sacrifices: [],
      };
    
    // reset selected cards to null
    game.players.two.selectedCard = null;

    console.dir(game.players.one.deck);
    console.dir(game.players.two.deck)

    game.stage = GameStage.Draw;
  }
}
