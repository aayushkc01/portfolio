/* ==================================================================
   SCENE.JS — The Distributed Core
   A living network graph: a central core (you), orbited by service
   nodes (AWS / Kafka / Kubernetes / Spring Boot / SQL / React),
   connected by pulsing light packets that travel the connections —
   a literal visualization of the systems this portfolio describes.

   Scroll position drives the camera through the network. Each
   section of the page corresponds to a "region" of the graph.
   ================================================================== */

(function(){
  const canvas = document.getElementById('scene-canvas');
  const isMobile = window.innerWidth < 760;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------- renderer / scene / camera ----------------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05080f, 0.018);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 22);

  // ---------------- colors ----------------
  const COLOR_SIGNAL = 0x00f0d8; // cyan
  const COLOR_DATA   = 0x7c5cff; // violet
  const COLOR_UPTIME = 0x0aff9d; // green
  const COLOR_DIM     = 0x1a3a44;

  // ---------------- lights ----------------
  scene.add(new THREE.AmbientLight(0x0a1622, 1.2));
  const coreLight = new THREE.PointLight(COLOR_SIGNAL, 6, 40, 2);
  coreLight.position.set(0, 0, 0);
  scene.add(coreLight);
  const rimLight = new THREE.PointLight(COLOR_DATA, 3, 60, 2);
  rimLight.position.set(-10, 8, -10);
  scene.add(rimLight);

  // ---------------- floor grid (cyberpunk horizon) ----------------
  const gridGroup = new THREE.Group();
  const gridSize = 140, gridDiv = 28;
  const gridGeo = new THREE.BufferGeometry();
  const gridPositions = [];
  const half = gridSize / 2;
  for (let i = 0; i <= gridDiv; i++) {
    const p = -half + (gridSize / gridDiv) * i;
    gridPositions.push(-half, 0, p,  half, 0, p);
    gridPositions.push(p, 0, -half,  p, 0, half);
  }
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
  const gridMat = new THREE.LineBasicMaterial({ color: COLOR_DIM, transparent: true, opacity: 0.28 });
  const gridLines = new THREE.LineSegments(gridGeo, gridMat);
  gridGroup.add(gridLines);
  gridGroup.position.y = -16;
  scene.add(gridGroup);

  // ---------------- starfield / data dust ----------------
  const starCount = isMobile ? 700 : 1800;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 40 + Math.random() * 80;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    starPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i*3+2] = r * Math.cos(phi);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0x4a6a76, size: 0.18, transparent: true, opacity: 0.6, sizeAttenuation: true });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ---------------- the core (identity node) ----------------
  const coreGroup = new THREE.Group();

  const coreGeo = new THREE.IcosahedronGeometry(2.1, 1);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x0a1622, emissive: COLOR_SIGNAL, emissiveIntensity: 0.55,
    metalness: 0.4, roughness: 0.35, wireframe: false
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreGroup.add(coreMesh);

  const coreWireGeo = new THREE.IcosahedronGeometry(2.4, 1);
  const coreWireMat = new THREE.MeshBasicMaterial({ color: COLOR_SIGNAL, wireframe: true, transparent: true, opacity: 0.5 });
  const coreWire = new THREE.Mesh(coreWireGeo, coreWireMat);
  coreGroup.add(coreWire);

  // outer halo ring
  const haloGeo = new THREE.TorusGeometry(3.4, 0.015, 8, 80);
  const haloMat = new THREE.MeshBasicMaterial({ color: COLOR_SIGNAL, transparent: true, opacity: 0.4 });
  const halo1 = new THREE.Mesh(haloGeo, haloMat);
  halo1.rotation.x = Math.PI / 2.3;
  coreGroup.add(halo1);
  const halo2 = new THREE.Mesh(haloGeo, haloMat.clone());
  halo2.rotation.x = Math.PI / 1.7;
  halo2.rotation.y = Math.PI / 4;
  halo2.scale.set(1.15, 1.15, 1.15);
  coreGroup.add(halo2);

  scene.add(coreGroup);

  // ---------------- service nodes ----------------
  // Each node = one technology, positioned in its own "region" of space.
  // Regions map loosely to scroll sections so the camera can travel
  // from hero -> about -> experience -> projects -> contact, weaving
  // through the relevant cluster each time.
  const nodeDefs = [
    { label: 'AWS',         color: COLOR_SIGNAL, pos: [ 7.5,  2.2, -4],  region: 'about' },
    { label: 'KAFKA',       color: COLOR_DATA,   pos: [-7.0,  3.0, -6],  region: 'about' },
    { label: 'KUBERNETES',  color: COLOR_SIGNAL, pos: [ 5.5, -3.4, -10], region: 'experience' },
    { label: 'SPRING BOOT', color: COLOR_UPTIME, pos: [-5.8, -2.6, -11], region: 'experience' },
    { label: 'SQL/NoSQL',   color: COLOR_DATA,   pos: [ 8.5, -1.0, -16], region: 'projects' },
    { label: 'REACT/TS',    color: COLOR_UPTIME, pos: [-8.6,  1.4, -17], region: 'projects' },
    { label: 'DOCKER',      color: COLOR_SIGNAL, pos: [ 3.0,  4.5, -21], region: 'contact' },
    { label: 'OAUTH/SEC',   color: COLOR_DATA,   pos: [-3.4, -4.0, -22], region: 'contact' },
  ];

  const nodes = [];
  const nodeGeo = new THREE.OctahedronGeometry(0.55, 0);
  nodeDefs.forEach((def) => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0a1622, emissive: def.color, emissiveIntensity: 0.85,
      metalness: 0.3, roughness: 0.4
    });
    const mesh = new THREE.Mesh(nodeGeo, mat);
    mesh.position.set(...def.pos);
    scene.add(mesh);

    const wireGeo = new THREE.OctahedronGeometry(0.72, 0);
    const wireMat = new THREE.MeshBasicMaterial({ color: def.color, wireframe: true, transparent: true, opacity: 0.6 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.copy(mesh.position);
    scene.add(wire);

    nodes.push({ mesh, wire, def, basePos: mesh.position.clone(), phase: Math.random() * Math.PI * 2 });
  });

  // ---------------- connections (core -> each node) + traveling packets ----------------
  const connections = [];
  nodes.forEach((node) => {
    const points = [new THREE.Vector3(0,0,0), node.basePos.clone()];
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,0,0),
      node.basePos.clone().multiplyScalar(0.5).add(new THREE.Vector3((Math.random()-0.5)*2, (Math.random()-0.5)*2, 0)),
      node.basePos.clone()
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.012, 6, false);
    const tubeMat = new THREE.MeshBasicMaterial({ color: node.def.color, transparent: true, opacity: 0.22 });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tube);

    // traveling packet (small glowing sphere moving along curve)
    const packetGeo = new THREE.SphereGeometry(0.085, 8, 8);
    const packetMat = new THREE.MeshBasicMaterial({ color: node.def.color });
    const packet = new THREE.Mesh(packetGeo, packetMat);
    scene.add(packet);

    connections.push({ curve, tube, packet, speed: 0.15 + Math.random() * 0.18, t: Math.random() });
  });

  // ---------------- node labels (HTML overlay, billboard-projected) ----------------
  const labelContainer = document.createElement('div');
  labelContainer.style.position = 'fixed';
  labelContainer.style.top = '0';
  labelContainer.style.left = '0';
  labelContainer.style.width = '100vw';
  labelContainer.style.height = '100vh';
  labelContainer.style.pointerEvents = 'none';
  labelContainer.style.zIndex = '3';
  document.body.appendChild(labelContainer);

  const labelEls = nodes.map((node) => {
    const el = document.createElement('div');
    el.textContent = node.def.label;
    el.style.position = 'absolute';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.fontFamily = "'JetBrains Mono', monospace";
    el.style.fontSize = '10.5px';
    el.style.letterSpacing = '0.06em';
    el.style.color = '#' + node.def.color.toString(16).padStart(6,'0');
    el.style.textShadow = '0 0 8px rgba(0,0,0,0.9)';
    el.style.whiteSpace = 'nowrap';
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.4s';
    labelContainer.appendChild(el);
    return el;
  });

  // ---------------- scroll-driven camera path ----------------
  // We define a sequence of camera keyframes (position + lookAt) that
  // correspond to each section. Scroll progress (0..1) interpolates
  // smoothly between them with easing, so the camera "flies through"
  // the network as the visitor reads.
  const sectionIds = ['home','about','experience','projects','contact'];
  const cameraKeyframes = [
    { pos: [0, 0, 22],     look: [0, 0, 0] },      // home — face the core head-on
    { pos: [9, 1.5, 6],    look: [0, 1, -5] },      // about — drift right toward AWS/Kafka
    { pos: [3, -2, -2],    look: [0, -1, -10] },    // experience — sink toward k8s/spring
    { pos: [-2, 1.5, -10], look: [0, 0, -16] },     // projects — push deeper into the graph
    { pos: [1, 2, -16],    look: [0, 0, -22] },     // contact — arrive at outer edge nodes
  ];

  function getScrollProgress(){
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
  }

  function lerp(a,b,t){ return a + (b-a)*t; }
  function easeInOut(t){ return t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2; }

  function getCameraStateAtProgress(p){
    const n = cameraKeyframes.length - 1;
    const scaled = p * n;
    const idx = Math.min(Math.floor(scaled), n-1);
    const localT = easeInOut(scaled - idx);
    const a = cameraKeyframes[idx];
    const b = cameraKeyframes[Math.min(idx+1, n)];
    return {
      pos: [
        lerp(a.pos[0], b.pos[0], localT),
        lerp(a.pos[1], b.pos[1], localT),
        lerp(a.pos[2], b.pos[2], localT),
      ],
      look: [
        lerp(a.look[0], b.look[0], localT),
        lerp(a.look[1], b.look[1], localT),
        lerp(a.look[2], b.look[2], localT),
      ]
    };
  }

  // mouse parallax (subtle, disabled on mobile / reduced motion)
  let mouseX = 0, mouseY = 0;
  if (!isMobile && !reducedMotion) {
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  let targetPos = new THREE.Vector3(0,0,22);
  let targetLook = new THREE.Vector3(0,0,0);
  const currentLook = new THREE.Vector3(0,0,0);

  function updateCameraFromScroll(){
    const p = getScrollProgress();
    const state = getCameraStateAtProgress(p);
    targetPos.set(...state.pos);
    targetLook.set(...state.look);
  }
  updateCameraFromScroll();
  window.addEventListener('scroll', updateCameraFromScroll, { passive: true });

  // ---------------- resize ----------------
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ---------------- render loop ----------------
  const clock = new THREE.Clock();
  const tmpVec = new THREE.Vector3();

  function animate(){
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    // core rotation + pulse
    coreGroup.rotation.y += dt * 0.18;
    coreGroup.rotation.x = Math.sin(t * 0.15) * 0.1;
    halo1.rotation.z += dt * 0.3;
    halo2.rotation.z -= dt * 0.22;
    const pulse = 0.5 + Math.sin(t * 1.6) * 0.15;
    coreMat.emissiveIntensity = pulse;
    coreLight.intensity = 5 + Math.sin(t * 1.6) * 1.5;

    // nodes: gentle float + rotation
    nodes.forEach((node) => {
      const f = Math.sin(t * 0.6 + node.phase) * 0.25;
      node.mesh.position.y = node.basePos.y + f;
      node.wire.position.y = node.basePos.y + f;
      node.mesh.rotation.x += dt * 0.4;
      node.mesh.rotation.y += dt * 0.5;
      node.wire.rotation.x -= dt * 0.3;
      node.wire.rotation.y -= dt * 0.4;
    });

    // traveling data packets along connections
    connections.forEach((c) => {
      c.t += dt * c.speed;
      if (c.t > 1) c.t = 0;
      const point = c.curve.getPointAt(c.t);
      c.packet.position.copy(point);
      const fade = Math.sin(c.t * Math.PI); // fade in/out at ends
      c.packet.material.opacity = fade;
    });

    // starfield slow drift
    stars.rotation.y += dt * 0.004;

    // camera: smooth follow toward scroll target, + subtle mouse parallax
    camera.position.x = lerp(camera.position.x, targetPos.x + mouseX * 0.6, 0.06);
    camera.position.y = lerp(camera.position.y, targetPos.y + mouseY * 0.4, 0.06);
    camera.position.z = lerp(camera.position.z, targetPos.z, 0.06);
    currentLook.lerp(targetLook, 0.06);
    camera.lookAt(currentLook);

    // project node labels to screen space, fade by distance & facing
    nodes.forEach((node, i) => {
      tmpVec.copy(node.mesh.position).project(camera);
      const visible = tmpVec.z < 1 && Math.abs(tmpVec.x) < 1.1 && Math.abs(tmpVec.y) < 1.1;
      const el = labelEls[i];
      if (visible) {
        const x = (tmpVec.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-tmpVec.y * 0.5 + 0.5) * window.innerHeight;
        el.style.left = x + 'px';
        el.style.top = (y - 28) + 'px';
        const dist = camera.position.distanceTo(node.mesh.position);
        el.style.opacity = dist < 26 ? '0.85' : '0';
      } else {
        el.style.opacity = '0';
      }
    });

    renderer.render(scene, camera);
  }
  animate();

  // expose for app.js (nav active-state, etc.)
  window.__scene = { sectionIds, getScrollProgress };
})();
