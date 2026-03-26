"use client";

import type { ReactElement } from "react";

export function getObjectSVG(type: string): ReactElement {
  switch (type) {
    case "cat":
      return (
        <g>
          {/* Body */}
          <ellipse cx="0" cy="10" rx="18" ry="14" fill="#F5A623" />
          {/* Head */}
          <circle cx="0" cy="-10" r="12" fill="#F5A623" />
          {/* Left ear */}
          <polygon points="-10,-18 -6,-28 -2,-18" fill="#F5A623" />
          <polygon points="-8,-19 -6,-26 -4,-19" fill="#FFD1A9" />
          {/* Right ear */}
          <polygon points="2,-18 6,-28 10,-18" fill="#F5A623" />
          <polygon points="4,-19 6,-26 8,-19" fill="#FFD1A9" />
          {/* Eyes */}
          <ellipse cx="-4" cy="-12" rx="2" ry="2.5" fill="#3E2723" />
          <ellipse cx="4" cy="-12" rx="2" ry="2.5" fill="#3E2723" />
          <circle cx="-3.2" cy="-12.5" r="0.7" fill="white" />
          <circle cx="4.8" cy="-12.5" r="0.7" fill="white" />
          {/* Nose */}
          <ellipse cx="0" cy="-8" rx="1.5" ry="1" fill="#FF8C94" />
          {/* Mouth */}
          <path d="M-2,-7 Q0,-5 2,-7" fill="none" stroke="#5D4037" strokeWidth="0.5" />
          {/* Whiskers */}
          <line x1="-12" y1="-9" x2="-4" y2="-8" stroke="#5D4037" strokeWidth="0.4" />
          <line x1="-11" y1="-7" x2="-4" y2="-7" stroke="#5D4037" strokeWidth="0.4" />
          <line x1="4" y1="-8" x2="12" y2="-9" stroke="#5D4037" strokeWidth="0.4" />
          <line x1="4" y1="-7" x2="11" y2="-7" stroke="#5D4037" strokeWidth="0.4" />
          {/* Tail */}
          <path d="M18,8 Q28,0 22,-10" fill="none" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" />
          {/* Paws */}
          <ellipse cx="-8" cy="22" rx="4" ry="2.5" fill="#E8972A" />
          <ellipse cx="8" cy="22" rx="4" ry="2.5" fill="#E8972A" />
        </g>
      );

    case "dog":
      return (
        <g>
          {/* Body */}
          <ellipse cx="0" cy="10" rx="20" ry="15" fill="#C4884A" />
          {/* Head */}
          <circle cx="0" cy="-10" r="13" fill="#C4884A" />
          {/* Left floppy ear */}
          <ellipse cx="-14" cy="-6" rx="6" ry="10" fill="#A06830" transform="rotate(-15,-14,-6)" />
          <ellipse cx="-14" cy="-5" rx="4" ry="7" fill="#E8C4A0" transform="rotate(-15,-14,-5)" />
          {/* Right floppy ear */}
          <ellipse cx="14" cy="-6" rx="6" ry="10" fill="#A06830" transform="rotate(15,14,-6)" />
          <ellipse cx="14" cy="-5" rx="4" ry="7" fill="#E8C4A0" transform="rotate(15,14,-5)" />
          {/* Muzzle */}
          <ellipse cx="0" cy="-5" rx="7" ry="5" fill="#E8C4A0" />
          {/* Eyes */}
          <circle cx="-5" cy="-13" r="2.5" fill="#3E2723" />
          <circle cx="5" cy="-13" r="2.5" fill="#3E2723" />
          <circle cx="-4.2" cy="-13.5" r="0.8" fill="white" />
          <circle cx="5.8" cy="-13.5" r="0.8" fill="white" />
          {/* Nose */}
          <ellipse cx="0" cy="-7" rx="2.5" ry="2" fill="#5C3D2E" />
          {/* Mouth */}
          <path d="M-2,-5 Q0,-3 2,-5" fill="none" stroke="#5C3D2E" strokeWidth="0.6" />
          {/* Tongue */}
          <ellipse cx="0" cy="-3" rx="1.5" ry="2" fill="#FF8A80" />
          {/* Tail */}
          <path d="M18,5 Q26,-2 24,-12" fill="none" stroke="#C4884A" strokeWidth="4" strokeLinecap="round" />
          {/* Paws */}
          <ellipse cx="-9" cy="23" rx="5" ry="3" fill="#A06830" />
          <ellipse cx="9" cy="23" rx="5" ry="3" fill="#A06830" />
        </g>
      );

    case "apple":
      return (
        <g>
          {/* Apple body */}
          <circle cx="-4" cy="4" r="14" fill="#E24B4A" />
          <circle cx="4" cy="4" r="14" fill="#E24B4A" />
          {/* Highlight */}
          <ellipse cx="-7" cy="-2" rx="4" ry="6" fill="#FF6B6B" opacity="0.5" />
          {/* Indent at top */}
          <path d="M-3,-9 Q0,-6 3,-9" fill="#D43F3F" />
          {/* Stem */}
          <rect x="-1" y="-18" width="2" height="8" rx="1" fill="#795548" />
          {/* Leaf */}
          <path d="M1,-16 Q8,-22 12,-16 Q8,-14 1,-16Z" fill="#4CAF50" />
          <line x1="1" y1="-16" x2="9" y2="-18" stroke="#388E3C" strokeWidth="0.4" />
          {/* Bottom dimple */}
          <path d="M-2,17 Q0,15 2,17" fill="none" stroke="#C62828" strokeWidth="0.5" />
          {/* Shadow on body */}
          <ellipse cx="6" cy="8" rx="5" ry="8" fill="#C62828" opacity="0.2" />
        </g>
      );

    case "book":
      return (
        <g>
          {/* Book cover back */}
          <rect x="-16" y="-12" width="32" height="24" rx="1" fill="#4E7A16" />
          {/* Pages */}
          <rect x="-14" y="-10" width="28" height="20" rx="1" fill="#FFF8E1" />
          {/* Page lines */}
          <line x1="-10" y1="-5" x2="10" y2="-5" stroke="#D7CCC8" strokeWidth="0.5" />
          <line x1="-10" y1="-1" x2="10" y2="-1" stroke="#D7CCC8" strokeWidth="0.5" />
          <line x1="-10" y1="3" x2="10" y2="3" stroke="#D7CCC8" strokeWidth="0.5" />
          <line x1="-10" y1="7" x2="6" y2="7" stroke="#D7CCC8" strokeWidth="0.5" />
          {/* Book cover front */}
          <rect x="-16" y="-12" width="32" height="24" rx="1" fill="none" stroke="#639922" strokeWidth="2" />
          {/* Spine */}
          <rect x="-16" y="-12" width="4" height="24" fill="#4E7A16" />
          <line x1="-14" y1="-12" x2="-14" y2="12" stroke="#3D6610" strokeWidth="0.5" />
          {/* Cover decoration */}
          <rect x="-4" y="-8" width="16" height="3" rx="1" fill="#639922" opacity="0.3" />
          <rect x="-2" y="-3" width="12" height="2" rx="1" fill="#639922" opacity="0.2" />
          {/* Bookmark ribbon */}
          <path d="M10,-12 L10,-16 L8,-14 L6,-16 L6,-12" fill="#E24B4A" />
        </g>
      );

    case "sun":
      return (
        <g>
          {/* Rays */}
          <line x1="0" y1="-26" x2="0" y2="-18" stroke="#FFC107" strokeWidth="3" strokeLinecap="round" />
          <line x1="0" y1="18" x2="0" y2="26" stroke="#FFC107" strokeWidth="3" strokeLinecap="round" />
          <line x1="-26" y1="0" x2="-18" y2="0" stroke="#FFC107" strokeWidth="3" strokeLinecap="round" />
          <line x1="18" y1="0" x2="26" y2="0" stroke="#FFC107" strokeWidth="3" strokeLinecap="round" />
          <line x1="-18" y1="-18" x2="-13" y2="-13" stroke="#FFC107" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="-13" x2="18" y2="-18" stroke="#FFC107" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="-18" y1="18" x2="-13" y2="13" stroke="#FFC107" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="13" x2="18" y2="18" stroke="#FFC107" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sun body */}
          <circle cx="0" cy="0" r="14" fill="#FFD93D" />
          {/* Cheeks */}
          <circle cx="-7" cy="3" r="3" fill="#FFB300" opacity="0.4" />
          <circle cx="7" cy="3" r="3" fill="#FFB300" opacity="0.4" />
          {/* Eyes */}
          <circle cx="-5" cy="-3" r="1.8" fill="#5D4037" />
          <circle cx="5" cy="-3" r="1.8" fill="#5D4037" />
          <circle cx="-4.3" cy="-3.5" r="0.6" fill="white" />
          <circle cx="5.7" cy="-3.5" r="0.6" fill="white" />
          {/* Smile */}
          <path d="M-5,3 Q0,8 5,3" fill="none" stroke="#5D4037" strokeWidth="1" strokeLinecap="round" />
        </g>
      );

    case "bird":
      return (
        <g>
          {/* Body */}
          <ellipse cx="0" cy="6" rx="14" ry="10" fill="#378ADD" />
          {/* Belly */}
          <ellipse cx="0" cy="10" rx="9" ry="6" fill="#7FC4FD" />
          {/* Head */}
          <circle cx="-2" cy="-8" r="9" fill="#378ADD" />
          {/* Eye */}
          <circle cx="-5" cy="-9" r="2.5" fill="white" />
          <circle cx="-5.5" cy="-9.3" r="1.3" fill="#1B3A4B" />
          <circle cx="-5.8" cy="-9.8" r="0.4" fill="white" />
          {/* Beak */}
          <polygon points="4,-9 10,-7 4,-5" fill="#FF9800" />
          <line x1="4" y1="-7" x2="9" y2="-7" stroke="#E65100" strokeWidth="0.4" />
          {/* Wing */}
          <path d="M-4,2 Q-18,-6 -14,8 Q-8,4 -4,6Z" fill="#2B6DAE" />
          <path d="M-6,3 Q-14,-2 -12,6" fill="none" stroke="#1F5690" strokeWidth="0.5" />
          {/* Tail feathers */}
          <path d="M12,4 L22,0 L20,6Z" fill="#2B6DAE" />
          <path d="M12,6 L22,8 L18,12Z" fill="#378ADD" />
          {/* Legs */}
          <line x1="-3" y1="15" x2="-5" y2="22" stroke="#FF9800" strokeWidth="1.2" />
          <line x1="3" y1="15" x2="5" y2="22" stroke="#FF9800" strokeWidth="1.2" />
          {/* Feet */}
          <path d="M-8,22 L-5,22 L-2,22" fill="none" stroke="#FF9800" strokeWidth="1" strokeLinecap="round" />
          <path d="M2,22 L5,22 L8,22" fill="none" stroke="#FF9800" strokeWidth="1" strokeLinecap="round" />
        </g>
      );

    case "bread":
      return (
        <g>
          {/* Bread loaf body */}
          <ellipse cx="0" cy="6" rx="20" ry="10" fill="#D4A843" />
          {/* Top dome */}
          <ellipse cx="0" cy="-2" rx="18" ry="12" fill="#D4A843" />
          {/* Crust top highlight */}
          <ellipse cx="0" cy="-6" rx="14" ry="8" fill="#E0BB5A" />
          {/* Score marks on top */}
          <path d="M-8,-6 Q-4,-10 0,-6" fill="none" stroke="#B8860B" strokeWidth="1" strokeLinecap="round" />
          <path d="M0,-6 Q4,-10 8,-6" fill="none" stroke="#B8860B" strokeWidth="1" strokeLinecap="round" />
          <path d="M-4,-4 Q0,-8 4,-4" fill="none" stroke="#B8860B" strokeWidth="0.7" strokeLinecap="round" />
          {/* Bottom crust edge */}
          <path d="M-18,6 Q-20,10 -16,12 Q0,16 16,12 Q20,10 18,6" fill="#B8860B" />
          {/* Surface texture dots */}
          <circle cx="-6" cy="-2" r="0.8" fill="#C49A30" />
          <circle cx="3" cy="-4" r="0.6" fill="#C49A30" />
          <circle cx="8" cy="0" r="0.7" fill="#C49A30" />
          <circle cx="-10" cy="2" r="0.5" fill="#C49A30" />
          {/* Side shadow */}
          <ellipse cx="8" cy="6" rx="6" ry="5" fill="#B8860B" opacity="0.25" />
        </g>
      );

    case "water":
      return (
        <g>
          {/* Glass body */}
          <path d="M-10,-16 L-12,16 Q-12,20 0,20 Q12,20 12,16 L10,-16Z" fill="#D6E8F5" opacity="0.5" stroke="#B0BEC5" strokeWidth="0.8" />
          {/* Water surface */}
          <ellipse cx="0" cy="-2" rx="11" ry="3" fill="#85B7EB" opacity="0.6" />
          {/* Water body */}
          <path d="M-11,-2 Q-11,0 -12,16 Q-12,20 0,20 Q12,20 12,16 Q11,0 11,-2Z" fill="#85B7EB" opacity="0.5" />
          {/* Water highlight */}
          <path d="M-8,-2 Q-8,4 -9,12" fill="none" stroke="white" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
          {/* Glass rim */}
          <ellipse cx="0" cy="-16" rx="10" ry="3" fill="none" stroke="#B0BEC5" strokeWidth="1" />
          <ellipse cx="0" cy="-16" rx="10" ry="3" fill="#E3F0FA" opacity="0.3" />
          {/* Glass highlight streak */}
          <path d="M7,-14 Q8,0 9,14" fill="none" stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
          {/* Bubbles */}
          <circle cx="-3" cy="6" r="1" fill="white" opacity="0.5" />
          <circle cx="2" cy="10" r="0.7" fill="white" opacity="0.4" />
          <circle cx="-1" cy="14" r="0.8" fill="white" opacity="0.35" />
          {/* Glass bottom */}
          <ellipse cx="0" cy="20" rx="12" ry="2" fill="#B0BEC5" opacity="0.3" />
        </g>
      );

    case "orange":
      return (
        <g>
          {/* Orange body */}
          <circle cx="0" cy="2" r="16" fill="#FF8C00" />
          {/* Highlight */}
          <ellipse cx="-5" cy="-4" rx="5" ry="7" fill="#FFA726" opacity="0.5" />
          {/* Dimple texture */}
          <circle cx="5" cy="0" r="0.6" fill="#E67E00" opacity="0.3" />
          <circle cx="8" cy="5" r="0.5" fill="#E67E00" opacity="0.3" />
          <circle cx="-2" cy="8" r="0.6" fill="#E67E00" opacity="0.3" />
          <circle cx="3" cy="-6" r="0.5" fill="#E67E00" opacity="0.3" />
          <circle cx="-8" cy="4" r="0.5" fill="#E67E00" opacity="0.3" />
          <circle cx="10" cy="-2" r="0.4" fill="#E67E00" opacity="0.3" />
          {/* Stem */}
          <rect x="-1.5" y="-18" width="3" height="5" rx="1" fill="#795548" />
          {/* Leaf */}
          <path d="M1,-16 Q8,-22 14,-15 Q8,-13 1,-16Z" fill="#4CAF50" />
          <line x1="2" y1="-16" x2="10" y2="-18" stroke="#388E3C" strokeWidth="0.4" />
          {/* Bottom navel */}
          <circle cx="0" cy="16" r="2" fill="#E67E00" opacity="0.3" />
          {/* Shadow */}
          <ellipse cx="6" cy="8" rx="5" ry="7" fill="#E65100" opacity="0.15" />
        </g>
      );

    case "cheese":
      return (
        <g>
          {/* Cheese wedge body */}
          <polygon points="-18,12 18,12 10,-14 -10,-14" fill="#FFD54F" />
          {/* Top face */}
          <polygon points="-10,-14 10,-14 18,-8 -10,-14" fill="#FFE082" />
          <polygon points="-10,-14 18,-8 18,12 -18,12" fill="#FFD54F" />
          {/* Right face (darker) */}
          <polygon points="10,-14 18,-8 18,12 10,12" fill="#FFC107" />
          {/* Holes */}
          <ellipse cx="-4" cy="2" rx="4" ry="3.5" fill="#FFF8E1" />
          <ellipse cx="6" cy="6" rx="3" ry="2.5" fill="#FFF8E1" />
          <ellipse cx="-8" cy="8" rx="2.5" ry="2" fill="#FFF8E1" />
          <ellipse cx="2" cy="-6" rx="2" ry="1.5" fill="#FFF8E1" />
          <ellipse cx="12" cy="0" rx="1.8" ry="1.5" fill="#FFF8E1" />
          {/* Edge line */}
          <line x1="-18" y1="12" x2="18" y2="12" stroke="#F9A825" strokeWidth="0.8" />
          {/* Rind edge */}
          <line x1="-10" y1="-14" x2="10" y2="-14" stroke="#F9A825" strokeWidth="1.5" />
          {/* Side shadow */}
          <polygon points="10,-14 18,-8 18,12 10,12" fill="#E6A800" opacity="0.2" />
        </g>
      );

    case "fish":
      return (
        <g>
          {/* Body */}
          <ellipse cx="0" cy="0" rx="20" ry="12" fill="#378ADD" />
          {/* Belly */}
          <ellipse cx="0" cy="4" rx="16" ry="6" fill="#7FC4FD" />
          {/* Tail */}
          <polygon points="16,-2 26,-10 26,10 16,2" fill="#378ADD" />
          <polygon points="18,0 26,-6 26,6 18,0" fill="#2B6DAE" />
          {/* Dorsal fin */}
          <path d="M-6,-10 Q0,-20 6,-10" fill="#2B6DAE" />
          {/* Pectoral fin */}
          <path d="M-4,6 Q-10,14 -2,12 Q2,10 -4,6Z" fill="#FF9800" />
          {/* Eye */}
          <circle cx="-10" cy="-2" r="3" fill="white" />
          <circle cx="-10.5" cy="-2.3" r="1.5" fill="#1B3A4B" />
          <circle cx="-11" cy="-2.8" r="0.5" fill="white" />
          {/* Mouth */}
          <path d="M-18,-1 Q-16,1 -18,3" fill="none" stroke="#2B6DAE" strokeWidth="0.8" />
          {/* Scales */}
          <path d="M-4,-4 Q0,-6 4,-4" fill="none" stroke="#7FC4FD" strokeWidth="0.5" opacity="0.6" />
          <path d="M0,-2 Q4,-4 8,-2" fill="none" stroke="#7FC4FD" strokeWidth="0.5" opacity="0.6" />
          <path d="M-8,-2 Q-4,-4 0,-2" fill="none" stroke="#7FC4FD" strokeWidth="0.5" opacity="0.6" />
          <path d="M4,0 Q8,-2 12,0" fill="none" stroke="#7FC4FD" strokeWidth="0.5" opacity="0.6" />
          <path d="M-2,2 Q2,0 6,2" fill="none" stroke="#7FC4FD" strokeWidth="0.5" opacity="0.6" />
          {/* Ventral fin */}
          <path d="M4,8 Q6,14 10,10 Q8,8 4,8Z" fill="#FF9800" />
        </g>
      );

    case "egg":
      return (
        <g>
          {/* Shadow underneath */}
          <ellipse cx="2" cy="18" rx="14" ry="4" fill="#E0E0E0" opacity="0.5" />
          {/* Egg body */}
          <ellipse cx="0" cy="2" rx="14" ry="18" fill="#FAFAFA" />
          {/* Subtle outline */}
          <ellipse cx="0" cy="2" rx="14" ry="18" fill="none" stroke="#E0E0E0" strokeWidth="0.8" />
          {/* Top highlight */}
          <ellipse cx="-4" cy="-8" rx="5" ry="7" fill="white" opacity="0.6" />
          {/* Secondary highlight */}
          <ellipse cx="-2" cy="-4" rx="3" ry="4" fill="white" opacity="0.4" />
          {/* Bottom shadow */}
          <ellipse cx="3" cy="10" rx="6" ry="8" fill="#E0E0E0" opacity="0.15" />
          {/* Slight warm tint at base */}
          <ellipse cx="0" cy="14" rx="10" ry="5" fill="#FFF8E1" opacity="0.2" />
          {/* Specular dot */}
          <circle cx="-3" cy="-10" r="1.5" fill="white" opacity="0.7" />
          {/* Surface subtlety */}
          <ellipse cx="5" cy="0" rx="4" ry="6" fill="#F5F5F5" opacity="0.2" />
          {/* Base shadow edge */}
          <path d="M-12,12 Q0,22 12,12" fill="none" stroke="#BDBDBD" strokeWidth="0.3" opacity="0.4" />
        </g>
      );

    case "milk":
      return (
        <g>
          {/* Glass body */}
          <path d="M-10,-18 L-12,16 Q-12,20 0,20 Q12,20 12,16 L10,-18Z" fill="#90CAF9" opacity="0.25" stroke="#90CAF9" strokeWidth="0.8" />
          {/* Milk body */}
          <path d="M-11.5,0 Q-12,10 -12,16 Q-12,20 0,20 Q12,20 12,16 Q12,10 11.5,0Z" fill="#FAFAFA" />
          {/* Milk surface */}
          <ellipse cx="0" cy="0" rx="11.5" ry="3" fill="#F5F5F5" />
          {/* Glass highlight */}
          <path d="M-8,-16 Q-8,-4 -9,8" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
          {/* Right glass highlight */}
          <path d="M7,-14 Q8,0 9,12" fill="none" stroke="white" strokeWidth="0.8" opacity="0.3" strokeLinecap="round" />
          {/* Glass rim */}
          <ellipse cx="0" cy="-18" rx="10" ry="3" fill="none" stroke="#90CAF9" strokeWidth="1" />
          <ellipse cx="0" cy="-18" rx="10" ry="3" fill="#E3F2FD" opacity="0.3" />
          {/* Milk foam dots */}
          <circle cx="-3" cy="-1" r="1" fill="white" opacity="0.5" />
          <circle cx="4" cy="0" r="0.8" fill="white" opacity="0.4" />
          {/* Glass bottom */}
          <ellipse cx="0" cy="20" rx="12" ry="2" fill="#90CAF9" opacity="0.2" />
          {/* Glass tint */}
          <path d="M-10,-18 L-12,16" fill="none" stroke="#90CAF9" strokeWidth="0.3" opacity="0.4" />
          <path d="M10,-18 L12,16" fill="none" stroke="#90CAF9" strokeWidth="0.3" opacity="0.4" />
        </g>
      );

    case "plate":
      return (
        <g>
          {/* Plate shadow */}
          <ellipse cx="2" cy="12" rx="20" ry="6" fill="#BDBDBD" opacity="0.2" />
          {/* Plate outer rim */}
          <ellipse cx="0" cy="4" rx="20" ry="12" fill="#E0E0E0" />
          {/* Plate inner well */}
          <ellipse cx="0" cy="3" rx="15" ry="9" fill="#FAFAFA" />
          {/* Plate center */}
          <ellipse cx="0" cy="2" rx="10" ry="6" fill="white" />
          {/* Rim highlight */}
          <ellipse cx="-6" cy="-2" rx="8" ry="3" fill="white" opacity="0.4" />
          {/* Rim decoration line */}
          <ellipse cx="0" cy="3.5" rx="17" ry="10.5" fill="none" stroke="#BDBDBD" strokeWidth="0.5" />
          {/* Center highlight */}
          <ellipse cx="-2" cy="0" rx="4" ry="2" fill="white" opacity="0.5" />
          {/* Outer edge */}
          <ellipse cx="0" cy="4" rx="20" ry="12" fill="none" stroke="#BDBDBD" strokeWidth="0.8" />
          {/* Bottom edge shadow */}
          <path d="M-18,8 Q0,18 18,8" fill="none" stroke="#9E9E9E" strokeWidth="0.5" opacity="0.3" />
          {/* Top rim shine */}
          <path d="M-12,-4 Q-6,-8 0,-5" fill="none" stroke="white" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
        </g>
      );

    case "spoon":
      return (
        <g>
          {/* Handle */}
          <rect x="-2" y="2" width="4" height="22" rx="2" fill="#B0BEC5" />
          {/* Handle bottom */}
          <ellipse cx="0" cy="24" rx="3" ry="2" fill="#B0BEC5" />
          {/* Handle highlight */}
          <line x1="-0.5" y1="4" x2="-0.5" y2="22" stroke="#CFD8DC" strokeWidth="1" opacity="0.6" />
          {/* Bowl */}
          <ellipse cx="0" cy="-6" rx="10" ry="8" fill="#B0BEC5" />
          {/* Bowl inner */}
          <ellipse cx="0" cy="-5" rx="8" ry="6" fill="#CFD8DC" />
          {/* Bowl highlight */}
          <ellipse cx="-2" cy="-8" rx="4" ry="3" fill="#ECEFF1" opacity="0.6" />
          {/* Bowl edge */}
          <ellipse cx="0" cy="-6" rx="10" ry="8" fill="none" stroke="#90A4AE" strokeWidth="0.5" />
          {/* Inner shadow */}
          <ellipse cx="2" cy="-3" rx="4" ry="3" fill="#90A4AE" opacity="0.15" />
          {/* Specular highlight */}
          <circle cx="-3" cy="-9" r="1.2" fill="white" opacity="0.5" />
          {/* Neck transition */}
          <path d="M-4,0 Q-2,2 0,2 Q2,2 4,0" fill="#B0BEC5" />
          {/* Handle decoration line */}
          <line x1="0" y1="10" x2="0" y2="12" stroke="#90A4AE" strokeWidth="0.5" opacity="0.4" />
        </g>
      );

    case "rice":
      return (
        <g>
          {/* Bowl */}
          <path d="M-16,0 Q-18,16 0,20 Q18,16 16,0Z" fill="#C4884A" />
          {/* Bowl inner dark */}
          <path d="M-14,0 Q-16,14 0,18 Q16,14 14,0Z" fill="#A06830" />
          {/* Rice mound */}
          <ellipse cx="0" cy="-2" rx="14" ry="8" fill="#FFF8E1" />
          {/* Rice highlight */}
          <ellipse cx="-3" cy="-5" rx="6" ry="3" fill="white" opacity="0.4" />
          {/* Individual rice grains */}
          <ellipse cx="-4" cy="-4" rx="2" ry="0.8" fill="#FFF8E1" transform="rotate(-15,-4,-4)" />
          <ellipse cx="2" cy="-6" rx="2" ry="0.8" fill="#FFF8E1" transform="rotate(10,2,-6)" />
          <ellipse cx="6" cy="-2" rx="2" ry="0.8" fill="#FFF8E1" transform="rotate(-5,6,-2)" />
          <ellipse cx="-6" cy="0" rx="2" ry="0.8" fill="#FFF8E1" transform="rotate(20,-6,0)" />
          <ellipse cx="0" cy="-1" rx="2" ry="0.8" fill="#FFF8E1" transform="rotate(-10,0,-1)" />
          <ellipse cx="4" cy="2" rx="2" ry="0.8" fill="#FFF8E1" transform="rotate(15,4,2)" />
          <ellipse cx="-2" cy="2" rx="1.8" ry="0.7" fill="#FFF8E1" transform="rotate(-8,-2,2)" />
          {/* Bowl rim */}
          <ellipse cx="0" cy="0" rx="16" ry="4" fill="none" stroke="#A06830" strokeWidth="1.5" />
          <ellipse cx="0" cy="0" rx="16" ry="4" fill="#C4884A" />
          {/* Bowl rim highlight */}
          <path d="M-14,0 Q-8,-4 0,-3 Q8,-4 14,0" fill="none" stroke="#D4A06A" strokeWidth="1" opacity="0.6" />
          {/* Bowl decoration */}
          <path d="M-10,10 Q0,14 10,10" fill="none" stroke="#8B6F47" strokeWidth="0.5" opacity="0.4" />
        </g>
      );

    case "flower":
      return (
        <g>
          {/* Stem */}
          <line x1="0" y1="8" x2="0" y2="24" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" />
          {/* Leaves */}
          <path d="M0,16 Q-10,12 -14,16 Q-10,20 0,16Z" fill="#4CAF50" />
          <path d="M0,20 Q10,16 14,20 Q10,24 0,20Z" fill="#4CAF50" />
          <line x1="0" y1="16" x2="-10" y2="15" stroke="#388E3C" strokeWidth="0.4" />
          <line x1="0" y1="20" x2="10" y2="19" stroke="#388E3C" strokeWidth="0.4" />
          {/* Petals */}
          <ellipse cx="0" cy="-12" rx="5" ry="8" fill="#E91E63" />
          <ellipse cx="0" cy="4" rx="5" ry="8" fill="#E91E63" />
          <ellipse cx="-10" cy="-4" rx="5" ry="8" fill="#E91E63" transform="rotate(60,-10,-4)" />
          <ellipse cx="10" cy="-4" rx="5" ry="8" fill="#E91E63" transform="rotate(-60,10,-4)" />
          <ellipse cx="-8" cy="2" rx="5" ry="8" fill="#E91E63" transform="rotate(-60,-8,2)" />
          <ellipse cx="8" cy="2" rx="5" ry="8" fill="#E91E63" transform="rotate(60,8,2)" />
          {/* Petal highlights */}
          <ellipse cx="-1" cy="-10" rx="2" ry="4" fill="#F06292" opacity="0.4" />
          <ellipse cx="-9" cy="-3" rx="2" ry="3" fill="#F06292" opacity="0.3" transform="rotate(60,-9,-3)" />
          {/* Center */}
          <circle cx="0" cy="-2" r="5" fill="#FFD93D" />
          {/* Center detail */}
          <circle cx="0" cy="-2" r="3" fill="#FFC107" />
          <circle cx="-1" cy="-3" r="1" fill="#FFE082" opacity="0.6" />
        </g>
      );

    case "butterfly":
      return (
        <g>
          {/* Left upper wing */}
          <ellipse cx="-12" cy="-6" rx="12" ry="10" fill="#9C27B0" transform="rotate(-15,-12,-6)" />
          <ellipse cx="-10" cy="-8" rx="6" ry="5" fill="#CE93D8" opacity="0.5" />
          {/* Left lower wing */}
          <ellipse cx="-10" cy="8" rx="10" ry="8" fill="#E91E63" transform="rotate(15,-10,8)" />
          <ellipse cx="-9" cy="7" rx="5" ry="4" fill="#F48FB1" opacity="0.5" />
          {/* Right upper wing */}
          <ellipse cx="12" cy="-6" rx="12" ry="10" fill="#9C27B0" transform="rotate(15,12,-6)" />
          <ellipse cx="10" cy="-8" rx="6" ry="5" fill="#CE93D8" opacity="0.5" />
          {/* Right lower wing */}
          <ellipse cx="10" cy="8" rx="10" ry="8" fill="#E91E63" transform="rotate(-15,10,8)" />
          <ellipse cx="9" cy="7" rx="5" ry="4" fill="#F48FB1" opacity="0.5" />
          {/* Wing dots */}
          <circle cx="-14" cy="-4" r="2" fill="#E1BEE7" opacity="0.6" />
          <circle cx="14" cy="-4" r="2" fill="#E1BEE7" opacity="0.6" />
          <circle cx="-10" cy="10" r="1.5" fill="#F8BBD0" opacity="0.6" />
          <circle cx="10" cy="10" r="1.5" fill="#F8BBD0" opacity="0.6" />
          {/* Body */}
          <ellipse cx="0" cy="0" rx="2.5" ry="12" fill="#333" />
          {/* Head */}
          <circle cx="0" cy="-12" r="3" fill="#333" />
          {/* Antennae */}
          <path d="M-1,-14 Q-6,-22 -8,-24" fill="none" stroke="#333" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M1,-14 Q6,-22 8,-24" fill="none" stroke="#333" strokeWidth="0.8" strokeLinecap="round" />
          <circle cx="-8" cy="-24" r="1.2" fill="#9C27B0" />
          <circle cx="8" cy="-24" r="1.2" fill="#9C27B0" />
        </g>
      );

    case "frog":
      return (
        <g>
          {/* Body */}
          <ellipse cx="0" cy="6" rx="16" ry="12" fill="#4CAF50" />
          {/* Belly */}
          <ellipse cx="0" cy="10" rx="12" ry="8" fill="#81C784" />
          {/* Head */}
          <ellipse cx="0" cy="-6" rx="14" ry="10" fill="#4CAF50" />
          {/* Left eye bump */}
          <circle cx="-8" cy="-14" r="6" fill="#4CAF50" />
          <circle cx="-8" cy="-14" r="4" fill="white" />
          <circle cx="-8" cy="-14.5" r="2" fill="#333" />
          <circle cx="-8.5" cy="-15" r="0.6" fill="white" />
          {/* Right eye bump */}
          <circle cx="8" cy="-14" r="6" fill="#4CAF50" />
          <circle cx="8" cy="-14" r="4" fill="white" />
          <circle cx="8" cy="-14.5" r="2" fill="#333" />
          <circle cx="8.5" cy="-15" r="0.6" fill="white" />
          {/* Mouth line */}
          <path d="M-10,-2 Q0,4 10,-2" fill="none" stroke="#2E7D32" strokeWidth="1" />
          {/* Nostrils */}
          <circle cx="-3" cy="-6" r="1" fill="#2E7D32" />
          <circle cx="3" cy="-6" r="1" fill="#2E7D32" />
          {/* Front legs */}
          <path d="M-14,10 L-22,16 L-20,18 L-16,16 L-12,18" fill="#388E3C" />
          <path d="M14,10 L22,16 L20,18 L16,16 L12,18" fill="#388E3C" />
          {/* Back legs */}
          <path d="M-10,14 Q-18,20 -14,24 L-10,22 L-6,24" fill="#388E3C" />
          <path d="M10,14 Q18,20 14,24 L10,22 L6,24" fill="#388E3C" />
          {/* Belly spots */}
          <circle cx="-3" cy="8" r="1.5" fill="#A5D6A7" opacity="0.4" />
          <circle cx="4" cy="12" r="1" fill="#A5D6A7" opacity="0.4" />
        </g>
      );

    case "rain":
      return (
        <g>
          {/* Cloud body */}
          <ellipse cx="0" cy="-6" rx="18" ry="10" fill="#90A4AE" />
          <ellipse cx="-10" cy="-8" rx="10" ry="8" fill="#90A4AE" />
          <ellipse cx="10" cy="-8" rx="10" ry="8" fill="#90A4AE" />
          <ellipse cx="-5" cy="-14" rx="8" ry="6" fill="#B0BEC5" />
          <ellipse cx="6" cy="-12" rx="7" ry="5" fill="#B0BEC5" />
          {/* Rain drops */}
          <path d="M-10,8 Q-10.5,12 -10,14 Q-9,16 -10,14" fill="#64B5F6" />
          <ellipse cx="-10" cy="14" rx="2" ry="3" fill="#64B5F6" />
          <path d="M-2,10 Q-2.5,14 -2,16 Q-1,18 -2,16" fill="#64B5F6" />
          <ellipse cx="-2" cy="16" rx="2" ry="3" fill="#64B5F6" />
          <path d="M6,6 Q5.5,10 6,12 Q7,14 6,12" fill="#64B5F6" />
          <ellipse cx="6" cy="12" rx="2" ry="3" fill="#64B5F6" />
          <path d="M-6,12 Q-6.5,16 -6,18 Q-5,20 -6,18" fill="#64B5F6" />
          <ellipse cx="-6" cy="18" rx="1.5" ry="2.5" fill="#64B5F6" />
          <path d="M10,10 Q9.5,14 10,16 Q11,18 10,16" fill="#64B5F6" />
          <ellipse cx="10" cy="16" rx="1.5" ry="2.5" fill="#64B5F6" />
          {/* Drop highlights */}
          <circle cx="-10.5" cy="13" r="0.5" fill="white" opacity="0.4" />
          <circle cx="-2.5" cy="15" r="0.5" fill="white" opacity="0.4" />
          <circle cx="5.5" cy="11" r="0.5" fill="white" opacity="0.4" />
        </g>
      );

    case "bee":
      return (
        <g>
          {/* Left wing */}
          <ellipse cx="-8" cy="-10" rx="8" ry="5" fill="#E0E0E0" opacity="0.7" transform="rotate(-20,-8,-10)" />
          <ellipse cx="-7" cy="-10" rx="6" ry="3.5" fill="white" opacity="0.4" transform="rotate(-20,-7,-10)" />
          {/* Right wing */}
          <ellipse cx="8" cy="-10" rx="8" ry="5" fill="#E0E0E0" opacity="0.7" transform="rotate(20,8,-10)" />
          <ellipse cx="7" cy="-10" rx="6" ry="3.5" fill="white" opacity="0.4" transform="rotate(20,7,-10)" />
          {/* Body */}
          <ellipse cx="0" cy="2" rx="10" ry="14" fill="#FFD93D" />
          {/* Stripes */}
          <rect x="-10" y="-4" width="20" height="3" fill="#333" rx="1" />
          <rect x="-9" y="2" width="18" height="3" fill="#333" rx="1" />
          <rect x="-8" y="8" width="16" height="3" fill="#333" rx="1" />
          {/* Head */}
          <circle cx="0" cy="-12" r="6" fill="#333" />
          {/* Eyes */}
          <circle cx="-3" cy="-13" r="2" fill="white" />
          <circle cx="3" cy="-13" r="2" fill="white" />
          <circle cx="-3" cy="-13" r="1" fill="#333" />
          <circle cx="3" cy="-13" r="1" fill="#333" />
          {/* Antennae */}
          <path d="M-2,-17 Q-4,-22 -6,-24" fill="none" stroke="#333" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M2,-17 Q4,-22 6,-24" fill="none" stroke="#333" strokeWidth="0.8" strokeLinecap="round" />
          <circle cx="-6" cy="-24" r="1" fill="#FFD93D" />
          <circle cx="6" cy="-24" r="1" fill="#FFD93D" />
          {/* Stinger */}
          <polygon points="-1.5,16 0,20 1.5,16" fill="#5D4037" />
          {/* Legs */}
          <line x1="-6" y1="6" x2="-12" y2="12" stroke="#333" strokeWidth="0.6" />
          <line x1="6" y1="6" x2="12" y2="12" stroke="#333" strokeWidth="0.6" />
          <line x1="-8" y1="2" x2="-14" y2="6" stroke="#333" strokeWidth="0.6" />
          <line x1="8" y1="2" x2="14" y2="6" stroke="#333" strokeWidth="0.6" />
        </g>
      );

    case "mushroom":
      return (
        <g>
          {/* Stem */}
          <rect x="-6" y="4" width="12" height="18" rx="3" fill="#C4884A" />
          {/* Stem highlight */}
          <rect x="-3" y="6" width="4" height="14" rx="2" fill="#D4A06A" opacity="0.4" />
          {/* Stem base */}
          <ellipse cx="0" cy="22" rx="8" ry="3" fill="#A06830" />
          {/* Cap */}
          <ellipse cx="0" cy="4" rx="20" ry="14" fill="#E24B4A" />
          {/* Cap top */}
          <ellipse cx="0" cy="-2" rx="16" ry="10" fill="#E24B4A" />
          {/* Cap highlight */}
          <ellipse cx="-6" cy="-6" rx="6" ry="4" fill="#EF5350" opacity="0.4" />
          {/* White spots */}
          <circle cx="-8" cy="-4" r="3" fill="#FAFAFA" />
          <circle cx="6" cy="-6" r="2.5" fill="#FAFAFA" />
          <circle cx="0" cy="0" r="2" fill="#FAFAFA" />
          <circle cx="-12" cy="2" r="2" fill="#FAFAFA" />
          <circle cx="12" cy="0" r="1.8" fill="#FAFAFA" />
          <circle cx="4" cy="-2" r="1.5" fill="#FAFAFA" />
          {/* Cap underside line */}
          <path d="M-18,6 Q0,10 18,6" fill="none" stroke="#C62828" strokeWidth="0.8" opacity="0.4" />
          {/* Cap edge */}
          <ellipse cx="0" cy="4" rx="20" ry="14" fill="none" stroke="#C62828" strokeWidth="0.5" opacity="0.3" />
          {/* Grass at base */}
          <path d="M-10,22 L-8,18 L-6,22" fill="#4CAF50" />
          <path d="M6,22 L8,17 L10,22" fill="#4CAF50" />
        </g>
      );

    case "tree":
      return (
        <g>
          {/* Trunk */}
          <rect x="-6" y="4" width="12" height="22" rx="2" fill="#795548" />
          {/* Trunk texture */}
          <line x1="-3" y1="8" x2="-2" y2="20" stroke="#5D4037" strokeWidth="0.5" opacity="0.4" />
          <line x1="2" y1="6" x2="3" y2="18" stroke="#5D4037" strokeWidth="0.5" opacity="0.4" />
          {/* Trunk knot */}
          <ellipse cx="1" cy="14" rx="2" ry="1.5" fill="#5D4037" opacity="0.3" />
          {/* Root bumps */}
          <path d="M-6,24 Q-10,26 -12,24" fill="none" stroke="#6D4C41" strokeWidth="2" strokeLinecap="round" />
          <path d="M6,24 Q10,26 12,24" fill="none" stroke="#6D4C41" strokeWidth="2" strokeLinecap="round" />
          {/* Canopy layers */}
          <ellipse cx="0" cy="-8" rx="20" ry="16" fill="#4CAF50" />
          <ellipse cx="-8" cy="-4" rx="12" ry="10" fill="#66BB6A" />
          <ellipse cx="8" cy="-6" rx="10" ry="10" fill="#43A047" />
          <ellipse cx="0" cy="-14" rx="10" ry="8" fill="#81C784" />
          {/* Canopy highlights */}
          <ellipse cx="-4" cy="-16" rx="5" ry="3" fill="#A5D6A7" opacity="0.4" />
          <ellipse cx="6" cy="-10" rx="4" ry="3" fill="#A5D6A7" opacity="0.3" />
          {/* Canopy shadow */}
          <ellipse cx="4" cy="2" rx="8" ry="4" fill="#2E7D32" opacity="0.2" />
        </g>
      );

    case "cloud":
      return (
        <g>
          {/* Main cloud body */}
          <ellipse cx="0" cy="4" rx="22" ry="10" fill="#E0E0E0" />
          {/* Upper bumps */}
          <ellipse cx="-8" cy="-4" rx="12" ry="10" fill="#E0E0E0" />
          <ellipse cx="8" cy="-2" rx="14" ry="10" fill="#E0E0E0" />
          <ellipse cx="0" cy="-10" rx="10" ry="8" fill="#EEEEEE" />
          {/* Top bump */}
          <ellipse cx="-4" cy="-14" rx="8" ry="6" fill="#EEEEEE" />
          <ellipse cx="6" cy="-10" rx="7" ry="6" fill="#EEEEEE" />
          {/* Highlights */}
          <ellipse cx="-6" cy="-12" rx="5" ry="3" fill="white" opacity="0.5" />
          <ellipse cx="4" cy="-8" rx="4" ry="2.5" fill="white" opacity="0.4" />
          <ellipse cx="-2" cy="-4" rx="6" ry="3" fill="white" opacity="0.3" />
          {/* Shadow underneath */}
          <ellipse cx="2" cy="10" rx="16" ry="4" fill="#BDBDBD" opacity="0.3" />
          {/* Edge definition */}
          <ellipse cx="-12" cy="6" rx="8" ry="5" fill="#E0E0E0" />
          <ellipse cx="14" cy="4" rx="8" ry="5" fill="#E0E0E0" />
        </g>
      );

    case "ball":
      return (
        <g>
          {/* Shadow */}
          <ellipse cx="2" cy="20" rx="14" ry="4" fill="#9E9E9E" opacity="0.2" />
          {/* Ball body */}
          <circle cx="0" cy="2" r="16" fill="#E24B4A" />
          {/* Blue segment */}
          <path d="M0,-14 Q-8,2 0,18 Q-16,10 -14,-6Z" fill="#378ADD" />
          {/* Yellow segment */}
          <path d="M0,-14 Q8,2 0,18 Q16,10 14,-6Z" fill="#FFD93D" />
          {/* Curved dividing lines */}
          <path d="M0,-14 Q-2,2 0,18" fill="none" stroke="white" strokeWidth="1.5" />
          <path d="M-14,-6 Q0,-2 14,-6" fill="none" stroke="white" strokeWidth="1.5" />
          <path d="M-14,10 Q0,14 14,10" fill="none" stroke="white" strokeWidth="1" opacity="0.6" />
          {/* Highlight */}
          <ellipse cx="-5" cy="-6" rx="5" ry="4" fill="white" opacity="0.3" />
          {/* Specular */}
          <circle cx="-4" cy="-8" r="2" fill="white" opacity="0.5" />
          {/* Outline */}
          <circle cx="0" cy="2" r="16" fill="none" stroke="#C62828" strokeWidth="0.5" opacity="0.3" />
        </g>
      );

    case "kite":
      return (
        <g>
          {/* String */}
          <path d="M0,14 Q10,30 5,40 Q0,50 -5,55" fill="none" stroke="#333" strokeWidth="0.8" />
          {/* Kite diamond body */}
          <polygon points="0,-20 14,0 0,14 -14,0" fill="#9C27B0" />
          {/* Cross bar */}
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#5D4037" strokeWidth="1" />
          <line x1="0" y1="-20" x2="0" y2="14" stroke="#5D4037" strokeWidth="1" />
          {/* Color sections */}
          <polygon points="0,-20 14,0 0,0" fill="#AB47BC" />
          <polygon points="0,0 14,0 0,14" fill="#7B1FA2" />
          <polygon points="0,0 -14,0 0,14" fill="#CE93D8" />
          {/* Center decoration */}
          <circle cx="0" cy="0" r="2" fill="#FFD93D" />
          {/* Tail bows */}
          <path d="M-8,32 Q-5,28 -2,32 Q-5,36 -8,32Z" fill="#E91E63" />
          <path d="M0,42 Q3,38 6,42 Q3,46 0,42Z" fill="#E91E63" />
          <path d="M-8,50 Q-5,46 -2,50 Q-5,54 -8,50Z" fill="#E91E63" />
          {/* Kite edge highlight */}
          <line x1="0" y1="-20" x2="14" y2="0" stroke="#BA68C8" strokeWidth="0.5" opacity="0.5" />
          <line x1="0" y1="-20" x2="-14" y2="0" stroke="#BA68C8" strokeWidth="0.5" opacity="0.5" />
          {/* Tail string bows detail */}
          <circle cx="-5" cy="32" r="0.8" fill="#F06292" />
          <circle cx="3" cy="42" r="0.8" fill="#F06292" />
        </g>
      );

    case "swing":
      return (
        <g>
          {/* Top bar */}
          <rect x="-18" y="-24" width="36" height="4" rx="2" fill="#795548" />
          {/* Left rope */}
          <line x1="-12" y1="-22" x2="-10" y2="10" stroke="#A1887F" strokeWidth="2" />
          <line x1="-12" y1="-22" x2="-10" y2="10" stroke="#795548" strokeWidth="1" opacity="0.3" />
          {/* Right rope */}
          <line x1="12" y1="-22" x2="10" y2="10" stroke="#A1887F" strokeWidth="2" />
          <line x1="12" y1="-22" x2="10" y2="10" stroke="#795548" strokeWidth="1" opacity="0.3" />
          {/* Seat */}
          <rect x="-14" y="10" width="28" height="5" rx="2" fill="#C4884A" />
          {/* Seat wood grain */}
          <line x1="-10" y1="12" x2="10" y2="12" stroke="#A06830" strokeWidth="0.3" />
          <line x1="-8" y1="13" x2="8" y2="13" stroke="#A06830" strokeWidth="0.3" />
          {/* Seat shadow */}
          <rect x="-12" y="14" width="24" height="2" rx="1" fill="#8D6E63" opacity="0.3" />
          {/* Rope knots at top */}
          <circle cx="-12" cy="-22" r="1.5" fill="#795548" />
          <circle cx="12" cy="-22" r="1.5" fill="#795548" />
          {/* Rope knots at seat */}
          <circle cx="-10" cy="10" r="1.2" fill="#795548" />
          <circle cx="10" cy="10" r="1.2" fill="#795548" />
          {/* Support posts */}
          <rect x="-20" y="-26" width="4" height="50" fill="#6D4C41" rx="1" />
          <rect x="16" y="-26" width="4" height="50" fill="#6D4C41" rx="1" />
        </g>
      );

    case "balloon":
      return (
        <g>
          {/* String */}
          <path d="M0,16 Q-4,26 -2,36 Q0,42 -3,48" fill="none" stroke="#333" strokeWidth="0.8" />
          {/* Balloon body */}
          <ellipse cx="0" cy="0" rx="14" ry="17" fill="#E24B4A" />
          {/* Balloon top highlight */}
          <ellipse cx="-4" cy="-8" rx="5" ry="6" fill="#EF5350" opacity="0.4" />
          {/* Specular highlight */}
          <ellipse cx="-5" cy="-10" rx="3" ry="3.5" fill="white" opacity="0.3" />
          <circle cx="-4" cy="-12" r="1.5" fill="white" opacity="0.5" />
          {/* Balloon shadow */}
          <ellipse cx="4" cy="6" rx="5" ry="7" fill="#C62828" opacity="0.2" />
          {/* Tie at bottom */}
          <polygon points="-2.5,16 0,20 2.5,16" fill="#C62828" />
          {/* Balloon outline */}
          <ellipse cx="0" cy="0" rx="14" ry="17" fill="none" stroke="#C62828" strokeWidth="0.5" opacity="0.3" />
          {/* Secondary highlight */}
          <path d="M-8,-4 Q-10,-10 -6,-14" fill="none" stroke="#FF8A80" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
          {/* String curl */}
          <path d="M-3,48 Q-6,52 -2,54" fill="none" stroke="#333" strokeWidth="0.6" />
        </g>
      );

    case "slide":
      return (
        <g>
          {/* Ladder side rails */}
          <line x1="-14" y1="-22" x2="-14" y2="20" stroke="#757575" strokeWidth="2.5" />
          <line x1="-6" y1="-22" x2="-6" y2="20" stroke="#757575" strokeWidth="2.5" />
          {/* Ladder rungs */}
          <line x1="-14" y1="-16" x2="-6" y2="-16" stroke="#9E9E9E" strokeWidth="2" />
          <line x1="-14" y1="-8" x2="-6" y2="-8" stroke="#9E9E9E" strokeWidth="2" />
          <line x1="-14" y1="0" x2="-6" y2="0" stroke="#9E9E9E" strokeWidth="2" />
          <line x1="-14" y1="8" x2="-6" y2="8" stroke="#9E9E9E" strokeWidth="2" />
          <line x1="-14" y1="16" x2="-6" y2="16" stroke="#9E9E9E" strokeWidth="2" />
          {/* Platform */}
          <rect x="-16" y="-24" width="16" height="4" rx="1" fill="#757575" />
          {/* Slide chute */}
          <path d="M0,-22 Q4,-10 12,10 Q16,20 20,24" fill="none" stroke="#378ADD" strokeWidth="8" strokeLinecap="round" />
          {/* Slide surface */}
          <path d="M-2,-22 Q2,-10 10,10 Q14,20 18,24" fill="#378ADD" opacity="0.3" />
          <path d="M2,-22 Q6,-10 14,10 Q18,20 22,24" fill="#378ADD" opacity="0.3" />
          {/* Slide highlight */}
          <path d="M-1,-20 Q3,-8 11,12 Q15,22 19,26" fill="none" stroke="#64B5F6" strokeWidth="1" opacity="0.5" />
          {/* Slide sides */}
          <path d="M-3,-22 Q1,-10 9,10 Q13,20 17,24" fill="none" stroke="#1976D2" strokeWidth="1" />
          <path d="M3,-22 Q7,-10 15,10 Q19,20 23,24" fill="none" stroke="#1976D2" strokeWidth="1" />
          {/* Ground contact */}
          <ellipse cx="20" cy="26" rx="6" ry="2" fill="#757575" opacity="0.3" />
          {/* Platform railing */}
          <line x1="-16" y1="-28" x2="2" y2="-28" stroke="#757575" strokeWidth="1.5" />
          <line x1="-16" y1="-28" x2="-16" y2="-24" stroke="#757575" strokeWidth="1.5" />
        </g>
      );

    case "bicycle":
      return (
        <g>
          {/* Back wheel */}
          <circle cx="-12" cy="10" r="12" fill="none" stroke="#757575" strokeWidth="2" />
          <circle cx="-12" cy="10" r="10" fill="none" stroke="#9E9E9E" strokeWidth="0.5" />
          {/* Back wheel spokes */}
          <line x1="-12" y1="-2" x2="-12" y2="22" stroke="#9E9E9E" strokeWidth="0.5" />
          <line x1="-24" y1="10" x2="0" y2="10" stroke="#9E9E9E" strokeWidth="0.5" />
          <line x1="-20" y1="2" x2="-4" y2="18" stroke="#9E9E9E" strokeWidth="0.5" />
          <line x1="-20" y1="18" x2="-4" y2="2" stroke="#9E9E9E" strokeWidth="0.5" />
          {/* Back hub */}
          <circle cx="-12" cy="10" r="2" fill="#757575" />
          {/* Front wheel */}
          <circle cx="16" cy="10" r="12" fill="none" stroke="#757575" strokeWidth="2" />
          <circle cx="16" cy="10" r="10" fill="none" stroke="#9E9E9E" strokeWidth="0.5" />
          {/* Front wheel spokes */}
          <line x1="16" y1="-2" x2="16" y2="22" stroke="#9E9E9E" strokeWidth="0.5" />
          <line x1="4" y1="10" x2="28" y2="10" stroke="#9E9E9E" strokeWidth="0.5" />
          <line x1="8" y1="2" x2="24" y2="18" stroke="#9E9E9E" strokeWidth="0.5" />
          <line x1="8" y1="18" x2="24" y2="2" stroke="#9E9E9E" strokeWidth="0.5" />
          {/* Front hub */}
          <circle cx="16" cy="10" r="2" fill="#757575" />
          {/* Frame - main tube */}
          <line x1="-12" y1="10" x2="2" y2="-10" stroke="#333" strokeWidth="2.5" />
          {/* Frame - down tube */}
          <line x1="2" y1="-10" x2="16" y2="10" stroke="#333" strokeWidth="2.5" />
          {/* Frame - seat tube */}
          <line x1="-4" y1="0" x2="-4" y2="-14" stroke="#333" strokeWidth="2" />
          {/* Frame - chain stay */}
          <line x1="-12" y1="10" x2="4" y2="4" stroke="#333" strokeWidth="1.5" />
          {/* Seat */}
          <ellipse cx="-4" cy="-16" rx="5" ry="2" fill="#E24B4A" />
          <rect x="-6" y="-16" width="4" height="3" rx="1" fill="#C62828" />
          {/* Handlebar */}
          <line x1="2" y1="-10" x2="6" y2="-16" stroke="#333" strokeWidth="2" />
          <line x1="2" y1="-16" x2="10" y2="-16" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          {/* Handlebar grips */}
          <circle cx="2" cy="-16" r="1.5" fill="#5D4037" />
          <circle cx="10" cy="-16" r="1.5" fill="#5D4037" />
          {/* Pedal area */}
          <circle cx="0" cy="6" r="2.5" fill="#757575" />
          <line x1="0" y1="6" x2="-4" y2="10" stroke="#757575" strokeWidth="1.5" />
          <rect x="-6" y="9" width="4" height="2" rx="0.5" fill="#9E9E9E" />
        </g>
      );

    default:
      return (
        <g>
          <circle cx="0" cy="0" r="12" fill="#BDBDBD" />
          <text textAnchor="middle" dy="4" fontSize="10" fill="#757575">?</text>
        </g>
      );
  }
}
