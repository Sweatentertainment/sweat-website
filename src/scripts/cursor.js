import gsap from "gsap";
const $cursorDot = document.querySelector(".ntk-cursor");

const handleCursorAnimation = () => {
  gsap.set($cursorDot, {
    xPercent: -50,
    yPercent: -50,
  });

  window.addEventListener("mousemove", (e) => {
    gsap.to($cursorDot, {
      duration: 0.3,
      x: e.clientX,
      y: e.clientY,
    });
  });

  window.addEventListener("mouseover", (e) => {
    if (e.target.matches("canvas")) {
      gsap.to($cursorDot, {
        scale: 5,
      });
    }
  });

  window.addEventListener("mouseout", (e) => {
    if (e.target.matches("canvas")) {
      gsap.to($cursorDot, {
        scale: 1,
      });
    }
  });
};

export { handleCursorAnimation };
