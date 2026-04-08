import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const $holder0 = document.querySelector(".ntk-h-0");
const $holder1 = document.querySelector(".ntk-h-1");
const $holder2 = document.querySelector(".ntk-h-2");
const $holder3 = document.querySelector(".ntk-h-3");
const $holder4 = document.querySelector(".ntk-h-4");
const $holder5 = document.querySelector(".ntk-h-5");
const $holder6 = document.querySelector(".ntk-h-6");

// --- Performance: shared animation loop ---
// Instead of 7 separate rAF loops (one per artist) + 7 smoothAnimation loops,
// we run a single rAF that ticks all active components. This cuts rAF overhead
// from ~14 callbacks per frame down to 1.
const activeComponents = [];
const MAX_DPR = 1.5; // Cap pixel ratio to reduce GPU fill on retina displays

function sharedAnimationLoop() {
  requestAnimationFrame(sharedAnimationLoop);
  const vh = window.innerHeight;
  for (let i = 0; i < activeComponents.length; i++) {
    const comp = activeComponents[i];
    // Viewport culling — skip render if off-screen
    const rect = comp.holder.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh) continue;
    // Lerp smooth mouse for mobile scroll
    if (!comp._isMouseActive) {
      comp.uMouse.y += (comp._scrollBasedY - comp.uMouse.y) * 0.1;
    }
    comp.customPass.uniforms.uMouse.value = comp.uMouse;
    comp.composer.render();
  }
}
// Start the single loop once
requestAnimationFrame(sharedAnimationLoop);

// --- Performance: single passive scroll handler shared by all components ---
let _lastScrollY = window.scrollY;
window.addEventListener("scroll", () => {
  if (window.innerWidth > 990) return;
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - _lastScrollY;
  _lastScrollY = currentScrollY;
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  for (let i = 0; i < activeComponents.length; i++) {
    const comp = activeComponents[i];
    if (comp._isMouseActive) continue;
    const rect = comp.holder.getBoundingClientRect();
    if (rect.top < vh && rect.bottom > 0 && rect.left < vw && rect.right > 0) {
      comp._scrollBasedY += scrollDelta * 0.001;
      comp._scrollBasedY = Math.max(0, Math.min(1, comp._scrollBasedY));
    } else {
      comp._scrollBasedY = scrollDelta > 0 ? 0 : (scrollDelta < 0 ? 1 : comp._scrollBasedY);
    }
    comp.uMouse.y = comp._scrollBasedY;
    comp.uMouse.x = comp._lastMouseX;
  }
}, { passive: true });


class ImageCanvasComponent {
  constructor(imageElementId, holder, yOffset = 0) {
    this.holder = holder;
    this.imageElementId = imageElementId;
    this.yOffset = yOffset;
    this.uMouse = new THREE.Vector2(0, 0);
    this.texture = null;
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.composer = null;
    this.renderPass = null;
    this.customPass = null;
    this.geometry = null;
    this.material = null;
    this.mesh = null;
    this.$img = document.getElementById(this.imageElementId);

    // Shared state for cursor/scroll (replaces per-instance rAF loops)
    this._isMouseActive = false;
    this._scrollBasedY = 0.1;
    this._lastMouseX = 0.5;
    this._lastMouseY = 0.5;

    if (!this.$img) {
      console.error(`3D Plane with ID "${this.imageElementId}" not found.`);
      return;
    }

    this.$image = document.createElement("img");
    this.initX();
  }

  initX() {
    this.$img.style.opacity = 0;
    this.$image.src = this.$img.src;
    this.$image.onload = () => {
      this.uploadImage();
    };
    this.handleCursorAnimation();
  }

  uploadImage() {
    this.texture = new THREE.Texture(this.$image);
    this.texture.needsUpdate = true;

    const aspectRatio = this.$image.naturalWidth / this.$image.naturalHeight;
    const planeHeight = 1;
    const planeWidth = planeHeight * aspectRatio;

    this.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.y = this.yOffset;
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);

    this.toggleAnimations();
    // Force an immediate first render so the chromatic aberration shader
    // is visible straight away (not just on hover)
    this.customPass.uniforms.uMouse.value = this.uMouse;
    this.composer.render();
    // Register with the shared loop for continuous updates
    activeComponents.push(this);
  }

  toggleAnimations() {
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      10
    );
    const planeDistance = 0.5;
    this.camera.position.z = planeDistance;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // Performance: cap pixel ratio — saves massive GPU fill on retina/HiDPI
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.holder.appendChild(this.renderer.domElement);

    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    const shaderEffect = this.getShaderEffect();
    this.customPass = new ShaderPass(shaderEffect);
    this.customPass.renderToScreen = true;
    this.composer.addPass(this.customPass);
  }

  getShaderEffect() {
    return {
      uniforms: {
        tDiffuse: { value: null },
        resolution: {
          value: new THREE.Vector2(1, window.innerHeight / window.innerWidth),
        },
        uMouse: { value: new THREE.Vector2(-10, -10) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        varying vec2 vUv;
        uniform vec2 uMouse;

        float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
          uv -= disc_center;
          uv *= resolution;
          float dist = sqrt(dot(uv, uv));
          return smoothstep(disc_radius + border_size, disc_radius - border_size, dist);
        }

        void main() {
          vec2 newUV = vUv;
          float c = circle(vUv, uMouse, 0.0, 0.65); //The original value is 0.2
          float r = texture2D(tDiffuse, newUV.xy += c * (0.1 * .5)).x;
          float g = texture2D(tDiffuse, newUV.xy += c * (0.1 * .525)).y;
          float b = texture2D(tDiffuse, newUV.xy += c * (0.1 * .55)).z; //The original value is 0.1
          vec4 color = vec4(r, g, b, 1.0);

          gl_FragColor = color;
        }
      `,
    };
  }

  // No more per-instance animation() — handled by sharedAnimationLoop

  handleCursorAnimation() {
    // Mouse tracking (per-holder, lightweight event listeners)
    this.holder.addEventListener("mousemove", (e) => {
      this._isMouseActive = true;
      const rect = this.holder.getBoundingClientRect();
      this.uMouse.x = (e.clientX - rect.left) / rect.width;
      this.uMouse.y = 1 - (e.clientY - rect.top) / rect.height;
      this._lastMouseX = this.uMouse.x;
      this._lastMouseY = this.uMouse.y;
    });

    this.holder.addEventListener("mouseleave", () => {
      this._isMouseActive = false;
      this.uMouse.x = this._lastMouseX;
      this.uMouse.y = this._lastMouseY;
    });

    // Scroll handling is now in the shared scroll listener above
  }
}

const artist1 = new ImageCanvasComponent("texture-0", $holder0, -0.18); // Blond:Ish (landscape)
const artist2 = new ImageCanvasComponent("texture-1", $holder1, -0.18); // Disclosure (landscape, swapped from pos 5)
const artist3 = new ImageCanvasComponent("texture-2", $holder2);        // Scout
const artist4 = new ImageCanvasComponent("texture-3", $holder3);        // Rules
const artist5 = new ImageCanvasComponent("texture-4", $holder4);        // Kid Apollo
const artist6 = new ImageCanvasComponent("texture-5", $holder5);        // St Lundi (swapped from pos 1)
const artist7 = new ImageCanvasComponent("texture-6", $holder6, -0.12); // Ethan Walsh
