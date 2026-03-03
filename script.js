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

(() => {
  const openButtons = [...document.querySelectorAll("[data-modal-open]")];
  const closeButtons = [...document.querySelectorAll("[data-modal-close]")];
  const overlays = [...document.querySelectorAll(".modal-overlay")];

  const closeAll = () => {
    overlays.forEach((overlay) => {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
    });
    document.body.classList.remove("modal-open");
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const modalId = button.getAttribute("data-modal-open");
      const target = document.querySelector(`.modal-overlay[data-modal-id="${modalId}"]`);
      if (!target) {
        return;
      }
      closeAll();
      target.classList.add("is-open");
      target.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeAll);
  });

  overlays.forEach((overlay) => {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeAll();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAll();
    }
  });
})();

(() => {
  const consentKey = "ics_cookie_consent_v1";
  const banner = document.getElementById("cookie-banner");
  if (!banner) {
    return;
  }

  const settingsPanel = banner.querySelector("[data-cookie-settings]");
  const settingsButton = banner.querySelector('[data-cookie-action="settings"]');
  const analyticsInput = banner.querySelector('input[name="cookie-analytics"]');
  const marketingInput = banner.querySelector('input[name="cookie-marketing"]');
  const actionButtons = [...banner.querySelectorAll("[data-cookie-action]")];

  const setSettingsOpen = (isOpen) => {
    if (!settingsPanel || !settingsButton) {
      return;
    }
    settingsPanel.hidden = !isOpen;
    settingsButton.setAttribute("aria-expanded", String(isOpen));
  };

  const updateBannerOffset = () => {
    if (!banner.classList.contains("is-visible")) {
      return;
    }
    document.body.style.setProperty("--cookie-banner-offset", `${banner.offsetHeight + 16}px`);
  };

  const showBanner = () => {
    banner.classList.add("is-visible");
    banner.setAttribute("aria-hidden", "false");
    document.body.classList.add("cookie-banner-visible");
    updateBannerOffset();
  };

  const hideBanner = () => {
    banner.classList.remove("is-visible");
    banner.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cookie-banner-visible");
    document.body.style.removeProperty("--cookie-banner-offset");
    setSettingsOpen(false);
  };

  const saveConsent = (mode) => {
    const payload = {
      mode,
      analytics: mode === "all" ? true : mode === "essential" ? false : Boolean(analyticsInput?.checked),
      marketing: mode === "all" ? true : mode === "essential" ? false : Boolean(marketingInput?.checked),
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(consentKey, JSON.stringify(payload));
    } catch (error) {
      // Ignored: consent banner still closes if browser storage is unavailable.
    }
    hideBanner();
  };

  setSettingsOpen(false);

  let storedConsent = null;
  try {
    const rawValue = localStorage.getItem(consentKey);
    if (rawValue) {
      storedConsent = JSON.parse(rawValue);
    }
  } catch (error) {
    storedConsent = null;
  }

  if (storedConsent && storedConsent.mode) {
    if (analyticsInput && typeof storedConsent.analytics === "boolean") {
      analyticsInput.checked = storedConsent.analytics;
    }
    if (marketingInput && typeof storedConsent.marketing === "boolean") {
      marketingInput.checked = storedConsent.marketing;
    }
    hideBanner();
  } else {
    showBanner();
  }

  window.addEventListener("resize", updateBannerOffset);

  actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-cookie-action");
      if (action === "essential") {
        saveConsent("essential");
        return;
      }
      if (action === "accept-all") {
        saveConsent("all");
        return;
      }
      if (action === "save-selection") {
        saveConsent("custom");
        return;
      }
      if (action === "settings") {
        const isOpen = settingsPanel ? !settingsPanel.hidden : false;
        setSettingsOpen(isOpen);
        updateBannerOffset();
      }
    });
  });
})();
