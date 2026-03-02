(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16 }
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 60, 260)}ms`;
      observer.observe(item);
    });
  }

  const heroMedia = document.querySelector(".hero-media");
  if (!heroMedia || prefersReducedMotion) {
    return;
  }

  const onMove = (event) => {
    const bounds = heroMedia.getBoundingClientRect();
    const relX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relY = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroMedia.style.transform = `perspective(900px) rotateX(${-relY * 2.6}deg) rotateY(${relX * 3.2}deg)`;
  };

  const onLeave = () => {
    heroMedia.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };

  heroMedia.addEventListener("mousemove", onMove);
  heroMedia.addEventListener("mouseleave", onLeave);
})();
