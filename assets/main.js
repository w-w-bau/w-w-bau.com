/* W&W Bau GmbH — Konzept, zweiter Aufbau (22.09.2026)
   Signatur: DIE SCHNUR. Alles additiv: ohne JS bleibt die Seite lesbar. */
(function(){
  'use strict';
  var d=document, w=window, ruhig=w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Intro: nur Startseite, einmal je Sitzung ---- */
  var intro=d.querySelector('.intro');
  if(intro){
    var gesehen=false; try{gesehen=sessionStorage.getItem('ww-intro')==='1';}catch(e){}
    if(gesehen||ruhig){ intro.remove(); }
    else{
      d.body.classList.add('intro-laeuft');
      try{sessionStorage.setItem('ww-intro','1');}catch(e){}
      setTimeout(function(){ intro.classList.add('weg'); d.body.classList.remove('intro-laeuft'); },2350);
      setTimeout(function(){ intro.remove(); },3600);   // unsichtbar ab 2,95 s; das Entfernen kommt später, damit die Probe den Zustand messen kann
    }
  }

  /* ---- Reveal (rv, mask, schlag, messleiste, masskette, bahnen, karte, naht) ---- */
  var ziele=d.querySelectorAll('.rv,.mask,.schlag,.messleiste,.masskette,.bahnen,.karte-buehne,.naht i');
  if('IntersectionObserver' in w && !ruhig){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        // Sichtbar → an. Und schon VORBEIgescrollt (Unterkante über dem Bildrand) → ebenfalls an: der Beobachter meldet nur den
        // Endzustand einer Lieferung, bei schnellem Scrollen geht das „sichtbar" dazwischen sonst verloren (gemessen 22.09.2026).
        if(e.isIntersecting || e.boundingClientRect.bottom<0){ e.target.classList.add('an'); io.unobserve(e.target); }
      });
    },{rootMargin:'0px 0px -10% 0px',threshold:0.08});
    ziele.forEach(function(z){ io.observe(z); });
  } else { ziele.forEach(function(z){ z.classList.add('an'); }); }

  /* ---- Laufschnur + Kopf schrumpft ---- */
  var kopf=d.getElementById('kopf');
  function lauf(){
    var h=d.documentElement, max=h.scrollHeight-h.clientHeight;
    h.style.setProperty('--lauf', max>0 ? Math.min(1,h.scrollTop/max).toFixed(4) : 0);
    if(kopf) kopf.classList.toggle('klein', h.scrollTop>80);
  }
  w.addEventListener('scroll',lauf,{passive:true}); lauf();

  /* ---- Statement: Wörter füllen sich beim Scrollen ---- */
  var st=d.querySelector('.statement');
  if(st){
    var zeilen=(st.dataset.zeilen||st.textContent.trim()).split('|');
    st.innerHTML=zeilen.map(function(z){ return z.trim().split(/\s+/).map(function(t){ return '<span class="w" data-w="'+t+'">'+t+'</span>'; }).join(' '); }).join('<br>');
    var ws=st.querySelectorAll('.w');
    function fuell(){
      var r=st.getBoundingClientRect(), vh=w.innerHeight;
      // Skill scroll-text (Noah, 22.09.2026): das TEXTELEMENT messen, Start bei 78 % der Fensterhoehe, voll bei 32 %
      var p=(vh*0.78-r.top)/(vh*0.46); p=Math.max(0,Math.min(1,p));
      ws.forEach(function(x,i){ var a=i/ws.length, b=(i+1)/ws.length; var f=Math.max(0,Math.min(1,(p-a)/(b-a))); x.style.setProperty('--fill',f.toFixed(3)); }); // Noah, 22.09.2026 abends: Effekt klar sichtbar, läuft in beide Richtungen
    }
    if(ruhig){ ws.forEach(function(x){x.style.setProperty('--fill',1);}); }
    else { w.addEventListener('scroll',fuell,{passive:true}); fuell(); }
  }

  /* ---- Der Plan: aus Schnüren wird ein Haus (mit Dach) ---- */
  var plan=d.querySelector('.plan');
  if(plan){
    var scroll=plan.querySelector('.bahn-scroll'), svg=plan.querySelector('svg.bau');
    var s=[1,2,3,4].map(function(i){return svg.querySelector('.s'+i);});
    var naegel=svg.querySelectorAll('.nagel');
    var platte=svg.getElementById('platte'), decke=svg.getElementById('decke');
    var waende=['wand-hl','wand-hr','wand-l','wand-r'].map(function(i){return svg.getElementById(i);});
    var fenster=svg.querySelectorAll('.fenster');
    var giebel=svg.getElementById('giebel'), dachL=svg.getElementById('dach-l'), dachR=svg.getElementById('dach-r');
    var schritte=plan.querySelectorAll('.schritte li');
    // Geometrie wie im Generator: A(130,330) B(450,175) C(770,330) D(450,485), Wandhöhe 190
    var A=[130,330],B=[450,175],C=[770,330],D=[450,485],H=190,FIRST=120;
    function pt(p,h){return p[0]+','+(p[1]-h);}
    function mid(p,q){return [(p[0]+q[0])/2,(p[1]+q[1])/2];}
    function ph(p,a,b){return Math.max(0,Math.min(1,(p-a)/(b-a)));}
    function setz(p){
      // Phasen: Schnur 0–.16 · Platte .16–.30 · Wände .30–.58 · Decke .58–.68 · Putz .68–.80 · Dach .80–.94
      var sch=ph(p,0,.16);
      s.forEach(function(x,i){ var t=ph(sch,i/4,(i+1)/4); x.style.strokeDashoffset=1200*(1-t); });
      naegel.forEach(function(n,i){ n.style.opacity = sch>i/4 ? 1 : 0; });
      var pl=ph(p,.16,.30); platte.style.opacity=pl;
      var wa=ph(p,.30,.58), hoch=H*wa;
      waende[0].setAttribute('points',pt(A,0)+' '+pt(B,0)+' '+pt(B,hoch)+' '+pt(A,hoch));
      waende[1].setAttribute('points',pt(B,0)+' '+pt(C,0)+' '+pt(C,hoch)+' '+pt(B,hoch));
      waende[2].setAttribute('points',pt(D,0)+' '+pt(A,0)+' '+pt(A,hoch)+' '+pt(D,hoch));
      waende[3].setAttribute('points',pt(C,0)+' '+pt(D,0)+' '+pt(D,hoch)+' '+pt(C,hoch));
      waende.forEach(function(x){ x.style.opacity=wa>0?1:0; });
      fenster.forEach(function(f){ f.style.opacity = wa>.72 ? ph(wa,.72,.9) : 0; });
      // Schnüre verblassen, sobald die Wände stehen
      var weg=1-ph(p,.42,.6); s.forEach(function(x){ x.style.opacity=weg; }); naegel.forEach(function(n){ n.style.opacity=Math.min(parseFloat(n.style.opacity||0),weg); });
      var de=ph(p,.58,.68); decke.style.opacity=de;
      var pu=ph(p,.68,.80);
      var farben=[['#7a3524','#8e8577'],['#a04c33','#b8b0a0'],['#8f3f2a','#a39b8c'],['#b5563a','#cbc3b3']];
      waende.forEach(function(x,i){ x.setAttribute('fill', pu>0 ? misch(farben[i][0],farben[i][1],pu) : farben[i][0]); });
      // Dach: First über den Mittelpunkten von DA und BC, Giebel auf DA (vorn links), zwei Dachflächen
      var da=ph(p,.80,.94);
      var mDA=mid(D,A), mBC=mid(B,C);
      var f1=[mDA[0],mDA[1]-H-FIRST*da], f2=[mBC[0],mBC[1]-H-FIRST*da];
      giebel.setAttribute('points',pt(D,H)+' '+pt(A,H)+' '+f1[0]+','+f1[1]);
      giebel.style.opacity=da>0?1:0;
      // linke Dachfläche (vorn): Traufe A–B ... First f1–f2 ; rechte: Traufe D–C
      dachL.setAttribute('points',pt(A,H)+' '+pt(B,H)+' '+f2[0]+','+f2[1]+' '+f1[0]+','+f1[1]);
      dachR.setAttribute('points',pt(D,H)+' '+pt(C,H)+' '+f2[0]+','+f2[1]+' '+f1[0]+','+f1[1]);
      dachL.style.opacity=da>0?1:0; dachR.style.opacity=da>0?1:0;
      // Schritte
      var grenzen=[.16,.30,.58,.68,.80,.94];
      var jetzt=0; for(var i=0;i<grenzen.length;i++){ if(p>=grenzen[i]-0.001) jetzt=i+1; }
      if(jetzt>5) jetzt=5;
      schritte.forEach(function(li,i){ li.classList.toggle('jetzt',i===jetzt); li.classList.toggle('vorbei',i<jetzt); });
    }
    function misch(a,b,t){
      function h(x){return [parseInt(x.substr(1,2),16),parseInt(x.substr(3,2),16),parseInt(x.substr(5,2),16)];}
      var A_=h(a),B_=h(b); return 'rgb('+A_.map(function(v,i){return Math.round(v+(B_[i]-v)*t);}).join(',')+')';
    }
    function planScroll(){
      var r=scroll.getBoundingClientRect(), strecke=r.height-w.innerHeight;
      var p= strecke>0 ? Math.max(0,Math.min(1,-r.top/strecke)) : 1;
      setz(p);
    }
    if(ruhig){ setz(1); } else { w.addEventListener('scroll',planScroll,{passive:true}); w.addEventListener('resize',planScroll); planScroll(); }
    plan.dataset.bereit='1';
  }

  /* ---- Bahnen: eine geht auf ---- */
  d.querySelectorAll('.bahnen').forEach(function(b){
    var bahnen=b.querySelectorAll('.bahn'); if(!bahnen.length) return;
    function auf(x){ bahnen.forEach(function(y){ y.classList.toggle('auf',y===x); }); }
    auf(bahnen[0]);
    bahnen.forEach(function(x){
      x.addEventListener('mouseenter',function(){auf(x);});
      x.addEventListener('focus',function(){auf(x);});
      x.addEventListener('touchstart',function(e){ if(!x.classList.contains('auf')){ e.preventDefault(); auf(x); } },{passive:false});
    });
  });

  /* ---- Zähler in der Maßkette ---- */
  d.querySelectorAll('.masskette').forEach(function(m){
    var zs=m.querySelectorAll('.zahl-gross'); var lief=false;
    function zaehl(){
      if(lief||ruhig) return; lief=true;
      zs.forEach(function(z){
        var ziel=parseInt(z.dataset.zahl,10); if(isNaN(ziel)) return;
        var t0=null; function f(t){ if(!t0)t0=t; var p=Math.min(1,(t-t0)/1300); p=1-Math.pow(1-p,3); z.textContent=Math.round(ziel*p); if(p<1)requestAnimationFrame(f); else z.textContent=z.dataset.zahl; }
        requestAnimationFrame(f);
      });
    }
    if('IntersectionObserver' in w){ var o=new IntersectionObserver(function(es){ if(es[0].isIntersecting){zaehl();o.disconnect();} },{threshold:.3}); o.observe(m); }
  });

  /* ---- Fadenkreuz ---- */
  if(w.matchMedia('(hover:hover) and (pointer:fine)').matches && !ruhig){
    var f=d.createElement('div'); f.className='faden'; d.body.appendChild(f);
    var fx=0,fy=0,tx=0,ty=0;
    d.addEventListener('mousemove',function(e){ tx=e.clientX; ty=e.clientY; f.classList.add('an'); });
    d.addEventListener('mouseleave',function(){ f.classList.remove('an'); });
    (function tick(){ fx+=(tx-fx)*.28; fy+=(ty-fy)*.28; f.style.transform='translate('+(fx-17)+'px,'+(fy-17)+'px)'; requestAnimationFrame(tick); })();
    d.addEventListener('mouseover',function(e){ f.classList.toggle('gross', !!e.target.closest('a,button,summary,.bahn')); });
    f.style.transform='translate(-100px,-100px)';
  }

  /* ---- Mobilmenü ---- */
  var burger=d.querySelector('.burger'), mm=d.querySelector('.mobilmenu');
  if(burger&&mm){
    function zu(){ mm.classList.remove('offen'); burger.setAttribute('aria-expanded','false'); d.body.style.overflow=''; }
    burger.addEventListener('click',function(){ mm.classList.add('offen'); burger.setAttribute('aria-expanded','true'); d.body.style.overflow='hidden'; });
    mm.querySelector('.zu').addEventListener('click',zu);
    mm.addEventListener('click',function(e){ if(e.target===mm) zu(); });
    d.addEventListener('keydown',function(e){ if(e.key==='Escape') zu(); });
  }

  /* ---- Seitenwechsel ---- */
  var we=d.createElement('div'); we.className='wechsel'; d.body.appendChild(we);
  d.body.classList.add('kommt');
  if(!ruhig) d.addEventListener('click',function(e){
    var a=e.target.closest('a[href]'); if(!a) return;
    var h=a.getAttribute('href');
    if(!h||h.charAt(0)==='#'||/^(tel|mailto|http)/.test(h)||a.target==='_blank'||e.metaKey||e.ctrlKey) return;
    e.preventDefault(); we.classList.add('an'); setTimeout(function(){ w.location.href=h; },420);
  });
  w.addEventListener('pageshow',function(e){ if(e.persisted){ we.classList.remove('an'); } });

  /* ---- Chips + Galerie-Filter ---- */
  d.querySelectorAll('.chip').forEach(function(c){ c.addEventListener('click',function(){ c.setAttribute('aria-pressed', c.getAttribute('aria-pressed')==='true'?'false':'true'); }); });
  var filter=d.querySelector('.filter');
  if(filter){
    filter.addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b) return;
      filter.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed', x===b?'true':'false'); });
      var k=b.dataset.k;
      d.querySelectorAll('.gal-gruppe').forEach(function(g){
        var zeig=g.dataset.k===k; g.hidden=!zeig;
        if(zeig) g.querySelectorAll('.schlag').forEach(function(s){ s.classList.add('an'); });
      });
    });
  }

  /* ---- Videos: nur abspielen, wenn im Bild ---- */
  var vids=d.querySelectorAll('video[autoplay]');
  if('IntersectionObserver' in w && vids.length){
    var vo=new IntersectionObserver(function(es){ es.forEach(function(e){ var v=e.target; if(e.isIntersecting){ var p=v.play(); if(p&&p.catch)p.catch(function(){}); } else v.pause(); }); },{threshold:.05});
    vids.forEach(function(v){ vo.observe(v); });
  }
})();


/* ---- Anfrageformular: POST an den Formular-Dienst, Rückmeldung per Parameter ---- */
(function(){
  var d=document, w=window;
  var q=new URLSearchParams(location.search);
  d.querySelectorAll('form.anfrage').forEach(function(f){
    var hinweis=f.querySelector('.form-hinweis');
    var knopf=f.querySelector('button[type="submit"]');
    var TEL='08869 9139760', MAIL='afn100norri@t-online.de';
    var ts=f.querySelector('[name="ts"]'); if(ts) ts.value=String(Date.now());
    function sage(t,art){ if(!hinweis) return; hinweis.textContent=t; hinweis.className='form-hinweis '+(art||''); }
    f.addEventListener('submit',function(e){
      var name=f.querySelector('[name="name"]'), mail=f.querySelector('[name="mail"]'),
          na=f.querySelector('[name="nachricht"]'), ok=f.querySelector('[name="einwilligung"]');
      if(!name.value.trim()){ e.preventDefault(); sage('Bitte tragen Sie noch Ihren Namen ein.','fehler'); name.focus(); return; }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim())){ e.preventDefault(); sage('Bitte tragen Sie eine gültige E-Mail-Adresse ein, damit wir antworten können.','fehler'); mail.focus(); return; }
      if(!na.value.trim()){ e.preventDefault(); sage('Bitte schreiben Sie kurz, worum es geht.','fehler'); na.focus(); return; }
      if(ok && !ok.checked){ e.preventDefault(); sage('Bitte bestätigen Sie noch die Zeile zum Datenschutz.','fehler'); ok.focus(); return; }
      /* Auswahl-Chips als Themen mitschicken */
      f.querySelectorAll('input.chip-thema').forEach(function(x){ x.remove(); });
      f.querySelectorAll('.chip[aria-pressed="true"]').forEach(function(c){
        var h=d.createElement('input'); h.type='hidden'; h.name='thema'; h.value=c.textContent.trim(); h.className='chip-thema'; f.appendChild(h);
      });
      var sel=f.querySelector('select[name="thema"]'); if(sel && !sel.value) sel.disabled=true;
      if(knopf){ knopf.disabled=true; }
      sage('');
    });
    if(location.hash==='#anfrage' && (q.has('gesendet')||q.has('fehler'))){
      if(q.has('gesendet')){ f.reset(); sage('Danke, Ihre Anfrage ist raus. Wir melden uns — meist am selben oder nächsten Werktag.','gut'); }
      else { sage('Das Absenden hat gerade nicht funktioniert. Rufen Sie uns einfach an: '+TEL+' — oder schreiben Sie an '+MAIL+'.','fehler'); }
      try{ history.replaceState(null,'',location.pathname+location.hash); }catch(x){}
    }
  });

  /* ---- Seitenaufrufe zählen: ohne Cookies, ohne Speicher im Browser, ohne IP und ohne Kennung.
     Eigener Zähler der HandwerksManufaktur (Worker seiten-zaehler); beschrieben in der Datenschutzerklärung. */
  if(/(^|\.)w-w-bau\.com$/.test(location.hostname)){
    var r='direkt';
    try{
      if(q.get('utm_source')) r='utm:'+q.get('utm_source');
      else if(d.referrer){ var h=new URL(d.referrer).hostname.replace(/^www\./,''); if(h && h!==location.hostname) r=h; }
    }catch(e){}
    var z=JSON.stringify({t:'v',s:location.hostname,p:location.pathname,g:w.innerWidth<768?'m':'d',id:Math.random().toString(36).slice(2,12),r:r});
    var Z='https://seiten-zaehler.handwerksmanufaktur.workers.dev/z';
    try{ if(!(navigator.sendBeacon && navigator.sendBeacon(Z,new Blob([z],{type:'text/plain'})))) fetch(Z,{method:'POST',body:z,keepalive:true,mode:'no-cors'}); }catch(e){}
  }
})();
