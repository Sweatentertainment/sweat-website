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


class ImageCanvasComponent {
  constructor(imageElementId, holder) {
    this.holder = holder;
    this.imageElementId = imageElementId;
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

    if (!this.$img) {
      console.error(`3D Plane with ID "${this.imageElementId}" not found. Please check if all the images are loaded correctly.`);
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
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);

    this.toggleAnimations();
    this.animation();
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
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
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

  animation() {
    this.customPass.uniforms.uMouse.value = this.uMouse;
    requestAnimationFrame(() => this.animation());
    this.composer.render();
  }

  handleCursorAnimation() {
    let isMouseActive = false;
    let lastScrollY = window.scrollY;
    let scrollDelta = 0; 
    let scrollBasedY = 0.1; 
    let lastMousePosition = new THREE.Vector2(0.5, 0.5); 
  
    this.holder.addEventListener("mousemove", (e) => {
      isMouseActive = true; 
      const rect = this.holder.getBoundingClientRect();
      this.uMouse.x = (e.clientX - rect.left) / rect.width;
      this.uMouse.y = 1 - (e.clientY - rect.top) / rect.height;
      lastMousePosition.set(this.uMouse.x, this.uMouse.y); 
    });
  
    this.holder.addEventListener("mouseleave", () => {
      isMouseActive = false; 
      this.uMouse.x = lastMousePosition.x;
      this.uMouse.y = lastMousePosition.y;
    });
  
    window.addEventListener("scroll", () => {
      if (window.innerWidth <= 990) { 
        const currentScrollY = window.scrollY;
        scrollDelta = currentScrollY - lastScrollY; 
        lastScrollY = currentScrollY;
    
        const rect = this.holder.getBoundingClientRect();
        if (
          rect.top < window.innerHeight &&
          rect.bottom > 0 &&
          rect.left < window.innerWidth &&
          rect.right > 0
        ) {
          if (!isMouseActive) {
            scrollBasedY += scrollDelta * 0.001;
            scrollBasedY = Math.max(0, Math.min(1, scrollBasedY));
            this.uMouse.y = scrollBasedY;
            this.uMouse.x = lastMousePosition.x; 
          }
        } else {
          if (!isMouseActive) {
            if (scrollDelta > 0) {
              scrollBasedY = 0;
            } else if (scrollDelta < 0) {
              scrollBasedY = 1;
            }
            this.uMouse.y = scrollBasedY;
            this.uMouse.x = lastMousePosition.x; 
          }
        }
      }
    });    
  
    const lerp = (start, end, t) => start * (1 - t) + end * t;
  
    const smoothAnimation = () => {
      if (!isMouseActive) {
        this.uMouse.y = lerp(this.uMouse.y, scrollBasedY, 0.1);
      }
      requestAnimationFrame(smoothAnimation);
    };
  
    smoothAnimation();
  }
  
}

const artist1 = new ImageCanvasComponent("texture-0", $holder0);
const artist2 = new ImageCanvasComponent("texture-1", $holder1);
const artist3 = new ImageCanvasComponent("texture-2", $holder2);
const artist4 = new ImageCanvasComponent("texture-3", $holder3);
const artist5 = new ImageCanvasComponent("texture-4", $holder4);
const artist6 = new ImageCanvasComponent("texture-5", $holder5);
const artist7 = new ImageCanvasComponent("texture-6", $holder6)