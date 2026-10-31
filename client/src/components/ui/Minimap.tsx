import React, { useState } from 'react';
import { useStore, CASHIERS } from '../../context/StoreContext';
import { Maximize2, Minimize2, Compass, Building2, ArrowUpDown } from 'lucide-react';
import { CheckoutCounterId } from '../../types';

export const Minimap: React.FC = () => {
  const {
    playerPosition,
    playerRotation,
    navigationTarget,
    setNavigationTarget,
    currentFloor,
    callElevator
  } = useStore();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [viewFloor, setViewFloor] = useState<0 | 1>(currentFloor);

  // Sync viewed floor when player changes floors
  React.useEffect(() => {
    setViewFloor(currentFloor);
  }, [currentFloor]);

  const mapWidth = isExpanded ? 300 : 160;
  const mapHeight = isExpanded ? 300 : 160;

  const worldToMap = (x: number, z: number): [number, number] => {
    const mx = ((x + 16) / 32) * (mapWidth - 20) + 10;
    const mz = ((z + 14) / 32) * (mapHeight - 20) + 10;
    return [mx, mz];
  };

  const [playerX, playerZ] = worldToMap(playerPosition[0], playerPosition[2]);
  const playerDeg = (playerRotation * 180) / Math.PI + 180;

  const targetMapPos = navigationTarget
    ? worldToMap(navigationTarget.position[0], navigationTarget.position[2])
    : null;

  const navigateToCounter = (cId: CheckoutCounterId) => {
    const coords: Record<CheckoutCounterId, [number, number, number]> = {
      1: [-5.5, 0, 9.8],
      2: [0.0, 0, 9.8],
      3: [5.5, 0, 9.8]
    };
    setNavigationTarget({
      name: `${CASHIERS[cId].laneName} (Ground Floor)`,
      position: coords[cId],
      aisle: 0
    });
  };

  const navigateToLift = () => {
    setNavigationTarget({
      name: 'Supermarket Lift',
      position: [0, currentFloor === 0 ? 0 : 5.6, -9.5],
      aisle: 0
    });
    callElevator(currentFloor);
  };

  return (
    <div
      className={`absolute top-16 right-2 sm:top-auto sm:bottom-6 sm:right-6 z-20 glass-panel rounded-2xl overflow-hidden border border-white/15 shadow-2xl transition-all duration-300 pointer-events-auto bg-slate-950/90 ${
        isExpanded ? 'w-[290px] p-2.5 sm:w-[320px] sm:p-3' : 'w-[140px] p-1.5 sm:w-[176px] sm:p-2'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">
            {viewFloor === 0 ? 'Radar: Ground' : 'Radar: Floor 1'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Floor toggle button */}
          <button
            onClick={() => setViewFloor(viewFloor === 0 ? 1 : 0)}
            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-white/10 transition-colors cursor-pointer"
            title="Switch map floor view"
          >
            {viewFloor === 0 ? 'View F1' : 'View G'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
            title={isExpanded ? 'Minimize Map' : 'Expand Map'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative bg-slate-950/90 rounded-xl overflow-hidden border border-white/10 shadow-inner">
        <svg width={mapWidth} height={mapHeight} className="w-full h-auto">
          <defs>
            <pattern id="radar-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width={mapWidth} height={mapHeight} fill="url(#radar-grid)" />

          {/* Store Outer Boundary */}
          <rect
            x={worldToMap(-15.5, -13.5)[0]}
            y={worldToMap(-15.5, -13.5)[1]}
            width={worldToMap(15.5, 13.5)[0] - worldToMap(-15.5, -13.5)[0]}
            height={worldToMap(15.5, 13.5)[1] - worldToMap(-15.5, -13.5)[1]}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
            rx="4"
          />

          {/* Supermarket Lift Shaft (Both Floors at X=0, Z=-11.5) */}
          <rect
            x={worldToMap(-1.8, -13.2)[0]}
            y={worldToMap(-1.8, -13.2)[1]}
            width={worldToMap(1.8, -9.8)[0] - worldToMap(-1.8, -13.2)[0]}
            height={worldToMap(1.8, -9.8)[1] - worldToMap(-1.8, -13.2)[1]}
            fill="#06b6d4"
            fillOpacity="0.4"
            stroke="#06b6d4"
            strokeWidth="1.5"
            rx="2"
          />
          <text
            x={worldToMap(0, -11.5)[0]}
            y={worldToMap(0, -11.5)[1] + 3}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8"
            fontWeight="bold"
          >
            LIFT
          </text>

          {viewFloor === 0 ? (
            /* GROUND FLOOR ELEMENTS */
            <g id="ground-floor-layout">
              {/* Automatic Sliding Door Entrance */}
              <line
                x1={worldToMap(-2.5, 13.5)[0]}
                y1={worldToMap(-2.5, 13.5)[1]}
                x2={worldToMap(2.5, 13.5)[0]}
                y2={worldToMap(2.5, 13.5)[1]}
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="2,2"
              />

              {/* Aisle 1 (Produce & Bakery) */}
              <rect
                x={worldToMap(-13.5, -8.0)[0]}
                y={worldToMap(-13.5, -8.0)[1]}
                width={worldToMap(-11.5, 7.5)[0] - worldToMap(-13.5, -8.0)[0]}
                height={worldToMap(-11.5, 7.5)[1] - worldToMap(-13.5, -8.0)[1]}
                fill="#16a34a"
                fillOpacity="0.45"
                stroke="#16a34a"
                strokeWidth="1"
                rx="2"
              />

              {/* Aisle 2 (Dairy & Drinks) */}
              <rect
                x={worldToMap(-7.5, -8.0)[0]}
                y={worldToMap(-7.5, -8.0)[1]}
                width={worldToMap(-5.5, 7.5)[0] - worldToMap(-7.5, -8.0)[0]}
                height={worldToMap(-5.5, 7.5)[1] - worldToMap(-7.5, -8.0)[1]}
                fill="#2563eb"
                fillOpacity="0.45"
                stroke="#2563eb"
                strokeWidth="1"
                rx="2"
              />

              {/* Aisle 3 (Groceries) */}
              <rect
                x={worldToMap(-1.5, -8.0)[0]}
                y={worldToMap(-1.5, -8.0)[1]}
                width={worldToMap(0.5, 7.5)[0] - worldToMap(-1.5, -8.0)[0]}
                height={worldToMap(0.5, 7.5)[1] - worldToMap(-1.5, -8.0)[1]}
                fill="#b45309"
                fillOpacity="0.45"
                stroke="#b45309"
                strokeWidth="1"
                rx="2"
              />

              {/* Aisle 4 (Snacks) */}
              <rect
                x={worldToMap(4.5, -8.0)[0]}
                y={worldToMap(4.5, -8.0)[1]}
                width={worldToMap(6.5, 7.5)[0] - worldToMap(4.5, -8.0)[0]}
                height={worldToMap(6.5, 7.5)[1] - worldToMap(4.5, -8.0)[1]}
                fill="#ea580c"
                fillOpacity="0.45"
                stroke="#ea580c"
                strokeWidth="1"
                rx="2"
              />

              {/* Aisle 5 (Care & Home) */}
              <rect
                x={worldToMap(10.5, -8.0)[0]}
                y={worldToMap(10.5, -8.0)[1]}
                width={worldToMap(12.5, 7.5)[0] - worldToMap(10.5, -8.0)[0]}
                height={worldToMap(12.5, 7.5)[1] - worldToMap(10.5, -8.0)[1]}
                fill="#9333ea"
                fillOpacity="0.45"
                stroke="#9333ea"
                strokeWidth="1"
                rx="2"
              />

              {/* 3 CHECKOUT COUNTERS */}
              <rect
                x={worldToMap(-6.8, 9.2)[0]}
                y={worldToMap(-6.8, 9.2)[1]}
                width={worldToMap(-4.2, 10.4)[0] - worldToMap(-6.8, 9.2)[0]}
                height={worldToMap(-4.2, 10.4)[1] - worldToMap(-6.8, 9.2)[1]}
                fill="#10b981"
                fillOpacity="0.6"
                stroke="#10b981"
                strokeWidth="1"
              />
              <rect
                x={worldToMap(-1.3, 9.2)[0]}
                y={worldToMap(-1.3, 9.2)[1]}
                width={worldToMap(1.3, 10.4)[0] - worldToMap(-1.3, 9.2)[0]}
                height={worldToMap(1.3, 10.4)[1] - worldToMap(-1.3, 9.2)[1]}
                fill="#0284c7"
                fillOpacity="0.6"
                stroke="#0284c7"
                strokeWidth="1"
              />
              <rect
                x={worldToMap(4.2, 9.2)[0]}
                y={worldToMap(4.2, 9.2)[1]}
                width={worldToMap(6.8, 10.4)[0] - worldToMap(4.2, 9.2)[0]}
                height={worldToMap(6.8, 10.4)[1] - worldToMap(4.2, 9.2)[1]}
                fill="#8b5cf6"
                fillOpacity="0.6"
                stroke="#8b5cf6"
                strokeWidth="1"
              />
            </g>
          ) : (
            /* 1ST FLOOR FASHION BOUTIQUE LAYOUT */
            <g id="first-floor-layout">
              {/* Men's Apparel Collection Zone (Left) */}
              <rect
                x={worldToMap(-11.5, -7.0)[0]}
                y={worldToMap(-11.5, -7.0)[1]}
                width={worldToMap(-2.5, 4.0)[0] - worldToMap(-11.5, -7.0)[0]}
                height={worldToMap(-2.5, 4.0)[1] - worldToMap(-11.5, -7.0)[1]}
                fill="#3b82f6"
                fillOpacity="0.35"
                stroke="#3b82f6"
                strokeWidth="1"
                rx="3"
              />
              <text
                x={worldToMap(-7.0, -1.5)[0]}
                y={worldToMap(-7.0, -1.5)[1]}
                textAnchor="middle"
                fill="#93c5fd"
                fontSize="7"
                fontWeight="bold"
              >
                MEN'S
              </text>

              {/* Sneaker Wall & Footwear Bench (Back Left) */}
              <rect
                x={worldToMap(-10.5, -11.0)[0]}
                y={worldToMap(-10.5, -11.0)[1]}
                width={worldToMap(-2.5, -8.0)[0] - worldToMap(-10.5, -11.0)[0]}
                height={worldToMap(-2.5, -8.0)[1] - worldToMap(-10.5, -11.0)[1]}
                fill="#f59e0b"
                fillOpacity="0.35"
                stroke="#f59e0b"
                strokeWidth="1"
                rx="2"
              />
              <text
                x={worldToMap(-6.5, -9.5)[0]}
                y={worldToMap(-6.5, -9.5)[1]}
                textAnchor="middle"
                fill="#fcd34d"
                fontSize="6"
                fontWeight="bold"
              >
                SNEAKERS
              </text>

              {/* Women's Boutique & Gown Displays (Right) */}
              <rect
                x={worldToMap(2.5, -7.0)[0]}
                y={worldToMap(2.5, -7.0)[1]}
                width={worldToMap(11.5, 4.0)[0] - worldToMap(2.5, -7.0)[0]}
                height={worldToMap(11.5, 4.0)[1] - worldToMap(2.5, -7.0)[0]}
                fill="#ec4899"
                fillOpacity="0.35"
                stroke="#ec4899"
                strokeWidth="1"
                rx="3"
              />
              <text
                x={worldToMap(7.0, -1.5)[0]}
                y={worldToMap(7.0, -1.5)[1]}
                textAnchor="middle"
                fill="#f9a8d4"
                fontSize="7"
                fontWeight="bold"
              >
                WOMEN'S
              </text>

              {/* Luxury Bags & Accessories Display (Back Right) */}
              <rect
                x={worldToMap(2.5, -11.0)[0]}
                y={worldToMap(2.5, -11.0)[1]}
                width={worldToMap(10.5, -8.0)[0] - worldToMap(2.5, -11.0)[0]}
                height={worldToMap(10.5, -8.0)[1] - worldToMap(2.5, -11.0)[0]}
                fill="#a855f7"
                fillOpacity="0.35"
                stroke="#a855f7"
                strokeWidth="1"
                rx="2"
              />
              <text
                x={worldToMap(6.5, -9.5)[0]}
                y={worldToMap(6.5, -9.5)[1]}
                textAnchor="middle"
                fill="#d8b4fe"
                fontSize="6"
                fontWeight="bold"
              >
                BAGS & ACC
              </text>
            </g>
          )}

          {/* Waypoint Marker */}
          {targetMapPos && (
            <g transform={`translate(${targetMapPos[0]}, ${targetMapPos[1]})`}>
              <circle r="6" fill="#38bdf8" opacity="0.4" className="animate-ping" />
              <circle r="4" fill="#0284c7" />
              <circle r="2" fill="#ffffff" />
            </g>
          )}

          {/* Player Position & Vision Cone (Only displayed with solid icon if player is on this floor) */}
          <g
            transform={`translate(${playerX}, ${playerZ}) rotate(${playerDeg})`}
            opacity={currentFloor === viewFloor ? 1.0 : 0.4}
          >
            <path d="M 0 0 L -12 -24 L 12 -24 Z" fill="rgba(56, 189, 248, 0.28)" />
            <circle
              r="4"
              fill={currentFloor === viewFloor ? '#38bdf8' : '#94a3b8'}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <polygon points="0,-7 3,0 -3,0" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Quick Navigation Shortcuts */}
      {isExpanded && (
        <div className="space-y-1.5 mt-2">
          {/* Lift Shortcut */}
          <button
            onClick={navigateToLift}
            className="w-full text-[10px] py-1.5 px-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center gap-1.5 hover:bg-cyan-900/60 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Guide to Lift (Floor G &harr; F1)</span>
          </button>

          {viewFloor === 0 ? (
            <>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Ground Floor Aisles:
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() =>
                    setNavigationTarget({ name: 'Aisle 1 - Produce', position: [-12.5, 1, 0], aisle: 1 })
                  }
                  className="text-[9px] py-1 px-1 rounded bg-green-950/80 border border-green-500/30 text-green-300 font-medium truncate cursor-pointer"
                >
                  A1: Produce
                </button>
                <button
                  onClick={() =>
                    setNavigationTarget({ name: 'Aisle 2 - Dairy', position: [-6.5, 1, 0], aisle: 2 })
                  }
                  className="text-[9px] py-1 px-1 rounded bg-blue-950/80 border border-blue-500/30 text-blue-300 font-medium truncate cursor-pointer"
                >
                  A2: Dairy
                </button>
                <button
                  onClick={() =>
                    setNavigationTarget({ name: 'Aisle 3 - Groceries', position: [-0.5, 1, 0], aisle: 3 })
                  }
                  className="text-[9px] py-1 px-1 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 font-medium truncate cursor-pointer"
                >
                  A3: Staples
                </button>
                <button
                  onClick={() =>
                    setNavigationTarget({ name: 'Aisle 4 - Snacks', position: [5.5, 1, 0], aisle: 4 })
                  }
                  className="text-[9px] py-1 px-1 rounded bg-orange-950/80 border border-orange-500/30 text-orange-300 font-medium truncate cursor-pointer"
                >
                  A4: Snacks
                </button>
                <button
                  onClick={() =>
                    setNavigationTarget({ name: 'Aisle 5 - Care', position: [11.5, 1, 0], aisle: 5 })
                  }
                  className="text-[9px] py-1 px-1 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300 font-medium truncate cursor-pointer"
                >
                  A5: Care
                </button>
              </div>

              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pt-1">
                Checkout Counters:
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => navigateToCounter(1)}
                  className="text-[9px] py-1 px-1 rounded bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 font-bold cursor-pointer truncate"
                >
                  Lane 01 (Priya)
                </button>
                <button
                  onClick={() => navigateToCounter(2)}
                  className="text-[9px] py-1 px-1 rounded bg-blue-950/90 border border-blue-500/30 text-blue-300 font-bold cursor-pointer truncate"
                >
                  Lane 02 (Rahul)
                </button>
                <button
                  onClick={() => navigateToCounter(3)}
                  className="text-[9px] py-1 px-1 rounded bg-purple-950/90 border border-purple-500/30 text-purple-300 font-bold cursor-pointer truncate"
                >
                  Lane 03 (Ananya)
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                1st Floor Fashion Zones:
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() =>
                    setNavigationTarget({
                      name: "Men's Apparel Zone",
                      position: [-6.5, 6.6, 0.0],
                      aisle: 10
                    })
                  }
                  className="text-[9px] py-1 px-1.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-300 font-medium truncate cursor-pointer"
                >
                  Men's Clothing
                </button>
                <button
                  onClick={() =>
                    setNavigationTarget({
                      name: "Women's Boutique",
                      position: [6.5, 6.6, 0.0],
                      aisle: 11
                    })
                  }
                  className="text-[9px] py-1 px-1.5 rounded bg-pink-950/80 border border-pink-500/30 text-pink-300 font-medium truncate cursor-pointer"
                >
                  Women's Boutique
                </button>
                <button
                  onClick={() =>
                    setNavigationTarget({
                      name: 'Sneaker Wall',
                      position: [-6.5, 6.6, -8.5],
                      aisle: 12
                    })
                  }
                  className="text-[9px] py-1 px-1.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 font-medium truncate cursor-pointer"
                >
                  Sneaker Showcase
                </button>
                <button
                  onClick={() =>
                    setNavigationTarget({
                      name: 'Luxury Bags & Hats',
                      position: [6.5, 6.6, -8.5],
                      aisle: 13
                    })
                  }
                  className="text-[9px] py-1 px-1.5 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300 font-medium truncate cursor-pointer"
                >
                  Bags & Accessories
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
