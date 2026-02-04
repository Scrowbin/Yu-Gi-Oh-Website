import type { Card } from "../types/card";
import { isXyz, isLink, isPendulum, hasLevel, isExtraDeck, isOnBanList } from "../types/card"; // Import your guards

interface CardViewProps {
  card: Card;
}

// export default function CardView({ card }: CardViewProps) {
//   return (
//     <div className="card-view-container color-inherit">
//       <div className="background-thing">
//         {/* 1. Image Section */}
//         <span className="rarity"><img src={card.rarity} alt={card.rarity} /></span>
//         <div className="Image">
//           <img className="card-img full-width svelte-1xqpccf" alt="Blue-Eyes White Dragon" srcSet="https://s3.duellinksmeta.com/cards/60c2b3a9a0e24f2d54a5179e_w50.webp 50w, https://s3.duellinksmeta.com/cards/60c2b3a9a0e24f2d54a5179e_w100.webp 100w, https://s3.duellinksmeta.com/cards/60c2b3a9a0e24f2d54a5179e_w140.webp 140w, https://s3.duellinksmeta.com/cards/60c2b3a9a0e24f2d54a5179e_w200.webp 200w, https://s3.duellinksmeta.com/cards/60c2b3a9a0e24f2d54a5179e_w260.webp 260w, https://s3.duellinksmeta.com/cards/60c2b3a9a0e24f2d54a5179e_w360.webp 360w, https://s3.duellinksmeta.com/cards/60c2b3a9a0e24f2d54a5179e_w420.webp 420w" sizes="(min-width: 576px) 300px, (max-width: 575px) 80vw"></img>
//         </div>

//         {/* 2. Info Section */}
//         <div>
//             <div className="info">
//                 <div className="header">
//                     <h2 className="card-name">{card.name}</h2>

//                     {card.cardType === "monster" && (
//                     <div className="monster-info">
//                         <span className="attribute">{card.attribute}</span>
                        
//                         {/* 2. Now these guards are safe to use because 'card' is narrowed to MonsterCard */}
//                         {
//                             isXyz(card) && (<span><img src="rank.png" alt= ""/>{card.rank.toString()}</span>)
//                         }
//                         {
//                             hasLevel(card) && (<span><img src="level.png" alt="" />{card.level.toString()}</span>)
//                         }
//                         {
//                             isPendulum(card) && (<span><img src="pendulum.png" alt="" />{card.pendScale.toString()}</span>)
//                         }
//                     </div>
//                     )}

//                     {card.cardType === "spell" && (
//                         <span>
//                             <img src="spell.png" alt="" />Spell 
//                             <img src={card.spellType + ".png"} alt="" /> {card.spellType}
//                         </span>
//                     )}
//                     {card.cardType === "trap" && (
//                         <span>
//                             <img src="spell.png" alt="" />Spell 
//                             <img src={card.trapType + ".png"} alt="" /> {card.trapType}
//                         </span>
//                     )}
//                 </div>

//                 {/* card tpyes */}
//                 {
//                     card.cardType === "monster" && 
//                     (
//                         <div className="monster-type-line">
//                             [ {card.monsterType} / {card.monsterCardType.join(" / ")} ]
//                         </div>
//                     )
//                 }

//                 {/* Card Effect */}
//                 {card.cardType === "monster" &&
//                     (
//                         isExtraDeck(card) && 
//                         <div className="text-italic">{card.material}</div>
//                     )
//                 }
//                 <p className="effect-text">{card.effect}</p>


//                 {
//                     card.cardType === "monster" && 
//                     (
//                         isPendulum(card) && 
//                         <div className="pend-effect">
//                             <span> [Pendulum Effect]</span>
//                             <span>
//                                 {card.pendEffect}
//                             </span>
//                         </div>
//                     )
//                 }

//                 {
//                     card.cardType === "monster" &&
//                     <div className="atk-def">
//                         ATK/{card.atk} {isLink(card) ? <div>LINK - {card.linkNumber}</div> : ` DEF/${card.def}`}
//                     </div>
//                 }
                
//                 <div className="footer">
//                     {isOnBanList(card) && <span className="status-tag"><img src={card.status + ".png"} alt="" />{card.status}</span>}
//                 </div>
//             </div>

//         </div>
//       </div>
//     </div>
//   );
// }

export default function CardView({ card }: CardViewProps) {
  return (
    <div className="card-view-container my-4 color-inherit">
      {/* Container: Stacked on mobile, side-by-side on md+ */}
      <div className="background-thing flex flex-col md:flex-row rounded-lg overflow-hidden border border-gray-800 shadow-2xl ">
        
        {/* 1. Image Section */}
        <div className="md:w-1/2 lg:w-2/5">
          {/* Rarity Overlay */}
          

          <div className="Image flex flex-col items-center justify-center">
            <span className="rarity ml-auto">
                <img src={card.rarity} alt={card.rarity} className=" h-auto" />
            </span>
            <img 
              className="ml-auto object-contain shadow-lg rounded-sm w-[clamp(200px,40vw,262px)] h-auto"
              alt={card.name} 
              src= {`src/assets/cards/${card.id}.webp`}
            />
          </div>
        </div>

        {/* 2. Info Section */}
        <div className="info flex-1 flex flex-col gap-4 overflow-y-auto">
          
          <div className="header flex flex-col gap-2 border-b border-gray-700 pb-3">
            <h2 className="text-2xl font-bold tracking-tight uppercase leading-tight">{card.name}</h2>

            {card.cardType === "monster" && (
              <div className="monster-info flex flex-wrap items-center gap-3 text-sm font-bold">
                <span className="attribute text-orange-400">{card.attribute}</span>
                
                {isXyz(card) && (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <img src="rank.png" alt="Rank" className="w-4 h-4" />{card.rank}
                  </span>
                )}
                {hasLevel(card) && (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <img src="level.png" alt="Level" className="w-4 h-4" />{card.level}
                  </span>
                )}
                {isPendulum(card) && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <img src="pendulum.png" alt="Scale" className="w-4 h-4" />{card.pendScale}
                  </span>
                )}
              </div>
            )}

            {card.cardType === "spell" && (
              <span className="flex items-center gap-2 text-emerald-300 font-bold uppercase text-sm">
                <img src="spell.png" alt="" className="w-5" />Spell 
                <img src={`${card.spellType}.png`} alt="" className="w-5" /> {card.spellType}
              </span>
            )}
            
            {card.cardType === "trap" && (
              <span className="flex items-center gap-2 text-pink-400 font-bold uppercase text-sm">
                <img src="trap.png" alt="" className="w-5" />Trap 
                <img src={`${card.trapType}.png`} alt="" className="w-5" /> {card.trapType}
              </span>
            )}
          </div>

          {/* Monster Type Line */}
          {card.cardType === "monster" && (
            <div className="monster-type-line font-bold text-gray-300 text-sm">
              [ {card.monsterType} / {card.monsterCardType.join(" / ")} ]
            </div>
          )}

          {/* Material / Effect Text */}
          <div className="effect-content flex flex-col gap-3 grow">
            {card.cardType === "monster" && isExtraDeck(card) && (
              <div className="text-italic text-gray-400 italic text-sm border-l-2 border-gray-600 pl-3">
                {card.material}
              </div>
            )}
            
            <p className="effect-text text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
              {card.effect}
            </p>

            {card.cardType === "monster" && isPendulum(card) && (
              <div className="pend-effect mt-2 p-3 bg-emerald-950/20 border border-emerald-900/50 rounded text-sm">
                <span className="block font-bold text-emerald-400 mb-1">[Pendulum Effect]</span>
                <span className="text-emerald-100/80 leading-snug">{card.pendEffect}</span>
              </div>
            )}
          </div>

          {/* Stats & Footer */}
          <div className="footer flex flex-col gap-4 mt-auto pt-4 border-t border-gray-800">
            {card.cardType === "monster" && (
              <div className="atk-def flex items-center justify-end gap-6 font-mono text-lg font-bold">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">ATK/</span>{card.atk}
                </div>
                {isLink(card) ? (
                  <div className="text-blue-400 flex items-baseline gap-1">
                    <span className="text-xs text-gray-500">LINK-</span>{card.linkNumber}
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-500">DEF/</span>{card.def}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-center">
               <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">{card.id}</span>
               {isOnBanList(card) && (
                 <span className="status-tag flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-[10px] font-bold uppercase tracking-wider text-red-400">
                   <img src={`${card.status}.png`} alt="" className="w-3 h-3" />
                   {card.status}
                 </span>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}