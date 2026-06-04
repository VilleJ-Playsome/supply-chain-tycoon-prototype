// Custom SVG icon set for Supply Line.
// Each glyph is 24x24, drawn with currentColor (+ opacity for a 2-tone facet),
// so it can be tinted per building tier / resource by setting `color` on a parent.

const wrap = inner => `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="gico">${inner}</svg>`;

export const ICON_SVG = {
  // RAW producers
  mine: wrap(`
    <path d="M3.6 9.6C7 5.2 13 3.8 18.4 5.6c.9.3.6 1.7-.3 1.7-1.6 0-3-.5-4.9-.4-2.5.1-4.7 1.2-6.4 3.3-.7.9-1.9.5-1.9-.6Z" fill="currentColor"/>
    <rect x="9.6" y="7" width="2.5" height="14" rx="1.25" transform="rotate(20 11 14)" fill="currentColor"/>`),
  tapper: wrap(`
    <path d="M12 2.5c3.6 0 6 2.6 6 5.8 0 3-2.3 4.8-4.4 5.4l.4 6.3a1 1 0 0 1-2 .1l-.4-6.4C9.6 13 7 11.2 7 8.3 7 5.1 8.6 2.5 12 2.5Z" fill="currentColor" opacity=".55"/>
    <path d="M17.4 14.2c1.3 1.5 1.3 3.4.1 4.3-1 .7-2.4.1-2.5-1.3-.1-1.1.9-2 2.4-3Z" fill="currentColor"/>`),
  sandpit: wrap(`
    <circle cx="17.5" cy="6.6" r="2.4" fill="currentColor" opacity=".55"/>
    <path d="M1.5 19.5c2.4-5.4 5-7.6 7.2-7.6 1.9 0 3 1.9 4.6 4 1.2 1.6 2.4 3.6 4.2 3.6H1.5Z" fill="currentColor"/>
    <path d="M11 19.5c1.4-3 3-4.2 4.4-4.2 1.3 0 2.2 1.3 3.4 2.6.7.7 1.4 1.6 2.7 1.6H11Z" fill="currentColor" opacity=".5"/>`),
  // PART makers
  smelter: wrap(`
    <path d="M12 2.4c3 3 5.1 5.6 5.1 9.3a5.1 5.1 0 0 1-10.2 0c0-1.8.8-3.2 1.9-4.3-.3 1.3.3 2.4 1.3 2.7C9.3 8.6 9.9 5.6 12 2.4Z" fill="currentColor"/>
    <path d="M12 13.4c1.4 1.2 2.2 2.3 2.2 3.7a2.2 2.2 0 0 1-4.4 0c0-1.1.7-2.1 2.2-3.7Z" fill="currentColor" opacity=".45"/>`),
  wheelworks: wrap(`
    <circle cx="12" cy="12" r="9.2" fill="currentColor"/>
    <circle cx="12" cy="12" r="5.6" fill="currentColor" opacity=".35"/>
    <circle cx="12" cy="12" r="2.3" fill="currentColor"/>`),
  refinery: wrap(`
    <path d="M9.6 3.2h4.8v4.6l4.4 8.7c.7 1.4-.3 3-1.9 3H7.1c-1.6 0-2.6-1.6-1.9-3l4.4-8.7V3.2Z" fill="currentColor"/>
    <path d="M8.8 3.2h6.4" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>
    <circle cx="10.6" cy="16" r="1" fill="#0b0e12" opacity=".35"/>
    <circle cx="13.2" cy="18" r=".8" fill="#0b0e12" opacity=".35"/>`),
  // FINAL-ish / mid
  bodyshop: wrap(`
    <path d="M2.4 16.4l1.5-3.4c.3-.7 1-1.2 1.8-1.2h.6l1.7-3c.4-.7 1.1-1.1 1.9-1.1h4.4c.8 0 1.5.4 1.9 1.1l1.7 3h.6c.8 0 1.5.5 1.8 1.2l1.5 3.4v2H2.4v-2Z" fill="currentColor"/>
    <path d="M9 8.6l-1.2 3.2h8.4L15 8.6z" fill="#0b0e12" opacity=".3"/>`),
  chipfab: wrap(`
    <rect x="7" y="7" width="10" height="10" rx="1.8" fill="currentColor"/>
    <rect x="9.8" y="9.8" width="4.4" height="4.4" rx="1" fill="#0b0e12" opacity=".4"/>
    <g fill="currentColor"><rect x="9.2" y="3.4" width="1.8" height="3" rx=".6"/><rect x="13" y="3.4" width="1.8" height="3" rx=".6"/><rect x="9.2" y="17.6" width="1.8" height="3" rx=".6"/><rect x="13" y="17.6" width="1.8" height="3" rx=".6"/><rect x="3.4" y="9.2" width="3" height="1.8" rx=".6"/><rect x="3.4" y="13" width="3" height="1.8" rx=".6"/><rect x="17.6" y="9.2" width="3" height="1.8" rx=".6"/><rect x="17.6" y="13" width="3" height="1.8" rx=".6"/></g>`),
  assembler: wrap(`
    <path d="M12 2.2l1.7 2.3 2.7-1 .5 2.8 2.8.6-1 2.7 2.3 1.7-2.3 1.7 1 2.7-2.8.6-.5 2.8-2.7-1L12 21.8l-1.7-2.3-2.7 1-.5-2.8L4.3 17l1-2.7L3 12.6l2.3-1.7-1-2.7 2.8-.6.5-2.8 2.7 1L12 2.2Z" fill="currentColor"/>
    <circle cx="12" cy="12" r="3.4" fill="#0b0e12" opacity=".45"/>`),
  shop: wrap(`
    <path d="M4.5 9.5h15v9.8h-15z" fill="currentColor" opacity=".5"/>
    <path d="M3 5.2h18l1.1 4.3H1.9z" fill="currentColor"/>
    <rect x="9.8" y="13" width="4.4" height="6.3" rx=".6" fill="currentColor"/>`),
};

export const RES_SVG = {
  ore: wrap(`
    <path d="M5 13.5l3.5-5 4 1.5 3-2 3.5 4.5-2.5 5h-9z" fill="currentColor"/>
    <path d="M8.5 8.5l4 1.5-1.5 5.5-6 .5z" fill="currentColor" opacity=".45"/>`),
  rubber: wrap(`
    <path d="M12 3.2c3.4 4 5.4 6.4 5.4 9.4a5.4 5.4 0 0 1-10.8 0c0-3 2-5.4 5.4-9.4Z" fill="currentColor"/>
    <path d="M9.4 13.6c0 1.6 1 2.8 2.4 3.1" stroke="#0b0e12" stroke-width="1.3" stroke-linecap="round" opacity=".35" fill="none"/>`),
  sand: wrap(`
    <path d="M2.5 18.5c2-4 4-5.8 5.8-5.8 1.5 0 2.4 1.5 3.7 3.2 1 1.3 1.9 2.6 3.3 2.6H2.5Z" fill="currentColor"/>
    <path d="M10 18.5c1.2-2.4 2.5-3.4 3.6-3.4 1 0 1.8 1 2.7 2 .6.6 1.1 1.4 2.2 1.4H10Z" fill="currentColor" opacity=".5"/>
    <circle cx="6" cy="8.5" r="1.3" fill="currentColor" opacity=".7"/><circle cx="15" cy="6.5" r="1.6" fill="currentColor" opacity=".7"/>`),
  steel: wrap(`
    <path d="M5 5h14v3.2h-5.4v7.6H19V19H5v-3.2h5.4V8.2H5z" fill="currentColor"/>`),
  wheel: wrap(`
    <circle cx="12" cy="12" r="9" fill="currentColor"/>
    <circle cx="12" cy="12" r="5.4" fill="currentColor" opacity=".35"/>
    <circle cx="12" cy="12" r="2.1" fill="currentColor"/>`),
  silicon: wrap(`
    <path d="M12 3a9 9 0 1 0 6.4 2.6L12 12V3Z" fill="currentColor"/>
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" opacity=".5" fill="none"/>`),
  body: wrap(`
    <path d="M2.4 16.4l1.5-3.4c.3-.7 1-1.2 1.8-1.2h.6l1.7-3c.4-.7 1.1-1.1 1.9-1.1h4.4c.8 0 1.5.4 1.9 1.1l1.7 3h.6c.8 0 1.5.5 1.8 1.2l1.5 3.4v2H2.4v-2Z" fill="currentColor"/>
    <path d="M9 8.6l-1.2 3.2h8.4L15 8.6z" fill="#0b0e12" opacity=".3"/>`),
  chip: wrap(`
    <rect x="7" y="7" width="10" height="10" rx="1.8" fill="currentColor"/>
    <rect x="9.8" y="9.8" width="4.4" height="4.4" rx="1" fill="#0b0e12" opacity=".4"/>
    <g fill="currentColor"><rect x="9.2" y="3.6" width="1.8" height="2.6" rx=".6"/><rect x="13" y="3.6" width="1.8" height="2.6" rx=".6"/><rect x="9.2" y="17.8" width="1.8" height="2.6" rx=".6"/><rect x="13" y="17.8" width="1.8" height="2.6" rx=".6"/><rect x="3.6" y="9.2" width="2.6" height="1.8" rx=".6"/><rect x="3.6" y="13" width="2.6" height="1.8" rx=".6"/><rect x="17.8" y="9.2" width="2.6" height="1.8" rx=".6"/><rect x="17.8" y="13" width="2.6" height="1.8" rx=".6"/></g>`),
  car: wrap(`
    <path d="M2.6 14.4l1.7-4.2c.4-1 1.4-1.6 2.5-1.6h10.4c1.1 0 2.1.6 2.5 1.6l1.7 4.2v3H2.6v-3Z" fill="currentColor"/>
    <path d="M6.6 8.6l1.3-2.2c.3-.5.8-.8 1.4-.8h5.4c.6 0 1.1.3 1.4.8l1.3 2.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" opacity=".5" fill="none"/>
    <circle cx="7.2" cy="17.6" r="2.3" fill="currentColor"/><circle cx="16.8" cy="17.6" r="2.3" fill="currentColor"/>
    <circle cx="7.2" cy="17.6" r=".9" fill="#0b0e12" opacity=".4"/><circle cx="16.8" cy="17.6" r=".9" fill="#0b0e12" opacity=".4"/>`),
};

// Also expose globally for non-module pages (e.g. the design-directions comparison).
if (typeof window !== 'undefined') { window.ICON_SVG = ICON_SVG; window.RES_SVG = RES_SVG; }
