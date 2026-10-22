/* ==========================================================
   Santos Climatização — interações
   ========================================================== */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WHATSAPP = "5500000000000";
  const HERO_LOOP_SECONDS = 15;

  document.body.classList.add("is-loading");
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Preloader ---------- */
  const finishLoading = () => {
    document.getElementById("preloader").classList.add("is-done");
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
  };
  window.addEventListener("load", () => setTimeout(finishLoading, 500));
  setTimeout(finishLoading, 3500); // garantia caso algum recurso demore

  /* ---------- Vídeo da hero: loop de ~15s ---------- */
  const video = document.getElementById("heroVideo");
  if (video) {
    video.addEventListener("timeupdate", () => {
      if (video.currentTime >= HERO_LOOP_SECONDS) video.currentTime = 0;
    });
    video.play().catch(() => {});
  }

  /* ---------- Header ---------- */
  const header = document.getElementById("header");
  let lastY = 0;
  const onScrollHeader = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    header.classList.toggle("is-hidden", y > lastY && y > 500 && !nav.classList.contains("is-open"));
    lastY = y;
  };

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const toggleMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => toggleMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ---------- Link ativo ---------- */
  const navLinks = [...nav.querySelectorAll("a[href^='#']:not(.btn)")];
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------- Parallax ---------- */
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  const onScrollParallax = () => {
    if (reduceMotion) return;
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax);
      const rect = el.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      el.style.transform = `translate3d(0, ${(-rect.top * speed).toFixed(1)}px, 0)`;
    });
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScrollHeader();
        onScrollParallax();
        ticking = false;
      });
    },
    { passive: true }
  );
  onScrollHeader();
  onScrollParallax();

  /* ---------- Reveal ao rolar ---------- */
  document.querySelectorAll("[data-delay]").forEach((el) => el.style.setProperty("--d", `${el.dataset.delay}s`));
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Contadores ---------- */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const duration = 1800;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(target * eased).toLocaleString("pt-BR") + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => counterObserver.observe(el));

  /* ---------- Cards com tilt 3D + brilho ---------- */
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform .6s cubic-bezier(.22,1,.36,1), border-color .4s, box-shadow .4s";
        card.style.transform = "";
        setTimeout(() => (card.style.transition = ""), 600);
      });
    });

    /* Botões magnéticos */
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
    });
  }

  /* ---------- Carrossel flutuante (direita → esquerda) ---------- */
  const marquee = document.getElementById("marquee");
  const track = marquee.querySelector(".marquee__track");
  track.innerHTML += track.innerHTML; // duplica para loop contínuo
  track.querySelectorAll(".shot").forEach((s, i) => i >= track.children.length / 2 && s.setAttribute("aria-hidden", "true"));
  let offset = 0;
  let speed = 0.55;
  let targetSpeed = speed;
  marquee.addEventListener("mouseenter", () => (targetSpeed = 0.12));
  marquee.addEventListener("mouseleave", () => (targetSpeed = 0.55));
  const runMarquee = () => {
    speed += (targetSpeed - speed) * 0.05;
    offset -= reduceMotion ? 0 : speed;
    const half = track.scrollWidth / 2;
    if (-offset >= half) offset += half;
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
    requestAnimationFrame(runMarquee);
  };
  requestAnimationFrame(runMarquee);

  /* ---------- Flocos de neve na hero ---------- */
  const canvas = document.getElementById("snowCanvas");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, flakes;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(w, 1400) / 18);
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        vy: Math.random() * 0.5 + 0.2,
        vx: Math.random() * 0.4 - 0.2,
        a: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI * 2,
      }));
    };
    let heroVisible = true;
    new IntersectionObserver(([e]) => (heroVisible = e.isIntersecting)).observe(canvas);
    const draw = (t) => {
      if (heroVisible) {
        ctx.clearRect(0, 0, w, h);
        for (const f of flakes) {
          f.y += f.vy;
          f.x += f.vx + Math.sin(t / 1600 + f.phase) * 0.25;
          if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
          if (f.x > w + 5) f.x = -5;
          if (f.x < -5) f.x = w + 5;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 225, 255, ${f.a})`;
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(draw);
  }

  /* ---------- Formulário → WhatsApp ---------- */
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("[required]").forEach((input) => {
      const ok = input.value.trim() !== "";
      input.closest(".field").classList.toggle("is-error", !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      note.textContent = "Preencha nome, telefone e serviço para continuar.";
      return;
    }
    const data = new FormData(form);
    const text =
      `Olá, Santos Climatização! Gostaria de um orçamento.%0A%0A` +
      `*Nome:* ${encodeURIComponent(data.get("nome"))}%0A` +
      `*Telefone:* ${encodeURIComponent(data.get("tel"))}%0A` +
      `*Serviço:* ${encodeURIComponent(data.get("servico"))}` +
      (data.get("msg") ? `%0A*Mensagem:* ${encodeURIComponent(data.get("msg"))}` : "");
    note.textContent = "Abrindo o WhatsApp...";
    window.open(`https://wa.me/${WHATSAPP}?text=${text}`, "_blank", "noopener");
    form.reset();
  });
})();
