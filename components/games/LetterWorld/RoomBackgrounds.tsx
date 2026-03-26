"use client";

import type { ReactElement } from "react";

function BedroomBackground(): ReactElement {
  return (
    <g>
      {/* Wall */}
      <rect x="0" y="0" width="800" height="400" fill="#FFF8F0" />

      {/* Wall texture - subtle horizontal lines */}
      <line x1="0" y1="100" x2="800" y2="100" stroke="#F5EDE0" strokeWidth="0.5" />
      <line x1="0" y1="200" x2="800" y2="200" stroke="#F5EDE0" strokeWidth="0.5" />
      <line x1="0" y1="300" x2="800" y2="300" stroke="#F5EDE0" strokeWidth="0.5" />

      {/* Floor */}
      <rect x="0" y="400" width="800" height="200" fill="#E8D5B8" />
      {/* Floor boards */}
      <line x1="0" y1="440" x2="800" y2="440" stroke="#D4C4A8" strokeWidth="1" />
      <line x1="0" y1="480" x2="800" y2="480" stroke="#D4C4A8" strokeWidth="1" />
      <line x1="0" y1="520" x2="800" y2="520" stroke="#D4C4A8" strokeWidth="1" />
      <line x1="0" y1="560" x2="800" y2="560" stroke="#D4C4A8" strokeWidth="1" />
      {/* Floor board vertical joints */}
      <line x1="160" y1="400" x2="160" y2="440" stroke="#D4C4A8" strokeWidth="0.5" />
      <line x1="400" y1="400" x2="400" y2="440" stroke="#D4C4A8" strokeWidth="0.5" />
      <line x1="640" y1="400" x2="640" y2="440" stroke="#D4C4A8" strokeWidth="0.5" />
      <line x1="80" y1="440" x2="80" y2="480" stroke="#D4C4A8" strokeWidth="0.5" />
      <line x1="320" y1="440" x2="320" y2="480" stroke="#D4C4A8" strokeWidth="0.5" />
      <line x1="560" y1="440" x2="560" y2="480" stroke="#D4C4A8" strokeWidth="0.5" />
      <line x1="240" y1="480" x2="240" y2="520" stroke="#D4C4A8" strokeWidth="0.5" />
      <line x1="480" y1="480" x2="480" y2="520" stroke="#D4C4A8" strokeWidth="0.5" />
      <line x1="720" y1="480" x2="720" y2="520" stroke="#D4C4A8" strokeWidth="0.5" />

      {/* Baseboard */}
      <rect x="0" y="395" width="800" height="10" fill="#C4A882" />

      {/* Window */}
      <rect x="300" y="60" width="200" height="160" rx="4" fill="#ADE0F5" stroke="#A08060" strokeWidth="5" />
      <line x1="400" y1="60" x2="400" y2="220" stroke="#A08060" strokeWidth="4" />
      <line x1="300" y1="140" x2="500" y2="140" stroke="#A08060" strokeWidth="4" />
      <rect x="303" y="63" width="95" height="74" fill="#B8E6FA" rx="2" />
      <rect x="403" y="63" width="95" height="74" fill="#B8E6FA" rx="2" />
      <rect x="303" y="143" width="95" height="74" fill="#C8EDFC" rx="2" />
      <rect x="403" y="143" width="95" height="74" fill="#C8EDFC" rx="2" />
      <ellipse cx="360" cy="100" rx="18" ry="8" fill="white" opacity="0.7" />
      <ellipse cx="350" cy="96" rx="12" ry="7" fill="white" opacity="0.7" />
      <rect x="290" y="218" width="220" height="12" rx="2" fill="#A08060" />

      {/* Left curtain */}
      <path d="M298,55 Q285,140 292,230 L298,230 Q305,140 298,55Z" fill="#D4738C" opacity="0.7" />
      <path d="M298,55 Q290,90 294,130 L298,130 Q302,90 298,55Z" fill="#E08BA2" opacity="0.5" />
      {/* Right curtain */}
      <path d="M502,55 Q515,140 508,230 L502,230 Q495,140 502,55Z" fill="#D4738C" opacity="0.7" />
      <path d="M502,55 Q510,90 506,130 L502,130 Q498,90 502,55Z" fill="#E08BA2" opacity="0.5" />
      {/* Curtain rod */}
      <line x1="280" y1="55" x2="520" y2="55" stroke="#8B6F47" strokeWidth="4" strokeLinecap="round" />
      <circle cx="280" cy="55" r="5" fill="#8B6F47" />
      <circle cx="520" cy="55" r="5" fill="#8B6F47" />

      {/* Bookshelf */}
      <rect x="40" y="120" width="120" height="180" fill="#A08060" stroke="#8B6F47" strokeWidth="2" />
      <rect x="40" y="120" width="120" height="4" fill="#8B6F47" />
      <rect x="40" y="176" width="120" height="4" fill="#8B6F47" />
      <rect x="40" y="236" width="120" height="4" fill="#8B6F47" />
      <rect x="40" y="296" width="120" height="4" fill="#8B6F47" />
      <rect x="50" y="126" width="10" height="48" fill="#E24B4A" rx="1" />
      <rect x="62" y="130" width="8" height="44" fill="#378ADD" rx="1" />
      <rect x="72" y="128" width="11" height="46" fill="#4CAF50" rx="1" />
      <rect x="85" y="126" width="9" height="48" fill="#FFD93D" rx="1" />
      <rect x="96" y="132" width="10" height="42" fill="#9C27B0" rx="1" />
      <rect x="108" y="127" width="12" height="47" fill="#FF9800" rx="1" />
      <rect x="122" y="130" width="9" height="44" fill="#607D8B" rx="1" />
      <rect x="48" y="182" width="12" height="52" fill="#FF5722" rx="1" />
      <rect x="62" y="186" width="9" height="48" fill="#3F51B5" rx="1" />
      <rect x="73" y="184" width="10" height="50" fill="#009688" rx="1" />
      <rect x="86" y="182" width="11" height="52" fill="#795548" rx="1" />
      <rect x="100" y="188" width="8" height="46" fill="#E91E63" rx="1" />
      <rect x="112" y="183" width="14" height="51" fill="#CDDC39" rx="1" />
      <rect x="50" y="242" width="14" height="52" fill="#673AB7" rx="1" />
      <rect x="66" y="246" width="10" height="48" fill="#00BCD4" rx="1" />
      <rect x="78" y="244" width="12" height="50" fill="#8BC34A" rx="1" />
      <rect x="94" y="242" width="9" height="52" fill="#FF9800" rx="1" />
      <rect x="106" y="248" width="11" height="46" fill="#F44336" rx="1" />

      {/* Rug */}
      <ellipse cx="400" cy="490" rx="200" ry="60" fill="#C4564A" opacity="0.6" />
      <ellipse cx="400" cy="490" rx="170" ry="48" fill="#D4738C" opacity="0.4" />
      <ellipse cx="400" cy="490" rx="140" ry="36" fill="#E89CA8" opacity="0.3" />
      <ellipse cx="400" cy="490" rx="195" ry="56" fill="none" stroke="#A0403A" strokeWidth="1.5" strokeDasharray="8,4" opacity="0.4" />

      {/* Picture frame 1 */}
      <rect x="180" y="100" width="70" height="55" rx="3" fill="#8B6F47" />
      <rect x="185" y="105" width="60" height="45" rx="2" fill="#FFF8E1" />
      <polygon points="195,148 215,118 235,148" fill="#4CAF50" opacity="0.5" />
      <polygon points="210,148 230,125 245,148" fill="#388E3C" opacity="0.5" />
      <circle cx="235" cy="115" r="5" fill="#FFD93D" opacity="0.6" />

      {/* Picture frame 2 */}
      <rect x="550" y="90" width="60" height="75" rx="3" fill="#8B6F47" />
      <rect x="555" y="95" width="50" height="65" rx="2" fill="#FFF8E1" />
      <line x1="580" y1="155" x2="580" y2="125" stroke="#4CAF50" strokeWidth="2" />
      <circle cx="580" cy="120" r="8" fill="#E24B4A" opacity="0.5" />
      <circle cx="580" cy="120" r="4" fill="#FFD93D" opacity="0.6" />

      {/* Door */}
      <rect x="660" y="140" width="100" height="258" rx="3" fill="#B08050" stroke="#8B6F47" strokeWidth="3" />
      <rect x="672" y="155" width="76" height="80" rx="2" fill="#A07040" />
      <rect x="672" y="250" width="76" height="100" rx="2" fill="#A07040" />
      <circle cx="730" cy="280" r="5" fill="#D4A843" stroke="#C49A30" strokeWidth="1" />

      {/* Potted plant on window sill */}
      <rect x="380" y="200" width="24" height="18" rx="3" fill="#C4564A" />
      <ellipse cx="392" cy="200" rx="10" ry="3" fill="#4CAF50" />
      <path d="M388,198 Q385,180 392,170 Q399,180 396,198" fill="#4CAF50" />
      <path d="M385,200 Q378,188 382,178" fill="none" stroke="#388E3C" strokeWidth="2" strokeLinecap="round" />
      <path d="M399,200 Q406,188 402,178" fill="none" stroke="#388E3C" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function KitchenBackground(): ReactElement {
  return (
    <g>
      {/* Wall */}
      <rect x="0" y="0" width="800" height="380" fill="#FFF5E6" />
      {/* Tile backsplash */}
      <rect x="0" y="200" width="800" height="180" fill="#FFF0D6" />
      {/* Horizontal tile lines */}
      <line x1="0" y1="230" x2="800" y2="230" stroke="#E8D5B0" strokeWidth="0.5" />
      <line x1="0" y1="260" x2="800" y2="260" stroke="#E8D5B0" strokeWidth="0.5" />
      <line x1="0" y1="290" x2="800" y2="290" stroke="#E8D5B0" strokeWidth="0.5" />
      <line x1="0" y1="320" x2="800" y2="320" stroke="#E8D5B0" strokeWidth="0.5" />
      <line x1="0" y1="350" x2="800" y2="350" stroke="#E8D5B0" strokeWidth="0.5" />
      {/* Vertical tile lines */}
      <line x1="100" y1="200" x2="100" y2="380" stroke="#E8D5B0" strokeWidth="0.5" />
      <line x1="200" y1="200" x2="200" y2="380" stroke="#E8D5B0" strokeWidth="0.5" />
      <line x1="300" y1="200" x2="300" y2="380" stroke="#E8D5B0" strokeWidth="0.5" />
      <line x1="400" y1="200" x2="400" y2="380" stroke="#E8D5B0" strokeWidth="0.5" />
      <line x1="500" y1="200" x2="500" y2="380" stroke="#E8D5B0" strokeWidth="0.5" />
      <line x1="600" y1="200" x2="600" y2="380" stroke="#E8D5B0" strokeWidth="0.5" />
      <line x1="700" y1="200" x2="700" y2="380" stroke="#E8D5B0" strokeWidth="0.5" />

      {/* Checkered floor */}
      <rect x="0" y="380" width="800" height="220" fill="#E8D5B8" />
      {/* Checkers row 1 */}
      <rect x="0" y="380" width="80" height="55" fill="#D4C0A0" />
      <rect x="160" y="380" width="80" height="55" fill="#D4C0A0" />
      <rect x="320" y="380" width="80" height="55" fill="#D4C0A0" />
      <rect x="480" y="380" width="80" height="55" fill="#D4C0A0" />
      <rect x="640" y="380" width="80" height="55" fill="#D4C0A0" />
      {/* Checkers row 2 */}
      <rect x="80" y="435" width="80" height="55" fill="#D4C0A0" />
      <rect x="240" y="435" width="80" height="55" fill="#D4C0A0" />
      <rect x="400" y="435" width="80" height="55" fill="#D4C0A0" />
      <rect x="560" y="435" width="80" height="55" fill="#D4C0A0" />
      <rect x="720" y="435" width="80" height="55" fill="#D4C0A0" />
      {/* Checkers row 3 */}
      <rect x="0" y="490" width="80" height="55" fill="#D4C0A0" />
      <rect x="160" y="490" width="80" height="55" fill="#D4C0A0" />
      <rect x="320" y="490" width="80" height="55" fill="#D4C0A0" />
      <rect x="480" y="490" width="80" height="55" fill="#D4C0A0" />
      <rect x="640" y="490" width="80" height="55" fill="#D4C0A0" />
      {/* Checkers row 4 */}
      <rect x="80" y="545" width="80" height="55" fill="#D4C0A0" />
      <rect x="240" y="545" width="80" height="55" fill="#D4C0A0" />
      <rect x="400" y="545" width="80" height="55" fill="#D4C0A0" />
      <rect x="560" y="545" width="80" height="55" fill="#D4C0A0" />
      <rect x="720" y="545" width="80" height="55" fill="#D4C0A0" />

      {/* Upper cabinets */}
      <rect x="20" y="30" width="160" height="140" rx="4" fill="#C4884A" stroke="#A06830" strokeWidth="2" />
      <rect x="26" y="36" width="70" height="128" rx="2" fill="#D4A06A" />
      <rect x="104" y="36" width="70" height="128" rx="2" fill="#D4A06A" />
      <circle cx="90" cy="100" r="3" fill="#8B6F47" />
      <circle cx="110" cy="100" r="3" fill="#8B6F47" />

      <rect x="620" y="30" width="160" height="140" rx="4" fill="#C4884A" stroke="#A06830" strokeWidth="2" />
      <rect x="626" y="36" width="70" height="128" rx="2" fill="#D4A06A" />
      <rect x="704" y="36" width="70" height="128" rx="2" fill="#D4A06A" />
      <circle cx="690" cy="100" r="3" fill="#8B6F47" />
      <circle cx="710" cy="100" r="3" fill="#8B6F47" />

      {/* Window between cabinets */}
      <rect x="300" y="40" width="200" height="130" rx="4" fill="#ADE0F5" stroke="#A08060" strokeWidth="4" />
      <line x1="400" y1="40" x2="400" y2="170" stroke="#A08060" strokeWidth="3" />
      <line x1="300" y1="105" x2="500" y2="105" stroke="#A08060" strokeWidth="3" />
      <ellipse cx="350" cy="80" rx="15" ry="7" fill="white" opacity="0.6" />
      <rect x="290" y="168" width="220" height="10" rx="2" fill="#A08060" />

      {/* Counter */}
      <rect x="0" y="370" width="800" height="16" rx="2" fill="#A08060" />
      {/* Counter front */}
      <rect x="0" y="386" width="240" height="100" fill="#C4884A" stroke="#A06830" strokeWidth="1" />
      <rect x="6" y="392" width="108" height="88" rx="2" fill="#D4A06A" />
      <rect x="122" y="392" width="108" height="88" rx="2" fill="#D4A06A" />
      <circle cx="60" cy="436" r="3" fill="#8B6F47" />
      <circle cx="176" cy="436" r="3" fill="#8B6F47" />

      {/* Stove */}
      <rect x="280" y="386" width="200" height="100" fill="#E0E0E0" stroke="#B0BEC5" strokeWidth="2" />
      <rect x="290" y="374" width="180" height="12" rx="2" fill="#BDBDBD" />
      {/* Burners */}
      <circle cx="330" cy="374" r="16" fill="#424242" />
      <circle cx="330" cy="374" r="10" fill="#616161" />
      <circle cx="430" cy="374" r="16" fill="#424242" />
      <circle cx="430" cy="374" r="10" fill="#616161" />
      {/* Oven door */}
      <rect x="300" y="410" width="160" height="65" rx="3" fill="#757575" />
      <rect x="308" y="418" width="144" height="50" rx="2" fill="#424242" opacity="0.3" />
      <rect x="360" y="403" width="40" height="5" rx="2" fill="#9E9E9E" />

      {/* Right counter */}
      <rect x="520" y="386" width="280" height="100" fill="#C4884A" stroke="#A06830" strokeWidth="1" />
      <rect x="526" y="392" width="128" height="88" rx="2" fill="#D4A06A" />
      <rect x="662" y="392" width="128" height="88" rx="2" fill="#D4A06A" />
      <circle cx="590" cy="436" r="3" fill="#8B6F47" />
      <circle cx="726" cy="436" r="3" fill="#8B6F47" />

      {/* Fridge on far right */}
      <rect x="700" y="200" width="90" height="180" rx="4" fill="#E0E0E0" stroke="#B0BEC5" strokeWidth="2" />
      <rect x="706" y="206" width="78" height="80" rx="2" fill="#EEEEEE" />
      <rect x="706" y="296" width="78" height="78" rx="2" fill="#EEEEEE" />
      <rect x="710" y="240" width="4" height="30" rx="2" fill="#9E9E9E" />
      <rect x="710" y="310" width="4" height="30" rx="2" fill="#9E9E9E" />

      {/* Small decorative items */}
      {/* Pot rack above stove */}
      <line x1="310" y1="210" x2="450" y2="210" stroke="#8B6F47" strokeWidth="3" strokeLinecap="round" />
      <path d="M330,213 L330,235 Q330,240 335,240 L345,240 Q350,240 350,235 L350,213" fill="none" stroke="#B0BEC5" strokeWidth="1.5" />
      <path d="M380,213 L380,230 Q380,235 385,235 L395,235 Q400,235 400,230 L400,213" fill="none" stroke="#B0BEC5" strokeWidth="1.5" />
      <path d="M420,213 L420,240 Q420,245 425,245 L435,245 Q440,245 440,240 L440,213" fill="none" stroke="#B0BEC5" strokeWidth="1.5" />
    </g>
  );
}

function GardenBackground(): ReactElement {
  return (
    <g>
      {/* Sky */}
      <rect x="0" y="0" width="800" height="350" fill="#87CEEB" />
      {/* Sky gradient effect */}
      <rect x="0" y="0" width="800" height="80" fill="#6CB4DA" opacity="0.3" />
      <rect x="0" y="280" width="800" height="70" fill="#A8DCF0" opacity="0.3" />

      {/* Clouds */}
      <ellipse cx="150" cy="70" rx="50" ry="20" fill="white" opacity="0.8" />
      <ellipse cx="130" cy="62" rx="30" ry="16" fill="white" opacity="0.8" />
      <ellipse cx="175" cy="65" rx="25" ry="14" fill="white" opacity="0.8" />

      <ellipse cx="550" cy="50" rx="60" ry="22" fill="white" opacity="0.7" />
      <ellipse cx="525" cy="42" rx="35" ry="18" fill="white" opacity="0.7" />
      <ellipse cx="580" cy="44" rx="28" ry="15" fill="white" opacity="0.7" />

      <ellipse cx="700" cy="100" rx="40" ry="16" fill="white" opacity="0.6" />
      <ellipse cx="685" cy="94" rx="25" ry="13" fill="white" opacity="0.6" />

      {/* Sun */}
      <circle cx="720" cy="60" r="35" fill="#FFD93D" opacity="0.9" />
      <circle cx="720" cy="60" r="28" fill="#FFE082" opacity="0.7" />

      {/* Grass ground */}
      <rect x="0" y="320" width="800" height="280" fill="#4CAF50" />
      {/* Grass texture */}
      <rect x="0" y="320" width="800" height="30" fill="#66BB6A" />
      <path d="M0,350 Q200,340 400,350 Q600,360 800,345 L800,360 Q600,370 400,360 Q200,355 0,365Z" fill="#43A047" opacity="0.4" />

      {/* Background trees - left */}
      <rect x="30" y="180" width="18" height="150" fill="#6D4C41" />
      <ellipse cx="39" cy="170" rx="50" ry="55" fill="#2E7D32" />
      <ellipse cx="25" cy="185" rx="35" ry="40" fill="#388E3C" />
      <ellipse cx="55" cy="180" rx="30" ry="35" fill="#43A047" opacity="0.7" />

      {/* Background trees - right */}
      <rect x="720" y="200" width="14" height="130" fill="#6D4C41" />
      <ellipse cx="727" cy="190" rx="45" ry="50" fill="#2E7D32" />
      <ellipse cx="715" cy="200" rx="30" ry="35" fill="#388E3C" />
      <ellipse cx="745" cy="195" rx="25" ry="30" fill="#43A047" opacity="0.7" />

      {/* Fence */}
      <rect x="0" y="290" width="800" height="6" fill="#A1887F" />
      <rect x="0" y="320" width="800" height="6" fill="#A1887F" />
      {/* Fence posts */}
      <rect x="50" y="270" width="8" height="60" fill="#8D6E63" rx="1" />
      <polygon points="50,270 54,258 58,270" fill="#8D6E63" />
      <rect x="130" y="270" width="8" height="60" fill="#8D6E63" rx="1" />
      <polygon points="130,270 134,258 138,270" fill="#8D6E63" />
      <rect x="210" y="270" width="8" height="60" fill="#8D6E63" rx="1" />
      <polygon points="210,270 214,258 218,270" fill="#8D6E63" />
      <rect x="290" y="270" width="8" height="60" fill="#8D6E63" rx="1" />
      <polygon points="290,270 294,258 298,270" fill="#8D6E63" />
      <rect x="370" y="270" width="8" height="60" fill="#8D6E63" rx="1" />
      <polygon points="370,270 374,258 378,270" fill="#8D6E63" />
      <rect x="450" y="270" width="8" height="60" fill="#8D6E63" rx="1" />
      <polygon points="450,270 454,258 458,270" fill="#8D6E63" />
      <rect x="530" y="270" width="8" height="60" fill="#8D6E63" rx="1" />
      <polygon points="530,270 534,258 538,270" fill="#8D6E63" />
      <rect x="610" y="270" width="8" height="60" fill="#8D6E63" rx="1" />
      <polygon points="610,270 614,258 618,270" fill="#8D6E63" />
      <rect x="690" y="270" width="8" height="60" fill="#8D6E63" rx="1" />
      <polygon points="690,270 694,258 698,270" fill="#8D6E63" />
      <rect x="770" y="270" width="8" height="60" fill="#8D6E63" rx="1" />
      <polygon points="770,270 774,258 778,270" fill="#8D6E63" />

      {/* Garden path */}
      <path d="M350,600 Q360,500 380,420 Q400,360 420,340" fill="#D7CCC8" stroke="#BCAAA4" strokeWidth="2" />
      <path d="M450,600 Q440,500 420,420 Q400,360 380,340" fill="#D7CCC8" stroke="#BCAAA4" strokeWidth="2" />
      {/* Path stones */}
      <ellipse cx="400" cy="370" rx="20" ry="8" fill="#BCAAA4" opacity="0.4" />
      <ellipse cx="390" cy="420" rx="25" ry="10" fill="#BCAAA4" opacity="0.4" />
      <ellipse cx="405" cy="480" rx="28" ry="10" fill="#BCAAA4" opacity="0.4" />
      <ellipse cx="395" cy="540" rx="30" ry="11" fill="#BCAAA4" opacity="0.4" />

      {/* Bushes */}
      <ellipse cx="100" cy="340" rx="40" ry="25" fill="#388E3C" />
      <ellipse cx="80" cy="345" rx="25" ry="18" fill="#43A047" />
      <ellipse cx="120" cy="342" rx="20" ry="16" fill="#2E7D32" />

      <ellipse cx="650" cy="335" rx="35" ry="22" fill="#388E3C" />
      <ellipse cx="635" cy="340" rx="22" ry="16" fill="#43A047" />
      <ellipse cx="670" cy="338" rx="18" ry="14" fill="#2E7D32" />

      {/* Flower patches in grass */}
      <circle cx="200" cy="400" r="3" fill="#E91E63" opacity="0.6" />
      <circle cx="210" cy="410" r="2.5" fill="#FF9800" opacity="0.6" />
      <circle cx="195" cy="415" r="2" fill="#9C27B0" opacity="0.5" />
      <circle cx="600" cy="380" r="3" fill="#E91E63" opacity="0.6" />
      <circle cx="590" cy="395" r="2.5" fill="#FFD93D" opacity="0.6" />
      <circle cx="610" cy="390" r="2" fill="#FF5722" opacity="0.5" />
    </g>
  );
}

function PlaygroundBackground(): ReactElement {
  return (
    <g>
      {/* Sky */}
      <rect x="0" y="0" width="800" height="300" fill="#87CEEB" />
      <rect x="0" y="0" width="800" height="60" fill="#6CB4DA" opacity="0.3" />

      {/* Clouds */}
      <ellipse cx="200" cy="60" rx="55" ry="22" fill="white" opacity="0.8" />
      <ellipse cx="178" cy="52" rx="32" ry="17" fill="white" opacity="0.8" />
      <ellipse cx="228" cy="55" rx="28" ry="15" fill="white" opacity="0.8" />

      <ellipse cx="600" cy="80" rx="45" ry="18" fill="white" opacity="0.7" />
      <ellipse cx="580" cy="73" rx="28" ry="14" fill="white" opacity="0.7" />
      <ellipse cx="625" cy="75" rx="22" ry="12" fill="white" opacity="0.7" />

      {/* Sun */}
      <circle cx="100" cy="60" r="30" fill="#FFD93D" opacity="0.9" />
      <circle cx="100" cy="60" r="24" fill="#FFE082" opacity="0.7" />

      {/* Background trees */}
      <rect x="10" y="160" width="14" height="140" fill="#6D4C41" />
      <ellipse cx="17" cy="150" rx="40" ry="45" fill="#2E7D32" />
      <ellipse cx="5" cy="160" rx="28" ry="32" fill="#388E3C" />

      <rect x="760" y="170" width="12" height="130" fill="#6D4C41" />
      <ellipse cx="766" cy="160" rx="35" ry="40" fill="#2E7D32" />
      <ellipse cx="778" cy="168" rx="24" ry="28" fill="#388E3C" />

      {/* Mid-distance trees */}
      <rect x="680" y="200" width="10" height="100" fill="#795548" />
      <ellipse cx="685" cy="195" rx="30" ry="35" fill="#43A047" />
      <ellipse cx="675" cy="200" rx="20" ry="25" fill="#66BB6A" opacity="0.7" />

      <rect x="100" y="210" width="10" height="90" fill="#795548" />
      <ellipse cx="105" cy="205" rx="28" ry="32" fill="#43A047" />

      {/* Ground */}
      <rect x="0" y="280" width="800" height="320" fill="#DCE775" />
      {/* Playground surface (safety rubber) */}
      <rect x="100" y="320" width="600" height="200" rx="8" fill="#EF9A9A" opacity="0.4" />
      <rect x="100" y="320" width="600" height="200" rx="8" fill="none" stroke="#E57373" strokeWidth="1" opacity="0.3" />
      {/* Grass texture */}
      <rect x="0" y="280" width="800" height="20" fill="#C0CA33" opacity="0.4" />
      <path d="M0,300 Q200,295 400,300 Q600,305 800,298" fill="none" stroke="#9E9D24" strokeWidth="1" opacity="0.3" />

      {/* Monkey bars frame */}
      <rect x="480" y="330" width="8" height="120" fill="#757575" />
      <rect x="620" y="330" width="8" height="120" fill="#757575" />
      <rect x="478" y="328" width="152" height="8" rx="2" fill="#9E9E9E" />
      {/* Monkey bar rungs */}
      <rect x="498" y="332" width="4" height="8" fill="#BDBDBD" />
      <line x1="500" y1="340" x2="500" y2="338" stroke="#BDBDBD" strokeWidth="4" />
      <line x1="520" y1="336" x2="520" y2="328" stroke="#BDBDBD" strokeWidth="3" />
      <line x1="540" y1="336" x2="540" y2="328" stroke="#BDBDBD" strokeWidth="3" />
      <line x1="560" y1="336" x2="560" y2="328" stroke="#BDBDBD" strokeWidth="3" />
      <line x1="580" y1="336" x2="580" y2="328" stroke="#BDBDBD" strokeWidth="3" />
      <line x1="600" y1="336" x2="600" y2="328" stroke="#BDBDBD" strokeWidth="3" />

      {/* Swing frame */}
      <rect x="170" y="310" width="8" height="140" fill="#795548" />
      <rect x="310" y="310" width="8" height="140" fill="#795548" />
      <rect x="168" y="306" width="152" height="8" rx="2" fill="#8D6E63" />
      {/* Swing ropes and seat */}
      <line x1="220" y1="314" x2="210" y2="400" stroke="#A1887F" strokeWidth="2" />
      <line x1="260" y1="314" x2="270" y2="400" stroke="#A1887F" strokeWidth="2" />
      <rect x="205" y="398" width="70" height="8" rx="2" fill="#C4884A" />

      {/* Sandbox */}
      <rect x="380" y="480" width="140" height="70" rx="6" fill="#FFE082" stroke="#FFC107" strokeWidth="2" />
      <rect x="386" y="486" width="128" height="58" rx="4" fill="#FFF8E1" />
      {/* Sand mound */}
      <ellipse cx="430" cy="510" rx="20" ry="10" fill="#FFD54F" />
      {/* Little flag in sand */}
      <line x1="430" y1="510" x2="430" y2="490" stroke="#795548" strokeWidth="1.5" />
      <polygon points="430,490 445,495 430,500" fill="#E24B4A" />

      {/* Bench */}
      <rect x="560" y="490" width="100" height="8" rx="2" fill="#8D6E63" />
      <rect x="560" y="502" width="100" height="8" rx="2" fill="#8D6E63" />
      <rect x="565" y="498" width="6" height="30" fill="#6D4C41" />
      <rect x="649" y="498" width="6" height="30" fill="#6D4C41" />
      {/* Bench back */}
      <rect x="558" y="470" width="104" height="6" rx="2" fill="#8D6E63" />
      <rect x="558" y="480" width="104" height="6" rx="2" fill="#8D6E63" />
      <rect x="563" y="468" width="6" height="30" fill="#6D4C41" />
      <rect x="651" y="468" width="6" height="30" fill="#6D4C41" />

      {/* Small decorative elements */}
      {/* Grass tufts around edges */}
      <path d="M50,300 L55,285 L60,300" fill="#7CB342" />
      <path d="M55,300 L60,288 L65,300" fill="#8BC34A" />
      <path d="M730,295 L735,282 L740,295" fill="#7CB342" />
      <path d="M735,295 L740,284 L745,295" fill="#8BC34A" />
      <path d="M400,282 L405,270 L410,282" fill="#7CB342" />
    </g>
  );
}

export function getRoomBackground(sceneId: string): ReactElement {
  switch (sceneId) {
    case "kitchen":
      return <KitchenBackground />;
    case "garden":
      return <GardenBackground />;
    case "playground":
      return <PlaygroundBackground />;
    default:
      return <BedroomBackground />;
  }
}
