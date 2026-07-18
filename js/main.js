(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header state ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  function closeNav() {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  function toggleNav() {
    var isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  }
  navToggle.addEventListener("click", toggleNav);
  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* ---------- Hero slideshow ---------- */
  var slides = document.querySelectorAll(".hero-slide");
  if (slides.length > 1 && !prefersReducedMotion) {
    var current = 0;
    setInterval(function () {
      slides[current].classList.remove("is-active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("is-active");
    }, 5500);
  }

  /* ---------- Listing carousel (listing.html only) ---------- */
  var carousel = document.getElementById("listingCarousel");
  if (carousel) {
    var track = carousel.querySelector(".carousel-track");
    var cSlides = carousel.querySelectorAll(".carousel-slide");
    var dotsWrap = document.getElementById("listingDots");
    var curLabel = document.getElementById("carouselCur");
    var cIndex = 0;
    var dots = [];

    var goTo = function (n) {
      cIndex = (n + cSlides.length) % cSlides.length;
      track.style.transform = "translateX(" + (-cIndex * 100) + "%)";
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === cIndex); });
      if (curLabel) curLabel.textContent = String(cIndex + 1);
    };

    cSlides.forEach(function (_, i) {
      var d = document.createElement("button");
      d.type = "button";
      d.className = "carousel-dot" + (i === 0 ? " is-active" : "");
      d.setAttribute("aria-label", "Go to photo " + (i + 1));
      d.addEventListener("click", function (e) { e.stopPropagation(); goTo(i); });
      dotsWrap.appendChild(d);
      dots.push(d);
    });

    // click the image area advances to the next photo
    track.addEventListener("click", function () { goTo(cIndex + 1); });
    carousel.querySelector(".carousel-prev").addEventListener("click", function (e) {
      e.stopPropagation(); goTo(cIndex - 1);
    });
    carousel.querySelector(".carousel-next").addEventListener("click", function (e) {
      e.stopPropagation(); goTo(cIndex + 1);
    });
    carousel.setAttribute("tabindex", "0");
    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { goTo(cIndex - 1); }
      else if (e.key === "ArrowRight") { goTo(cIndex + 1); }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Gallery lightbox (gallery.html only) ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");

  if (lightbox && lightboxImg && lightboxClose) {
    var lastFocused = null;

    var openLightbox = function (src, alt) {
      lastFocused = document.activeElement;
      lightboxImg.src = src;
      lightboxImg.alt = alt || "";
      lightbox.hidden = false;
      lightboxClose.focus();
      document.body.style.overflow = "hidden";
    };
    var closeLightbox = function () {
      lightbox.hidden = true;
      lightboxImg.src = "";
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    };

    document.querySelectorAll(".gallery-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var full = btn.getAttribute("data-full");
        var img = btn.querySelector("img");
        openLightbox(full, img ? img.alt : "");
      });
    });
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }

  /* ---------- Enquiry form (contact.html only) ---------- */
  var form = document.getElementById("enquiryForm");
  var status = document.getElementById("formStatus");

  if (form && status) {
    var validators = {
      fullName: function (v) { return v.trim().length >= 2; },
      phone: function (v) { return /^[0-9+()\-\s]{7,}$/.test(v.trim()); },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
    };
    var messages = {
      fullName: "Please enter your full name.",
      phone: "Please enter a valid phone number.",
      email: "Please enter a valid email address."
    };

    var validateField = function (name) {
      var input = form.elements[name];
      var errorEl = document.getElementById("err-" + name);
      var valid = validators[name](input.value);
      input.setAttribute("data-touched", "true");
      if (errorEl) errorEl.textContent = valid ? "" : messages[name];
      return valid;
    };

    Object.keys(validators).forEach(function (name) {
      form.elements[name].addEventListener("blur", function () { validateField(name); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allValid = Object.keys(validators)
        .map(validateField)
        .every(Boolean);

      if (!allValid) {
        status.textContent = "Please correct the highlighted fields.";
        status.className = "form-status error";
        return;
      }

      var data = {
        fullName: form.elements.fullName.value.trim(),
        phone: form.elements.phone.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim()
      };

      var subject = encodeURIComponent("MTR Gardens, Isheri: Enquiry from " + data.fullName);
      var body = encodeURIComponent(
        "Name: " + data.fullName +
        "\nPhone: " + data.phone +
        "\nEmail: " + data.email +
        "\n\nMessage:\n" + (data.message || "(no message provided)")
      );

      window.location.href = "mailto:info@atlanticprophub.com?subject=" + subject + "&body=" + body;

      status.textContent = "Thank you, " + data.fullName + ". Your email client is opening so you can send your enquiry.";
      status.className = "form-status success";
      form.reset();
    });
  }
})();
