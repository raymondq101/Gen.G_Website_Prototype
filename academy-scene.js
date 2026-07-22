/* <academy-scene> — pixelated (voxel) Genrang intro → pixel-bloom into detailed scroll-driven Seoul map. */
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
  function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const smooth = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const clamp01 = (t) => Math.min(1, Math.max(0, t));

  // Voxelized Genrang — same recipe as genrang-3d.js (details first, first hit wins)
  function genrangVoxels(cell) {
    const C = { gold: 0xd9ac00, dark: 0x241c10, cream: 0xfff4de, shirt: 0x17140f, glass: 0x141008, badge: 0xb89b00 };
    const P = [];
    const ell = (cx, cy, cz, rx, ry, rz, col) => P.push({ t: (x, y, z) => { const a = (x - cx) / rx, b = (y - cy) / ry, c = (z - cz) / rz; return a * a + b * b + c * c <= 1; }, col });
    const box = (cx, cy, cz, w, h, d, col) => P.push({ t: (x, y, z) => Math.abs(x - cx) <= w / 2 && Math.abs(y - cy) <= h / 2 && Math.abs(z - cz) <= d / 2, col });
    box(-0.42, 2.74, 0.94, 0.62, 0.44, 0.3, C.glass); box(0.42, 2.74, 0.94, 0.62, 0.44, 0.3, C.glass);
    box(0, 2.78, 0.98, 0.3, 0.14, 0.22, C.glass);
    box(-1.04, 2.78, 0.38, 0.12, 0.1, 0.78, C.glass); box(1.04, 2.78, 0.38, 0.12, 0.1, 0.78, C.glass);
    ell(0, 2.5, 1.08, 0.14, 0.12, 0.14, C.dark);
    box(0, 2.14, 1.0, 0.3, 0.05, 0.1, C.dark); // mouth
    box(-0.35, 3.06, 0.86, 0.22, 0.07, 0.14, C.dark); box(0.35, 3.06, 0.86, 0.22, 0.07, 0.14, C.dark); // brow marks
    ell(-0.87, 3.44, 0.1, 0.2, 0.2, 0.17, C.dark); ell(0.87, 3.44, 0.1, 0.2, 0.2, 0.17, C.dark);
    ell(-0.85, 3.38, -0.08, 0.35, 0.35, 0.35, C.gold); ell(0.85, 3.38, -0.08, 0.35, 0.35, 0.35, C.gold);
    ell(0, 3.3, 0.28, 0.62, 0.24, 0.46, C.dark);
    box(-1.16, 2.65, 0.12, 0.16, 0.36, 0.44, C.dark); box(1.16, 2.65, 0.12, 0.16, 0.36, 0.44, C.dark);
    box(-1.1, 2.28, 0.2, 0.14, 0.28, 0.38, C.dark); box(1.1, 2.28, 0.2, 0.14, 0.28, 0.38, C.dark);
    ell(0, 2.3, 0.64, 0.78, 0.47, 0.46, C.cream);
    ell(0, 2.6, 0, 1.24, 1.0, 1.05, C.gold);
    ell(0, 1.32, 0.76, 0.27, 0.27, 0.1, C.badge);
    ell(-0.82, 1.5, 0, 0.28, 0.22, 0.25, C.shirt); ell(0.82, 1.5, 0, 0.28, 0.22, 0.25, C.shirt);
    ell(0, 1.18, 0, 0.96, 0.9, 0.78, C.shirt);
    ell(-0.92, 1.28, 0.05, 0.2, 0.26, 0.2, C.gold); ell(0.92, 1.28, 0.05, 0.2, 0.26, 0.2, C.gold);
    ell(-1.06, 0.98, 0.08, 0.2, 0.28, 0.2, C.gold); ell(1.06, 0.98, 0.08, 0.2, 0.28, 0.2, C.gold);
    ell(-1.12, 0.82, 0.12, 0.23, 0.23, 0.23, C.cream); ell(1.12, 0.82, 0.12, 0.23, 0.23, 0.23, C.cream);
    ell(-0.4, 0.36, 0, 0.29, 0.34, 0.29, C.gold); ell(0.4, 0.36, 0, 0.29, 0.34, 0.29, C.gold);
    ell(-0.42, 0.16, 0.16, 0.31, 0.2, 0.4, C.cream); ell(0.42, 0.16, 0.16, 0.31, 0.2, 0.4, C.cream);
    ell(0.85, 0.45, -0.62, 0.18, 0.18, 0.18, C.gold); ell(1.06, 0.68, -0.74, 0.15, 0.15, 0.15, C.gold); ell(1.2, 0.9, -0.82, 0.12, 0.12, 0.12, C.dark);
    const out = [];
    for (let x = -1.7; x <= 1.7; x += cell) for (let y = cell / 2; y <= 3.95; y += cell) for (let z = -1.15; z <= 1.4; z += cell) {
      for (const p of P) if (p.t(x, y, z)) { out.push({ x, y, z, col: p.col }); break; }
    }
    return out;
  }

  class AcademyScene extends HTMLElement {
    connectedCallback() {
      this.style.cssText += ';display:block;width:100%;height:100%;pointer-events:none';
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
    _blob(T, cx, cz, r, n, rnd, wobble) {
      const shape = new T.Shape(); const pts = [];
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const rr = r * (1 + (rnd() - 0.5) * wobble); pts.push([cx + Math.cos(a) * rr, cz + Math.sin(a) * rr]); }
      shape.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i <= n; i++) { const p = pts[i % n], q = pts[(i + 1) % n]; shape.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
      return shape;
    }
    _plateau(T, shape, h, y, mat) {
      const g = new T.ExtrudeGeometry(shape, { depth: h, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.03, bevelSegments: 2 });
      const m = new T.Mesh(g, mat); m.rotation.x = -Math.PI / 2; m.position.y = y;
      m.castShadow = true; m.receiveShadow = true; return m;
    }
    _label(T, text, w, gold) {
      const c = document.createElement('canvas'); c.width = 512; c.height = 96;
      const x = c.getContext('2d');
      x.font = '600 44px "JetBrains Mono", monospace';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = gold ? '#8f7a00' : 'rgba(42,39,33,.55)';
      x.fillText(text.split('').join(String.fromCharCode(8202)), 256, 50);
      const tex = new T.CanvasTexture(c); tex.anisotropy = 4;
      const m = new T.Mesh(new T.PlaneGeometry(w, w * 96 / 512),
        new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; return m;
    }
    // Han river centerline: [x, z, halfWidth]
    _riverPts() {
      return [
        [-34, -3.2, .7], [-24, -2.4, .68], [-18, -1.9, .66], [-14.5, -1.5, .64], [-12.6, -1.2, .63],
        [-11.5, -1.0, .62], [-10.2, -0.55, .6], [-9.0, -0.15, .58], [-7.9, 0.45, .56], [-6.9, 0.95, .55],
        [-5.9, 1.3, .6], [-4.9, 1.25, .55], [-3.9, 1.05, .5], [-2.9, 1.0, .5], [-1.9, 1.25, .52],
        [-0.9, 1.45, .55], [0.1, 1.5, .55], [1.1, 1.2, .5], [2.1, 0.7, .48], [3.1, 0.35, .46],
        [4.1, 0.15, .46], [5.1, 0.3, .5], [6.1, 0.7, .52], [7.1, 1.2, .55], [8.1, 1.35, .55],
        [9.1, 1.05, .52], [10.2, 0.6, .5], [11.5, 0.15, .5],
        [13, -0.35, .52], [15.5, -0.9, .55], [19, -1.7, .58], [25, -2.5, .62], [34, -3.2, .68]
      ];
    }
    _init() {
      const T = window.THREE;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFShadowMap;
      renderer.shadowMap.autoUpdate = false;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.92;
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
      this.appendChild(renderer.domElement);
      this._renderer = renderer;
      const scene = new T.Scene();
      scene.fog = new T.Fog(0xe9e4d6, 45, 130);
      const cam = new T.PerspectiveCamera(30, 1, 0.1, 300);

      scene.add(new T.HemisphereLight(0xf2ead8, 0x8f8a7c, 0.55));
      const sun = new T.DirectionalLight(0xffe9c4, 1.0);
      sun.position.set(7, 14, 5); sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -13; sun.shadow.camera.right = 13;
      sun.shadow.camera.top = 13; sun.shadow.camera.bottom = -13;
      sun.shadow.radius = 7; scene.add(sun);
      const fill = new T.DirectionalLight(0xcfd8de, 0.22);
      fill.position.set(-7, 5, -6); scene.add(fill);

      const std = (hex, rough) => new T.MeshStandardMaterial({ color: hex, roughness: rough ?? 0.95, metalness: 0 });
      const mats = {
        base: std(0xe4dfd2), c1: std(0xdcd6c6), c2: std(0xd2cbb8), c3: std(0xc8c0ab),
        river: new T.MeshStandardMaterial({ color: 0x84afc9, roughness: 0.24, metalness: 0.08, side: 2 }),
        riverDeep: new T.MeshStandardMaterial({ color: 0x6e9cba, roughness: 0.28, metalness: 0.06, side: 2 }),
        shore: new T.MeshStandardMaterial({ color: 0xc3d8e1, roughness: 0.5, metalness: 0, side: 2 }),
        bldg: std(0xefebdf, 0.9), ink: std(0x2a2721, 0.7),
        gold: new T.MeshStandardMaterial({ color: 0xb89b00, roughness: 0.45, metalness: 0.3 }),
        white: std(0xf5f2e8, 0.6),
        road: std(0xccc5b1, 1), roadMinor: std(0xd7d1c0, 1),
        park: std(0xc6cbaf, 0.95)
      };
      const rnd = mulberry(37127);

      // infinite ground — never shows white space
      const ground = new T.Mesh(new T.PlaneGeometry(400, 400), std(0xe0dbcc));
      ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true;
      scene.add(ground);

      const map = new T.Group(); scene.add(map);

      const W = 34, H = 22, R = 0.4;
      const base = new T.Shape();
      base.moveTo(-W + R, -H); base.lineTo(W - R, -H); base.quadraticCurveTo(W, -H, W, -H + R);
      base.lineTo(W, H - R); base.quadraticCurveTo(W, H, W - R, H);
      base.lineTo(-W + R, H); base.quadraticCurveTo(-W, H, -W, H - R);
      base.lineTo(-W, -H + R); base.quadraticCurveTo(-W, -H, -W + R, -H);
      map.add(this._plateau(T, base, 0.14, 0, mats.base));

      // mountains
      const mts = [
        { cx: -0.8, cz: -5.4, r: 2.6, lv: 3 }, { cx: -3.4, cz: -3.4, r: 1.3, lv: 2 },
        { cx: 0.6, cz: -1.5, r: 1.15, lv: 3 }, { cx: 6.4, cz: -1.8, r: 1.2, lv: 2 },
        { cx: -2.2, cz: 5.6, r: 2.2, lv: 3 }, { cx: 3.4, cz: 5.2, r: 1.2, lv: 2 },
        { cx: 9.3, cz: -0.9, r: 0.85, lv: 2 },
        // far ranges beyond the city — fill the horizon, no visible board edge
        { cx: -17, cz: -9, r: 4.5, lv: 2 }, { cx: -9, cz: -11, r: 3.8, lv: 2 }, { cx: 4, cz: -12, r: 4.2, lv: 2 },
        { cx: 14, cz: -9.5, r: 3.6, lv: 2 }, { cx: 21, cz: -5, r: 3.2, lv: 1 }, { cx: -22, cz: -4, r: 3, lv: 1 },
        { cx: -15, cz: 9, r: 3.4, lv: 2 }, { cx: -4, cz: 12, r: 3.8, lv: 1 }, { cx: 9, cz: 11.5, r: 3.5, lv: 2 },
        { cx: 19, cz: 8, r: 3.2, lv: 1 }
      ];
      for (const s of mts) for (let l = 0; l < s.lv; l++)
        map.add(this._plateau(T, this._blob(T, s.cx, -s.cz, s.r * (1 - l * 0.3), 9, rnd, 0.35), 0.085, 0.14 + l * 0.085, [mats.c1, mats.c2, mats.c3][l]));

      // N Seoul Tower — lattice base, shaft, observation deck, spire
      const nsY = 0.14 + 3 * 0.085;
      const nsBase = new T.Mesh(new T.CylinderGeometry(0.055, 0.1, 0.16, 10), mats.ink);
      nsBase.position.set(0.6, nsY + 0.08, -1.5);
      const nsShaft = new T.Mesh(new T.CylinderGeometry(0.028, 0.048, 0.62, 10), mats.white);
      nsShaft.position.set(0.6, nsY + 0.16 + 0.31, -1.5);
      const nsDeck = new T.Mesh(new T.CylinderGeometry(0.12, 0.14, 0.1, 10), mats.white);
      nsDeck.position.set(0.6, nsY + 0.78, -1.5);
      const nsDeck2 = new T.Mesh(new T.CylinderGeometry(0.09, 0.11, 0.05, 10), mats.ink);
      nsDeck2.position.set(0.6, nsY + 0.86, -1.5);
      const nsSpire = new T.Mesh(new T.CylinderGeometry(0.005, 0.014, 0.26, 8), mats.gold);
      nsSpire.position.set(0.6, nsY + 1.0, -1.5);
      for (const m of [nsBase, nsShaft, nsDeck, nsDeck2, nsSpire]) m.castShadow = true;
      map.add(nsBase, nsShaft, nsDeck, nsDeck2, nsSpire);

      // ---- Han river (variable width) + banks + tributary ----
      const pts = this._riverPts();
      const rz = (x) => {
        for (let i = 0; i < pts.length - 1; i++) if (x >= pts[i][0] && x <= pts[i + 1][0]) {
          const t = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
          return pts[i][1] + t * (pts[i + 1][1] - pts[i][1]);
        } return 0.5;
      };
      const rh = (x) => {
        for (let i = 0; i < pts.length - 1; i++) if (x >= pts[i][0] && x <= pts[i + 1][0]) {
          const t = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
          return pts[i][2] + t * (pts[i + 1][2] - pts[i][2]);
        } return 0.5;
      };
      // smooth-curved ribbon shape between two bank edges
      const ribbon = (edgeA, edgeB) => {
        const sh = new T.Shape();
        const run = (list, first) => {
          if (first) sh.moveTo(list[0][0], list[0][1]); else sh.lineTo(list[0][0], list[0][1]);
          for (let i = 1; i < list.length - 1; i++)
            sh.quadraticCurveTo(list[i][0], list[i][1], (list[i][0] + list[i + 1][0]) / 2, (list[i][1] + list[i + 1][1]) / 2);
          sh.lineTo(list[list.length - 1][0], list[list.length - 1][1]);
        };
        run(edgeA, true); run(edgeB.slice().reverse(), false);
        return sh;
      };
      const flat = (sh, mat, y, shadow) => {
        const m = new T.Mesh(new T.ShapeGeometry(sh, 10), mat);
        m.rotation.x = -Math.PI / 2; m.position.y = y; if (shadow) m.receiveShadow = true;
        map.add(m); return m;
      };
      const bank = (off) => pts.map(([x, z, h]) => [x, -(z + (off >= 0 ? 1 : -1) * (h * Math.abs(off)))]);
      const bankAbs = (side, extra) => pts.map(([x, z, h]) => [x, -(z + side * (h + extra))]);
      // shoreline halo → water body → deep channel (smooth curved edges)
      flat(ribbon(bankAbs(-1, 0.08), bankAbs(1, 0.08)), mats.shore, 0.168, false);
      flat(ribbon(bank(-1), bank(1)), mats.river, 0.17, true);
      flat(ribbon(bank(-0.45), bank(0.45)), mats.riverDeep, 0.172, false);
      // riverside park strips (smooth outer edges)
      for (const side of [-1, 1]) {
        flat(ribbon(bankAbs(side, 0.02), bankAbs(side, 0.2)), mats.park, 0.165, false);
      }
      // Tancheon tributary (smooth, joins between Gangnam & Jamsil)
      const tan = [[5.1, 0.35], [5.3, 1.5], [5.15, 2.6], [5.45, 3.9], [5.3, 5.2]];
      const th = 0.14;
      flat(ribbon(tan.map(([x, z]) => [x - th, -z]), tan.map(([x, z]) => [x + th, -z])), mats.river, 0.171, false);
      // Yeouido island
      map.add(this._plateau(T, this._blob(T, -5.6, -1.35, 0.55, 8, rnd, 0.2), 0.05, 0.166, mats.c1));

      // ---- street network ----
      const road = (rp, w, mat) => {
        for (let i = 0; i < rp.length - 1; i++) {
          const [x1, z1] = rp[i], [x2, z2] = rp[i + 1];
          const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
          const m = new T.Mesh(new T.BoxGeometry(len + w * 0.6, 0.012, w), mat);
          m.position.set((x1 + x2) / 2, 0.167, (z1 + z2) / 2);
          m.rotation.y = -Math.atan2(dz, dx); map.add(m);
        }
      };
      // riverside expressways (both banks)
      road(pts.map(p => [p[0], p[1] - p[2] - 0.3]), 0.1, mats.road);
      road(pts.map(p => [p[0], p[1] + p[2] + 0.3]), 0.1, mats.road);
      // Teheran-ro (through HQ) + Gangnam arterials
      road([[0.9, 2.15], [3.2, 2.55], [5.4, 2.95], [7.6, 3.3]], 0.14, mats.road);
      road([[2.55, 1.05], [2.75, 4.4]], 0.12, mats.road);   // Gangnam-daero
      road([[4.35, 1.05], [4.15, 4.4]], 0.09, mats.road);   // Yeongdong-daero
      // Gangnam block grid (tilted like the real one)
      for (let i = -3; i <= 3; i++) {
        const zc = 2.7 + i * 0.45;
        road([[1.15, zc + 0.18], [5.65, zc - 0.18]], 0.045, mats.roadMinor);
      }
      for (let j = -3; j <= 3; j++) {
        const xc = 3.4 + j * 0.72;
        road([[xc + 0.11, 1.35], [xc - 0.11, 4.05]], 0.045, mats.roadMinor);
      }
      // Jongno / old town grid
      road([[-3.2, -0.75], [-0.4, -0.85], [2.0, -0.6]], 0.12, mats.road); // Jongno
      road([[-2.6, -0.3], [1.4, -0.3]], 0.05, mats.roadMinor);
      road([[-2.6, -1.3], [1.4, -1.3]], 0.05, mats.roadMinor);
      road([[-1.8, -1.7], [-1.8, -0.05]], 0.05, mats.roadMinor);
      road([[0.4, -1.7], [0.4, -0.05]], 0.05, mats.roadMinor);
      road([[-1.25, -3.4], [-1.15, -0.1]], 0.09, mats.road); // Sejong-daero N-S
      // Hongdae diagonals
      road([[-7.7, -1.15], [-5.6, -1.95]], 0.09, mats.road);
      road([[-7.3, -2.5], [-6.0, -0.85]], 0.05, mats.roadMinor);
      road([[-6.9, -0.5], [-5.9, -2.4]], 0.045, mats.roadMinor);
      // Yeouido loop
      road([[-6.1, 1.12], [-5.15, 1.12], [-5.15, 1.62], [-6.1, 1.62], [-6.1, 1.12]], 0.05, mats.roadMinor);
      // Jamsil
      road([[6.2, 2.2], [7.7, 2.45], [8.7, 3.0]], 0.09, mats.road);
      road([[6.5, 1.75], [8.3, 1.95]], 0.05, mats.roadMinor);
      // eastern N-S arterial
      road([[8.2, -3.3], [8.1, 0.45]], 0.09, mats.road);
      // northern inner ring
      road([[-11, -3.4], [-8.2, -3.1], [-5.2, -3.3]], 0.09, mats.road);
      road([[-9.3, -0.85], [-7.7, -1.15]], 0.09, mats.road); // Mapo → Hongdae
      road([[-1.6, -0.15], [-0.2, 0.2], [1.0, 0.55]], 0.06, mats.roadMinor); // Itaewon-ro
      // southern arterial chain (Yeongdeungpo → Dongjak → Gangnam)
      road([[-8.6, 2.2], [-6.4, 2.45], [-4.6, 2.3], [-2.4, 2.65], [-0.4, 2.5], [0.9, 2.15]], 0.09, mats.road);
      road([[8.7, 3.0], [9.8, 2.5], [10.6, 1.6]], 0.07, mats.roadMinor); // Jamsil east
      road([[2.0, -0.6], [4.0, -0.35], [5.9, -0.55]], 0.06, mats.roadMinor); // Seongsu spur

      // parks
      map.add(this._plateau(T, this._blob(T, 8.9, -2.5, 0.6, 8, rnd, 0.25), 0.04, 0.166, mats.park));  // Olympic Park
      map.add(this._plateau(T, this._blob(T, 2.4, 0.15, 0.42, 8, rnd, 0.25), 0.04, 0.166, mats.park)); // Seoul Forest

      // bridges — deck, railings, piers
      for (const bx of [-6.6, -4.8, -3.6, -1.5, -0.4, 1.0, 2.2, 3.6, 5.0, 6.4, 7.8]) {
        const L2 = rh(bx) * 2 + 0.7, bz = rz(bx);
        const bg = new T.Group(); bg.position.set(bx, 0, bz);
        const deck = new T.Mesh(new T.BoxGeometry(0.13, 0.028, L2), mats.white);
        deck.position.y = 0.208; deck.castShadow = true; bg.add(deck);
        for (const sx of [-1, 1]) {
          const rail = new T.Mesh(new T.BoxGeometry(0.016, 0.022, L2 * 0.96), mats.white);
          rail.position.set(sx * 0.057, 0.232, 0); bg.add(rail);
        }
        for (const pz of [-L2 * 0.22, L2 * 0.22]) {
          const pier = new T.Mesh(new T.CylinderGeometry(0.022, 0.028, 0.05, 8), mats.ink);
          pier.position.set(0, 0.183, pz); bg.add(pier);
        }
        map.add(bg);
      }

      // building districts
      const districts = [
        [3.4, 2.7, 2.6, 1.5, 60, 0.55], [6.8, 2.4, 1.4, 0.9, 22, 0.4],
        [-0.4, -0.5, 2.2, 1.1, 36, 0.42], [-6.4, -0.6, 1.5, 0.9, 20, 0.28],
        [-5.6, 1.35, 0.7, 0.3, 8, 0.7], [-0.2, 2.9, 1.6, 0.8, 16, 0.25],
        [4.4, -0.9, 1.2, 0.7, 12, 0.3], [8.6, 1.0, 1.1, 0.6, 12, 0.3],
        [2.6, -0.3, 1.0, 0.5, 10, 0.3],   // Seongsu
        [-2.0, 0.25, 1.0, 0.45, 9, 0.3],  // Yongsan
        [-4.4, 0.25, 0.9, 0.4, 8, 0.25],  // Mapo riverside
        [-8.3, 2.4, 1.3, 0.8, 14, 0.3],   // Yeongdeungpo / Guro
        [-3.2, 2.9, 1.4, 0.7, 11, 0.25],  // Dongjak
        [9.6, -2.4, 0.8, 0.5, 7, 0.25]    // east
      ];
      const binfo = [];
      for (const [cx, cz, sx, sz, n, tall] of districts) {
        for (let i = 0; i < n; i++) {
          const x = cx + (rnd() - 0.5) * 2 * sx, z = cz + (rnd() - 0.5) * 2 * sz;
          if (Math.abs(z - rz(x)) < rh(x) + 0.32) continue;               // river
          if (Math.abs(x - 5.27) < 0.35 && z > 0.3) continue;             // Tancheon
          const h = 0.07 + rnd() * tall;
          binfo.push({ x, y: 0.14 + h / 2, z, sx: 0.22 + rnd() * 0.18, sy: h, sz2: 0.22 + rnd() * 0.18, ink: rnd() > 0.92 });
        }
      }
      // all district buildings in ONE instanced mesh (big draw-call saving)
      const bIM = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshStandardMaterial({ roughness: 0.9 }), binfo.length);
      bIM.castShadow = true; bIM.frustumCulled = false;
      bIM.instanceMatrix.setUsage(T.DynamicDrawUsage);
      bIM.userData.inst = true;
      {
        const bd = new T.Object3D(), bc = new T.Color();
        binfo.forEach((b, i) => {
          bd.position.set(b.x, b.y, b.z); bd.rotation.set(0, 0, 0); bd.scale.set(b.sx, b.sy, b.sz2);
          bd.updateMatrix(); bIM.setMatrixAt(i, bd.matrix); bIM.setColorAt(i, bc.setHex(b.ink ? 0x2a2721 : 0xefebdf));
          b.ord = clamp01(Math.hypot(b.x - 2.8, b.z - 1) / 14) * 0.9 + rnd() * 0.1;
        });
      }
      map.add(bIM);
      // Lotte World Tower — tapered two-stage shaft + gold crown
      const lw1 = new T.Mesh(new T.CylinderGeometry(0.105, 0.15, 0.85, 12), mats.white);
      lw1.position.set(7.15, 0.14 + 0.425, 2.15);
      const lw2 = new T.Mesh(new T.CylinderGeometry(0.05, 0.105, 0.65, 12), mats.white);
      lw2.position.set(7.15, 0.14 + 0.85 + 0.325, 2.15);
      const lwCrown = new T.Mesh(new T.CylinderGeometry(0.012, 0.05, 0.14, 12), mats.gold);
      lwCrown.position.set(7.15, 0.14 + 1.5 + 0.07, 2.15);
      lw1.castShadow = lw2.castShadow = lwCrown.castShadow = true;
      map.add(lw1, lw2, lwCrown);
      // Jamsil Olympic stadium bowl
      const stad = new T.Mesh(new T.TorusGeometry(0.28, 0.07, 10, 28), mats.white);
      stad.rotation.x = -Math.PI / 2; stad.scale.set(1.25, 0.9, 1);
      stad.position.set(6.35, 0.2, 1.95); stad.castShadow = true; map.add(stad);
      // DDP dome (Dongdaemun)
      const ddp = new T.Mesh(new T.SphereGeometry(0.24, 16, 12), mats.white);
      ddp.scale.set(1.2, 0.35, 0.8); ddp.position.set(1.25, 0.2, -0.45); ddp.castShadow = true; map.add(ddp);
      const b63 = new T.Mesh(new T.BoxGeometry(0.14, 0.75, 0.3), mats.gold);
      b63.position.set(-5.9, 0.152 + 0.42, 1.3); b63.castShadow = true; map.add(b63);

      const L = (t, x, z, w, ry, gold) => { const m = this._label(T, t, w, gold); m.position.set(x, 0.178, z); if (ry) m.rotation.z = ry; map.add(m); };
      L('GANGNAM', 3.4, 4.6, 2.4);
      L('JAMSIL', 7.6, 3.55, 1.7);
      L('NAMSAN', 0.6, -2.6, 1.7);
      L('HONGDAE', -6.6, -1.7, 1.9);
      L('YEOUIDO', -5.6, 2.3, 1.8);
      L('JONGNO', -0.4, -1.6, 1.7);
      L('HAN RIVER', -2.55, 0.9, 1.9, 0.18);

      const HQX = 3.2, HQZ = 2.55;
      const hq = new T.Mesh(new T.BoxGeometry(0.4, 1.0, 0.4), mats.ink);
      hq.position.set(HQX, 0.14 + 0.5, HQZ); hq.castShadow = true;
      const band = new T.Mesh(new T.BoxGeometry(0.44, 0.1, 0.44), mats.gold);
      band.position.set(HQX, 0.14 + 0.92, HQZ);
      map.add(hq, band);
      const pin = new T.Group();
      const phead = new T.Mesh(new T.SphereGeometry(0.22, 14, 12), mats.gold); phead.position.y = 0.5;
      const ptail = new T.Mesh(new T.ConeGeometry(0.13, 0.46, 14), mats.gold); ptail.rotation.x = Math.PI; ptail.position.y = 0.12;
      phead.castShadow = ptail.castShadow = true;
      pin.add(phead, ptail); pin.position.set(HQX, 1.55, HQZ); map.add(pin);
      const ring = new T.Mesh(new T.RingGeometry(0.34, 0.39, 40), new T.MeshBasicMaterial({ color: 0xb89b00, transparent: true, side: T.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(HQX, 0.2, HQZ); map.add(ring);
      const hqLabel = this._label(T, 'GEN.G HQ', 1.9, true);
      hqLabel.position.set(HQX, 0.178, HQZ - 0.75); map.add(hqLabel);
      // GGX — city-center venue marker
      const GGXX = -0.55, GGXZ = -0.55;
      const ggx = new T.Mesh(new T.BoxGeometry(0.32, 0.62, 0.32), mats.ink);
      ggx.position.set(GGXX, 0.14 + 0.31, GGXZ); ggx.castShadow = true;
      const ggxBand = new T.Mesh(new T.BoxGeometry(0.36, 0.09, 0.36), mats.gold);
      ggxBand.position.set(GGXX, 0.14 + 0.56, GGXZ);
      map.add(ggx, ggxBand);
      const ggxPin = new T.Group();
      const gph = new T.Mesh(new T.SphereGeometry(0.16, 12, 10), mats.gold); gph.position.y = 0.36;
      const gpt = new T.Mesh(new T.ConeGeometry(0.1, 0.34, 12), mats.gold); gpt.rotation.x = Math.PI; gpt.position.y = 0.08;
      gph.castShadow = gpt.castShadow = true;
      ggxPin.add(gph, gpt); ggxPin.position.set(GGXX, 1.1, GGXZ); map.add(ggxPin);
      const ggxLabel = this._label(T, 'GGX', 1.1, true);
      ggxLabel.position.set(GGXX, 0.178, GGXZ - 0.55); map.add(ggxLabel);

      // ---- low-poly gaming room (revealed from "Pick your block" onward) ----
      const room = new T.Group(); room.visible = false; scene.add(room);
      const roomLight = new T.PointLight(0xffe2a0, 0, 16); roomLight.position.set(0, 3.9, 0); scene.add(roomLight);
      const roomSpot = new T.SpotLight(0xffd75e, 0, 26, 0.7, 0.55, 1.2); roomSpot.position.set(5, 9, 5); roomSpot.target.position.set(-1, 0, -1); scene.add(roomSpot, roomSpot.target);
      const roomRim = new T.PointLight(0x9db8c9, 0, 18); roomRim.position.set(6.5, 2.5, -6.5); scene.add(roomRim);
      const screenM = new T.MeshStandardMaterial({ color: 0x17130d, emissive: 0xffd75e, emissiveIntensity: 0.5, roughness: 0.4 });
      {
        const wall = std(0x2e2a23, 0.95), deskM = std(0x3a352b, 0.85), dark = mats.ink,
          seat = std(0x211d17, 0.8),
          ledM = new T.MeshStandardMaterial({ color: 0xb89b00, emissive: 0xd9ac00, emissiveIntensity: 1.4 });
        const B = (w, h, d, m, x, y, z) => { const q = new T.Mesh(new T.BoxGeometry(w, h, d), m); q.position.set(x, y, z); q.castShadow = q.receiveShadow = true; room.add(q); return q; };
        B(11, 0.35, 11, std(0x26221b, 0.95), 0, -0.175, 0);            // floor slab
        B(4.6, 0.06, 3.4, std(0x14110c, 1), 0.9, 0.03, 0.9);           // rug
        B(11, 4.4, 0.28, wall, 0, 2.2, -5.36);                          // back wall
        B(0.28, 4.4, 11, wall, -5.36, 2.2, 0);                          // left wall
        B(10.4, 0.09, 0.08, ledM, 0, 4.08, -5.18);                      // cove LEDs
        B(0.08, 0.09, 10.4, ledM, -5.18, 4.08, 0);
        // wall screen with academy mark
        const sc = document.createElement('canvas'); sc.width = 1024; sc.height = 512;
        const sx2 = sc.getContext('2d');
        sx2.fillStyle = '#17140f'; sx2.fillRect(0, 0, 1024, 512);
        sx2.textAlign = 'center'; sx2.fillStyle = '#c8ab13';
        sx2.font = '700 88px "JetBrains Mono",monospace'; sx2.fillText('GEN.G ACADEMY', 512, 235);
        sx2.fillStyle = 'rgba(200,171,19,.55)'; sx2.font = '600 42px "JetBrains Mono",monospace';
        sx2.fillText('BOOTCAMP FLOOR · 6 STATIONS', 512, 330);
        const scrGrp = new T.Group();
        const body = new T.Mesh(new T.BoxGeometry(3.9, 2.0, 0.12), dark); body.castShadow = true; scrGrp.add(body);
        const face = new T.Mesh(new T.PlaneGeometry(3.6, 1.75), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sc) }));
        face.position.z = 0.07; scrGrp.add(face);
        scrGrp.position.set(0.5, 2.75, -5.16); room.add(scrGrp);
        // real Gen.G logo texture (hi-res, white bg knocked out)
        const logoCanvas = document.createElement('canvas'); logoCanvas.width = logoCanvas.height = 1024;
        const logoTex = new T.CanvasTexture(logoCanvas);
        logoTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const logoImg = new Image();
        logoImg.onload = () => {
          const x = logoCanvas.getContext('2d');
          x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
          const s = Math.min(1024 / logoImg.width, 1024 / logoImg.height);
          x.clearRect(0, 0, 1024, 1024);
          x.drawImage(logoImg, (1024 - logoImg.width * s) / 2, (1024 - logoImg.height * s) / 2, logoImg.width * s, logoImg.height * s);
          const d = x.getImageData(0, 0, 1024, 1024);
          for (let i = 0; i < d.data.length; i += 4) {
            const r = d.data[i], g2 = d.data[i + 1], b = d.data[i + 2];
            const lum = (r + g2 + b) / 3;
            if (r > 225 && g2 > 225 && b > 225) d.data[i + 3] = 0;
            else if (lum > 195 && Math.abs(r - g2) < 18 && Math.abs(g2 - b) < 18) d.data[i + 3] = Math.round(255 * (1 - (lum - 195) / 60)); // soften halo edge
          }
          x.putImageData(d, 0, 0);
          logoTex.needsUpdate = true;
        };
        logoImg.src = (window.__resources && window.__resources.gengLogo) || 'uploads/GenG-esports-team-logo-1_11zon.webp';
        // left wall plaque + rug decal using the real mark
        const plaqueB = new T.Mesh(new T.BoxGeometry(0.1, 1.9, 1.9), wall); plaqueB.position.set(-5.16, 2.6, 2.6); plaqueB.castShadow = true; room.add(plaqueB);
        const plaque = new T.Mesh(new T.PlaneGeometry(1.6, 1.6), new T.MeshBasicMaterial({ map: logoTex, transparent: true }));
        plaque.rotation.y = Math.PI / 2; plaque.position.set(-5.1, 2.6, 2.6); room.add(plaque);
        const decal = new T.Mesh(new T.PlaneGeometry(2.1, 2.1), new T.MeshBasicMaterial({ map: logoTex, transparent: true, opacity: 0.9 }));
        decal.rotation.x = -Math.PI / 2; decal.rotation.z = -Math.PI / 4; decal.position.set(0.9, 0.075, 0.9); room.add(decal);
        // hanging light bars
        for (const [hx, hz, hr] of [[-1.2, -2.2, 0], [-2.2, 1.0, Math.PI / 2]]) {
          const bar = new T.Group();
          const fixture = new T.Mesh(new T.BoxGeometry(2.6, 0.07, 0.16), dark); fixture.castShadow = true; bar.add(fixture);
          const tube = new T.Mesh(new T.BoxGeometry(2.4, 0.03, 0.08), ledM); tube.position.y = -0.045; bar.add(tube);
          for (const cx of [-0.9, 0.9]) { const cable = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 0.8, 6), dark); cable.position.set(cx, 0.43, 0); bar.add(cable); }
          bar.position.set(hx, 3.95, hz); bar.rotation.y = hr; room.add(bar);
        }
        // 6 PC stations
        const mkSetup = (x, z, ry) => {
          const g = new T.Group();
          const A = (w, h, d, m, px, py, pz) => { const q = new T.Mesh(new T.BoxGeometry(w, h, d), m); q.position.set(px, py, pz); q.castShadow = q.receiveShadow = true; g.add(q); return q; };
          A(1.9, 0.09, 0.85, deskM, 0, 1.04, 0);
          A(1.5, 0.015, 0.5, seat, -0.05, 1.095, 0.05);
          A(0.07, 1.0, 0.8, deskM, -0.88, 0.52, 0); A(0.07, 1.0, 0.8, deskM, 0.88, 0.52, 0);
          A(0.72, 0.42, 0.04, dark, 0, 1.62, -0.3);
          A(0.64, 0.34, 0.02, screenM, 0, 1.62, -0.27);
          const m2 = new T.Mesh(new T.BoxGeometry(0.4, 0.3, 0.035), dark); m2.position.set(0.62, 1.56, -0.24); m2.rotation.y = -0.5; m2.castShadow = true; g.add(m2);
          const m2s = new T.Mesh(new T.BoxGeometry(0.34, 0.24, 0.02), screenM); m2s.position.set(0.615, 1.56, -0.225); m2s.rotation.y = -0.5; g.add(m2s);
          A(0.06, 0.28, 0.06, dark, 0, 1.22, -0.32); A(0.22, 0.02, 0.14, dark, 0, 1.09, -0.3);
          A(0.5, 0.025, 0.16, dark, -0.1, 1.1, 0.12); A(0.09, 0.02, 0.13, dark, 0.42, 1.1, 0.12);
          const hs = new T.Mesh(new T.TorusGeometry(0.085, 0.022, 8, 14, Math.PI), seat); hs.position.set(-0.68, 1.32, 0.05); g.add(hs);
          A(0.03, 0.2, 0.03, dark, -0.68, 1.2, 0.05);
          A(0.3, 0.62, 0.62, dark, 1.32, 0.31, -0.05);
          A(0.02, 0.5, 0.05, ledM, 1.16, 0.31, 0.18);
          A(0.5, 0.09, 0.5, seat, 0, 0.62, 0.95); A(0.5, 0.72, 0.09, seat, 0, 1.06, 1.22);
          const post = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.32, 8), dark); post.position.set(0, 0.42, 0.95); g.add(post);
          const bse = new T.Mesh(new T.CylinderGeometry(0.26, 0.3, 0.05, 10), dark); bse.position.set(0, 0.24, 0.95); bse.castShadow = true; g.add(bse);
          g.position.set(x, 0, z); g.rotation.y = ry; room.add(g);
        };
        mkSetup(-2.6, -4.05, 0); mkSetup(-0.2, -4.05, 0); mkSetup(2.2, -4.05, 0);
        mkSetup(-4.05, -1.6, Math.PI / 2); mkSetup(-4.05, 0.8, Math.PI / 2); mkSetup(-4.05, 3.2, Math.PI / 2);
        // props: shelf + books + trophy, plant, beanbag, speaker
        B(1.7, 0.06, 0.42, wall, 3.7, 2.9, -5.05);
        for (let i = 0; i < 5; i++) B(0.14, 0.42, 0.3, [dark, mats.gold, deskM, seat, dark][i], 3.15 + i * 0.24, 3.16, -5.05);
        const cup = new T.Mesh(new T.CylinderGeometry(0.1, 0.06, 0.24, 10), mats.gold); cup.position.set(4.35, 3.05, -5.05); cup.castShadow = true; room.add(cup);
        const pot = new T.Mesh(new T.CylinderGeometry(0.22, 0.17, 0.4, 8), deskM); pot.position.set(4.6, 0.2, -4.6); pot.castShadow = true; room.add(pot);
        const leaf = new T.Mesh(new T.IcosahedronGeometry(0.42, 0), std(0x5d6544, 0.95)); leaf.position.set(4.6, 0.85, -4.6); leaf.castShadow = true; room.add(leaf);
        const bean = new T.Mesh(new T.IcosahedronGeometry(0.62, 0), std(0x38332a, 0.95)); bean.scale.y = 0.7; bean.position.set(3.6, 0.42, 3.4); bean.castShadow = true; room.add(bean);
        B(0.5, 1.1, 0.5, dark, -4.7, 0.55, 4.5);
      }

      // ---- bloom setup: map pieces grow in smoothly, radiating from Genrang ----
      const GX = 2.8, GZ = 1; // Genrang stand point (right of center, clear of hero text)
      const bloomKids = [];
      const bb = new T.Box3(), ctr = new T.Vector3();
      for (const c of map.children) {
        if (c === pin || c === ring || c.userData.inst) continue;
        bb.setFromObject(c); bb.getCenter(ctr);
        const ord = clamp01(Math.hypot(ctr.x - GX, ctr.z - GZ) / 14) * 0.9 + rnd() * 0.1;
        bloomKids.push({ o: c, s0: c.scale.clone(), y0: c.position.y, ord });
      }
      const roomKids = room.children.map((c) => {
        bb.setFromObject(c); bb.getCenter(ctr);
        return { o: c, s0: c.scale.clone(), x0: c.position.x, y0: c.position.y, z0: c.position.z, ord: clamp01(Math.hypot(ctr.x, ctr.z) / 8) * 0.7 + rnd() * 0.3 };
      });
      const groundBase = new T.Color(0xe0dbcc), groundDark = new T.Color(0x453f35);
      const fogBase = new T.Color(0xe9e4d6), fogDark = new T.Color(0x57503f);

      // ---- pixelated Genrang intro figure (instanced voxels) ----
      const CELL = 0.095;
      const vox = genrangVoxels(CELL);
      const vgeo = new T.BoxGeometry(CELL * 0.92, CELL * 0.92, CELL * 0.92);
      const vmat = new T.MeshStandardMaterial({ roughness: 0.85, metalness: 0, emissive: 0xd9ac00, emissiveIntensity: 0 });
      const im = new T.InstancedMesh(vgeo, vmat, vox.length);
      im.castShadow = true;
      im.frustumCulled = false;
      im.instanceMatrix.setUsage(T.DynamicDrawUsage);
      const G = new T.Group();
      G.position.set(GX, 0, GZ); G.scale.setScalar(1.35);
      G.add(im); scene.add(G);
      const dummy = new T.Object3D(), vcol = new T.Color();
      const vdata = vox.map((v, i) => {
        dummy.position.set(v.x, v.y, v.z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1);
        dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); im.setColorAt(i, vcol.setHex(v.col));
        // ribbon landing: voxels settle along a spiral band sweeping out from the stand point
        const stag = clamp01(1 - v.y / 3.95) * 0.72 + rnd() * 0.14; // bottom flows first, mostly coherent
        const ang = -0.6 + stag * 4.4 + (rnd() - 0.5) * 0.18;
        const rad = 1.2 + stag * 9.5 + (rnd() - 0.5) * 0.5;
        const tx = (GX + Math.cos(ang) * rad - GX) / 1.35, tz = (GZ + Math.sin(ang) * rad * 0.62 - GZ) / 1.35, ty = 0.16 / 1.35;
        const tangX = -(tz - v.z), tangZ = (tx - v.x);
        const tl = Math.hypot(tangX, tangZ) || 1;
        return {
          x: v.x, y: v.y, z: v.z, tx, ty, tz,
          swx: (tangX / tl) * (0.35 + rnd() * 0.25), swz: (tangZ / tl) * (0.35 + rnd() * 0.25),
          stag, spin: (rnd() - 0.5) * 2
        };
      });
      im.instanceMatrix.needsUpdate = true;

      // scroll camera keyframes
      const keys = [
        { p: 0.00, pos: [0, 24, 14], look: [0, 0, -0.5] },
        { p: 0.16, pos: [1.5, 13, 9.5], look: [2.4, 0, 1.8] },
        { p: 0.32, pos: [6.2, 5.5, 6.4], look: [HQX, 0.7, HQZ] },
        { p: 0.50, pos: [1.5, 8.5, 7.5], look: [1.2, 0, 1.0] },
        { p: 0.66, pos: [-4.5, 7.5, 5.2], look: [-4.0, 0, 0.8] },
        { p: 0.84, pos: [-0.5, 16, 9], look: [0.8, 0, 0.6] },
        { p: 1.00, pos: [HQX + 0.4, 19, HQZ + 4.5], look: [HQX, 0, HQZ] }
      ];
      const v = new T.Vector3(), lk = new T.Vector3();
      const evalKeys = (p) => {
        let i = 0; while (i < keys.length - 2 && p > keys[i + 1].p) i++;
        const a = keys[i], b = keys[i + 1];
        const t = smooth(clamp01((p - a.p) / (b.p - a.p)));
        v.set(a.pos[0] + (b.pos[0] - a.pos[0]) * t, a.pos[1] + (b.pos[1] - a.pos[1]) * t, a.pos[2] + (b.pos[2] - a.pos[2]) * t);
        lk.set(a.look[0] + (b.look[0] - a.look[0]) * t, a.look[1] + (b.look[1] - a.look[1]) * t, a.look[2] + (b.look[2] - a.look[2]) * t);
      };

      const iPos = new T.Vector3(0, 4.6, 14.5), iLook = new T.Vector3(0.9, 2.9, 1);
      const INTRO_SPAN = 0.26;
      const introLight = new T.PointLight(0xffd75e, 0, 30); introLight.position.set(GX, 2.2, GZ); scene.add(introLight);
      // gold shockwave rings that ripple out as the voxels touch down
      const swMat = new T.MeshBasicMaterial({ color: 0xd9ac00, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false });
      const sw1 = new T.Mesh(new T.RingGeometry(0.96, 1, 48), swMat);
      sw1.rotation.x = -Math.PI / 2; sw1.position.set(GX, 0.18, GZ); scene.add(sw1);
      const sw2 = new T.Mesh(new T.RingGeometry(0.96, 1, 48), swMat.clone());
      sw2.rotation.x = -Math.PI / 2; sw2.position.set(GX, 0.18, GZ); scene.add(sw2);

      let mx = 0, my = 0, smx = 0, smy = 0, prog = 0, sprog = 0;
      this._pm = (e) => { mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2; };
      window.addEventListener('pointermove', this._pm, { passive: true });

      const resize = () => {
        const w = this.clientWidth || innerWidth, h = this.clientHeight || innerHeight;
        renderer.setSize(w, h, false);
        cam.aspect = w / h; cam.updateProjectionMatrix();
      };
      this._ro = new ResizeObserver(resize); this._ro.observe(this);
      resize();

      const t0 = performance.now();
      let sized = false, lastBurst = -1, lastBloom = -1, lastRoom = -1, frame = 0;
      const tick = () => {
        if (!this._alive) return;
        if (!sized) { sized = true; resize(); }
        const t = (performance.now() - t0) / 1000;
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - innerHeight);
        prog = clamp01((window.scrollY || doc.scrollTop) / max);
        sprog += (prog - sprog) * 0.045;
        smx += (mx - smx) * 0.03; smy += (my - smy) * 0.03;
        const ip = clamp01(sprog / INTRO_SPAN);
        const sp2 = clamp01((sprog - INTRO_SPAN) / (1 - INTRO_SPAN));
        evalKeys(sp2);
        // gaming-room transition progress (from #duration "Pick your block" onward)
        let rT = 0;
        const durEl = this._durEl || (this._durEl = document.getElementById('duration'));
        if (durEl) {
          const rStart = clamp01((durEl.offsetTop - innerHeight * 0.62) / max);
          const rSpan = Math.max(0.03, (innerHeight * 0.95) / max);
          rT = smooth(clamp01((sprog - rStart) / rSpan));
        }

        // Genrang downflow: voxels cascade down (bottom first), swirl outward and land
        // across the map footprint — becoming the map as pieces grow in where they settle.
        const burst = smooth(clamp01(ip * 1.05));
        const iFlash = Math.sin(Math.PI * burst) ** 2;
        introLight.intensity = 2.2 * iFlash * (1 - sp2);
        vmat.emissiveIntensity = 0.25 * iFlash; // faint gold warmth mid-flight
        const swp = smooth(clamp01(burst * 1.15));
        sw1.scale.setScalar(0.01 + swp * 24); sw1.material.opacity = Math.sin(Math.PI * swp) * 0.55;
        const swp2 = smooth(clamp01(burst * 1.15 - 0.22));
        sw2.scale.setScalar(0.01 + swp2 * 17); sw2.material.opacity = Math.sin(Math.PI * swp2) * 0.4;
        G.visible = burst < 0.999;
        if (G.visible) {
          G.position.y = Math.sin(t * 1.7) * 0.07 * (1 - burst);
          G.rotation.y = Math.sin(t * 0.6) * 0.1 * (1 - burst) + smx * 0.3 * (1 - burst);
        }
        if (G.visible && burst !== lastBurst) {
          for (let i = 0; i < vdata.length; i++) {
            const d = vdata[i];
            const k = smooth(clamp01((burst * 1.5 - d.stag * 0.5)));
            const ik = 1 - k, sw = Math.sin(k * Math.PI);
            // cubic bezier: voxel → vortex pinch above Genrang → high over landing → touchdown
            const b0 = ik * ik * ik, b1 = 3 * ik * ik * k, b2 = 3 * ik * k * k, b3 = k * k * k;
            let x = b0 * d.x + b1 * (d.x * 0.3) + (b2 + b3) * d.tx;
            const y = b0 * d.y + b1 * (d.y + 2.6) + b2 * (d.ty + 1.3) + b3 * d.ty;
            let z = b0 * d.z + b1 * (d.z * 0.3) + (b2 + b3) * d.tz;
            // corkscrew: swirl around the vortex axis, unwinding to zero at touchdown
            // ribbon spread: fan voxels sideways mid-flight into a wide band
            const ph = 2.4 * sw * (0.5 + d.stag);
            const ca = Math.cos(ph), sa = Math.sin(ph);
            let nx = x * ca - z * sa, nz = x * sa + z * ca;
            nx += d.swx * sw * 2.6; nz += d.swz * sw * 2.6;
            dummy.position.set(nx, y, nz);
            dummy.rotation.set(k * 3 * sw, d.spin * k * 4, k * 2 * sw);
            dummy.scale.setScalar(Math.max(0.001, (1 - smooth(clamp01((k - 0.72) / 0.28))) * (1 + 0.3 * sw)));
            dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix);
          }
          im.instanceMatrix.needsUpdate = true;
          lastBurst = burst;
        }

        // map bloom + room handoff: map shrinks away as the room blooms in
        const bloom = smooth(clamp01((ip - 0.16) / 0.84));
        map.visible = bloom > 0.003 && rT < 0.998;
        // map exit: sink, tilt away and drift as it spins out — slower ease than the room's entry
        const mExit = smooth(rT);
        map.position.y = -0.6 * (1 - bloom) - 3.2 * mExit;
        map.position.x = -2.2 * mExit;
        map.rotation.y = -1.35 * mExit;
        map.rotation.x = 0.35 * Math.sin(Math.PI * mExit);
        map.scale.setScalar(Math.max(0.001, 1 - 0.999 * mExit));
        if (bloom !== lastBloom) {
          for (const kid of bloomKids) {
            const e = smooth(clamp01(bloom * 1.5 - kid.ord * 0.5));
            kid.o.scale.copy(kid.s0).multiplyScalar(Math.max(0.001, e));
            kid.o.position.y = kid.y0 - (1 - e) * 0.7;
            kid.o.visible = e > 0.002;
          }
          for (let i = 0; i < binfo.length; i++) {
            const b = binfo[i];
            const e = smooth(clamp01(bloom * 1.5 - b.ord * 0.5));
            dummy.position.set(b.x, b.y - (1 - e) * 0.4, b.z);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(Math.max(0.001, b.sx * e), Math.max(0.001, b.sy * e), Math.max(0.001, b.sz2 * e));
            dummy.updateMatrix(); bIM.setMatrixAt(i, dummy.matrix);
          }
          bIM.instanceMatrix.needsUpdate = true;
          lastBloom = bloom;
        }
        room.visible = rT > 0.002;
        const flash = Math.sin(Math.PI * rT) ** 2;
        roomLight.intensity = 2.2 * rT + 2.4 * flash;
        roomSpot.intensity = 1.6 * rT;
        roomRim.intensity = 1.2 * rT;
        renderer.toneMappingExposure = 0.92 + 0.3 * flash;
        ground.material.color.lerpColors(groundBase, groundDark, rT);
        scene.fog.color.lerpColors(fogBase, fogDark, rT);
        screenM.emissiveIntensity = 0.75 + 0.08 * Math.sin(t * 6) + 0.6 * flash;
        document.body.classList.toggle('om-dark', rT > 0.4);
        room.rotation.y = t * 0.12; // slow continuous turntable
        if (rT !== lastRoom) {
          for (const kid of roomKids) {
            const e = smooth(smooth(clamp01(rT * 1.7 - kid.ord * 0.7))); // double-smoothed = softer in/out
            // ribbon flow: spiral sweep with a vertical arc and a gentle settle
            const th = (1 - e) * 2.6, cs = Math.cos(th), sn = Math.sin(th);
            const rr = 0.18 + 0.82 * e;
            const arc = Math.sin(Math.PI * e) * (0.5 + kid.ord * 0.6); // rises over the path, settles at end
            kid.o.position.x = (kid.x0 * cs - kid.z0 * sn) * rr;
            kid.o.position.z = (kid.x0 * sn + kid.z0 * cs) * rr;
            kid.o.position.y = kid.y0 + (1 - e) * (2.6 + kid.ord * 1.8) + arc;
            kid.o.rotation.y = (kid.o.userData.ry0 ?? (kid.o.userData.ry0 = kid.o.rotation.y)) + th;
            const settle = 1 + 0.14 * Math.sin(Math.PI * clamp01((e - 0.75) / 0.25)); // soft scale settle
            kid.o.scale.copy(kid.s0).multiplyScalar(Math.max(0.001, e * settle));
            kid.o.visible = e > 0.002;
          }
          lastRoom = rT;
        }

        // camera: blend intro shot → scroll path → room isometric orbit
        const cb = smooth(ip);
        let px = iPos.x + (v.x - iPos.x) * cb + smx * 0.9 * cb + Math.sin(t * 0.1) * 0.25;
        let py = iPos.y + (v.y - iPos.y) * cb - smy * 0.7 * cb;
        let pz = iPos.z + (v.z - iPos.z) * cb + Math.cos(t * 0.13) * 0.2;
        lk.set(iLook.x + (lk.x - iLook.x) * cb, iLook.y + (lk.y - iLook.y) * cb, iLook.z + (lk.z - iLook.z) * cb);
        if (rT > 0) {
          const rEase = smooth(rT);
          const ang = Math.PI * 0.25 + (sprog - 0.5) * 0.55 + smx * 0.12 + (1 - rEase) * 0.9; // camera swings in around the room
          const dist = 28.5 - Math.sin(sprog * 2.6) * 1.4 + (1 - rEase) * 7;
          const rx = Math.cos(ang) * dist, rzz = Math.sin(ang) * dist, ryy = 23.5 - smy * 1.2 + (1 - rEase) * 4;
          px += (rx - px) * rEase; py += (ryy - py) * rEase; pz += (rzz - pz) * rEase;
          lk.x += (-0.4 - lk.x) * rEase; lk.y += (0.8 - lk.y) * rEase; lk.z += (-0.4 - lk.z) * rEase;
        }
        cam.position.set(px, py, pz);
        cam.lookAt(lk);
        cam.rotateZ(0.05 * Math.sin(Math.PI * burst) * (1 - sp2)); // subtle roll during the vortex

        pin.position.y = 1.55 + Math.sin(t * 1.8) * 0.08;
        pin.rotation.y = t * 0.6;
        ggxPin.position.y = 1.1 + Math.sin(t * 1.8 + 1.4) * 0.06;
        ggxPin.rotation.y = t * 0.6 + 1.4;
        const k = (t * 0.65) % 1;
        ring.scale.setScalar(1 + k * 2.6);
        ring.material.opacity = 0.55 * (1 - k);
        if ((frame++ & 1) === 0) renderer.shadowMap.needsUpdate = true; // shadows on alternate frames
        renderer.render(scene, cam);
        this._raf = requestAnimationFrame(tick);
      };
      tick();
    }
  }
  if (!customElements.get('academy-scene')) customElements.define('academy-scene', AcademyScene);
})();
