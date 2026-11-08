import React, {useEffect, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, SlidersHorizontal} from 'lucide-react';
import ProgressiveImage from './ProgressiveImage';
import './blackball-ordering.css';
const featuredIds=[10,14,2,54];
export default function BlackballShowcase({menu,onChoose}) {
 const products=featuredIds.map(id=>menu.find(i=>i.id===id&&i.available!==false)).filter(Boolean);
 const [active,setActive]=useState(0);const track=useRef(null);
 useEffect(()=>setActive(i=>Math.min(i,Math.max(0,products.length-1))),[products.length]);
 if(!products.length)return null;
 const selected=products[Math.min(active,products.length-1)];
 const go=index=>{const next=(index+products.length)%products.length;track.current?.children[next]?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest',inline:'center'});};
 return <section className="bb-showcase" aria-label="Blackball featured product gallery">
  <div className="bb-gallery-heading"><span>A little craving. A good beginning.</span><span className="tnum">{active+1} / {products.length}</span></div>
  <div className="bb-gallery-track" ref={track} tabIndex={0} aria-label="Swipe featured products" onKeyDown={e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();go(active+(e.key==='ArrowRight'?1:-1));}}} onScroll={e=>{const el=e.currentTarget;setActive(Math.max(0,Math.min(products.length-1,Math.round(el.scrollLeft/el.clientWidth))));}}>
   {products.map((item,index)=><article key={item.id} className="bb-gallery-slide" aria-label={`${index+1} of ${products.length}: ${item.name}`}>
    <button className="bb-product-photo" tabIndex={active===index?0:-1} aria-label={`Choose featured ${item.name}`} onClick={()=>onChoose(item)}><ProgressiveImage src={item.image} alt={item.name} width="640" height="800"/><span className="bb-photo-hint"><SlidersHorizontal size={14}/> Make it yours</span></button>
   </article>)}
  </div>
  <div className="bb-gallery-meta"><div aria-live="polite"><small>ON THE MENU</small><h2>{selected.name}</h2><span>From ₱{selected.price.toLocaleString('en-PH')}</span></div><button className="bb-select" aria-label={`Customize featured ${selected.name}`} onClick={()=>onChoose(selected)}><ArrowRight size={22}/></button></div>
  <div className="bb-gallery-controls"><button aria-label="Previous featured product" onClick={()=>go(active-1)}><ArrowLeft size={17}/></button><div className="bb-gallery-dots">{products.map((p,i)=><button key={p.id} aria-label={`Show ${p.name}`} aria-current={active===i?'true':undefined} onClick={()=>go(i)}><i/></button>)}</div><button aria-label="Next featured product" onClick={()=>go(active+1)}><ArrowRight size={17}/></button></div>
 </section>;
}
