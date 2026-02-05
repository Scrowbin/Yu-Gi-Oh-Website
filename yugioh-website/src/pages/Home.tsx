import type { MainDeckMonster } from "../types/card";
import CardView from "../components/CardView";
import CardImage from "../components/CardImage";
export default function Home(){
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

    return (
        <div className="w-full flex flex-col items-center justify-center">
            {/* Pass the 'blueEyes' variable to the 'card' prop */}
            <CardView card={blueEyes} />
        </div>
    );
}