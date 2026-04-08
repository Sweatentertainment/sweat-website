import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const $containerPerspective0 = document.querySelector(".ntk-gsap-perspective-0");
const $containerPerspective1 = document.querySelector(".ntk-gsap-perspective-1");
const $containerPerspective2 = document.querySelector(".ntk-gsap-perspective-2");

const $containers = document.querySelectorAll(".ntk-main__container");
const $maskedText = document.querySelectorAll(".ntk-text--scroller");
const $maskedTextFooter = document.querySelectorAll(".ntk-text--scroller-footer");
const $dropdown = document.querySelectorAll(".ntk-container-accordion-right");

const handleScrollAnimations = () => {
  gsap.matchMedia().add("(min-width: 990px)", () => {
    $containers.forEach((container) => {
      gsap.fromTo(
        container,
        {
          y: 200,
        },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: container,
            start: "top 100%",
            end: "bottom 20%",
            scrub: 2,
          },
        }
      );
    });

    $dropdown.forEach((container) => {
      gsap.to(container, {
        y: 180,
        scrollTrigger: {
          trigger: container,
          start: "top 100%",
          end: "bottom 20%",
          scrub: 2,
        },
      });
    });
  });
};

const handleDropdowns = () => {
  const $accordionContainers = document.querySelectorAll(".ntk-faq-container");

  $accordionContainers.forEach(($container) => {
    $container.addEventListener("click", (e) => {
      if (e.target.matches(".ntk-faq")) {
        const $item = e.target;

        if ($item.classList.contains("ntk-faq-active")) {
          $item.classList.remove("ntk-faq-active");
          return;
        }

        const $allItems = $container.querySelectorAll(".ntk-faq");
        $allItems.forEach((item) => {
          item.classList.remove("ntk-faq-active");
        });

        $item.classList.add("ntk-faq-active");
      }
    });
  });
};

const maskedTextAnimation = () => {
  const animateText = (text, isActive) => {
    const color = isActive ? "#0c54b8" : "#b4b4b449"; 
    const blur = isActive ? "blur(0px)" : "blur(10px)"; 

    gsap.to(text, {
      color: color,
      filter: blur,
      duration: 0.3,  
    });
  };

  $maskedText.forEach((text, index) => {
    const triggerId = `#trigger-masked-${index + 1}`;

    gsap.to(text, {
      scrollTrigger: {
        trigger: triggerId,
        start: "top 50%",  
        end: "bottom 50%",
        onEnter: () => {
          animateText(text, true);

          $maskedText.forEach((otherText) => {
            if (otherText !== text) {
              animateText(otherText, false);
            }
          });
        },
        onLeave: () => {
          if (text === $maskedText[$maskedText.length - 1]) {
            animateText(text, true);
          } else {
            animateText(text, false);
          }
        },
        onEnterBack: () => {
          animateText(text, true);

          $maskedText.forEach((otherText) => {
            if (otherText !== text) {
              animateText(otherText, false);
            }
          });
        },
        onLeaveBack: () => {
          if (text === $maskedText[$maskedText.length - 1]) {
            animateText(text, true);
          } else {
            animateText(text, false);
          }
        },
      },
    });
  });

  $maskedTextFooter.forEach(text => {
    gsap.to(text, {
      y: 0,
      scrollTrigger: {
        trigger: text,
        start: "top bottom",
        end: "top bottom-=150px",
        scrub: 2,
      },
    })
  })
};

const perspectiveAnimation = () => {
  gsap.to($containerPerspective0, {
    scrollTrigger: {
      trigger: $containerPerspective0,
      start: "top-=150px center",
      end: "bottom-=150px center",
      scrub: true,
    },
    rotateY: "10deg",
  });

  gsap.to($containerPerspective1, {
    scrollTrigger: {
      trigger: $containerPerspective1,
      start: "top-=300px center",
      end: "bottom center",
      scrub: true,
    },
    rotateY: "-10deg",
  });

  gsap.to($containerPerspective2, {
    scrollTrigger: {
      trigger: $containerPerspective2,
      start: "top-=300px center",
      end: "bottom center",
      scrub: true,
    },
    rotateY: "5deg",
  });

};


export {
  handleScrollAnimations,
  handleDropdowns,
  maskedTextAnimation,
  perspectiveAnimation,
};

