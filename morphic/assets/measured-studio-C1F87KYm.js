import{_ as et}from"./preload-helper-PPVm8Dsz.js";import{c as tt,d as ve,s as at,h as nt,G as rt,t as ot,f as Pe,a as se,l as st,b as Re,u as it,e as Fe}from"./capture-BwHlOsDV.js";import{f as fe,V as Z,g as Ie,R as _e,h as ze,i as be,I as lt,F as ct,j as dt,k as pt,G as ut,M as ft,l as ht,m as mt,B as gt,n as vt,o as bt,p as yt,q as wt,r as xt}from"./three.module-DAQ7URuL.js";const kt=`<header>
  <a class="brand" href="./">morphic<span>◌</span></a>
  <a class="header-note" href="./article.html">How Morphic works</a>
  <a class="button-link" href="./?mode=capture&capture=1"
    >Create from capture</a
  >
  <button id="save" class="primary">Save session</button>
</header>

<main class="measured-workspace">
  <aside>
    <h1>Try an object.</h1>
    <p class="measured-intro">
      Play the recorded motion, then drag the sloth to try your own interaction.
    </p>

    <label class="field-label" for="example">Examples</label>
    <select id="example">
      <option value="sloth">Sloth · observed behavior</option>
      <option value="capture_glove">Baseball glove · reconstructed</option>
      <option value="lemon">Lemon</option>
      <option value="sweet_potato">Sweet potato</option>
      <option value="met_tablet">Clay tablet</option>
      <option value="met_bottle">Moche bottle</option>
    </select>
    <label class="field-label" for="asset">Recording</label
    ><select id="asset">
      <option value="single_lift_sloth">Sloth / lift</option>
      <option value="single_push_sloth">Sloth / push</option>
      <option value="double_lift_sloth">
        Sloth / double lift · validation
      </option>
      <option value="double_stretch_sloth">Sloth / stretch · test</option>
      <option value="single_lift_zebra">Zebra / lift · pilot</option>
    </select>
    <p id="credit" class="credit">PhysTwin dataset · Jiang et al.</p>

    <div class="divider"></div>
    <details class="response-details">
      <summary>Adjust the response</summary>
      <label class="field-label" for="response-model">Compare response</label
      ><select id="response-model">
        <option value="fitted">Fitted response</option>
        <option value="default">Default response</option>
        <option value="regional">Two-region fit</option>
      </select>
      <p id="provenance" class="fine"></p>

      <label class="field-label" for="edit-region">Edit region</label
      ><select id="edit-region">
        <option value="all">Whole object</option>
        <option value="0">Lower-X half</option>
        <option value="1">Upper-X half</option>
      </select>

      <label class="edit-label" for="softness"
        >Compliance multiplier <output id="softness-value">1.00×</output></label
      ><input
        id="softness"
        type="range"
        min="-1"
        max="1"
        step="0.05"
        value="0"
      />
      <p class="fine">
        Higher compliance makes the selected region easier to deform. An edit is
        an intentional intervention, not a newly fitted material.
      </p>
      <button id="restore" class="full">Restore selected response</button>

      <div class="divider"></div>
    </details>
    <details class="inspect-details">
      <summary>Appearance and camera</summary>
      <label class="field-label" for="appearance">Appearance</label
      ><select id="appearance">
        <option value="mesh">Textured mesh</option>
        <option value="gaussian">Gaussian appearance</option></select
      ><label class="field-label" for="camera-view">Camera</label
      ><select id="camera-view">
        <option value="studio">Studio view</option>
        <option value="recorded">Recorded camera</option></select
      ><label class="toggle"
        ><span>Response graph</span><input type="checkbox" id="cage" /></label
      ><label class="toggle"
        ><span>Observed hand points</span
        ><input type="checkbox" id="hands" checked
      /></label>
    </details>
    <details>
      <summary>Physical assumptions</summary>
      <p>
        Metres and seconds. Gravity 9.81 m/s². The observed first frame is
        treated as the rest state. Mass is prescribed; no force or material
        modulus was measured.
      </p>
      <p>
        Contact springs follow the recorded hand trajectories. Additional mouse
        interaction is exploratory. The fitted timestep and graph stay fixed.
      </p>
    </details>

    <details>
      <summary>Appearance and evidence</summary>
      <p>
        The appearance mesh is PhysTwin's generated shape prior aligned to the
        first RGB-D frame. Motion fitting uses its filtered 3D tracks. The joint
        fit improves the fitting recordings but does not outperform the default
        on double-lift validation; stretch-test errors are nearly equal.
      </p>
      <a
        href="https://github.com/Jianghanxiao/PhysTwin"
        target="_blank"
        rel="noreferrer"
        >Original method and dataset</a
      >
    </details>

    <div class="sloth-preview">
      <video
        autoplay
        loop
        muted
        playsinline
        controls
        preload="metadata"
        poster="./media/measured/sloth-response.jpg"
        aria-label="Observed sloth lift beside Morphic simulation"
      >
        <source
          src="./media/measured/sloth-response.mp4"
          type="video/mp4"
        /></video
      ><a href="./article.html#experiments"
        >Watch the observation and simulation</a
      >
    </div>
    <button id="load" class="full subtle">Open saved session</button>
  </aside>

  <section class="workspace">
    <div id="viewport" tabindex="0" aria-label="Interactive fitted object">
      <div class="stage-heading">
        <div>
          <div class="eyebrow" id="asset-tag">
            Response fitted from observations
          </div>
          <h2 id="asset-name">Sloth</h2>
        </div>
        <span class="state" id="state">Loading</span>
      </div>
      <div class="stage-tools">
        <button id="home" aria-label="Reset camera">⌂</button
        ><button id="photo" aria-label="Save PNG">▣</button
        ><button id="export" aria-label="Export deformed GLB">↗</button>
      </div>
      <div id="loading">
        Preparing fitted object<span
          >Loading the appearance and response graph…</span
        >
      </div>
      <div class="stage-bottom">
        <span>Drag the object to intervene. Drag empty space to orbit.</span
        ><span id="geometry"></span>
      </div>
    </div>

    <div class="transport">
      <button id="play" class="play" aria-label="Play recorded loading">
        Play motion</button
      ><button id="reset" aria-label="Reset simulation">↺</button
      ><span id="time">0.00 s</span
      ><input
        id="scrub"
        type="range"
        min="0"
        max="1"
        step="1"
        value="0"
        aria-label="Recorded loading frame"
      /><button id="replay">Replay session</button>
    </div>

    <div class="measured-context">
      <p id="assay">Recorded loading · fitted response</p>
      <button id="record-video">Export video</button>
    </div>
    <div id="status" role="status" aria-live="polite">
      Loading the sloth response.
    </div>
  </section>
</main>

<footer>
  <a href="./article.html">Read the experiment</a
  ><span
    >Recorded data: PhysTwin. Fitting and interactive deployment: Morphic.</span
  ><a href="https://jaundel.github.io/projects.html">Portfolio</a>
</footer>
<input id="session-file" type="file" accept=".json,.morphic" hidden />
<dialog id="video-dialog">
  <h3>Exported simulation</h3>
  <video id="video-preview" controls muted playsinline></video>
  <div>
    <a id="video-download">Download video</a
    ><button id="video-close">Close preview</button>
  </div>
</dialog>
`;function At(e,t,a,r,o){t.updateMatrixWorld(!0);const s=new fe().fromArray(a.c2w.flat()).transpose();s.multiply(new fe().makeScale(1,-1,-1)),s.premultiply(t.matrixWorld),s.decompose(e.position,e.quaternion,new Z),e.updateMatrixWorld(!0);const i=Math.min(r/a.width,o/a.height),u=a.K[0][0]*i,d=a.K[1][1]*i,p=(r-a.width*i)/2+a.K[0][2]*i,C=(o-a.height*i)/2+a.K[1][2]*i,b=e.near,j=e.far;e.projectionMatrix.set(2*u/r,0,1-2*p/r,0,0,2*d/o,2*C/o-1,0,0,0,-(j+b)/(j-b),-2*j*b/(j-b),0,0,-1,0),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}let Te;async function $e(e,t,a={}){if(!["127.0.0.1","localhost"].includes(location.hostname)||(Te??=fetch("./__morphic_artifacts").then(o=>o.headers.get("content-type")?.includes("application/json")?o.json():null).catch(()=>null),!(await Te)?.enabled))return null;const r=await fetch("./__morphic_artifacts",{method:"POST",headers:{"Content-Type":e.type,"X-Artifact-Name":t,"X-Artifact-Metadata":JSON.stringify(a)},body:e});if(!r.ok)throw Error("The artifact is ready to download, but saving it to the local project failed.");return r.json()}function ie(e){const t=(s,i,u)=>Array.isArray(s)&&s.length>0&&s.length<=u&&s.every(d=>Array.isArray(d)&&d.length===i&&d.every(Number.isFinite));if(e?.schema!=="morphic-measured-graph-1"||typeof e.case!="string"||!/^[a-z0-9_]{1,80}$/.test(e.case)||!e.provenance||typeof e.provenance!="object"||!t(e.rest,3,5e3)||!t(e.edges,2,1e5))throw Error("Invalid measured-response geometry.");const a=e.rest.length,r=e.controller?.[0]?.length;if(!Number.isInteger(r)||r<1||r>100||!Array.isArray(e.controller)||e.controller.length>1800||!e.controller.every(s=>t(s,3,r)&&s.length===r))throw Error("Invalid observed controller motion.");if(!e.edges.every(([s,i])=>Number.isInteger(s)&&Number.isInteger(i)&&s>=0&&s<a&&i>s&&i<a+r)||e.lengths?.length!==e.edges.length||!e.lengths.every(s=>Number.isFinite(s)&&s>1e-7)||e.region?.length!==e.edges.length||!e.region.every(s=>[0,1,2].includes(s)))throw Error("Invalid response-graph connectivity.");if(!Number.isInteger(e.objectEdges)||e.objectEdges<1||e.objectEdges>=e.edges.length||!e.edges.every(([,s],i)=>i<e.objectEdges?s<a&&e.region[i]<2:s>=a&&e.region[i]===2))throw Error("Invalid object and controller edge partition.");const o=e.settings;if(!o||o.substeps!==8||o.iterations!==5||!Number.isFinite(o.friction)||o.friction<0||o.friction>1.5||o.unitMass!==1||o.floorZ!==0||JSON.stringify(o.gravity)!=="[0,0,9.81]"||e.fps!==30)throw Error("Unsupported fitted numerical configuration.");return Be(e.parameters),e}function Be(e){if(!Array.isArray(e)||e.length!==4||!e.every(Number.isFinite)||e.slice(0,3).some(t=>t<1e-9||t>.1)||e[3]<0||e[3]>100)throw Error("Invalid effective-response parameters.");return e}class Y{constructor(t){this.asset=ie(t),this.n=t.rest.length,this.rest=Float64Array.from(t.rest.flat()),this.x=Float64Array.from([...this.rest,...t.controller[0].flat()]),this.v=new Float64Array(this.rest.length),this.previous=this.v.slice(),this.edges=Uint32Array.from(t.edges.flat()),this.lengths=Float64Array.from(t.lengths),this.region=Uint8Array.from(t.region),this.lambda=new Float64Array(this.lengths.length),this.parameters=t.parameters.slice(),this.dt=1/(t.fps*t.settings.substeps),this.tick=0,this.grab=null}setParameters(t){this.parameters=Be(t).slice()}apply(t){if(t.type==="response")this.setParameters(t.parameters);else if(t.type==="release")this.grab=null;else if(t.type==="grab"||t.type==="move"){if(!Array.isArray(t.target)||t.target.length!==3||!t.target.every(a=>Number.isFinite(a)&&Math.abs(a)<10))throw Error("Invalid interaction target.");if(t.type==="grab"){if(!Number.isInteger(t.node)||t.node<0||t.node>=this.n)throw Error("Invalid interaction node.");this.grab={node:t.node,target:t.target.slice()}}else this.grab&&(this.grab.target=t.target.slice())}else throw Error("Unknown measured-response action.")}step(t){const{x:a,v:r,n:o,dt:s,previous:i,edges:u,lengths:d,region:p,lambda:C,parameters:b}=this;if(t?.length!==a.length-o*3||!t.every(Number.isFinite))throw Error("Invalid controller target.");i.set(a.subarray(0,o*3));const j=Math.exp(-b[3]*s),z=b.slice(0,3).map(g=>g/(s*s));for(let g=0;g<o;g++){const v=g*3;for(let f=0;f<3;f++)r[v+f]*=j;r[v+2]+=9.81*s;for(let f=0;f<3;f++)a[v+f]+=r[v+f]*s}a.set(t,o*3),C.fill(0);for(let g=0;g<this.asset.settings.iterations;g++){for(let v=0;v<d.length;v++){const f=u[v*2]*3,A=u[v*2+1]*3,P=a[f]-a[A],E=a[f+1]-a[A+1],R=a[f+2]-a[A+2],I=Math.sqrt(P*P+E*E+R*R);if(I<1e-12)continue;const T=A<o*3?1:0,D=z[p[v]],w=(-(I-d[v])-D*C[v])/(1+T+D),h=w/I;C[v]+=w,a[f]+=P*h,a[f+1]+=E*h,a[f+2]+=R*h,T&&(a[A]-=P*h,a[A+1]-=E*h,a[A+2]-=R*h)}if(this.grab){const v=this.grab.node*3;for(let f=0;f<3;f++)a[v+f]=this.grab.target[f]}for(let v=0;v<o;v++){const f=v*3;if(a[f+2]>0){const A=a[f+2];a[f+2]=0;const P=a[f]-i[f],E=a[f+1]-i[f+1],R=Math.sqrt(P*P+E*E);if(R>1e-12){const I=Math.min(1,this.asset.settings.friction*A/R);a[f]-=P*I,a[f+1]-=E*I}}}}for(let g=0;g<o*3;g++)r[g]=(a[g]-i[g])/s;if(this.tick++,!a.every(Number.isFinite))throw Error("Measured-response simulation became non-finite.")}stepRecorded(){const t=this.asset.controller,a=this.asset.settings.substeps,r=Math.min(Math.floor(this.tick/a)+1,t.length-1),o=(this.tick%a+1)/a,s=t[Math.max(0,r-1)],i=t[r],u=new Float64Array(i.length*3);for(let d=0;d<i.length;d++)for(let p=0;p<3;p++)u[d*3+p]=s[d][p]+(i[d][p]-s[d][p])*o;this.tick>=(t.length-1)*a&&u.set(i.flat()),this.step(u)}}function qe(e){if(e?.schema!=="morphic-measured-session-1")throw Error("Unsupported response session.");const t=ie(e.response);if(!Array.isArray(e.events)||e.events.length>2e4||!Number.isInteger(e.endTick)||e.endTick<0||e.endTick>3e4||!Array.isArray(e.finalPositions)||e.finalPositions.length!==t.rest.length*3||!e.finalPositions.every(Number.isFinite))throw Error("Invalid response session.");const a=new Y(t);let r=-1;for(const o of e.events){if(!Number.isInteger(o.tick)||o.tick<r||o.tick>e.endTick)throw Error("Invalid session action timing.");a.apply(o.action),r=o.tick}if(typeof e.appearance?.glb!="string"||!/^[a-f0-9]{64}$/.test(e.appearance.sha256??""))throw Error("Invalid session appearance.");return e}const Mt=`
in float splatId;
uniform sampler2D splats;
uniform sampler2D nodes;
uniform sampler2D restNodes;
uniform int textureWidth;
uniform vec2 viewportSize;
out vec2 gaussianCoordinate;
out vec4 gaussianColor;
vec4 getSplat(int index) { return texelFetch(splats, ivec2(index % textureWidth,index / textureWidth),0); }
void main(){
  int id=int(splatId)*4;
  vec4 p=getSplat(id),color=getSplat(id+1),ids=getSplat(id+2),weights=getSplat(id+3);
  vec3 delta[4]; vec3 gradients[4]; float raw[4]; float total=0.;vec3 totalGradient=vec3(0.);
  vec3 center=p.xyz;
  for(int k=0;k<4;k++){
    vec3 r=texelFetch(restNodes,ivec2(int(ids[k]),0),0).xyz;
    delta[k]=texelFetch(nodes,ivec2(int(ids[k]),0),0).xyz-r;
    center+=weights[k]*delta[k];
    vec3 difference=p.xyz-r;float distance2=dot(difference,difference);
    raw[k]=1./max(distance2,1.e-10);total+=raw[k];
    gradients[k]=distance2>1.e-10 ? -2.*difference*raw[k]*raw[k] : vec3(0.);
    totalGradient+=gradients[k];
  }
  mat3 F=mat3(1.);
  for(int k=0;k<4;k++) F+=outerProduct(delta[k],(gradients[k]-weights[k]*totalGradient)/total);
  vec4 camera=modelViewMatrix*vec4(center,1.);
  vec4 clip=projectionMatrix*camera;
  if(camera.z>-.01 || clip.w<=0.){gl_Position=vec4(2.,2.,2.,1.);gaussianCoordinate=vec2(4.);gaussianColor=vec4(0.);return;}
  float z=-camera.z;
  float fx=viewportSize.x*projectionMatrix[0][0]*.5;
  float fy=viewportSize.y*projectionMatrix[1][1]*.5;
  vec3 Jx=vec3(fx/z,0.,fx*camera.x/(z*z));
  vec3 Jy=vec3(0.,fy/z,fy*camera.y/(z*z));
  mat3 B=mat3(modelViewMatrix)*F*p.w;
  vec3 bx=transpose(B)*Jx,by=transpose(B)*Jy;
  float a=dot(bx,bx)+.3,b=dot(bx,by),c=dot(by,by)+.3;
  float middle=.5*(a+c),radius=sqrt(max(0.,.25*(a-c)*(a-c)+b*b));
  float lambda1=max(.1,middle+radius),lambda2=max(.1,middle-radius);
  vec2 axis1=abs(b)>1.e-7 ? normalize(vec2(b,lambda1-a)) : (a>=c ? vec2(1.,0.) : vec2(0.,1.));
  vec2 axis2=vec2(-axis1.y,axis1.x);
  vec2 offset=3.*(position.x*sqrt(lambda1)*axis1+position.y*sqrt(lambda2)*axis2);
  clip.xy+=offset*2./viewportSize*clip.w;
  gl_Position=clip;gaussianCoordinate=position.xy*3.;gaussianColor=color;
}`,Ct=`
in vec2 gaussianCoordinate;
in vec4 gaussianColor;
out vec4 outputColor;
void main(){
  float radius2=dot(gaussianCoordinate,gaussianCoordinate);
  if(radius2>9.) discard;
  float alpha=min(.99,gaussianColor.a*exp(-.5*radius2));
  if(alpha<.003) discard;
  outputColor=vec4(gaussianColor.rgb,alpha);
}`;function Ue(e,t){St(e,t);const a=e.length/16,r=1024,o=Math.ceil(a*4/r),s=new Float32Array(r*o*4);s.set(e);const i=new Ie(s,r,o,_e,ze);i.needsUpdate=!0;const u=t.length/3,d=new Float32Array(u*4),p=new Float32Array(u*4);for(let w=0;w<u;w++)for(let h=0;h<3;h++)d[w*4+h]=p[w*4+h]=t[w*3+h];function C(w){const h=new Ie(w,u,1,_e,ze);return h.needsUpdate=!0,h}const b=C(d),j=C(p),z=new be,g=new lt;g.setAttribute("position",new ct([-1,-1,0,1,-1,0,1,1,0,-1,1,0],3)),g.setIndex([0,1,2,0,2,3]),g.instanceCount=a;const v=Float32Array.from({length:a},(w,h)=>h);g.setAttribute("splatId",new dt(v,1));const f=new pt({glslVersion:ut,vertexShader:Mt,fragmentShader:Ct,uniforms:{splats:{value:i},nodes:{value:b},restNodes:{value:j},textureWidth:{value:r},viewportSize:{value:z}},transparent:!0,depthTest:!0,depthWrite:!1,toneMapped:!1}),A=new ft(g,f);A.frustumCulled=!1,A.renderOrder=10;const P=Array.from({length:a},(w,h)=>h),E=new Float64Array(a),R=new fe;let I=-1/0,T=!0,D="";return A.onBeforeRender=(w,h,N)=>{w.getDrawingBufferSize(z),R.multiplyMatrices(N.matrixWorldInverse,A.matrixWorld);const Ce=R.elements.join(",");if((T||D!==Ce)&&performance.now()-I>160){const te=R.elements;for(let G=0;G<a;G++){const L=G*16;let Se=e[L],je=e[L+1],Ee=e[L+2];for(let ae=0;ae<4;ae++){const $=e[L+8+ae]*4,pe=e[L+12+ae];Se+=pe*(d[$]-p[$]),je+=pe*(d[$+1]-p[$+1]),Ee+=pe*(d[$+2]-p[$+2])}E[G]=te[2]*Se+te[6]*je+te[10]*Ee+te[14]}P.sort((G,L)=>E[G]-E[L]),v.set(P),g.attributes.splatId.needsUpdate=!0,D=Ce,I=performance.now(),T=!1}},{mesh:A,count:a,forceSort(){I=-1/0,T=!0},update(w){for(let h=0;h<u;h++)for(let N=0;N<3;N++)d[h*4+N]=w[h*3+N];b.needsUpdate=!0,T=!0},dispose(){g.dispose(),f.dispose(),i.dispose(),b.dispose(),j.dispose()}}}function St(e,t){if(!(e instanceof Float32Array)||!e.length||e.length%16||e.length>16*5e5||!e.every(Number.isFinite))throw Error("Invalid Gaussian appearance data.");const a=t.length/3;for(let r=0;r<e.length;r+=16){if(e[r+3]<=0||e[r+3]>1||e.subarray(r+4,r+8).some(s=>s<0||s>1))throw Error("Invalid Gaussian scale or color.");let o=0;for(let s=0;s<4;s++){const i=e[r+8+s],u=e[r+12+s];if(!Number.isInteger(i)||i<0||i>=a||u<0||u>1)throw Error("Invalid Gaussian response binding.");o+=u}if(Math.abs(o-1)>1e-5)throw Error("Gaussian weights must sum to one.")}}function jt(e,t,a=4){const r=new Uint32Array(e.length/3*a),o=new Float64Array(r.length);for(let s=0;s<e.length;s+=3){const i=[];for(let p=0;p<t.length;p+=3){const C=(e[s]-t[p])**2+(e[s+1]-t[p+1])**2+(e[s+2]-t[p+2])**2;let b=0;for(;b<i.length&&i[b].d<=C;)b++;b<a&&(i.splice(b,0,{id:p/3,d:C}),i.length>a&&i.pop())}const u=s/3*a;let d=0;for(let p=0;p<a;p++)r[u+p]=i[p].id,o[u+p]=1/Math.max(i[p].d,1e-10),d+=o[u+p];for(let p=0;p<a;p++)o[u+p]/=d}return{ids:r,weights:o,rest:t,vertices:e,count:a}}function Et(e,t,a){const{ids:r,weights:o,rest:s,vertices:i,count:u}=e;for(let d=0;d<i.length;d+=3)for(let p=0;p<3;p++){let C=0;for(let b=0;b<u;b++){const j=d/3*u+b,z=r[j]*3+p;C+=o[j]*(t[z]-s[z])}a[d+p]=i[d+p]+C}return a}const n=e=>document.getElementById(e),We=new URLSearchParams(location.search).get("embed")==="1";We&&document.body.classList.add("embedded");n("app").innerHTML=kt;We&&(n("app").querySelector(".response-details").open=!0);const Pt=matchMedia("(prefers-reduced-motion: reduce)"),ue=n("app").querySelector(".sloth-preview video");Pt.matches&&ue&&(ue.autoplay=!1,ue.pause());const m=tt(n("viewport")),k=new ht;k.rotation.x=Math.PI/2;k.scale.setScalar(4);m.scene.add(k);const ne=new mt(new gt,new vt({color:1926071,size:.009}));k.add(ne);function ye(){n("camera-view")&&(n("camera-view").value="studio"),m.controls.enabled=!0,m.camera.updateProjectionMatrix(),m.camera.position.set(-1.6,2.1,1.5),m.controls.target.set(0,.12,0),m.controls.update()}let x,l,De,q,c,Oe,he,Ve,me,U,S,B=0;const Rt=await fetch("./measured/experiment.json").then(e=>e.ok?e.json():null),ge=Array.from(n("asset").options,e=>e.value),Je=["single_lift_sloth","double_stretch_sloth"];function re(e){for(const t of document.querySelectorAll("button,input,select"))["asset","load","session-file"].includes(t.id)||(t.disabled=!e)}re(!1);let we=!0,Q=[],M=null,J=0,le=!1,Le=performance.now(),V=0,oe=!1,O=null,H=!1;const xe=new bt,Ne=new be,Xe=new yt,X=new Z;function y(e,t=!1){n("status").textContent=e,n("status").classList.toggle("error",t)}function F(e){we=e,V=0,n("play").textContent=e?"Play motion":"Pause",n("play").setAttribute("aria-label",e?"Play recorded loading":"Pause simulation"),n("state").textContent=e?"Paused":"Playing"}function ee(e){!c||M||(c.apply(e),Q.push({tick:c.tick,action:structuredClone(e)}),H=!0,n("assay").textContent="Intentional intervention · not a fitted prediction")}function de(){l&&(Ae(!0),c=new Y(l),Q=[],M=null,H=!1,F(!0),n("softness").value=0,n("softness-value").textContent="1.00×",n("assay").textContent=l.provenance.origin==="unfitted-reference"?"Recorded loading · default response":"Recorded loading · fitted response",n("asset-tag").textContent=l.provenance.origin==="unfitted-reference"?"Default graph response":"Response fitted from observations",_())}function _(){if(!x)return;Et(Oe,c.x,he),it(x,he),S?.update(c.x),ne.geometry.setAttribute("position",new xt(Float32Array.from(c.x.subarray(c.n*3)),3)),ne.geometry.computeBoundingSphere(),ne.visible=n("hands").checked;const e=new Float32Array(c.n*3),t=new Z;k.updateMatrixWorld(!0);for(let a=0;a<c.n;a++)t.fromArray(c.x,a*3).applyMatrix4(k.matrixWorld).toArray(e,a*3);m.showCage(Ve,e,n("cage").checked),n("time").textContent=(c.tick*c.dt).toFixed(2)+" s",n("scrub").value=Math.min(l.controller.length-1,Math.floor(c.tick/l.settings.substeps))}async function ke(e,t=null){const a=++B;F(!0),re(!1),n("loading").hidden=!1;try{let r,o;if(t){if(qe(t),r=ie(t.response),o=Pe(t.appearance.glb),await se(o)!==t.appearance.sha256)throw Error("Appearance checksum mismatch.")}else{const[d,p]=await Promise.all([fetch(`./measured/${e}/asset.json`),fetch(`./measured/${e}/appearance.glb`)]);if(!d.ok||!p.ok)throw Error("Recording package is unavailable.");r=ie(await d.json()),o=await p.arrayBuffer()}const s=await st(o,{normalize:!1});if(a!==B){Re(s);return}S&&(k.remove(S.mesh),S.dispose(),S=null),x&&(k.remove(x.group),Re(x)),l=r,De=structuredClone(r),me=o,U=null,q=null,x=s,k.add(x.group),c=new Y(l),Oe=jt(x.vertices,c.rest),he=new Float32Array(x.vertices.length),Ve={edges:Uint32Array.from(l.edges.slice(0,l.objectEdges).flat()),regions:l.region.slice(0,l.objectEdges)};const i=new wt().setFromArray(c.rest),u=i.getCenter(new Z);if(k.position.set(-u.x*4,0,-u.y*4),ye(),n("asset-name").textContent=e?.includes("zebra")?"Zebra":"Sloth",n("geometry").textContent=`${c.n} nodes / ${l.objectEdges} object springs`,n("provenance").textContent=`Fit input: ${(l.provenance.fitCases??[l.case]).map(d=>d.replaceAll("_"," ")).join(", ")}.`,n("scrub").max=l.controller.length-1,de(),re(!0),n("response-model").value="fitted",n("response-model").options[2].disabled=!l.case.includes("sloth"),ge.includes(l.case)&&(n("asset").value=l.case),n("appearance").value="mesh",n("appearance").options[1].disabled=!Je.includes(l.case),n("loading").hidden=!0,y("Ready. Play the observed hand loading or drag the object to intervene."),ge.includes(l.case)&&(q=await fetch(`./measured/${l.case}/observations.json`).then(d=>d.ok?d.json():null).catch(()=>null),a!==B))return;if(n("camera-view").options[1].disabled=!q,t?.appearance.gaussians){const d=Pe(t.appearance.gaussians.data);if(await se(d)!==t.appearance.gaussians.sha256)throw Error("Gaussian checksum mismatch.");U=d,S=Ue(new Float32Array(d),c.rest),k.add(S.mesh),x.group.visible=!1,n("appearance").value="gaussian",n("appearance").options[1].disabled=!1}t&&He(t)}catch(r){a===B&&(n("loading").hidden=!0,re(!!c),y(r.message,!0))}}function Ae(e){for(const t of["softness","edit-region","restore","replay"])n(t).disabled=!e}function He(e){qe(e),Ae(!1),c=new Y(l),M=e,J=0,Q=[],H=e.events.length>0,H&&(n("assay").textContent="Intentional intervention / replay"),F(!1),y("Replaying the recorded actions with the same fitted model.")}async function Ke(){if(!c)throw Error("Load a response first.");return{schema:"morphic-measured-session-1",response:structuredClone(l),appearance:{glb:Fe(me),sha256:await se(me),...U&&n("appearance").value==="gaussian"?{gaussians:{data:Fe(U),sha256:await se(U),source:"PhysTwin pretrained appearance; Morphic SH0 approximation"}}:{}},events:structuredClone(M?M.events.slice(0,J):Q),endTick:c.tick,finalPositions:Array.from(c.x.subarray(0,c.n*3))}}n("appearance").onchange=async()=>{const e=B;try{if(n("appearance").value==="gaussian"&&!S){y("Loading the attributed Gaussian appearance comparison…");const t=await fetch(`./measured/${l.case}/gaussians.bin`);if(!t.ok)throw Error("Gaussian pilot is unavailable.");const a=await t.arrayBuffer();if(e!==B)return;U=a;const r=new Float32Array(a);S=Ue(r,c.rest),k.add(S.mesh),S.update(c.x)}x.group.visible=n("appearance").value==="mesh",S&&(S.mesh.visible=!x.group.visible),y(x.group.visible?"Textured appearance prior.":"PhysTwin pretrained appearance, SH0 approximation. Morphic covariance transport; appearance quality is under evaluation.")}catch(t){y(t.message,!0)}};n("example").onchange=()=>{n("example").value!=="sloth"&&(location.href=`./?mode=capture&asset=${encodeURIComponent(n("example").value)}`)};n("asset").onchange=async()=>{await ke(n("asset").value),await Qe()};n("response-model").onchange=()=>{l=structuredClone(De);const e=n("response-model").value;if(e!=="fitted"){const t=Rt.protocol.parameters[e==="default"?"default":"jointRegional"];l.parameters=t.slice(0,4),l.settings.friction=t[4]??.5,l.provenance={...l.provenance,origin:e==="default"?"unfitted-reference":"fitted-observations",model:e}}de(),y(e==="default"?"Default graph response: no parameters fitted to observations.":"Loaded a frozen fitted response. Compare using the same recorded loading."),n("provenance").textContent=e==="default"?"Unfitted reference settings.":`Fit input: ${(l.provenance.fitCases??[l.case]).join(", ").replaceAll("_"," ")}.`};n("camera-view").onchange=()=>{n("camera-view").value==="studio"?ye():(m.controls.enabled=!1,K())};function K(){if(n("camera-view").value==="recorded"&&q){const e=m.renderer.getSize(new be);At(m.camera,k,q,e.x,e.y)}m.render()}n("play").onclick=()=>F(!we);n("reset").onclick=de;n("home").onclick=ye;n("cage").onchange=_;n("edit-region").onchange=()=>{n("edit-region").value!=="all"&&(n("cage").checked=!0),_(),y("Graph colors: blue is the lower-X half; amber is the upper-X half.")};n("hands").onchange=_;n("softness").oninput=()=>{if(!c)return;const e=10**Number(n("softness").value),t=l.parameters.slice(),a=n("edit-region").value;for(let r=0;r<2;r++)(a==="all"||Number(a)===r)&&(t[r]=Math.min(.1,Math.max(1e-9,t[r]*e)));ee({type:"response",parameters:t}),n("softness-value").textContent=e.toFixed(2)+"×"};n("restore").onclick=()=>{ee({type:"response",parameters:l.parameters}),n("softness").value=0,n("softness-value").textContent="1.00×"};n("scrub").oninput=function(){const e=Number(this.value);de();for(let t=0;t<e*l.settings.substeps;t++)c.stepRecorded();_()};n("save").onclick=async()=>{try{const e=await Ke(),t=new Blob([JSON.stringify(e)],{type:"application/json"});ve(t,`${l.case}.morphic.json`);const a=await $e(t,`${l.case}.morphic.json`);y(a?`Saved session to ${a.path}.`:"Session saved with appearance, response, loading, and action log.")}catch(e){y(e.message,!0)}};n("replay").onclick=async()=>{try{const e=await Ke();He(e)}catch(e){y(e.message,!0)}};n("load").onclick=()=>n("session-file").click();n("session-file").onchange=async e=>{try{const t=e.target.files[0];if(!t)return;if(t.size>75*1024*1024)throw Error("Session exceeds 75 MB.");const a=JSON.parse(await t.text());if(at(a)!=="measured"){await nt(a);return}await ke(a.response.case,a)}catch(t){y(t.message,!0)}e.target.value=""};n("photo").onclick=()=>{K(),m.renderer.domElement.toBlob(e=>ve(e,"morphic-observed-response.png"))};n("export").onclick=async()=>{try{const e=await new rt().parseAsync(x.group,{binary:!0,onlyVisible:!1});ve(new Blob([e],{type:"model/gltf-binary"}),`${l.case}-deformed.glb`),y("Exported the deformed mesh in dataset metres. Gaussian appearance remains in the saved session.")}catch(e){y(e.message,!0)}};n("record-video").onclick=async()=>{if(!c||oe)return;F(!0),oe=!0;const e=c,t=m.renderer.getPixelRatio(),a=Array.from(document.querySelectorAll("button,input,select")),r=a.map(o=>o.disabled);a.forEach(o=>o.disabled=!0);try{const{encodeSimulationVideo:o}=await et(async()=>{const{encodeSimulationVideo:d}=await import("./video-CFmNS4pe.js");return{encodeSimulationVideo:d}},[],import.meta.url);c=new Y(l),c.setParameters(e.parameters),m.renderer.setPixelRatio(1),m.lockSize(1280,720);const s=n("appearance").value,i=await o(m.renderer.domElement,l.controller.length,l.fps,async d=>{if(d>0)for(let p=0;p<l.settings.substeps;p++)c.stepRecorded();_(),S?.forceSort(),K(),y(`Rendering video: frame ${d+1} of ${l.controller.length}.`)});O&&URL.revokeObjectURL(O),O=URL.createObjectURL(i),n("video-preview").src=O,n("video-download").href=O,n("video-download").download=`${l.case}-${s}-morphic.webm`,n("video-dialog").showModal(),y(`Exported ${l.controller.length} frames at ${l.fps} fps with the current response. Simulation timestamps are preserved.`);const u=await $e(i,`${l.case}-${s}-morphic.webm`,{case:l.case,appearance:s,parameters:c.parameters,settings:l.settings,provenance:l.provenance,camera:n("camera-view").value,cameraWorldMatrix:m.camera.matrixWorld.toArray(),projectionMatrix:m.camera.projectionMatrix.toArray(),frames:l.controller.length,fps:l.fps,width:1280,height:720,scope:"Recorded loading with the selected effective response; no mouse actions in this video"});u&&y(`Saved ${l.controller.length} frames at ${l.fps} fps to ${u.path}.`)}catch(o){y(o.message,!0)}finally{c=e,m.renderer.setPixelRatio(t),m.unlockSize(),a.forEach((o,s)=>o.disabled=r[s]),oe=!1,_(),K()}};n("video-close").onclick=()=>n("video-dialog").close();const W=m.renderer.domElement;function Ze(e){const t=W.getBoundingClientRect();Ne.set((e.clientX-t.left)/t.width*2-1,-(e.clientY-t.top)/t.height*2+1),xe.setFromCamera(Ne,m.camera)}W.addEventListener("pointerdown",e=>{if(e.button!==0||!x||M)return;Ze(e);const t=xe.intersectObject(x.group,!0)[0];if(!t)return;e.stopImmediatePropagation(),le=!0,m.controls.enabled=!1,W.setPointerCapture(e.pointerId);const a=k.worldToLocal(t.point.clone());let r=0,o=1/0;for(let i=0;i<c.n;i++){const u=(c.x[i*3]-a.x)**2+(c.x[i*3+1]-a.y)**2+(c.x[i*3+2]-a.z)**2;u<o&&(o=u,r=i)}X.fromArray(c.x,r*3);const s=k.localToWorld(X.clone());Xe.setFromNormalAndCoplanarPoint(m.camera.getWorldDirection(new Z),s),ee({type:"grab",node:r,target:X.toArray()}),F(!1)},!0);W.addEventListener("pointermove",e=>{if(le&&(Ze(e),xe.ray.intersectPlane(Xe,X))){const t=k.worldToLocal(X.clone());t.z=Math.min(0,t.z),ee({type:"move",target:t.toArray()})}},!0);function Me(){le&&(le=!1,m.controls.enabled=n("camera-view").value==="studio",ee({type:"release"}))}W.addEventListener("pointerup",Me,!0);W.addEventListener("pointercancel",Me,!0);window.addEventListener("blur",()=>{Me(),F(!0)});function Ye(e){if(requestAnimationFrame(Ye),oe)return;const t=Math.min((e-Le)/1e3,.05);if(Le=e,c&&!we){V=Math.min(V+t,.05);let a=!1;try{for(;V>=c.dt;){if(M){for(;J<M.events.length&&M.events[J].tick===c.tick;)c.apply(M.events[J++].action);if(c.tick>=M.endTick){let r=0;for(let o=0;o<c.n*3;o++)r=Math.max(r,Math.abs(c.x[o]-M.finalPositions[o]));Q=structuredClone(M.events),M=null,Ae(!0),F(!0),y(`Replay maximum coordinate drift: ${r.toExponential(2)} m.`);break}}if(!M&&!H&&c.tick>=(l.controller.length-1)*l.settings.substeps){F(!0);break}if(c.tick>=3e4){F(!0);break}c.stepRecorded(),V-=c.dt,a=!0}a&&_()}catch(r){F(!0),y(r.message,!0)}}K()}requestAnimationFrame(Ye);const Ge=new URLSearchParams(location.search).get("recording");let ce;try{ce=await ot()}catch(e){y(e.message,!0)}await ke(ce?.response?.case??(ge.includes(Ge)?Ge:"single_lift_sloth"),ce);async function Qe(){c&&(q&&(n("camera-view").value="recorded",n("camera-view").onchange()),Je.includes(l.case)&&(n("appearance").value="gaussian",await n("appearance").onchange()))}ce||await Qe();
