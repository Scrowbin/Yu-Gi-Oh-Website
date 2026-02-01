import { MainDeckMonster } from "../src/types/card";
import { isMainDeck } from '../src/types/card';

const blueEyes: MainDeckMonster = {
  id: "0001",
  name: "Blue-Eyes White Dragon",
  effect: "This legendary dragon is a powerful engine of destruction.",
  status: "unlimited",
  cardFrame: "Normal",
  cardType: "monster",
  rarity: "Ultra Rare (UR)",

  attribute: "LIGHT",
  monsterType: "Dragon",
  monsterCardType: ["Normal", "Main Deck"],

  atk: 3000,
  def: 2500,
  level: 8,
};

console.log("Test card:");
if (isMainDeck(blueEyes)) console.log("hellyeah");