import gsap from "gsap";
import Lenis from "lenis";
import { handleCursorAnimation } from "./src/scripts/cursor.js";
import {
  handleDropdowns,
  handleScrollAnimations,
  maskedTextAnimation,
  perspectiveAnimation,
} from "./src/scripts/scroll.js";
import { linePathAnimation } from "./src/scripts/pathLine.js";

const initLenis = () => {
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1.2,
  });

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
};

const handleTimeline = () => {
  const tl = gsap.timeline();

  tl.add(() => window.scrollTo(0, 0));

  tl.to(".ntk-curtain__gallery", {
    delay: 0.8,
    height: "450px",
    ease: "power3.inOut",
    duration: 0.8,
    scale: 1.1,
  });

  tl.to(".ntk-curtain__picture", {
    bottom: "0%",
    ease: "power3.inOut",
    duration: 0.8,
    stagger: 0.5,
  });

  tl.to(".ntk-curtain__gallery", {
    scale: 0.8,
    ease: "power3.inOut",
    duration: 1,
  });

  tl.to(".ntk-curtain", {
    top: "-100%",
    duration: 1,
    delay: -0.1,
  });

  tl.add(() => initLenis());

  tl.to(".ntk-curtain", {
    cursor: "default",
    pointerEvents: "none",
  });

  // tl.to(".ntk-hamburger-menu__container", {
  //   display: "flex",
  // });
};

/*gsap.to(".ntk-hamburger-menu__container", {
  opacity: 1,
  pointerEvents: "all",
  duration: 0.5,
  scrollTrigger: {
    trigger: ".ntk-main",
    start: "top+=500px center",
    end: "center top",
    toggleActions: "play reverse play reverse",
  },
});*/

document.addEventListener("DOMContentLoaded", async () => {
  linePathAnimation();
  maskedTextAnimation();
  handleDropdowns();
  handleCursorAnimation();
  handleScrollAnimations();
  perspectiveAnimation();
  setTimeout(() => {
    handleTimeline();
  }, 1500);

  const canvas = document.getElementById("canvas3d");

  if (canvas) {
    try {
      const [splineModule] = await Promise.all([import("@splinetool/runtime")]);
      const Application = splineModule.Application;

      const spline = new Application(canvas);

      await spline.load(
        "https://prod.spline.design/xhjvcXw3rWm4cd7r/scene.splinecode"
      );
    } catch (error) {
      console.error("Spline module error:", error);
    }
  } else {
    console.warn("No 3D Canvas found");
  }
});

/*const $hamburgerBtn = document.querySelector(".ntk-hamburger-menu__btn");
let isMenuOpen = false;

const setMenuOpen = () => (isMenuOpen = !isMenuOpen);
const handleMenu = () => {
  setMenuOpen();

  isMenuOpen
    ? (gsap.to(".ntk-hamburger-menu__side", {
        width: "100%",
        height: "100%",
        ease: "power1",
        duration: 0.3,
      }),
      gsap.to(".ntk-hamburger-menu__btn", {
        rotate: "90deg",
        ease: "power1",
        duration: 0.3,
      }))
    : (gsap.to(".ntk-hamburger-menu__side", {
        width: "80px",
        height: "80px",
        ease: "power1",
        duration: 0.3,
      }),
      gsap.to(".ntk-hamburger-menu__btn", {
        rotate: "0deg",
        ease: "power1",
        duration: 0.3,
      }));
};

$hamburgerBtn.addEventListener("click", (e) => {
  handleMenu();
});*/
