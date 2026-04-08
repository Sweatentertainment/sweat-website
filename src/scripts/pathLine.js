import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const $containerSvg = document.querySelector(".ntk-svg-wrapper__dimensions");
const $maskedText = document.querySelector(".ntk-masked-text__section")
const $svg = document.querySelector("svg");
const $path = $svg.querySelector("path");
const $pathLength = $path.getTotalLength();

const linePathAnimation = () => {
    gsap.set($path, { strokeDasharray: $pathLength });
    gsap.set($path, { strokeDashoffset: $pathLength * 0.96 });

    gsap.fromTo(
      $path,
      {
        strokeDashoffset: $pathLength * 0.96
      },
      {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: $containerSvg,
          start: "top 25%",
          end: "bottom 80%",
          scrub: 5,
        },
      }
    );

    gsap.fromTo(
      $path,
      {
          opacity: 1, 
      },
      {
          ease: "none",
          opacity: 0.4,
          scrollTrigger: {
              trigger: $maskedText,
              start: "top-=1200px 50%", 
              end: "bottom 80%", 
              scrub: 1,
          },
      }
  );

};

export { linePathAnimation }
