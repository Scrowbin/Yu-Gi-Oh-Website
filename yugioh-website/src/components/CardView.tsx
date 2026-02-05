import type { Card } from "../types/card";
import { isXyz, isLink, isPendulum, hasLevel, isExtraDeck, isOnBanList } from "../types/card"; // Import your guards
import CardImage from "./CardImage";

interface CardViewProps {
  card: Card;
}



export default function CardView({ card }: CardViewProps) {
  return (
    <div className="w-full max-w-[750px]">
      
      {/* =====================
          DIV 1: Card name
         ===================== */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight p-[4px] text-center">
        {card.name}
      </h1>

      {/* =====================
          DIV 2: Image + Info
         ===================== */}
      <div
        className="
          background-thing
          flex flex-col
          sm:flex-row
          gap-4
          rounded-lg
          border border-gray-800
          shadow-2xl
          p-4
        "
      >
        {/* ---------- Image ---------- */}
        <div
          className="
            w-1/2
            sm:w-1/3
            flex-shrink-0
          "
        >
          <CardImage card={card} />
        </div>

        {/* ---------- Info ---------- */}
        <div
          className="
            w-full
            sm:w-2/3
            flex flex-col
            gap-4
            overflow-y-auto
          "
        >
          {/* Header */}
          <div className="flex flex-col gap-2 border-b border-gray-700 pb-3">
            {card.cardType === "monster" && (
              <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
                <span className="text-orange-400">{card.attribute}</span>

                {isXyz(card) && (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <img src="rank.png" className="w-4 h-4" />
                    {card.rank}
                  </span>
                )}

                {hasLevel(card) && (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <img src="level.png" className="w-4 h-4" />
                    {card.level}
                  </span>
                )}

                {isPendulum(card) && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <img src="pendulum.png" className="w-4 h-4" />
                    {card.pendScale}
                  </span>
                )}
              </div>
            )}

            {card.cardType === "spell" && (
              <span className="flex items-center gap-2 text-emerald-300 font-bold text-sm uppercase">
                <img src="spell.png" className="w-5" />
                Spell
                <img src={`${card.spellType}.png`} className="w-5" />
                {card.spellType}
              </span>
            )}

            {card.cardType === "trap" && (
              <span className="flex items-center gap-2 text-pink-400 font-bold text-sm uppercase">
                <img src="trap.png" className="w-5" />
                Trap
                <img src={`${card.trapType}.png`} className="w-5" />
                {card.trapType}
              </span>
            )}
          </div>

          {/* Monster Type */}
          {card.cardType === "monster" && (
            <div className="text-sm font-bold text-gray-300">
              [ {card.monsterType} / {card.monsterCardType.join(" / ")} ]
            </div>
          )}

          {/* Effect */}
          <div className="flex flex-col gap-3 grow">
            {card.cardType === "monster" && isExtraDeck(card) && (
              <div className="italic text-gray-400 text-sm border-l-2 border-gray-600 pl-3">
                {card.material}
              </div>
            )}

            <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
              {card.effect}
            </p>

            {card.cardType === "monster" && isPendulum(card) && (
              <div className="mt-2 p-3 rounded border border-emerald-900/50 bg-emerald-950/20 text-sm">
                <span className="block font-bold text-emerald-400 mb-1">
                  [Pendulum Effect]
                </span>
                <span className="text-emerald-100/80">
                  {card.pendEffect}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 mt-auto border-t border-gray-800 flex flex-col gap-3">
            {card.cardType === "monster" && (
              <div className="flex justify-end gap-6 font-mono text-lg font-bold">
                <span>
                  <span className="text-xs text-gray-500">ATK/</span>
                  {card.atk}
                </span>

                {isLink(card) ? (
                  <span className="text-blue-400">
                    <span className="text-xs text-gray-500">LINK-</span>
                    {card.linkNumber}
                  </span>
                ) : (
                  <span>
                    <span className="text-xs text-gray-500">DEF/</span>
                    {card.def}
                  </span>
                )}
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">
                {card.id}
              </span>

              {isOnBanList(card) && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-[10px] font-bold uppercase tracking-wider text-red-400">
                  <img src={`${card.status}.png`} className="w-3 h-3" />
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
