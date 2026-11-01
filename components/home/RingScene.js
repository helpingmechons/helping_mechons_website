// three.js scene: ten figures holding hands in a ring, like the logo.
// Loaded on demand (dynamic import) on desktop only.
import * as THREE from "three";
import { RING_COLORS, N, STEP, R_HEAD, R_HEAD_SIZE, R_BODY_IN, R_BODY_OUT, R_ARMS, R_FEET, LEG_SPLAY, VIEW } from "./ringGeometry";

const easeOutBack = (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const clamp01 = (t) => Math.min(1, Math.max(0, t));

export function createRingScene(canvas, { onReady } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-VIEW, VIEW, VIEW, -VIEW, 0.1, 20);
  camera.position.set(0, 0, 6);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c6d8, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-2, 3, 5);
  scene.add(key);

  const ring = new THREE.Group();
  scene.add(ring);

  const disposables = [];
  const geo = (g) => (disposables.push(g), g);
  const headGeo = geo(new THREE.SphereGeometry(R_HEAD_SIZE, 32, 16));
  const bodyLen = R_BODY_OUT - R_BODY_IN;
  const bodyGeo = geo(new THREE.CapsuleGeometry(0.052, bodyLen, 6, 16));
  const legLen = Math.hypot(R_FEET * Math.cos(LEG_SPLAY) - R_BODY_OUT, R_FEET * Math.sin(LEG_SPLAY));
  const legGeo = geo(new THREE.CapsuleGeometry(0.034, legLen, 6, 12));
  const armGeo = geo(new THREE.TorusGeometry(R_ARMS, 0.03, 12, 40, STEP * 1.02));

  const figures = [];
  RING_COLORS.forEach((hex, i) => {
    // three.js y is up, so go clockwise with a negative angle to match the logo.
    const a = Math.PI / 2 - i * STEP;
    const mat = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.42, metalness: 0.05 });
    disposables.push(mat);

    const fig = new THREE.Group();
    fig.rotation.z = a; // local +x now points outward along the radius

    const head = new THREE.Mesh(headGeo, mat);
    head.position.x = R_HEAD;
    fig.add(head);

    const body = new THREE.Mesh(bodyGeo, mat);
    body.rotation.z = Math.PI / 2;
    body.position.x = (R_BODY_IN + R_BODY_OUT) / 2;
    fig.add(body);

    [-1, 1].forEach((side) => {
      // From the end of the body (hips) out to the foot.
      const fx = R_FEET * Math.cos(side * LEG_SPLAY), fy = R_FEET * Math.sin(side * LEG_SPLAY);
      const leg = new THREE.Mesh(legGeo, mat);
      leg.position.set((R_BODY_OUT + fx) / 2, fy / 2, 0);
      leg.rotation.z = Math.atan2(fy, fx - R_BODY_OUT) - Math.PI / 2; // capsule's long axis is +y
      fig.add(leg);
    });

    const arm = new THREE.Mesh(armGeo, mat);
    arm.rotation.z = -STEP / 2; // centre the arc on this figure
    fig.add(arm);

    ring.add(fig);
    figures.push({ fig, a, seed: Math.random() * Math.PI * 2, from: {
      r: 1.6 + Math.random() * 0.8, z: (Math.random() - 0.5) * 3, spin: (Math.random() - 0.5) * 2.4,
    } });
  });

  // Pointer tilt
  const target = { x: 0, y: 0 };
  const onPointer = (e) => {
    const r = canvas.getBoundingClientRect();
    target.x = ((e.clientY - r.top) / r.height - 0.5) * -0.7;
    target.y = ((e.clientX - r.left) / r.width - 0.5) * 0.7;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (w && h) renderer.setSize(w, h, false);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
  io.observe(canvas);

  const start = performance.now();
  let raf, readyFired = false;
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    const t = (now - start) / 1000;

    figures.forEach(({ fig, a, seed, from }, i) => {
      const p = easeOutBack(clamp01((t - 0.15 - i * 0.07) / 1.1));
      const r = (1 - p) * from.r; // radial offset during assembly
      fig.position.set(Math.cos(a) * r, Math.sin(a) * r, (1 - p) * from.z + Math.sin(t * 1.4 + seed) * 0.03);
      fig.rotation.z = a + (1 - p) * from.spin;
      fig.scale.setScalar(0.3 + 0.7 * clamp01(p));
    });

    ring.rotation.z -= 0.0016; // turns slowly, like the gear
    ring.rotation.x += (target.x - ring.rotation.x) * 0.05;
    ring.rotation.y += (target.y - ring.rotation.y) * 0.05;

    renderer.render(scene, camera);
    if (!readyFired) { readyFired = true; onReady?.(); }
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onPointer);
    ro.disconnect();
    io.disconnect();
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
  };
}
