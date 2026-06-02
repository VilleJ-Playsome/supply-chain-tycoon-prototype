export const BUILDINGS = {
  mine:       {name:'Iron ore',  short:'Iron ore', out:'ore',    rate:2.0, inputs:[],                                       depth:0},
  tapper:     {name:'Rubber',    short:'Rubber',   out:'rubber', rate:2.0, inputs:[],                                       depth:0},
  smelter:    {name:'Steel',     short:'Steel',    out:'steel',  rate:2.0, inputs:[{res:'ore',qty:1}],                      depth:1},
  wheelworks: {name:'Wheel',     short:'Wheel',    out:'wheel',  rate:2.0, inputs:[{res:'rubber',qty:1}],                   depth:1},
  bodyshop:   {name:'Car body',  short:'Car body', out:'body',   rate:1.0, inputs:[{res:'steel',qty:1}],                    depth:2},
  assembler:  {name:'Assembler', short:'Assembler',out:'car',    rate:1.0, inputs:[{res:'body',qty:1},{res:'wheel',qty:4}],  depth:3},
  shop:       {name:'Shop',      short:'Shop',     out:null,     rate:6.0, inputs:[],                                       depth:0},
};

export const PRICE   = {ore:0.4, rubber:0.4, steel:1.2, wheel:1.5, body:3.5, car:12};
export const RNAME   = {ore:'Iron ore',rubber:'Rubber',steel:'Steel',wheel:'Wheel',body:'Car body',car:'Car'};
export const BASE_COST = {shop:30, mine:20, tapper:20, smelter:55, wheelworks:75, bodyshop:150, assembler:300};
export const PROD_ORDER = ['mine','tapper','smelter','wheelworks','bodyshop','assembler'];
export const ICON    = {mine:'⛏️',tapper:'🌳',smelter:'🔥',wheelworks:'🛞',bodyshop:'🛠️',assembler:'⚙️',shop:'🏪'};
export const RESICON = {ore:'🪨',rubber:'🟤',steel:'🔩',wheel:'🛞',body:'🚙',car:'🚗'};
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
