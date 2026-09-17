import{i as qe,s as He,c as Je,g as Ye,d as ce,u as le,G as Ve,a as Ke,h as Xe,f as Qe,b as de,t as Ze,l as et,e as Se}from"./capture-DADEgmgG.js";import{r as Ae,s as tt,t as nt,g as ot,R as at,h as st,o as rt,i as it,p as ct,V,u as lt}from"./three.module-DAQ7URuL.js";import{v as dt}from"./session-BQ9_He4D.js";const ut=`<header>
  <a class="brand" href="./">morphic<span>◌</span></a
  ><a class="header-note" href="./article.html">How Morphic works</a
  ><button id="capture-open" class="primary">Create from capture</button
  ><button id="save">Save session</button>
</header>
<main class="capture-workspace">
  <aside>
    <h1>Try an object.</h1>
    <p class="intro">
      Drag its surface to pull it.<br />Drag the background to look around.
    </p>
    <label for="asset">Examples</label
    ><select id="asset">
      <option value="sloth">Sloth · observed behavior</option>
      <option value="capture_glove">Baseball glove · reconstructed</option>
      <option value="lemon">Lemon</option>
      <option value="sweet_potato">Sweet potato</option>
      <option value="met_tablet">Clay tablet</option>
      <option value="met_bottle">Moche bottle</option>
    </select>
    <p id="credit" class="credit"></p>
    <div id="capture-story" hidden>
      <p class="fine">
        Seven photographs became this textured shape. Inspect the original
        views, then pull or drop the result.
      </p>
      <div class="source-views">
        <a href="./captures/glove/view-0.png" target="_blank"
          ><img
            src="./captures/glove/view-0.png"
            alt="First input photograph of the baseball glove"
        /></a>
        <a href="./captures/glove/view-3.png" target="_blank"
          ><img
            src="./captures/glove/view-3.png"
            alt="Fourth input photograph from another angle"
        /></a>
        <a href="./captures/glove/view-6.png" target="_blank"
          ><img
            src="./captures/glove/view-6.png"
            alt="Seventh input photograph of the baseball glove"
        /></a>
      </div>
      <p class="fine">
        CO3D / Reizenstein et al. · CC BY-NC 4.0. Resized input views; generated
        geometry. <a href="./captures/glove/provenance.json">Capture details</a>
      </p>
    </div>
    <p class="fine">
      These examples use assigned soft-body behavior, not measured material
      properties.
    </p>
    <div class="simple-actions">
      <button id="drop">Drop</button><button id="reset">Reset object</button>
    </div>
    <details>
      <summary>Save and open</summary>
      <button id="load">Open session</button
      ><button id="import">Open 3D file</button
      ><button id="export">Export 3D shape</button
      ><button id="photo">Save image</button
      ><button id="replay">Replay session</button>
    </details>
    <a class="research-link" href="./article.html">How Morphic works</a>
    <a class="sloth-preview" href="./?mode=measured"
      ><img
        src="./media/measured/morphic-thumbnail.gif"
        alt="Sloth responding to recorded hand motion"
      /><span>Try the sloth's observed behavior</span></a
    >
  </aside>
  <section class="workspace" aria-label="Interactive object">
    <div
      id="viewport"
      tabindex="0"
      aria-label="Drag the object to deform it; drag the background to orbit"
    >
      <div class="stage-heading">
        <h2 id="asset-name">Preparing object</h2>
        <span id="state" class="state"></span>
      </div>
      <div class="stage-tools">
        <button id="home" aria-label="Reset camera">Reset view</button>
      </div>
      <div id="loading">
        Preparing your object<span>Building its interactive shape…</span>
      </div>
      <div class="stage-bottom">
        <span>Drag to interact</span
        ><button id="play" aria-label="Play simulation">▶</button>
      </div>
    </div>
    <div id="status" role="status" aria-live="polite"></div>
  </section>
</main>
<div hidden aria-hidden="true">
  <span id="asset-tag"></span><span id="geometry"></span><span id="time"></span>
  <div id="progress"></div>
  <span id="solver-ms"></span><span id="frame-ms"></span
  ><span id="volume"></span><span id="inverted"></span><span id="drift"></span
  ><button id="squash"></button><button id="stretch"></button
  ><button id="pin"></button><input id="gravity" type="checkbox" /><input
    id="ghost"
    type="checkbox"
  /><input id="cage" type="checkbox" /><select id="surface">
    <option value="floor">Floor</option>
    <option value="sphere">Sphere</option>
    <option value="ramp">Ramp</option></select
  ><select id="resolution">
    <option value="8">8</option>
  </select>
</div>
<input type="file" id="file" accept=".glb,.json" multiple hidden /><input
  type="file"
  id="session-file"
  accept=".json,.morphic"
  hidden
/>
<dialog id="capture-dialog" aria-labelledby="capture-title">
  <form method="dialog">
    <button class="capture-close" aria-label="Close capture">Close</button>
  </form>
  <h2 id="capture-title">Capture your object.</h2>
  <p>
    Keep the object still. Move around it slowly in even light, including its
    back and top. Use overlapping photos or one short orbit video.
  </p>
  <label class="capture-picker"
    >Choose photos or a video<input
      id="capture-files"
      type="file"
      accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
      multiple
  /></label>
  <p id="capture-feedback" role="status" aria-live="polite">
    Your files stay on this device.
  </p>
  <div id="capture-previews"></div>
  <p id="capture-selection" role="status" aria-live="polite"></p>
  <button id="capture-save" disabled>Save capture on this device</button>
  <button id="capture-create" disabled>Create 3D object</button>
  <p id="capture-compute" role="status">
    Checking reconstruction availability…
  </p>
  <p class="capture-help">
    The public studio runs prepared examples. Creating a new object needs your
    own compatible GPU. <a href="./guide.html">Set up personal generation</a>.
  </p>
  <p id="capture-storage-status" role="status" aria-live="polite"></p>
  <details>
    <summary>Saved captures</summary>
    <div id="capture-saved"></div>
    <h3>Created objects</h3>
    <div id="capture-jobs"></div>
  </details>
  <p class="capture-boundary">
    Creating an object sends up to 12 resized views to your configured GPU
    worker. Hidden surfaces are generated estimates. Movement uses assigned
    simulation, not measured material properties. Originals stay on this device.
  </p>
</dialog>
`;async function Pe(e,n){if(e?.schema!==1||e.state!=="completed"||e.stage!=="completed")throw Error("Reconstruction has not completed successfully.");if(!["trellis2-single-image","trellis-single-image","trellis-multi-image"].includes(e.method)||e.behavior!=="assigned"||e.hiddenSurfaces!=="generated-unverified")throw Error("Unsupported reconstruction method or evidence labels.");for(const a of[e.sourceCommit,e.checkpointRevision])if(!/^[a-f0-9]{40}$/.test(a??""))throw Error("Missing reconstruction source revision.");if(!/^[a-f0-9]{64}$/.test(e.input?.sha256??""))throw Error("Missing source-image checksum.");const t=e.method==="trellis2-single-image"?"512":"trellis-image-large";if(!Number.isInteger(e.seed)||e.pipeline!==t)throw Error("Unsupported reconstruction settings.");const s=e.inputs??[e.input];if(!Array.isArray(s)||!s.length||s.length>80||s.some(a=>!/^[a-f0-9]{64}$/.test(a?.sha256??"")))throw Error("Invalid reconstruction input provenance.");if(e.method==="trellis-multi-image"&&s.length<2)throw Error("Multiview reconstruction needs multiple source images.");if(e.output?.bytes!==n.byteLength)throw Error("Reconstruction output size mismatch.");const r=[...new Uint8Array(await crypto.subtle.digest("SHA-256",n))].map(a=>a.toString(16).padStart(2,"0")).join("");if(r!==e.output.sha256)throw Error("Reconstruction output checksum mismatch.");return qe(n),{method:e.method,sourceCommit:e.sourceCommit,checkpointRevision:e.checkpointRevision,inputSha256:e.input.sha256,inputs:s.map(a=>({sha256:a.sha256,name:String(a.name??"").slice(0,250)})),outputSha256:r,seed:e.seed,pipeline:e.pipeline,behavior:"assigned",hiddenSurfaces:"generated-unverified"}}const pt=new Set(["image/jpeg","image/png","image/webp"]),Re=new Set(["video/mp4","video/webm","video/quicktime"]);function K(e){if(!e.length)throw Error("Choose photos or one video.");if(e.length>80||e.reduce((t,s)=>t+s.size,0)>300*1024*1024)throw Error("Choose up to 80 photos or one video, totaling less than 300 MB.");if(e.some(t=>!t.size))throw Error("One of these files is empty. Choose the original capture.");if(e.some(t=>!pt.has(t.type)&&!Re.has(t.type)))throw Error("Use JPEG, PNG or WebP photos, or an MP4, WebM or MOV video.");const n=e.filter(t=>Re.has(t.type));if(n.length&&e.length!==1)throw Error("Choose one video, or a set of photos, in separate captures.");return n.length?"video":"photos"}function Te(e,n,t){if(e===void 0)return;const s=n==="video"?"video-midpoints-12-v1":"photos-source-order-v1",r=n==="video"?12:t;if(!e||e.recipe!==s||!Array.isArray(e.selectedIndices)||e.selectedIndices.length>12||new Set(e.selectedIndices).size!==e.selectedIndices.length||e.selectedIndices.some(a=>!Number.isInteger(a)||a<0||a>=r))throw Error("This saved view selection is invalid or uses an unsupported sampling method. Choose the original files again.");return{recipe:s,selectedIndices:[...e.selectedIndices].sort((a,l)=>a-l)}}async function je(e,n){const t=K(e),s=Te(n,t,e.length),r=[];for(const a of e){const l=await crypto.subtle.digest("SHA-256",await a.arrayBuffer());r.push({name:a.name,type:a.type,size:a.size,sha256:[...new Uint8Array(l)].map(b=>b.toString(16).padStart(2,"0")).join("")})}return{id:crypto.randomUUID(),version:1,createdAt:new Date().toISOString(),name:e[0].name,kind:t,state:"captured",sources:r,files:[...e],...s?{review:s}:{}}}function Ue(){return new Promise((e,n)=>{const t=indexedDB.open("morphic-captures",1);t.onupgradeneeded=()=>{t.result.createObjectStore("metadata",{keyPath:"id"}),t.result.createObjectStore("sources",{keyPath:"id"})},t.onsuccess=()=>e(t.result),t.onerror=()=>n(t.error)})}async function Ie(e){const n=await Ue();try{await new Promise((t,s)=>{const r=n.transaction(["metadata","sources"],"readwrite"),{files:a,...l}=e;r.objectStore("metadata").add(l),r.objectStore("sources").add({id:e.id,files:a}),r.oncomplete=t,r.onabort=()=>s(r.error||Error("Capture storage was interrupted.")),r.onerror=()=>{}})}finally{n.close()}}async function Be(e,n){const t=await Ue();try{return await new Promise((s,r)=>{const a=t.transaction(e,"readonly"),l=n?a.objectStore(e).get(n):a.objectStore(e).getAll();a.oncomplete=()=>s(l.result),a.onabort=()=>r(a.error),l.onerror=()=>r(l.error)})}finally{t.close()}}async function ht(){return(await Be("metadata")).sort((e,n)=>n.createdAt.localeCompare(e.createdAt))}async function mt(e){const n=await Be("sources",e);if(!n)throw Error("This capture is no longer in this browser. Choose the original files again.");return K(n.files),n.files}function gt(e){const n=document.getElementById("capture-dialog"),t=document.getElementById("capture-files"),s=document.getElementById("capture-feedback"),r=document.getElementById("capture-previews"),a=document.getElementById("capture-selection");let l=[],b=[],w=0,A=[],p=[],u=!1,g=!1,P=!1;const S=document.getElementById("capture-create"),j=document.getElementById("capture-compute"),D="/__morphic_reconstruction/",ge=["127.0.0.1","localhost"].includes(location.hostname);async function ze(){P=!1,!u&&!g&&(S.disabled=!0,j.textContent="Checking GPU connection…");let i="No personal GPU connected. Review and save your capture here, or follow the setup guide to create a new object.";if(!ge){j.textContent=i;return}try{const d=await fetch(D),f=await d.json();P=d.ok&&f.available&&!f.busy,d.ok&&typeof f.message=="string"&&(i=f.message)}catch{P=!1}!u&&!g&&(S.disabled=!P||!p.length,j.textContent=i)}async function fe(i){const d=Date.now();for(;;){if(Date.now()-d>20*6e4)throw Error("Still waiting for the GPU. Do not resubmit; check the existing job.");const m=await fetch(D+i),E=await m.json();if(!m.ok||["failed","interrupted","invalid"].includes(E.stage))throw Error(E.error??"Reconstruction failed.");if(E.stage==="completed")break;j.textContent=`Creating your object: ${E.stage}. You can keep this window open while it works.`,await new Promise(k=>setTimeout(k,2e3))}const[f,M]=await Promise.all([fetch(D+i+"/asset"),fetch(D+i+"/report")]);if(!f.ok||!M.ok)throw Error("Could not retrieve the completed object.");const h=await f.arrayBuffer(),c=await Pe(await M.json(),h);await e(h,c),j.textContent="Object reconstructed. Its hidden surfaces and physical behavior remain unverified.",n.close()}S.onclick=async()=>{if(!(u||g||!p.length)){u=!0,S.disabled=I.disabled=t.disabled=!0;try{await Ie(await je(A,Ee())),j.textContent="Sending selected views to your GPU worker…";const i=await fetch(D,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({images:p})}),d=await i.json();if(!i.ok)throw Error(d.error??"Could not submit reconstruction.");await fe(d.id)}catch(i){j.textContent=i.message}finally{u=!1,t.disabled=!1,I.disabled=!A.length}}};const I=document.getElementById("capture-save"),ve=document.getElementById("capture-saved"),z=document.getElementById("capture-storage-status");async function be(){const i=document.getElementById("capture-jobs");if(i.replaceChildren(),!ge){i.textContent="Created objects are saved by your local studio. Open a downloaded session to use it here.";return}try{const d=await fetch(D+"jobs");if(!d.ok)throw Error("Reconstruction history is unavailable.");const f=await d.json();for(const[M,h]of f.entries()){const c=document.createElement("div"),m=document.createElement("button");m.textContent=`${h.stage==="completed"?"Open":"Check"} object ${M+1}`,m.disabled=["invalid","failed"].includes(h.stage);const E=document.createElement("span");if(E.textContent=` (${h.stage})`,c.append(m,E),h.error){const k=document.createElement("p");k.textContent=h.error,c.append(k)}m.onclick=async()=>{if(!(u||g)){u=!0,S.disabled=t.disabled=I.disabled=!0;try{if(h.stage==="interrupted"){const k=await fetch(D+h.id+"/recover",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}),ke=await k.json();if(!k.ok||ke.stage!=="completed")throw Error(ke.error??"The existing job is still running. Check again later; do not resubmit.")}await fe(h.id)}catch(k){j.textContent=k.message}finally{u=!1,t.disabled=!1,I.disabled=!A.length,await be()}}},i.append(c)}f.length||(i.textContent="No reconstructed objects saved by this local server yet.")}catch(d){i.textContent=d.message}}async function ye(){ve.replaceChildren();try{for(const i of await ht()){const d=document.createElement("button");d.textContent=`${i.name} — ${i.sources.length} source(s)`,d.onclick=async()=>{if(!(u||g))try{await xe(await mt(i.id),i.review)}catch(f){z.textContent=f.message}},ve.append(d)}}catch{z.textContent="Browser storage is unavailable. You can still review files."}}I.onclick=async()=>{if(g||u)return;const i=[...A];if(i.length){I.disabled=!0,t.disabled=!0,g=!0,S.disabled=!0,r.querySelectorAll("button").forEach(d=>d.disabled=!0),z.textContent="Saving original files on this device…";try{await Ie(await je(i,Ee())),z.textContent="Capture and selected views saved in this browser. Keep your originals; clearing browser data removes saved captures.",await ye()}catch(d){z.textContent=`Could not save capture: ${d.message}. Keep the original files and try again.`,I.disabled=!1}finally{t.disabled=!1,g=!1,S.disabled=u||!P||!p.length,r.querySelectorAll("button").forEach(d=>d.disabled=!1)}}};const we=()=>{b.forEach(URL.revokeObjectURL),b=[],r.replaceChildren(),l=[],a.textContent=""};function Ce(){p=l.filter(i=>i.selected).map(i=>{if(!i.data){const d=document.createElement("canvas"),f=Math.min(1,768/Math.max(i.image.naturalWidth,i.image.naturalHeight));d.width=Math.max(1,Math.round(i.image.naturalWidth*f)),d.height=Math.max(1,Math.round(i.image.naturalHeight*f)),d.getContext("2d").drawImage(i.image,0,0,d.width,d.height),i.data=d.toDataURL("image/png")}return i.data});for(const i of l)i.button.setAttribute("aria-pressed",String(i.selected));a.textContent=`${p.length} of ${l.length} views selected. Tap a view to include or exclude it. Choose up to 12 clear, overlapping views.`,S.disabled=u||!P||!p.length}function Ee(){return{recipe:A[0].type.startsWith("video/")?"video-midpoints-12-v1":"photos-source-order-v1",selectedIndices:l.flatMap((i,d)=>i.selected?[d]:[])}}function _e(i){const d=Math.min(12,l.length),f=Array.from({length:d},(c,m)=>d===1?0:Math.round(m*(l.length-1)/(d-1))),M=Te(i,K(A),A.length),h=new Set(M?M.selectedIndices:f);l.forEach((c,m)=>{c.selected=h.has(m),c.button=document.createElement("button"),c.button.type="button",c.button.className="capture-view",c.button.setAttribute("aria-label",`Use view ${m+1}: ${c.image.alt}`);const E=document.createElement("span");E.textContent=`View ${m+1}`,c.button.append(c.image,E),c.button.onclick=()=>{if(!(u||g)){if(!c.selected&&p.length>=12){a.textContent="12 views selected. Exclude one before adding another.";return}c.selected=!c.selected,Ce(),I.disabled=!1}},r.append(c.button)}),Ce()}document.getElementById("capture-open").onclick=()=>{n.showModal(),ye(),ze(),be()},new URLSearchParams(location.search).get("capture")==="1"&&document.getElementById("capture-open").click(),t.onchange=()=>xe([...t.files]);async function xe(i,d){const f=++w;we(),A=[],p=[],S.disabled=!0,I.disabled=!0;try{K(i)}catch(h){s.textContent=h.message;return}const M=i.filter(h=>h.type.startsWith("video/"));s.textContent="Reading your capture…";try{if(M.length){const h=URL.createObjectURL(M[0]);b.push(h);const c=document.createElement("video");if(c.muted=!0,c.preload="auto",await Me(c,"loadedmetadata",()=>{c.src=h}),!Number.isFinite(c.duration)||c.duration<=0||c.duration>120)throw Error("Use a video shorter than two minutes with a readable duration.");const m=document.createElement("canvas");m.width=Math.max(1,Math.round(c.videoWidth*Math.min(1,768/Math.max(c.videoWidth,c.videoHeight)))),m.height=Math.max(1,Math.round(m.width*c.videoHeight/c.videoWidth));try{for(let E=0;E<12;E++){if(f!==w||(await Me(c,"seeked",()=>{c.currentTime=c.duration*(E+.5)/12}),m.getContext("2d").drawImage(c,0,0,m.width,m.height),f!==w))return;const k=new Image;k.src=m.toDataURL("image/png"),k.alt=`Video sample ${E+1}`,l.push({image:k,data:k.src})}}finally{c.removeAttribute("src"),c.load()}s.textContent="12 frames sampled for reconstruction. Check that the object stays still and each view is sharp."}else{for(const h of i){if(!/^image\/(jpeg|png|webp)$/.test(h.type))throw Error("Use JPEG, PNG or WebP photos.");const c=URL.createObjectURL(h);b.push(c);const m=new Image;if(m.src=c,m.alt=h.name,await m.decode(),f!==w)return;l.push({image:m})}s.textContent=`${i.length} ${i.length===1?"photo":"photos"} ready for review. Keep the object still and cover its sides.`}f===w&&(A=i,_e(d),I.disabled=!1)}catch(h){f===w&&(we(),p=[],s.textContent=h.message)}}}function Me(e,n,t){return new Promise((s,r)=>{const a=()=>{clearTimeout(w),e.removeEventListener(n,l),e.removeEventListener("error",b)},l=()=>{a(),s()},b=()=>{a(),r(Error("Could not read this video. Try MP4 or WebM."))},w=setTimeout(b,15e3);e.addEventListener(n,l,{once:!0}),e.addEventListener("error",b,{once:!0}),t()})}const ft=`
uniform sampler2D morphicNodes;
uniform sampler2D morphicRest;
uniform float morphicWidth;
attribute vec4 morphicIds;
attribute vec4 morphicWeights;
attribute vec3 morphicRestNormal;
vec3 nodeAt(sampler2D t, float id) { return texture2D(t,vec2((id+.5)/morphicWidth,.5)).xyz; }
mat3 safeInverse(mat3 m) {
  vec3 a=cross(m[1],m[2]),b=cross(m[2],m[0]),c=cross(m[0],m[1]);
  float d=dot(m[0],a); d=abs(d)<1.e-10 ? (d<0. ? -1.e-10:1.e-10) : d;
  return transpose(mat3(a,b,c))/d;
}
mat3 morphicGradient() {
  vec3 r0=nodeAt(morphicRest,morphicIds.x),r1=nodeAt(morphicRest,morphicIds.y),r2=nodeAt(morphicRest,morphicIds.z),r3=nodeAt(morphicRest,morphicIds.w);
  vec3 p0=nodeAt(morphicNodes,morphicIds.x),p1=nodeAt(morphicNodes,morphicIds.y),p2=nodeAt(morphicNodes,morphicIds.z),p3=nodeAt(morphicNodes,morphicIds.w);
  return mat3(p1-p0,p2-p0,p3-p0)*safeInverse(mat3(r1-r0,r2-r0,r3-r0));
}
`,vt="vec3 transformed = morphicWeights.x*nodeAt(morphicNodes,morphicIds.x)+morphicWeights.y*nodeAt(morphicNodes,morphicIds.y)+morphicWeights.z*nodeAt(morphicNodes,morphicIds.z)+morphicWeights.w*nodeAt(morphicNodes,morphicIds.w);";function bt(e,n){const t=n.rest.length/3,s=new Float32Array(t*4),r=new Float32Array(t*4);for(let p=0;p<t;p++)for(let u=0;u<3;u++)s[p*4+u]=r[p*4+u]=n.rest[p*3+u];function a(p){const u=new ot(p,t,1,at,st);return u.needsUpdate=!0,u}const l=a(s),b=a(r),w=[];function A(p,u=!0){p.onBeforeCompile=g=>{g.uniforms.morphicNodes={value:l},g.uniforms.morphicRest={value:b},g.uniforms.morphicWidth={value:t},g.vertexShader=ft+g.vertexShader.replace("#include <begin_vertex>",vt),u&&(g.vertexShader=g.vertexShader.replace("#include <beginnormal_vertex>",`#include <beginnormal_vertex>
objectNormal = transpose(safeInverse(morphicGradient())) * morphicRestNormal;`))},p.customProgramCacheKey=()=>`morphic-gpu-v1-${u}`,p.needsUpdate=!0}for(const p of e.parts){const u=p.mesh.geometry,g=p.offset*4,P=(p.offset+p.count)*4;u.setAttribute("morphicIds",new Ae(Float32Array.from(n.bindNodes.slice(g,P)),4)),u.setAttribute("morphicWeights",new Ae(Float32Array.from(n.weights.slice(g,P)),4)),u.setAttribute("morphicRestNormal",u.attributes.normal.clone());for(const j of[].concat(p.mesh.material))A(j);const S=new tt({depthPacking:nt});A(S,!1),p.mesh.customDepthMaterial=S,w.push(S),p.mesh.frustumCulled=!1}return{update(p){for(let u=0;u<t;u++)for(let g=0;g<3;g++)s[u*4+g]=p[u*3+g];l.needsUpdate=!0},dispose(){l.dispose(),b.dispose();for(const p of w)p.dispose()}}}function ue(e,n,t=new Float32Array(e.bindNodes.length/4*3)){const{bindNodes:s,weights:r}=e;for(let a=0;a<s.length/4;a++)for(let l=0;l<3;l++){let b=0;for(let w=0;w<4;w++)b+=r[a*4+w]*n[s[a*4+w]*3+l];t[a*3+l]=b}return t}const o=e=>document.getElementById(e);document.querySelector("#app").innerHTML=ut;He();gt(async(e,n)=>{if(!await q(e,{id:"generated",name:"Your object",author:"TRELLIS generated asset",license:"Unseen surfaces unverified",provenance:n}))throw Error("The reconstruction finished, but the object could not be opened. Its files are retained in the local job folder.");o("asset").value=""});const v=Je(o("viewport")),L=new Worker(new URL(""+new URL("worker-BrALvlKu.js",import.meta.url).href,import.meta.url),{type:"module"});let y,R,x,W,T,O,pe,X,Ne,H=0,U=!0,G=!1,ne=!1,Q=!1,J,he="download",Y=null,re=0,ie=0;const yt=new URLSearchParams(location.search).has("cpu");let ae=0,se=performance.now(),$e=0,Z=!1,_=null;const me=new rt,Le=new it,De=new ct,B=new V;let ee=[];function C(e,n=!1){o("status").textContent=e,o("status").classList.toggle("error",n)}function $(e){!ne||Q||(L.postMessage({type:"action",action:e}),o("drift").textContent="—")}function F(e){U=e,L.postMessage({type:"pause",value:e}),o("play").textContent=e?"▶":"Ⅱ",o("play").setAttribute("aria-label",e?"Play simulation":"Pause simulation")}function wt(e){$({type:e}),F(!1)}function te(e){ne=!e,o("loading").hidden=!e;for(const n of document.querySelectorAll("button,input,select"))!n.closest("#capture-dialog")&&!["file","session-file","import","load","asset"].includes(n.id)&&(n.disabled=e)}async function q(e,n,t=null){const s=++H;te(!0),F(!0),C("Reading capture and building a volumetric simulation…");try{const r=await et(e);if(s!==H){Se(r);return}return O?.dispose(),O=null,y&&(v.scene.remove(y.group),Se(y)),T&&(v.scene.remove(T),T.traverse(a=>{a.isMesh&&(a.material.dispose(),a.geometry.dispose())})),y=r,pe=e,X=n,Ne=await de(e),v.scene.add(y.group),v.home(),T=y.group.clone(!0),T.traverse(a=>{a.isMesh&&(a.geometry=a.geometry.clone(),a.material=new lt({color:"#1d63b7",wireframe:!0,transparent:!0,opacity:.15,depthWrite:!1}),a.castShadow=!1)}),T.visible=o("ghost").checked,v.scene.add(T),o("asset-name").textContent=n.name,o("capture-story").hidden=n.id!=="capture_glove",o("credit").textContent=`${n.author??"Your capture"} · ${n.license??"Local import"}`,o("asset-tag").textContent=n.id==="lemon"?"OBJECT 01 / TEXTURED ASSET":n.id==="sweet_potato"?"OBJECT 02 / TEXTURED ASSET":n.id?.startsWith("met_")?"MUSEUM SCAN / THE MET":"YOUR CAPTURE / GLB",o("drift").textContent="—",J=null,Y=t,L.postMessage({type:"init",generation:H,vertices:y.vertices,triangles:y.triangles,resolution:Number(o("resolution").value)}),!0}catch(r){return te(!1),ne=!!y,o("loading").hidden=!0,C(r.message,!0),!1}}L.onmessage=({data:e})=>{if(!(e.generation!==void 0&&e.generation!==H))if(e.type==="ready")R=e.cage,W=new Float32Array(R.bindNodes.length/4*3),yt||(O=bt(y,R)),te(!1),G=!1,o("pin").classList.remove("selected"),o("geometry").textContent=`${y.triangles.length/3} TRIANGLES / ${R.rest.length/3} NODES`,C("Drag the object to pull it. Drag the background to look around."),Y&&(L.postMessage({type:"replay",session:Y}),Y=null);else if(e.type==="frame"){const n=performance.now();x=e.x,R&&y&&(O?O.update(x):(ue(R,x,W),le(y,W)),v.showCage(R,x,o("cage").checked)),ie=performance.now()-n;const t=e.stats;U=t.paused,Q=t.playing;const s=t.time;o("play").textContent=U?"▶":"Ⅱ",o("play").setAttribute("aria-label",U?"Play simulation":"Pause simulation"),o("time").textContent=`${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toFixed(3).padStart(6,"0")}`,o("progress").style.width=`${Math.min(100,s/60*100)}%`,o("state").textContent=t.fault?"LIMIT REACHED":Q?"REPLAYING":U?"PAUSED":"LIVE",o("state").classList.toggle("live",!U),o("solver-ms").innerHTML=`${t.stepP95.toFixed(2)} <small>ms</small>`,o("volume").innerHTML=`${(t.volumeRatio*100).toFixed(1)} <small>%</small>`,o("inverted").textContent=t.inverted,o("inverted").classList.toggle("bad",t.inverted>0),o("gravity").checked=t.gravity!==0,o("surface").value=t.surface,v.setSurface(t.surface);for(const r of document.querySelectorAll("[data-material]"))r.classList.toggle("selected",r.dataset.material===t.material);t.fault&&C(t.fault,!0),window.morphicStats={...t,updateCPU:ie,frameCPU:re,fps:$e,nodes:R?.rest.length/3,renderVertices:y?.vertices.length/3,skinning:O?"gpu":"cpu"}}else e.type==="session"?(J={...e.session,resolution:Number(o("resolution").value),asset:{...X,sha256:Ne,glb:Ye(pe)}},he==="replay"?(L.postMessage({type:"replay",session:J}),C("Replaying recorded inputs from the original state…")):(ce(JSON.stringify(J),`${X.id??"capture"}.morphic.json`,"application/json"),C("Saved a portable session with the capture, inputs, and verification checkpoint."))):e.type==="replayComplete"?(o("drift").textContent=e.maxError===0?"0 m":`${e.maxError.toExponential(2)} m`,C(`Replay complete. Maximum node drift: ${e.maxError.toExponential(2)} m.`,e.maxError>1e-6)):e.type==="error"&&(te(!1),F(!0),C(e.message,!0))};L.onerror=e=>C(`Simulation worker failed: ${e.message}`,!0);for(const e of document.querySelectorAll("[data-material]"))e.onclick=()=>$({type:"material",value:e.dataset.material});for(const e of["squash","stretch","drop"])o(e).onclick=()=>wt(e);o("pin").onclick=()=>{G=!G,$({type:G?"pin":"unpin"}),o("pin").classList.toggle("selected",G)};o("play").onclick=()=>F(!U);o("gravity").onchange=()=>$({type:"gravity",value:o("gravity").checked});o("surface").onchange=()=>$({type:"surface",value:o("surface").value});o("reset").onclick=()=>{L.postMessage({type:"reset"}),o("drift").textContent="—",G=!1,o("pin").classList.remove("selected"),C("Reset to the original capture.")};o("resolution").onchange=()=>q(pe,X);o("ghost").onchange=()=>{T&&(T.visible=o("ghost").checked)};o("cage").onchange=()=>{R&&x&&v.showCage(R,x,o("cage").checked)};o("home").onclick=()=>v.home();o("photo").onclick=()=>{v.render(),v.renderer.domElement.toBlob(e=>{e&&ce(e,"morphic-capture.png","image/png")})};o("export").onclick=async()=>{try{ue(R,x,W),le(y,W);const e=y.group.clone(!0);e.traverse(t=>{t.isMesh&&(t.geometry=t.geometry.clone(),t.geometry.deleteAttribute("morphicIds"),t.geometry.deleteAttribute("morphicWeights"),t.geometry.deleteAttribute("morphicRestNormal"))});const n=await new Ve().parseAsync(e,{binary:!0});e.traverse(t=>t.geometry?.dispose()),ce(n,"morphic-deformed.glb","model/gltf-binary"),C("Exported current geometry with its original materials and textures.")}catch(e){C(e.message,!0)}};o("save").onclick=()=>{he="download",L.postMessage({type:"save"})};o("replay").onclick=()=>{he="replay",L.postMessage({type:"save"})};o("import").onclick=()=>o("file").click();o("load").onclick=()=>o("session-file").click();o("file").onchange=async e=>{try{const n=[...e.target.files];if(!n.length)return;const t=n.filter(b=>/\.glb$/i.test(b.name)),s=n.filter(b=>/\.json$/i.test(b.name));if(t.length!==1||s.length>1||n.length!==t.length+s.length)throw Error("Choose one GLB, optionally with its reconstruction result.json.");const r=t[0];if(r.size>50*1024*1024)throw Error("GLB limit is 50 MB.");const a=await r.arrayBuffer();let l;if(s.length){if(s[0].size>1024*1024)throw Error("Reconstruction report is too large.");l=await Pe(JSON.parse(await s[0].text()),a)}await q(a,{id:"import",name:r.name.replace(/\.glb$/i,""),author:l?`${l.method.startsWith("trellis2")?"TRELLIS.2":"TRELLIS"} generated asset`:"Local capture",license:l?"Unseen surfaces unverified":"Local import",...l?{provenance:l}:{}}),o("asset").value=""}catch(n){C(n.message,!0)}finally{e.target.value=""}};o("session-file").onchange=async e=>{try{const n=e.target.files[0];if(!n)return;if(n.size>75*1024*1024)throw Error("Session is too large.");const t=JSON.parse(await n.text());if(Ke(t)!=="capture"){await Xe(t);return}await Oe(t)}catch(n){C(n.message,!0)}e.target.value=""};async function Oe(e){const n=dt(e),t=Qe(n.asset?.glb);if(await de(t)!==n.asset.sha256)throw Error("Asset checksum mismatch.");if(![6,8,12].includes(n.resolution))throw Error("Unsupported session resolution.");o("resolution").value=n.resolution,await q(t,n.asset,n),o("asset").value=ee.some(s=>s.id===n.asset.id)?n.asset.id:""}o("asset").onchange=()=>We(o("asset").value);async function We(e){if(e==="sloth"){location.href="./?mode=measured";return}try{const n=ee.find(r=>r.id===e),t=await fetch(`./assets/${e}.glb`);if(!t.ok)throw Error("Asset download failed. Run npm run assets.");const s=await t.arrayBuffer();if(await de(s)!==n.sha256)throw Error("Bundled asset checksum mismatch.");await q(s,n)}catch(n){C(n.message,!0)}}const N=v.renderer.domElement;function Fe(e){const n=N.getBoundingClientRect();Le.set((e.clientX-n.left)/n.width*2-1,-(e.clientY-n.top)/n.height*2+1),me.setFromCamera(Le,v.camera)}N.addEventListener("pointerdown",e=>{if(e.button!==0||!ne||Q)return;O&&(ue(R,x,W),le(y,W)),Fe(e);const n=me.intersectObject(y.group,!0)[0];if(!n)return;e.stopImmediatePropagation(),v.controls.enabled=!1,Z=!0,_=e.pointerId,N.setPointerCapture(e.pointerId);let t=0,s=1/0;for(let r=0;r<x.length;r+=3){const a=(x[r]-n.point.x)**2+(x[r+1]-n.point.y)**2+(x[r+2]-n.point.z)**2;a<s&&(s=a,t=r/3)}B.set(x[t*3],x[t*3+1],x[t*3+2]),De.setFromNormalAndCoplanarPoint(v.camera.getWorldDirection(new V),B),$({type:"grab",node:t,target:B.toArray()}),v.handle.position.copy(B),v.handle.visible=!0,F(!1)},!0);N.addEventListener("pointermove",e=>{Z&&(Fe(e),me.ray.intersectPlane(De,B)&&(B.clamp(new V(-6,.02,-6),new V(6,7,6)),$({type:"move",target:B.toArray()}),v.handle.position.copy(B)))},!0);function oe(){Z&&(Z=!1,v.controls.enabled=!0,v.handle.visible=!1,$({type:"release"}),_!==null&&N.hasPointerCapture(_)&&N.releasePointerCapture(_),_=null)}N.addEventListener("pointerup",oe,!0);N.addEventListener("pointercancel",oe,!0);window.addEventListener("blur",oe);document.addEventListener("visibilitychange",()=>{document.hidden&&(oe(),F(!0))});document.addEventListener("keydown",e=>{document.querySelector("dialog[open]")||["INPUT","SELECT","TEXTAREA","BUTTON"].includes(e.target.tagName)||(e.code==="Space"&&(e.preventDefault(),F(!U)),e.code==="KeyR"&&o("reset").click())});function Ge(){requestAnimationFrame(Ge);const e=performance.now();v.render(),re=performance.now()-e+ie,ae++,e-se>500&&($e=ae*1e3/(e-se),ae=0,se=e,o("frame-ms").innerHTML=`${re.toFixed(2)} <small>ms</small>`)}Ge();try{ee=await(await fetch("./assets/manifest.json")).json();const n=new URLSearchParams(location.search).get("asset"),t=ee.some(r=>r.id===n)?n:"lemon";o("asset").value=t;const s=await Ze();s?await Oe(s):await We(t)}catch(e){C(`Could not load bundled assets: ${e.message}`,!0)}
