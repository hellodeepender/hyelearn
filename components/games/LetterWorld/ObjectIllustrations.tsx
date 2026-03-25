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

    default:
      return (
        <g>
          <circle cx="0" cy="0" r="12" fill="#BDBDBD" />
          <text textAnchor="middle" dy="4" fontSize="10" fill="#757575">?</text>
        </g>
      );
  }
}
