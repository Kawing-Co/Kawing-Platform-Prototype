import React, {useEffect, useRef, useState} from 'react';
import {ArrowDown, Infinity as Connection, ShoppingBag, Pause, Play, Check} from 'lucide-react';
import connection from './motion/connection.json';
import cart from './motion/cart.json';
import nudge from './motion/nudge.json';

const clips={connection,cart,nudge};
const icons={connection:Connection,cart:ShoppingBag,nudge:ArrowDown};
function animationData(name,tone){
  const data=JSON.parse(JSON.stringify(clips[name]));
  if(tone==='light'){
    const walk=value=>{if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object'){if(['fl','st'].includes(value.ty)&&value.c&&!value.c.a){const white=value.c.k[0]>.95;value.c.k=white?[20/255,40/255,75/255,1]:[1,1,1,1];}Object.values(value).forEach(walk);}};
    walk(data);
  }
  return data;
}
const preferenceKey='kawing-motion-paused';
export function useDemoMotion(){
  const [paused,setPaused]=useState(()=>{try{return localStorage.getItem(preferenceKey)==='1';}catch{return false;}});
  const [pageVisible,setPageVisible]=useState(!document.hidden);
  useEffect(()=>{const change=()=>setPageVisible(!document.hidden);document.addEventListener('visibilitychange',change);return()=>document.removeEventListener('visibilitychange',change);},[]);
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReduced(q.matches);q.addEventListener('change',change);return()=>q.removeEventListener('change',change);},[]);
  return {enabled:!paused&&!reduced,reduced,pageVisible,toggle:()=>setPaused(v=>{try{localStorage.setItem(preferenceKey,v?'0':'1');}catch{}return !v;})};
}
export function MotionControl({motion}){
  const Icon=motion.enabled?Pause:Play;
  return <button className="motion-control" onClick={motion.toggle} disabled={motion.reduced} aria-label={motion.reduced?'Reduced motion enabled':motion.enabled?'Pause motion':'Play motion'} title={motion.reduced?'Your device requests reduced motion':undefined}><Icon size={14}/><span>{motion.reduced?'Reduced motion':motion.enabled?'Pause motion':'Play motion'}</span></button>;
}
// Local vector-only data; the light SVG player is loaded separately from ordering.
export function MotionGlyph({name='connection',enabled=true,loop=false,tone='ink',className=''}){
  const host=useRef(null),container=useRef(null);
  useEffect(()=>{
    if(!enabled)return;
    let disposed=false,animation,visible=false,completed=false;
    const el=host.current,action=el.closest('button,a');
    const sync=()=>{if(!animation)return;const play=visible&&!document.hidden&&!completed;play?animation.play():animation.pause();el.dataset.lottieState=play?'playing':completed?'complete':'paused';};
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.1});observer.observe(el);
    const replay=()=>{if(!animation||!visible||document.hidden)return;completed=false;animation.goToAndPlay(0,true);el.dataset.lottieState='playing';};
    document.addEventListener('visibilitychange',sync);action?.addEventListener('pointerenter',replay);action?.addEventListener('focus',replay);
    import('lottie-web/build/player/lottie_light').then(module=>{
      if(disposed)return;
      animation=module.default.loadAnimation({container:container.current,renderer:'svg',loop,autoplay:false,animationData:animationData(name,tone),rendererSettings:{progressiveLoad:true,hideOnTransparent:true}});
      animation.setSpeed(name==='cart'?1.6:.8);
      animation.addEventListener('DOMLoaded',()=>{if(disposed)return;container.current.querySelector('svg')?.setAttribute('viewBox',{connection:'85 190 430 220',cart:'310 280 220 200',nudge:'30 30 84 84'}[name]);el.dataset.lottieReady='true';sync();});
      animation.addEventListener('complete',()=>{completed=true;el.dataset.lottieState='complete';});
      animation.addEventListener('data_failed',()=>{el.dataset.lottieReady='false';el.dataset.lottieState='unavailable';});
    }).catch(()=>{if(!disposed)el.dataset.lottieState='unavailable';});
    return()=>{disposed=true;observer.disconnect();document.removeEventListener('visibilitychange',sync);action?.removeEventListener('pointerenter',replay);action?.removeEventListener('focus',replay);animation?.destroy();el.dataset.lottieReady='false';};
  },[name,enabled,loop,tone]);
  const Icon=icons[name];
  return <span ref={host} className={'motion-glyph '+className} aria-hidden="true" data-clip={name} data-enabled={enabled} data-tone={tone}><span ref={container} className="motion-vector"/><Icon className="motion-fallback" size={24}/></span>;
}
const steps=[
  {title:'Arrive & order',copy:'A guest explores the menu, places an order, and follows its progress.',sample:'Iced matcha, less sweet. Sent straight to the team.',label:'Customer',clip:'cart'},
  {title:'Run the business',copy:'The merchant verifies payment, prepares the order, and manages their brand.',sample:'Payment checked. Your drink is now being prepared.',label:'Merchant',clip:'nudge'},
  {title:'Bring it together',copy:'The admin supports merchants, packages, and shared market operations.',sample:'One shared market. Every booth has its own business.',label:'Admin',clip:'connection'},
];
export function ConnectedVisit({motion}){
  const [active,setActive]=useState(0),[interacted,setInteracted]=useState(false),[visible,setVisible]=useState(false),[pageVisible,setPageVisible]=useState(!document.hidden);
  const card=useRef(null);
  useEffect(()=>{const o=new IntersectionObserver(e=>{const showing=e[0].isIntersecting;setVisible(showing);card.current?.closest('.demo-purpose-card')?.setAttribute('data-card-visible',String(showing));},{threshold:.25});o.observe(card.current);const change=()=>setPageVisible(!document.hidden);document.addEventListener('visibilitychange',change);return()=>{o.disconnect();document.removeEventListener('visibilitychange',change);};},[]);

  return <div ref={card} className="connected-visit" data-active-step={active}>
    <ol>{steps.map((step,i)=><li key={step.title}><button className="visit-step" aria-pressed={active===i} onClick={()=>{setActive(i);setInteracted(true);}}><span className="visit-index">0{i+1}</span><span><b>{step.title}</b><span className="visit-description">{step.copy}</span></span><span className="visit-indicator"><Check size={14}/></span></button></li>)}</ol>
    <div className="visit-preview" key={active}><MotionGlyph name={steps[active].clip} enabled={motion.enabled} tone="light"/><div><small>{steps[active].label} perspective · Demo</small><p>{steps[active].sample}</p></div></div>
    <small className="visit-hint">Select a step to explore the connection.</small>
  </div>;
}
