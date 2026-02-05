import type { Card } from "../types/card";
import {isOnBanList } from "../types/card"; 

interface CardImageProps {
    card: Card;
}
const numberBanList ={
    "forbidden": "https://www.masterduelmeta.com/_app/immutable/assets/forbidden-49ca3c01.svg",
    "limited": "https://www.masterduelmeta.com/_app/immutable/assets/limited-1-464ca3c1.svg",
    "semi-limited": "https://www.masterduelmeta.com/_app/immutable/assets/limited-2-6c4a0f68.svg",
    "unlimited": ""
}

const rarityImage = {
    "Normal (N)": "data:image/webp;base64,UklGRjADAABXRUJQVlA4WAoAAAA…Vh8JxSqmCBoYt1NoXTFLdQaaCHiGptYo24q7UAU7M6rG2AAA=",
    "Rare (R)" : "data:image/webp;base64,UklGRl4EAABXRUJQVlA4WAoAAAA…ma4MQAA1pvfFnHnhBtH31gdCQGFlMtrDZV3qWuP/YXmAAAA==",
    "Super Rare (SR)": "data:image/webp;base64,UklGRgYGAABXRUJQVlA4WAoAAAA…kymtYPlH8UI1QTiXWwwkKW0kAwjzkhBbzm+xRLrZ5vzUAAAA=",
    "Ultra Rare (UR)": "data:image/webp;base64,UklGRgIGAABXRUJQVlA4WAoAAAAQAAAA3gAANQAAQUxQSOkAAAABkCvbtmlbtm3btm07cmRE9r2REdnWs23btm2/8QEPI42ICRD4I+vwH/1HVIKbCnBTCm4KfnOT/xvU5P4GNVk/QU3mT1CT+hPUJH0HNbHfQE3UN1AT/hXUhHwCNf6fQI3PR1Dj+Q7UuL0FNc5vQY3DK1Bj+xzUWD0HNeZPQI3pI1Bj/ADUGNwDNbq3QY3ODVCjdQ3UqF8BNaoXQY3KOVCjeBrUyJ8ANfJHQY3sIVAjtR/USO0BNZLbQY3YFlAjtgnUiK0FNSLLoEZ4AdQIT4MaoTFQIzgCagQHQI1gP7jpBjft4KYN3DaBXABWUDgg8gQAAPAbAJ0BKt8ANgA+bS6SRiQipCEwFAqQgA2JZAiQJMsMHw90onUvR8q71ZMafPED+Jr1KvNF0QPQA6TfeOP3T/aAnEXkWpoIxFyGFKaeRUT1SlFYpXDHXH1ronWuf2ZNGlABizBDtUnOEi2KXMvViRFYcXAXCfpf/+jpYbkRySIuFyB1wfbIPmGJZITz4ub675VXaDSM9eW14DiP//x8Gom2xdk5wU/EhZM6NIc9OOZcUyxYpiJ6n4XT/IXOlIgleIb4l1T87YGab/qbFCETw7mMo/uTTSFpMkanAIOkIp8otugkKEnz8zYA/vJfwDkfIvzmQBYg4OEFfVJmh3KQ09YpinFE5LxGxPBBaJnqYpGwgfnhWmAxSCjk4h53G0ygGq+z++RRKJySRSvoJNa3Yrvf75BjVXpopy9LIGVWZ6URKhchwf7oaR/mFUJscxsTULvg+rffuPrrqO4Pu/XRvH/8Od3jRbWrPEWKnqfHMKByAhf94mF283j7P9v/0ABO8PUIfACV04cKrNf/4E6DQj54TZ1NFh8EpckjyDPsmPsVB+Jusl75jvOdzZxOLW3ixOp3haIniQ22pb/zMHwaMMiD1aKxJAlV1d/Idq8D7PWL9mr//MqA//U9UES+ht6m9w/Ba0ne4WWQSBaucdbFZr+lyXg0WJ5iPo1BPRMSmhnBcgzkKDJfKCykRhXzclXyBiYKW+YlIHE1XlnLIbG1zMnT5UYy/doafxzyfnMgCxBwcIK+qTNDuUhp6xTFOKJyXiNieCC0TPUxSNhTG9guOPTnvmj9Wd2WR4cdXrmljegMAt78noAXdyoGJa8n44x89HI325an/H+tVs3dSiB/hH4D+S8huWJeeYK3K9Lddr3mT6QZlrBbZN/ZBzL/Nj+s01B1/E1GBmsXMul7X8uX/5rZch9UJrcAsbF0un+mYxCebMjUKqqh8j8x/bn/FrHBv0csVqhl4VzRxG4VHWEOHC1AmiHWtWS+1fI+fgdcZJj/J+/cpyGy2Q5peaXbG6GCWHOtTwxd3THznsbWbieUHepFS/jmBuC+AMbJI9+li0Dej1H7DQZkNpiQZ/yo28xLOwUAccez60yRFURlc5HsfeGfHzjigmQWXx+ttdX+OHPxv/Pww3YlLBnQSgi886kOjiE+xv2Hazn7gCb13+zfFYCC6OH5u9G5ZVQDPL2aORKZO9pZ2HWSmqQjL2hi0J6LVxjyvW88tgz8SgEzQT9+c9wBlZw8kX3/ZheBCUesEztUJ5Bh13ayoSCzrJbEFITnJOS0CVhToLwZV73r5l1FInDEjnbJDOcuSAQKWbRr/M5CrAbGEeanhiqX3fXOiFsRma2DikKvondyuRl+sJDPbqv9v5Cb687E6rykgEJz9kkazQ+wCez2hhGseGqAryv03GfHcFrUKVvCHLE8NQLDwsK4oZrULR2tVTrVv6N7oSYXCw9zRmpOXkfkhbrZxaCZXgaFk4xPICXRJqOMYWEY4Q9hB3Jrj5H8BR9Df2VvQChF2WJa25oA0JLWUNbVQRIR3fs/9luGISpK3PHD+T/2W4XrQhUkB2ozC+x6+gikKx7c9VwddnAAcWdXZyQbiCftY/Pvo9y58NQvqbXADrMDkzza9fp/TqX4yTCJPVObIid3pJR8ItQFLXukQLLMZMRarGrV/emIYiCsaziUTMK763AAAA==",
}


export default function CardImage({ card }: CardImageProps) {
  return (
    <div className="flex flex-col">
        {/* rarity img */}
        <img src={rarityImage[card.rarity]} alt={card.rarity} className="w-[36%] min-w-[42px] self-end" />

        <div className="relative inline-block">
            {/* Card image */}
            <img
                src={"src/assets/cards/" + card.id + ".webp"}
                alt={card.name}
                className="z-[1] w-full h-auto flex-none aspect-1.46 overflow-clip [overflow-clip-margin:content-box] "
            />

            {/* FAL number overlay */}
            {isOnBanList(card) &&
                <img src= {numberBanList[card.status]}
                    className="absolute top-0 w-1/4 min-w-[20px] max-w-[40px] z-[2] drop-shadow-[1px_1px_2px_rgba(0,0,0,1)] overflow-clip [overflow-clip-margin:content-box]">
                </img>
            }
        </div>  
    </div>

        
  );
}

