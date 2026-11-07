import React, { useRef, useState } from 'react';
import { Plus, Minus, Maximize, Move, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

export function boundMapView({zoom=1,x=0,y=0}) {
  zoom=Math.max(1,Math.min(3,Number.isFinite(zoom)?zoom:1));
  return {zoom,x:Math.max(0,Math.min(100-100/zoom,Number.isFinite(x)?x:0)),y:Math.max(0,Math.min(70-70/zoom,Number.isFinite(y)?y:0))};
}
export default function BoothMap({booths, profiles, visible, selected, onSelect, onClear, editing}) {
  const [view,setView]=useState({zoom:1,x:0,y:0}),[gestures,setGestures]=useState(false),[dragging,setDragging]=useState(false);
  const svg=useRef(null),points=useRef(new Map()),start=useRef(null),suppress=useRef(false),live=useRef(view);
  live.current=view;
  const matches=new Set(visible.map(b=>b.id));
  function update(next){setView(boundMapView(next));}
  function zoomBy(amount){const v=live.current,z=Math.max(1,Math.min(3,v.zoom+amount));update({zoom:z,x:v.x+50/v.zoom-50/z,y:v.y+35/v.zoom-35/z});if(z>1)setGestures(true);}
  function fit(){points.current.clear();start.current=null;setDragging(false);setGestures(false);update({zoom:1,x:0,y:0});}
  function frame(v){const r=svg.current.getBoundingClientRect(),s=Math.min(r.width/(100/v.zoom),r.height/(70/v.zoom));return {r,s,left:(r.width-100/v.zoom*s)/2,top:(r.height-70/v.zoom*s)/2};}
  function restart(){
    const p=[...points.current.values()],v=live.current;
    if(p.length>1){const mid={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2},f=frame(v);start.current={view:v,distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),anchor:{x:v.x+(mid.x-f.r.left-f.left)/f.s,y:v.y+(mid.y-f.r.top-f.top)/f.s}};suppress.current=true;}
    else if(p.length)start.current={view:v,point:p[0]};else start.current=null;
  }
  function down(e){if(e.pointerType==='mouse'&&e.button!==0)return;if(e.pointerType==='touch'&&!gestures)return;if(points.current.size===0)suppress.current=false;points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});restart();}
  function move(e){
    if(!points.current.has(e.pointerId)||!start.current)return;
    points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});const p=[...points.current.values()],a=start.current;
    if(p.length>1&&a.distance>0){const z=a.view.zoom*Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)/a.distance,v=boundMapView({zoom:z}),f=frame(v),mid={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2};update({zoom:v.zoom,x:a.anchor.x-(mid.x-f.r.left-f.left)/f.s,y:a.anchor.y-(mid.y-f.r.top-f.top)/f.s});suppress.current=true;}
    else if(a.point){const dx=e.clientX-a.point.x,dy=e.clientY-a.point.y;if(Math.hypot(dx,dy)<6&&!suppress.current)return;suppress.current=true;const f=frame(a.view);update({...a.view,x:a.view.x-dx/f.s,y:a.view.y-dy/f.s});}
    if(suppress.current){setDragging(true);try{svg.current.setPointerCapture(e.pointerId);}catch{}}
  }
  function up(e){points.current.delete(e.pointerId);if(points.current.size)restart();else{start.current=null;setDragging(false);}}
  return <section className={'venue-map map-explorer'+(dragging?' is-dragging':'')} aria-label="Interactive market map">
    <header className="explorer-heading"><div><span>THE SUNDAY COMMONS</span><h2>Find your place.</h2></div><span className="map-count">{visible.length} of {booths.length} booths</span></header>
    <div className="explorer-tools">
      <div className="explorer-zoom" role="group" aria-label="Map zoom controls">
        <button aria-label="Zoom out" disabled={view.zoom===1} onClick={()=>zoomBy(-.25)}><Minus size={17}/></button>
        <span aria-live="polite" aria-label="Map zoom">{Math.round(view.zoom*100)}%</span>
        <button aria-label="Zoom in" disabled={view.zoom===3} onClick={()=>zoomBy(.25)}><Plus size={17}/></button>
        <button aria-label="Fit map" onClick={fit}><Maximize size={17}/></button>
      </div>
      <button className="map-gesture-toggle" aria-pressed={gestures} onClick={()=>setGestures(v=>!v)}><Move size={15}/>{gestures?'Gestures on':'Enable map gestures'}</button>
      {visible.length!==booths.length&&<button className="map-clear-filter" onClick={onClear}>Clear filters</button>}
    </div>
    <div className="map-stage">
      <svg ref={svg} viewBox={`${view.x} ${view.y} ${100/view.zoom} ${70/view.zoom}`} role="group" tabIndex={0} aria-label="Booth layout" aria-describedby="map-instructions" style={{touchAction:gestures?'none':'pan-y'}} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={e=>{points.current.clear();start.current=null;suppress.current=true;setDragging(false);}} onKeyDown={e=>{
        if(e.target!==e.currentTarget)return;const keys={ArrowLeft:[-5,0],ArrowRight:[5,0],ArrowUp:[0,-5],ArrowDown:[0,5]};if(keys[e.key]){e.preventDefault();update({...view,x:view.x+keys[e.key][0],y:view.y+keys[e.key][1]});}else if(['+','=','-','Home'].includes(e.key)){e.preventDefault();e.key==='Home'?fit():zoomBy(e.key==='-'?-.25:.25);}
      }}>
        <rect width="100" height="70" rx="3" fill="#f3f6fb"/>
        <rect x="3" y="5" width="94" height="21" rx="2.2" fill="#e4eaf3"/>
        <rect x="3" y="44" width="94" height="21" rx="2.2" fill="#e4eaf3"/>
        <path d="M0 35H100" stroke="#fff" strokeWidth="12"/>
        <path d="M59.5 0V70" stroke="#fff" strokeWidth="5"/>
        <path d="M0 35H100M59.5 0V70" stroke="#d1dcea" strokeWidth=".3" strokeDasharray="1 1"/>
        <text x="28" y="36" textAnchor="middle" fontSize="2" fill="#526077" letterSpacing=".25">CENTRAL WALKWAY</text>
        <text x="59.5" y="4" textAnchor="middle" fontSize="1.7" fill="#526077">ACCESS</text>
        <g className="map-entrances" fill="#14284b">
          <circle cx="3" cy="35" r="2.4"/><path d="M1.5 35h3m-1-1 1 1-1 1" stroke="#fff" strokeWidth=".4" fill="none"/>
          <circle cx="97" cy="35" r="2.4"/><path d="M98.5 35h-3m1-1-1 1 1 1" stroke="#fff" strokeWidth=".4" fill="none"/>
          <text x="9" y="32" fontSize="1.7">ENTRY A</text><text x="83" y="32" fontSize="1.7">ENTRY B</text>
          <text x="59.5" y="68" textAnchor="middle" fontSize="1.7">ACCESS</text>
        </g>
        {booths.map(b=>{const match=matches.has(b.id),p=profiles.find(p=>p.id===b.merchant),state=b.blocked?'Unavailable':b.merchant?'Occupied':'Available';return <g key={b.id} id={'map-'+b.id} role="button" tabIndex={match?0:-1} aria-hidden={!match} aria-label={`${b.id} ${state}`} aria-controls="booth-detail-panel" aria-expanded={selected===b.id} className={'map-booth map-spot '+(b.blocked?'blocked':b.merchant?'occupied':'available')+(selected===b.id?' selected':'')+(!match?' map-dimmed':'')} style={{pointerEvents:match?'auto':'none'}} onClick={()=>{if(!suppress.current)onSelect(b.id);suppress.current=false;}} onKeyDown={e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();onSelect(b.id);}}}>
          <title>{b.id} · {p?.name||b.category} · {state}</title>
          <rect className="booth-footprint" x={b.x} y={b.y} width={b.w} height={b.h} rx="1.4"/>
          <path className="booth-awning" d={`M${b.x+.8} ${b.y<29?b.y+b.h-1.3:b.y+1.3}h${b.w-1.6}`} strokeWidth="1.3" strokeLinecap="round"/>
          <text className="booth-mark" x={b.x+b.w/2} y={b.y+b.h*.43} textAnchor="middle" fontSize={b.merchant?'3':'4'} fontWeight="500">{b.blocked?'—':b.merchant?(p?.name||'Shop').split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase():'+'}</text>
          <text className="booth-number" x={b.x+b.w/2} y={b.y+b.h*.75} textAnchor="middle" fontSize="3.5" fontWeight="650">{b.id}</text>
          {selected===b.id&&<circle className="booth-selection-dot" cx={b.x+b.w-1.2} cy={b.y+1.2} r="1"/>}
        </g>})}
      </svg>
      <div className="map-orientation" aria-hidden="true"><span>↑</span>SCHEMATIC</div>
    </div>
    <div className="explorer-bottom"><div className="map-legend"><span><i className="legend-available"/>Available</span><span><i className="legend-occupied"/>Occupied</span><span><i className="legend-blocked"/>Unavailable</span><span><i className="legend-selected"/>Selected</span></div>
      <div className="explorer-pan" role="group" aria-label="Pan map">{[["left",ArrowLeft,-5,0],["up",ArrowUp,0,-5],["down",ArrowDown,0,5],["right",ArrowRight,5,0]].map(([name,Icon,x,y])=><button key={name} aria-label={'Pan map '+name} disabled={view.zoom===1} onClick={()=>update({...view,x:view.x+x,y:view.y+y})}><Icon size={15}/></button>)}</div>
    </div>
    <p id="map-instructions" className="map-instructions">{gestures?'Drag to move · Pinch or use + / − to zoom. Fit restores page scrolling.':'Tap a booth for details. Scroll normally, or enable gestures to move the map.'} Keyboard: focus the map, use arrows, + / − and Home.</p>
    <p className="map-disclosure">{editing?'Layout draft · Keep both walkways clear.':'Two facing booth rows · Clear central walkway and cross access.'} Fictional schematic inspired by the supplied venue reference; not a surveyed floor plan.</p>
  </section>;
}
