/**
 * Original, parametric Codex learning workbench. No model, image, CDN or account.
 * Three.js r180 is deferred and served beside this module; see vendor/THREE-LICENSE.txt.
 * Every motion is user initiated and bounded. The settled scene does not render.
 */
export async function createGuidedScene(host, { onSelect = () => {} } = {}) {
  if (!host || typeof host.appendChild !== 'function') throw new Error('The 3D workspace needs a visible container.');
  let THREE;
  try {
    THREE = await import('./vendor/three.module.min.js');
  } catch (cause) {
    throw new Error('The 3D renderer could not load. Use the workspace part buttons to continue.', { cause });
  }
  if (!host.isConnected) throw new Error('The 3D workspace was closed before it finished loading.');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (cause) {
    throw new Error('Interactive 3D is unavailable in this browser. Use the workspace part buttons to continue.', { cause });
  }
  const canvas = renderer.domElement;
  canvas.dataset.guidedScene = '';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y pinch-zoom;cursor:grab;outline:none';
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const world = new THREE.Group();
  scene.add(world);
  const camera = new THREE.OrthographicCamera(-6, 6, 4.5, -4.5, 0.1, 70);
  const target = new THREE.Vector3(0, 0.55, 0);
  let elevation = 0;
  const cameraPosition = () => {
    camera.position.set(9.5, 10.2 + elevation, 13.8);
    camera.lookAt(target);
  };
  cameraPosition();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x879099, 2.6));
  const keyLight = new THREE.DirectionalLight(0xfff6e4, 3.0);
  keyLight.position.set(-5, 12, 7);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  Object.assign(keyLight.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
  keyLight.shadow.normalBias = 0.04;
  keyLight.shadow.bias = -0.0003;
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xd2e8ff, 1.45);
  fillLight.position.set(8, 5, -5);
  scene.add(fillLight);

  const palette = {
    ink: 0x283747, slate: 0x354559, screen: 0x182b40, cream: 0xe9e1d0,
    paper: 0xfffcf2, cobalt: 0x3465cd, cyan: 0x55bec5, steel: 0xa4adb3,
    warm: 0xe4bc79, green: 0x3e9e79, coral: 0xd36a59,
  };
  const ownedGeometries = new Set();
  const ownedMaterials = new Set();
  const ownedTextures = new Set();
  const selectable = [];
  const parts = new Map();
  const geometries = (value) => (ownedGeometries.add(value), value);
  const materials = (value) => (ownedMaterials.add(value), value);
  const material = (color, extra = {}) => materials(new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05, ...extra }));
  const mat = Object.fromEntries(Object.entries(palette).map(([name, color]) => [name, material(color)]));
  const outlineMaterial = materials(new THREE.LineBasicMaterial({ color: palette.ink, transparent: true, opacity: 0.7 }));
  const roundedGeometry = (w, h, d, radius = 0.07) => {
    const r = Math.min(radius, w / 4, h / 4, d / 3);
    const shape = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y); shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r); shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h); shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelSize: r * 0.38, bevelThickness: r * 0.38, bevelSegments: 2, steps: 1, curveSegments: 4 });
    geometry.translate(0, 0, -d / 2);
    return geometries(geometry);
  };
  function mesh(parent, geometry, surface, position = [0, 0, 0], id, outline = true) {
    const object = new THREE.Mesh(geometry, surface);
    object.position.set(...position);
    object.castShadow = true; object.receiveShadow = true;
    parent.add(object);
    if (id) { object.userData.part = id; selectable.push(object); }
    if (outline) object.add(new THREE.LineSegments(geometries(new THREE.EdgesGeometry(geometry, 38)), outlineMaterial));
    return object;
  }
  const box = (parent, size, surface, position, id, outline = true) => mesh(parent, roundedGeometry(...size), surface, position, id, outline);
  function surface(width, height, draw) {
    const element = document.createElement('canvas');
    element.width = 1024;
    element.height = Math.round(1024 * height / width);
    const context = element.getContext('2d');
    if (!context) throw new Error('The 3D workspace could not create its labels. Use the workspace part buttons.');
    const texture = new THREE.CanvasTexture(element);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    ownedTextures.add(texture);
    const update = (data) => {
      context.save(); context.scale(element.width / width, element.height / height);
      draw(context, data); context.restore(); texture.needsUpdate = true;
    };
    update({});
    return { texture, update };
  }
  function panel(parent, width, height, texture, position, id, flat = false) {
    const plane = mesh(parent, geometries(new THREE.PlaneGeometry(width, height)), materials(new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })), position, id, false);
    plane.castShadow = false; plane.receiveShadow = false;
    if (flat) plane.rotation.x = -Math.PI / 2;
    return plane;
  }
  const text = (ctx, str, x, y, size, color = '#283747', weight = 500, family = 'monospace') => {
    ctx.fillStyle = color; ctx.font = `${weight} ${size}px ${family}`; ctx.fillText(str, x, y);
  };
  const roundRect = (ctx, x, y, w, h, r, color) => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
  };
  function staticLabel(parent, label, width, position, id, flat = false, color = '#283747', background = '#fffcf2') {
    const labelSurface = surface(600, 125, (ctx) => {
      ctx.fillStyle = background; ctx.fillRect(0, 0, 600, 125);
      text(ctx, label, 28, 83, 45, color, 700);
    });
    return panel(parent, width, width * 125 / 600, labelSurface.texture, position, id, flat);
  }
  function part(id, position, footprint) {
    const group = new THREE.Group(); group.position.set(...position); world.add(group);
    const haloMaterial = material(palette.cyan, { transparent: true, opacity: 0.12, depthWrite: false });
    const halo = mesh(world, roundedGeometry(footprint[0], 0.025, footprint[1], 0.05), haloMaterial, [position[0], 0.24, position[2]], null, false);
    halo.castShadow = false; halo.receiveShadow = false;
    parts.set(id, { group, base: position[1], halo, haloMaterial });
    return group;
  }

  // A physical desk gives the learning objects a common, inspectable coordinate space.
  const deskMaterial = material(palette.cream);
  box(world, [9.45, 0.22, 6.05], deskMaterial, [0, 0.06, 0], null);
  box(world, [9.0, 0.09, 5.65], mat.slate, [0, -0.105, 0], null);
  for (const x of [-3.8, 3.8]) for (const z of [-2.15, 2.15]) {
    mesh(world, geometries(new THREE.CylinderGeometry(0.17, 0.2, 0.28, 12)), mat.slate, [x, -0.26, z], null);
  }
  const shadowMaterial = materials(new THREE.ShadowMaterial({ opacity: 0.15 }));
  const floor = mesh(scene, geometries(new THREE.PlaneGeometry(80, 80)), shadowMaterial, [0, -0.42, 0], null, false);
  floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const gridMaterial = materials(new THREE.LineBasicMaterial({ color: 0x8b9292, transparent: true, opacity: 0.12 }));
  const gridPoints = [];
  for (let x = -4.1; x <= 4.1; x += 0.55) gridPoints.push(x, 0.185, -2.6, x, 0.185, 2.6);
  for (let z = -2.6; z <= 2.6; z += 0.55) gridPoints.push(-4.1, 0.185, z, 4.1, 0.185, z);
  world.add(new THREE.LineSegments(geometries(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(gridPoints, 3))), gridMaterial));

  // 01: project folder and the Codex laptop share the project selection.
  const project = part('project', [-0.65, 0.24, -0.5], [3.5, 2.45]);
  box(project, [3.3, 0.12, 2.05], mat.steel, [0, 0.08, 0.5], 'project');
  box(project, [2.8, 0.035, 0.97], mat.slate, [0, 0.165, 0.25], 'project', false);
  const keyGeometry = geometries(new THREE.BoxGeometry(0.185, 0.033, 0.12));
  const keys = new THREE.InstancedMesh(keyGeometry, mat.cream, 50);
  const keyMatrix = new THREE.Matrix4();
  for (let row = 0; row < 5; row++) for (let col = 0; col < 10; col++) {
    keyMatrix.makeTranslation(-1.05 + col * 0.232, 0.195, -0.1 + row * 0.175);
    keys.setMatrixAt(row * 10 + col, keyMatrix);
  }
  project.add(keys); keys.castShadow = false;
  box(project, [0.88, 0.016, 0.43], mat.cream, [0, 0.161, 1.13], 'project', false);
  const lid = new THREE.Group(); lid.position.set(0, 1.19, -0.43); lid.rotation.x = -0.13; project.add(lid);
  box(lid, [3.18, 2.02, 0.15], mat.slate, [0, 0, 0], 'project');
  box(lid, [2.96, 1.79, 0.025], mat.screen, [0, 0.025, 0.085], 'project', false);
  const screenSurface = surface(1000, 600, (ctx, data = {}) => {
    ctx.fillStyle = '#182b40'; ctx.fillRect(0, 0, 1000, 600);
    text(ctx, 'CODEX', 55, 87, 49, '#f6f2e7', 700);
    text(ctx, 'LOCAL WORKSPACE', 570, 82, 23, '#91a8bb', 600);
    ctx.fillStyle = '#40566a'; ctx.fillRect(55, 117, 890, 2);
    text(ctx, 'Small change.', 55, 235, 63, '#f5f3e9', 600, 'sans-serif');
    text(ctx, 'Clear evidence.', 55, 310, 63, '#69ced0', 600, 'sans-serif');
    text(ctx, '> ' + (data.fileLabel || 'read the project first'), 60, 403, 30, '#c7d7e2');
    text(ctx, data.moduleId ? String(data.moduleId).replace(/[-_]/g, ' ').slice(0, 34).toUpperCase() : '01 / UNDERSTAND THE CONTEXT', 60, 466, 24, '#91a8bb', 600);
    roundRect(ctx, 58, 510, 880, 8, 4, '#344c61');
    roundRect(ctx, 58, 510, 220 + ((Number(data.stage) || 0) % 5) * 130, 8, 4, data.status === 'fail' ? '#dd8d78' : '#62c5c7');
  });
  panel(lid, 2.87, 1.71, screenSurface.texture, [0, 0.025, 0.104], 'project');
  mesh(lid, geometries(new THREE.SphereGeometry(0.025, 8, 6)), mat.steel, [0, 0.93, 0.085], 'project', false);
  const folder = new THREE.Group(); folder.position.set(-2.55, 0.7, -0.52); folder.rotation.x = -0.16; folder.rotation.y = 0.06; project.add(folder);
  const folderShape = new THREE.Shape();
  folderShape.moveTo(-0.82, -0.58); folderShape.lineTo(0.82, -0.58); folderShape.lineTo(0.82, 0.45);
  folderShape.lineTo(-0.1, 0.45); folderShape.lineTo(-0.25, 0.68); folderShape.lineTo(-0.82, 0.68); folderShape.closePath();
  const folderGeometry = geometries(new THREE.ExtrudeGeometry(folderShape, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2, steps: 1 }));
  mesh(folder, folderGeometry, mat.warm, [0, 0, 0], 'project');
  box(folder, [1.45, 0.99, 0.03], mat.paper, [0, 0.04, 0.15], 'project', false);
  box(folder, [1.63, 0.87, 0.06], mat.cobalt, [0, -0.15, 0.23], 'project');
  staticLabel(folder, 'PROJECT', 1.31, [-0.02, -0.07, 0.268], 'project', false, '#fffcf2', '#3465cd');
  staticLabel(world, '01  PROJECT', 1.72, [-2.95, 0.195, -2.03], 'project', true);

  // 02: an actual stack of three pages; the selected context page is readable.
  const files = part('files', [-3.03, 0.25, 1.28], [2.05, 2.05]);
  for (let index = 0; index < 3; index++) {
    const page = box(files, [1.73, 0.045, 1.9], index === 2 ? mat.paper : mat.cream, [index * 0.04, index * 0.067 + 0.04, 0], 'files');
    page.rotation.y = (index - 1) * 0.045;
  }
  const fileSurface = surface(700, 760, (ctx, data = {}) => {
    ctx.fillStyle = '#fffcf2'; ctx.fillRect(0, 0, 700, 760);
    roundRect(ctx, 46, 42, 608, 82, 10, '#e4ecee');
    text(ctx, 'CONTEXT', 72, 96, 34, '#3465cd', 700);
    const name = String(data.fileLabel || 'AGENTS.md').slice(0, 21);
    text(ctx, name, 46, 208, name.length > 15 ? 35 : 49, '#283747', 700);
    text(ctx, 'Read before changing.', 46, 266, 28, '#647281');
    [0.85, 0.7, 0.92, 0.77, 0.5].forEach((width, index) => roundRect(ctx, 48, 340 + index * 58, 580 * width, 14, 7, index === 1 ? '#9bd4d4' : '#d7dee0'));
    text(ctx, 'scope / rules / files', 46, 702, 27, '#647281');
  });
  panel(files, 1.57, 1.7, fileSurface.texture, [0.08, 0.214, 0], 'files', true);
  staticLabel(world, '02  FILES', 1.55, [-3.1, 0.195, 2.65], 'files', true);

  // 03: a prompt is a physical request slate, not an opaque AI effect.
  const prompt = part('prompt', [2.24, 0.26, 1.24], [2.7, 1.95]);
  prompt.rotation.y = -0.08;
  box(prompt, [2.55, 0.12, 1.72], mat.cobalt, [0, 0.06, 0], 'prompt');
  box(prompt, [2.39, 0.035, 1.55], mat.paper, [0, 0.142, 0], 'prompt', false);
  const promptSurface = surface(1000, 640, (ctx) => {
    ctx.fillStyle = '#fffcf2'; ctx.fillRect(0, 0, 1000, 640);
    text(ctx, 'PROMPT', 55, 87, 49, '#3465cd', 700);
    text(ctx, 'One clear outcome.', 55, 207, 61, '#283747', 600, 'sans-serif');
    text(ctx, 'Give context. Set a boundary.', 55, 292, 33, '#647281');
    text(ctx, 'Ask for a check.', 55, 345, 33, '#647281');
    roundRect(ctx, 55, 417, 890, 112, 15, '#e6edef');
    text(ctx, '> make one small change', 85, 487, 35, '#283747', 600);
    text(ctx, 'GOAL  /  CONTEXT  /  VERIFY', 55, 594, 26, '#3465cd', 700);
  });
  panel(prompt, 2.28, 1.46, promptSurface.texture, [0, 0.163, 0], 'prompt', true);
  staticLabel(world, '03  PROMPT', 1.75, [2.25, 0.195, 2.65], 'prompt', true);

  // 04: a diff pane with individually modelled additions and removals.
  const change = part('change', [2.65, 0.24, -1.24], [2.6, 1.24]);
  const diffStand = new THREE.Group(); diffStand.position.y = 0.98; diffStand.rotation.x = -0.12; change.add(diffStand);
  box(change, [1.53, 0.1, 0.72], mat.slate, [0, 0.07, 0.06], 'change');
  box(change, [0.14, 0.76, 0.12], mat.steel, [0, 0.46, -0.15], 'change');
  box(diffStand, [2.32, 1.79, 0.12], mat.paper, [0, 0.05, 0], 'change');
  const diffSurface = surface(850, 630, (ctx, data = {}) => {
    ctx.fillStyle = '#fffcf2'; ctx.fillRect(0, 0, 850, 630);
    text(ctx, 'DIFF', 45, 79, 50, '#283747', 700);
    text(ctx, 'REVIEW THE CHANGE', 270, 73, 23, '#647281', 600);
    ctx.fillStyle = '#d9dfe0'; ctx.fillRect(45, 111, 760, 2);
    const rows = [ ['−', 'old assumption', '#f5e4dd', '#ab6256'], ['+', 'one small change', '#e1f0e9', '#377e65'], ['+', 'a clear check', '#e1f0e9', '#377e65'] ];
    rows.forEach(([symbol, line, bg, ink], index) => {
      roundRect(ctx, 45, 156 + index * 100, 760, 79, 9, bg);
      text(ctx, symbol, 67, 211 + index * 100, 35, ink, 700);
      text(ctx, line, 122, 211 + index * 100, 31, ink, 500);
    });
    text(ctx, data.status === 'pass' ? 'READY TO EXPLAIN' : data.status === 'fail' ? 'LOOK AGAIN →' : 'READ BEFORE ACCEPTING', 47, 565, 27, data.status === 'fail' ? '#ab6256' : '#3465cd', 700);
  });
  panel(diffStand, 2.14, 1.59, diffSurface.texture, [0, 0.05, 0.09], 'change');
  staticLabel(world, '04  CHANGE', 1.75, [2.9, 0.195, -2.28], 'change', true);

  // 05: a result receipt and a tactile status puck change together.
  const check = part('check', [0.12, 0.25, 1.91], [1.75, 1.62]);
  const receipt = new THREE.Group(); receipt.position.set(-0.17, 0.55, -0.18); receipt.rotation.x = -0.5; check.add(receipt);
  box(receipt, [1.43, 1.05, 0.045], mat.paper, [0, 0, 0], 'check');
  const checkSurface = surface(760, 540, (ctx, data = {}) => {
    ctx.fillStyle = '#fffcf2'; ctx.fillRect(0, 0, 760, 540);
    text(ctx, 'EVIDENCE', 44, 86, 51, '#283747', 700);
    const status = data.status || 'idle';
    text(ctx, status === 'pass' ? 'CHECK PASSED' : status === 'fail' ? 'CHECK FAILED' : 'CHECK THE RESULT', 46, 162, 29, status === 'pass' ? '#377e65' : status === 'fail' ? '#ab6256' : '#3465cd', 700);
    ['actual output', 'expected result', 'explain the gap'].forEach((line, index) => {
      text(ctx, status === 'pass' ? '✓' : status === 'fail' && index === 1 ? '!' : '○', 47, 262 + index * 85, 38, status === 'fail' ? '#ab6256' : '#377e65', 700, 'sans-serif');
      text(ctx, line, 110, 257 + index * 85, 31, '#647281');
    });
  });
  panel(receipt, 1.35, 0.96, checkSurface.texture, [0, 0, 0.032], 'check');
  const puckMaterial = material(palette.cyan);
  mesh(check, geometries(new THREE.CylinderGeometry(0.38, 0.43, 0.22, 32)), mat.slate, [0.42, 0.13, 0.43], 'check');
  mesh(check, geometries(new THREE.CylinderGeometry(0.33, 0.34, 0.07, 32)), puckMaterial, [0.42, 0.277, 0.43], 'check', false);
  const puckSurface = surface(256, 256, (ctx, data = {}) => {
    ctx.clearRect(0, 0, 256, 256);
    ctx.fillStyle = data.status === 'pass' ? '#3e9e79' : data.status === 'fail' ? '#d36a59' : '#55bec5';
    ctx.fillRect(0, 0, 256, 256);
    ctx.textAlign = 'center';
    text(ctx, data.status === 'pass' ? '✓' : data.status === 'fail' ? '!' : '·', 128, 183, 168, '#fffcf2', 700, 'sans-serif');
    ctx.textAlign = 'start';
  });
  const puckTop = mesh(check, geometries(new THREE.CircleGeometry(0.3, 32)), materials(new THREE.MeshBasicMaterial({ map: puckSurface.texture, toneMapped: false })), [0.42, 0.317, 0.43], 'check', false);
  puckTop.rotation.x = -Math.PI / 2; puckTop.castShadow = false;
  staticLabel(world, '05  CHECK', 1.55, [0.15, 0.195, 2.83], 'check', true);

  // Physical cables stay quiet until a learner deliberately changes state.
  const cableMaterial = material(palette.ink);
  function cable(points, color = cableMaterial) {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0.275, z)));
    mesh(world, geometries(new THREE.TubeGeometry(curve, 36, 0.027, 6, false)), color, [0, 0, 0], null, false);
    for (const [x, z] of [points[0], points[points.length - 1]]) box(world, [0.14, 0.075, 0.13], mat.cyan, [x, 0.276, z], null, false);
  }
  cable([[-3.1, -1.45], [-2.9, -1.9], [-1.25, -1.8], [-0.8, -1.3]]);
  cable([[0.95, -0.7], [1.3, -1.1], [1.57, -1.23]]);
  cable([[2.65, -0.6], [3.55, -0.15], [3.65, 0.42], [3.32, 1.0]]);
  cable([[1.0, 1.8], [1.35, 2.2], [1.1, 2.57], [0.62, 2.36]]);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let state = { focus: 'project', moduleId: '', stage: 0, status: 'idle', theme: 'light', reducedMotion: !!media?.matches, fileLabel: '' };
  let disposed = false, contextLost = false, raf = 0, transition = null, hovered = null, drag = null, renderCount = 0;
  let currentZoom = 1, viewWidth = 0, viewHeight = 0;
  const syncDataset = () => {
    canvas.dataset.activePart = state.focus;
    canvas.dataset.rotation = world.rotation.y.toFixed(4);
    canvas.dataset.zoom = currentZoom.toFixed(3);
    canvas.dataset.motion = state.reducedMotion ? 'reduce' : 'normal';
    canvas.dataset.sceneStatus = state.status;
    canvas.dataset.pendingFrame = raf ? 'true' : 'false';
  };
  function requestRender() {
    if (disposed || contextLost || raf) return;
    raf = requestAnimationFrame(render); syncDataset();
  }
  function render(time) {
    raf = 0;
    if (disposed || contextLost) return;
    if (transition) {
      const progress = Math.min(1, (time - transition.started) / 180);
      const eased = 1 - (1 - progress) ** 3;
      for (const [id, item] of parts) item.group.position.y = transition.from[id] + (transition.to[id] - transition.from[id]) * eased;
      if (progress < 1) requestRender(); else transition = null;
    }
    renderer.render(scene, camera);
    canvas.dataset.renderCount = String(++renderCount); syncDataset();
  }
  function updateVisuals(animate = false) {
    const from = {}, to = {};
    for (const [id, item] of parts) {
      const active = id === state.focus, over = id === hovered;
      from[id] = item.group.position.y; to[id] = item.base + (active ? 0.12 : 0);
      item.haloMaterial.color.set(state.status === 'fail' && active ? palette.coral : active ? palette.cobalt : palette.cyan);
      item.haloMaterial.opacity = active ? (state.theme === 'dark' ? 0.3 : 0.2) : over ? 0.19 : 0.035;
      if (!animate || state.reducedMotion) item.group.position.y = to[id];
    }
    transition = animate && !state.reducedMotion ? { from, to, started: performance.now() } : null;
    puckMaterial.color.set(state.status === 'pass' ? palette.green : state.status === 'fail' ? palette.coral : palette.cyan);
    deskMaterial.color.set(state.theme === 'dark' ? 0x78858c : palette.cream);
    gridMaterial.opacity = state.theme === 'dark' ? 0.19 : 0.12;
    shadowMaterial.opacity = state.theme === 'dark' ? 0.25 : 0.15;
    screenSurface.update(state); fileSurface.update(state); diffSurface.update(state); checkSurface.update(state); puckSurface.update(state);
    requestRender(); syncDataset();
  }
  function setState(next = {}) {
    if (disposed) return;
    const candidate = { ...state, ...next };
    if (!parts.has(candidate.focus)) candidate.focus = state.focus;
    if (!['idle', 'pass', 'fail'].includes(candidate.status)) candidate.status = 'idle';
    candidate.theme = candidate.theme === 'dark' ? 'dark' : 'light';
    candidate.reducedMotion = !!candidate.reducedMotion;
    const changed = Object.keys(candidate).some((key) => candidate[key] !== state[key]);
    if (!changed) return;
    state = candidate; updateVisuals(false);
  }
  function resize() {
    if (disposed) return;
    const bounds = host.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width)), height = Math.max(1, Math.round(bounds.height));
    if (width === viewWidth && height === viewHeight) return;
    viewWidth = width; viewHeight = height;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    const span = Math.max(7.65, 12.2 / Math.max(0.1, aspect));
    camera.left = -span * aspect / 2; camera.right = span * aspect / 2;
    camera.top = span / 2; camera.bottom = -span / 2;
    camera.zoom = currentZoom; camera.updateProjectionMatrix(); requestRender();
  }
  function hit(event) {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
    scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(selectable, false)[0]?.object.userData.part || null;
  }
  function pointerDown(event) {
    if (event.button !== 0 || drag || disposed) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, moved: false, touch: event.pointerType === 'touch' };
    // pan-y lets a touch scroll the page; native scrolling will cancel this pointer.
    try { canvas.setPointerCapture(event.pointerId); } catch { /* Detached pointers need no capture. */ }
  }
  function pointerMove(event) {
    if (disposed) return;
    if (drag && drag.id === event.pointerId) {
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      if (drag.touch && !drag.moved && Math.abs(dy) > Math.abs(dx)) return;
      drag.moved = true; canvas.style.cursor = 'grabbing';
      world.rotation.y += (event.clientX - drag.lastX) * 0.007;
      if (!drag.touch) elevation = THREE.MathUtils.clamp(elevation + (event.clientY - drag.lastY) * 0.028, -3.5, 4);
      drag.lastX = event.clientX; drag.lastY = event.clientY;
      cameraPosition(); requestRender(); syncDataset(); return;
    }
    const next = hit(event);
    if (next !== hovered) { hovered = next; canvas.style.cursor = next ? 'pointer' : 'grab'; updateHover(); }
  }
  function updateHover() {
    for (const [id, item] of parts) if (id !== state.focus) item.haloMaterial.opacity = id === hovered ? 0.19 : 0.035;
    requestRender();
  }
  function pointerUp(event) {
    if (!drag || drag.id !== event.pointerId) return;
    const select = !drag.moved && hit(event);
    drag = null;
    try { canvas.releasePointerCapture(event.pointerId); } catch { /* A cancelled pointer is already released. */ }
    canvas.style.cursor = select ? 'pointer' : 'grab';
    if (select) {
      state = { ...state, focus: select }; updateVisuals(true); onSelect(select);
    }
  }
  function pointerCancel() { drag = null; canvas.style.cursor = 'grab'; }
  function pointerLeave() { if (!drag && hovered) { hovered = null; updateHover(); } }
  function lost(event) { event.preventDefault(); contextLost = true; if (raf) cancelAnimationFrame(raf); raf = 0; syncDataset(); }
  function restored() { contextLost = false; requestRender(); }
  const listeners = [ ['pointerdown', pointerDown], ['pointermove', pointerMove], ['pointerup', pointerUp], ['pointercancel', pointerCancel], ['pointerleave', pointerLeave], ['webglcontextlost', lost], ['webglcontextrestored', restored] ];
  for (const [type, listener] of listeners) canvas.addEventListener(type, listener);
  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(host); else window.addEventListener('resize', resize);
  host.appendChild(canvas); resize(); updateVisuals(false);

  return {
    setState,
    rotate(deltaRadians = 0) {
      if (disposed || !Number.isFinite(Number(deltaRadians))) return;
      world.rotation.y += Number(deltaRadians); requestRender(); syncDataset();
    },
    zoom(factor = 1) {
      if (disposed || !Number.isFinite(Number(factor)) || Number(factor) <= 0) return;
      currentZoom = THREE.MathUtils.clamp(currentZoom * Number(factor), 0.72, 1.5);
      camera.zoom = currentZoom; camera.updateProjectionMatrix(); requestRender(); syncDataset();
    },
    reset() {
      if (disposed) return;
      world.rotation.set(0, 0, 0); elevation = 0; currentZoom = 1;
      cameraPosition(); camera.zoom = 1; camera.updateProjectionMatrix(); requestRender(); syncDataset();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0; transition = null;
      canvas.dataset.pendingFrame = 'false';
      canvas.dataset.disposed = 'true';
      if (drag) { try { canvas.releasePointerCapture(drag.id); } catch { /* Pointer may already be released. */ } }
      drag = null;
      for (const [type, listener] of listeners) canvas.removeEventListener(type, listener);
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', resize);
      for (const texture of ownedTextures) texture.dispose();
      for (const geometry of ownedGeometries) geometry.dispose();
      for (const entry of ownedMaterials) entry.dispose();
      scene.clear(); world.clear();
      renderer.renderLists.dispose(); renderer.dispose(); renderer.forceContextLoss();
      canvas.remove();
      selectable.length = 0; parts.clear();
      ownedTextures.clear(); ownedGeometries.clear(); ownedMaterials.clear();
    },
  };
}
