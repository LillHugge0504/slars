/*
 * SLARS – enkel vanilla JS för:
 * 1. Mobilmeny (hamburgarknapp)
 * 2. Fade/slide-in-animationer när sektioner scrollas in
 * 3. Kontaktformulär: validering + mailto-fallback
 * 4. Dynamiskt copyright-år i footern
 */

document.addEventListener("DOMContentLoaded", function () {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- 1. Mobilmeny ---------- */
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("primaryNav");

  if (navToggle && nav) {
    const closeMenu = function () {
      navToggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    };

    navToggle.addEventListener("click", function () {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
    });

    // Stäng menyn när man klickar på en länk (mobil)
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Stäng menyn med Escape, oavsett var fokus ligger i menyn
    nav.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
        navToggle.focus();
      }
    });
  }

  /* ---------- 2. Scroll-in-animationer ---------- */
  const revealElements = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    // Ingen animation: visa allt direkt
    revealElements.forEach(function (el) {
      el.classList.add("in-view");
    });
  } else {
    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- 3. Kontaktformulär ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  if (form && status) {
    const fields = {
      name: {
        input: document.getElementById("name"),
        error: document.getElementById("name-error"),
        validate: function (value) {
          return value.trim().length > 0 ? "" : "Ange ditt namn.";
        },
      },
      company: {
        input: document.getElementById("company"),
        error: document.getElementById("company-error"),
        validate: function (value) {
          return value.trim().length > 0 ? "" : "Ange företagets namn.";
        },
      },
      email: {
        input: document.getElementById("email"),
        error: document.getElementById("email-error"),
        validate: function (value) {
          const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value.trim().length === 0) return "Ange din e-postadress.";
          if (!pattern.test(value.trim())) return "Ange en giltig e-postadress.";
          return "";
        },
      },
      message: {
        input: document.getElementById("message"),
        error: document.getElementById("message-error"),
        validate: function (value) {
          return value.trim().length > 0 ? "" : "Skriv ett kort meddelande.";
        },
      },
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      let hasError = false;
      let firstInvalid = null;

      Object.keys(fields).forEach(function (key) {
        const field = fields[key];
        const errorMessage = field.validate(field.input.value);

        if (errorMessage) {
          hasError = true;
          field.input.setAttribute("aria-invalid", "true");
          field.error.textContent = errorMessage;
          if (!firstInvalid) firstInvalid = field.input;
        } else {
          field.input.removeAttribute("aria-invalid");
          field.error.textContent = "";
        }
      });

      if (hasError) {
        status.textContent = "Kontrollera de markerade fälten och försök igen.";
        status.dataset.state = "error";
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Bygg ett mailto-meddelande som fallback (kräver ingen server).
      // Byt gärna ut denna del mot ett POST-anrop till t.ex. Formspree
      // längre fram, se kommentaren i index.html vid formuläret.
      const name = fields.name.input.value.trim();
      const company = fields.company.input.value.trim();
      const email = fields.email.input.value.trim();
      const phone = document.getElementById("phone").value.trim();
      const message = fields.message.input.value.trim();

      const subject = encodeURIComponent(
        "Offertförfrågan från " + company + " (" + name + ")"
      );
      const body = encodeURIComponent(
        "Namn: " + name +
        "\nFöretag: " + company +
        "\nE-post: " + email +
        "\nTelefon: " + (phone || "–") +
        "\n\nMeddelande:\n" + message
      );

      window.location.href =
        "mailto:slars.se@gmail.com?subject=" + subject + "&body=" + body;

      status.textContent =
        "Din e-postklient öppnas nu med meddelandet ifyllt. Händer inget? " +
        "Maila oss direkt på slars.se@gmail.com.";
      status.dataset.state = "success";
      form.reset();
    });
  }

  /* ---------- 4. Dynamiskt årtal i footern ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
