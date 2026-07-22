/* <genrang-3d> — fully pixelated (voxel) Genrang, idle animation, pointer-follow head */
(function () {
  const THREE_URL = (window.__resources && window.__resources.threeJs) || 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js';
  let threeReady = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve();
    if (threeReady) return threeReady;
    threeReady = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = THREE_URL; s.onload = () => res(); s.onerror = rej;
      document.head.appendChild(s);
    });
    return threeReady;
  }
  // Sample Genrang's primitives on a voxel grid. First matching primitive wins (details first).
  function genrangVoxels(cell) {
    const C = { gold: 0xd9ac00, dark: 0x241c10, cream: 0xfff4de, shirt: 0x17140f, glass: 0x141008, badge: 0xb89b00 };
    const P = [];
    const ell = (cx, cy, cz, rx, ry, rz, col, head) => P.push({ t: (x, y, z) => { const a = (x - cx) / rx, b = (y - cy) / ry, c = (z - cz) / rz; return a * a + b * b + c * c <= 1; }, col, head });
    const box = (cx, cy, cz, w, h, d, col, head) => P.push({ t: (x, y, z) => Math.abs(x - cx) <= w / 2 && Math.abs(y - cy) <= h / 2 && Math.abs(z - cz) <= d / 2, col, head });
    // sunglasses (lenses, bridge, arms)
    box(-0.42, 2.74, 0.94, 0.62, 0.44, 0.3, C.glass, 1); box(0.42, 2.74, 0.94, 0.62, 0.44, 0.3, C.glass, 1);
    box(0, 2.78, 0.98, 0.3, 0.14, 0.22, C.glass, 1);
    box(-1.04, 2.78, 0.38, 0.12, 0.1, 0.78, C.glass, 1); box(1.04, 2.78, 0.38, 0.12, 0.1, 0.78, C.glass, 1);
    ell(0, 2.5, 1.08, 0.14, 0.12, 0.14, C.dark, 1); // nose
    box(0, 2.14, 1.0, 0.3, 0.05, 0.1, C.dark, 1); // mouth
    box(-0.35, 3.06, 0.86, 0.22, 0.07, 0.14, C.dark, 1); box(0.35, 3.06, 0.86, 0.22, 0.07, 0.14, C.dark, 1); // brow marks
    ell(-0.87, 3.44, 0.1, 0.2, 0.2, 0.17, C.dark, 1); ell(0.87, 3.44, 0.1, 0.2, 0.2, 0.17, C.dark, 1); // ear inner
    ell(-0.85, 3.38, -0.08, 0.35, 0.35, 0.35, C.gold, 1); ell(0.85, 3.38, -0.08, 0.35, 0.35, 0.35, C.gold, 1); // ears
    ell(0, 3.3, 0.28, 0.62, 0.24, 0.46, C.dark, 1); // crown patch
    box(-1.16, 2.65, 0.12, 0.16, 0.36, 0.44, C.dark, 1); box(1.16, 2.65, 0.12, 0.16, 0.36, 0.44, C.dark, 1); // stripes
    box(-1.1, 2.28, 0.2, 0.14, 0.28, 0.38, C.dark, 1); box(1.1, 2.28, 0.2, 0.14, 0.28, 0.38, C.dark, 1);
    ell(0, 2.3, 0.64, 0.78, 0.47, 0.46, C.cream, 1); // muzzle
    ell(0, 2.6, 0, 1.24, 1.0, 1.05, C.gold, 1); // head
    ell(0, 1.32, 0.76, 0.27, 0.27, 0.1, C.badge, 0); // GG badge
    ell(-0.82, 1.5, 0, 0.28, 0.22, 0.25, C.shirt, 0); ell(0.82, 1.5, 0, 0.28, 0.22, 0.25, C.shirt, 0); // sleeves
    ell(0, 1.18, 0, 0.96, 0.9, 0.78, C.shirt, 0); // body
    ell(-0.92, 1.28, 0.05, 0.2, 0.26, 0.2, C.gold, 0); ell(0.92, 1.28, 0.05, 0.2, 0.26, 0.2, C.gold, 0); // arms
    ell(-1.06, 0.98, 0.08, 0.2, 0.28, 0.2, C.gold, 0); ell(1.06, 0.98, 0.08, 0.2, 0.28, 0.2, C.gold, 0);
    ell(-1.12, 0.82, 0.12, 0.23, 0.23, 0.23, C.cream, 0); ell(1.12, 0.82, 0.12, 0.23, 0.23, 0.23, C.cream, 0); // paws
    ell(-0.4, 0.36, 0, 0.29, 0.34, 0.29, C.gold, 0); ell(0.4, 0.36, 0, 0.29, 0.34, 0.29, C.gold, 0); // legs
    ell(-0.42, 0.16, 0.16, 0.31, 0.2, 0.4, C.cream, 0); ell(0.42, 0.16, 0.16, 0.31, 0.2, 0.4, C.cream, 0); // feet
    ell(0.85, 0.45, -0.62, 0.18, 0.18, 0.18, C.gold, 0); ell(1.06, 0.68, -0.74, 0.15, 0.15, 0.15, C.gold, 0); ell(1.2, 0.9, -0.82, 0.12, 0.12, 0.12, C.dark, 0); // tail
    const out = [];
    for (let x = -1.7; x <= 1.7; x += cell) for (let y = cell / 2; y <= 3.95; y += cell) for (let z = -1.15; z <= 1.4; z += cell) {
      for (const p of P) if (p.t(x, y, z)) { out.push({ x, y, z, col: p.col, head: p.head }); break; }
    }
    return out;
  }
  window.__genrangVoxels = genrangVoxels;

  class Genrang3D extends HTMLElement {
    connectedCallback() {
      this.style.cssText += ';display:block;width:100%;height:100%';
      this._alive = true;
      loadThree().then(() => { if (this._alive) this._init(); }).catch(() => {});
    }
    disconnectedCallback() {
      this._alive = false;
      if (this._raf) cancelAnimationFrame(this._raf);
      if (this._ro) this._ro.disconnect();
      window.removeEventListener('pointermove', this._pm);
      if (this._renderer) this._renderer.dispose();
    }
    _init() {
      const T = window.THREE;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
      this.appendChild(renderer.domElement);
      this._renderer = renderer;
      const scene = new T.Scene();
      const cam = new T.PerspectiveCamera(28, 1, 0.1, 50);
      cam.position.set(0, 2.1, 7.4); cam.lookAt(0, 1.75, 0);

      scene.add(new T.HemisphereLight(0xfff4dd, 0x9a9488, 0.65));
      const sun = new T.DirectionalLight(0xffe9c4, 1.15);
      sun.position.set(1.2, 9, 2.5); sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 14; sun.shadow.bias = -0.0004;
      scene.add(sun);
      const rim = new T.DirectionalLight(0xd7e0e6, 0.35);
      rim.position.set(-4, 3, -3); scene.add(rim);

      // voxel Genrang — body + head as two instanced meshes (head follows pointer)
      const CELL = 0.1;
      const vox = genrangVoxels(CELL);
      const geo = new T.BoxGeometry(CELL * 0.92, CELL * 0.92, CELL * 0.92);
      const mat = new T.MeshStandardMaterial({ roughness: 0.85, metalness: 0 });
      const G = new T.Group(); scene.add(G);
      const HD = new T.Group(); HD.position.set(0, 2.6, 0); G.add(HD);
      const mk = (list, parent, py) => {
        const im = new T.InstancedMesh(geo, mat, list.length);
        const d = new T.Object3D(), col = new T.Color();
        list.forEach((v, i) => {
          d.position.set(v.x, v.y - py, v.z); d.updateMatrix();
          im.setMatrixAt(i, d.matrix); im.setColorAt(i, col.setHex(v.col));
        });
        im.instanceMatrix.needsUpdate = true;
        im.castShadow = true; parent.add(im); return im;
      };
      mk(vox.filter(v => !v.head), G, 0);
      mk(vox.filter(v => v.head), HD, 2.6);

      // contact shadow — real cast shadow only, soft PCF, sized to stay inside frame
      const floor = new T.Mesh(new T.CircleGeometry(5, 48), new T.ShadowMaterial({ opacity: 0.15 }));
      floor.rotation.x = -Math.PI / 2; floor.position.y = 0; floor.receiveShadow = true;
      scene.add(floor);
      sun.shadow.camera.left = -5; sun.shadow.camera.right = 5;
      sun.shadow.camera.top = 7; sun.shadow.camera.bottom = -3;

      let mx = 0, my = 0, smx = 0, smy = 0;
      this._pm = (e) => {
        const r = this.getBoundingClientRect();
        mx = ((e.clientX - (r.left + r.width / 2)) / innerWidth) * 2;
        my = ((e.clientY - (r.top + r.height / 2)) / innerHeight) * 2;
      };
      window.addEventListener('pointermove', this._pm, { passive: true });

      const resize = () => {
        const w = this.clientWidth || 300, h = this.clientHeight || 300;
        renderer.setSize(w, h, false);
        cam.aspect = w / h;
        cam.position.z = 8.2 * Math.max(1.1, 0.85 / cam.aspect);
        cam.updateProjectionMatrix();
      };
      this._ro = new ResizeObserver(resize); this._ro.observe(this);
      resize();

      const t0 = performance.now();
      let sized = false;
      const tick = () => {
        if (!this._alive) return;
        if (!sized) { sized = true; resize(); }
        const t = (performance.now() - t0) / 1000;
        smx += (mx - smx) * 0.06; smy += (my - smy) * 0.06;
        G.position.y = Math.sin(t * 1.6) * 0.06;
        G.rotation.y = Math.sin(t * 0.5) * 0.1 + smx * 0.5;
        HD.rotation.y = smx * 0.45;
        HD.rotation.x = smy * 0.3 + Math.sin(t * 1.6 + 0.6) * 0.02;
        renderer.render(scene, cam);
        this._raf = requestAnimationFrame(tick);
      };
      tick();
    }
  }
  if (!customElements.get('genrang-3d')) customElements.define('genrang-3d', Genrang3D);
})();
