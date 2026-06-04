export const BUILDINGS = {
  mine:       {name:'Iron ore',   short:'Iron ore', out:'ore',     rate:2.0, inputs:[],                                                              depth:0},
  tapper:     {name:'Rubber',     short:'Rubber',   out:'rubber',  rate:2.0, inputs:[],                                                              depth:0},
  sandpit:    {name:'Silica sand',short:'Silica',   out:'sand',    rate:2.0, inputs:[],                                                              depth:0},
  smelter:    {name:'Steel',      short:'Steel',    out:'steel',   rate:2.0, inputs:[{res:'ore',qty:10}],                                            depth:1},
  wheelworks: {name:'Wheel',      short:'Wheel',    out:'wheel',   rate:2.0, inputs:[{res:'rubber',qty:25}],                                         depth:1},
  refinery:   {name:'Silicon',    short:'Silicon',  out:'silicon', rate:2.0, inputs:[{res:'sand',qty:10}],                                           depth:1},
  bodyshop:   {name:'Car body',   short:'Car body', out:'body',    rate:1.0, inputs:[{res:'steel',qty:25}],                                          depth:2},
  chipfab:    {name:'Microchip',  short:'Microchip',out:'chip',    rate:1.0, inputs:[{res:'silicon',qty:20}],                                        depth:2},
  assembler:  {name:'Assembler',  short:'Assembler',out:'car',     rate:1.0, inputs:[{res:'body',qty:1},{res:'wheel',qty:4},{res:'chip',qty:1}],     depth:3},
  shop:       {name:'Shop',       short:'Shop',     out:null,      rate:6.0, inputs:[],                                                              depth:0},
};

export const PRICE   = {ore:0.5, rubber:0.6, sand:0.45, steel:7.0, wheel:20, silicon:6.5, body:230, chip:175, car:650};
export const RNAME   = {ore:'Iron ore',rubber:'Rubber',sand:'Silica sand',steel:'Steel',wheel:'Wheel',silicon:'Silicon',body:'Car body',chip:'Microchip',car:'Car'};
export const BASE_COST = {shop:90, mine:30, tapper:35, sandpit:34, smelter:180, wheelworks:240, refinery:200, bodyshop:900, chipfab:1100, assembler:5000};
export const COPY_GROWTH = {shop:1.75, mine:1.38, tapper:1.4, sandpit:1.39, smelter:1.48, wheelworks:1.52, refinery:1.49, bodyshop:1.6, chipfab:1.62, assembler:1.7};
export const SPEED_BASE_COST = {shop:120, mine:75, tapper:85, sandpit:80, smelter:400, wheelworks:540, refinery:430, bodyshop:1800, chipfab:2000, assembler:5200};
export const SPEED_COST_GROWTH = 2.05;
export const EFFICIENCY_TYPES = ['smelter', 'wheelworks', 'refinery', 'bodyshop', 'chipfab'];
export const EFFICIENCY_BASE_COST = {smelter:650, wheelworks:850, refinery:700, bodyshop:3200, chipfab:3500};
export const EFFICIENCY_COST_GROWTH = 2.2;
export const EFFICIENCY_STEP = 0.05;
export const EFFICIENCY_MAX_LEVEL = 7;
export const QUALITY_BASE_COST = {mine:120, tapper:140, sandpit:130, smelter:900, wheelworks:1200, refinery:950, bodyshop:4500, chipfab:5000, assembler:12000};
export const QUALITY_COST_GROWTH = 2.15;
export const QUALITY_INPUT_STEP = 0.1;
export const QUALITY_VALUE_STEP = 0.25;
export const UNLOCK_BASE_COST = 60;
export const UNLOCK_COST_GROWTH = 1.7;
export const PROD_ORDER = ['mine','tapper','sandpit','smelter','wheelworks','refinery','bodyshop','chipfab','assembler'];
export const ICON    = {mine:'⛏️',tapper:'🌳',sandpit:'🏖️',smelter:'🔥',wheelworks:'🛞',refinery:'⚗️',bodyshop:'🛠️',chipfab:'🔬',assembler:'⚙️',shop:'🏪'};
export const RESICON = {ore:'🪨',rubber:'🟤',sand:'🟡',steel:'🔩',wheel:'🛞',silicon:'🔘',body:'🚙',chip:'🟩',car:'🚗'};
export const TIERCOL = {
  d0:   {s:'#8a93a0',c:'#2c333d'},
  d1:   {s:'#3fb6a0',c:'#16312b'},
  d2:   {s:'#cf9244',c:'#352512'},
  d3:   {s:'#e6a23c',c:'#3a2c12'},
  shop: {s:'#e6c46a',c:'#3a2f17'},
};

export const OUT_CAP       = 15;
export const IN_CAP        = 15;
export const BAY_CAP       = 30;
export const MOVE_COOLDOWN = 3;
export const OFFLINE_STEP  = 2;

export const TRUCK_BATCH         = 1.5;  // units per truck
export const TRUCK_SPEED         = 0.55; // progress/s — ~1.8s travel time
export const MAX_TRUCKS_PER_ROUTE = 3;
export const TRUCK_COL = {ore:'#8a93a0',rubber:'#a0724a',sand:'#d9b66b',steel:'#3fb6a0',wheel:'#2a9d8f',silicon:'#7b8aa0',body:'#cf9244',chip:'#3fae5a',car:'#e6a23c'};
