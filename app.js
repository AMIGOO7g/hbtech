(() => {
  const D = window.HBTECH_DATA,
    qs = (s, r = document) => r.querySelector(s),
    qsa = (s, r = document) => [...r.querySelectorAll(s)],
    esc = (s) =>
      String(s).replace(
        /[&<>'"]/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;",
          })[c],
      );
  let activeView = "home",
    currentProject = "Север",
    leadMode = "project";
  const nav = qs("#siteNav"),
    drawer = qs(".menu-drawer"),
    menuToggle = qs(".menu-toggle"),
    projectDetail = qs("#projectDetail"),
    projectScroll = qs(".project-scroll"),
    detailSheet = qs("#detailSheet"),
    leadSheet = qs("#leadSheet"),
    compareSheet = qs("#compareSheet"),
    gallerySheet = qs("#gallerySheet");

  function footerHTML(context) {
    const action = {
      projects: ["Нашли подходящий дом", "Купить проект", "buy"],
      architecture: ["Первый эскиз бесплатно", "Заказать эскиз", "consult"],
      technology: ["Есть проект и участок", "Заказать адаптацию", "adapt"],
      materials: ["Нужна точная комплектация", "Получить спецификацию", "spec"],
      process: ["Готовы обсудить стройку", "Получить точную смету", "build"],
      calc: ["Нужна точная цифра", "Получить точную смету", "build"],
      experience: ["Познакомимся лично", "Связаться с нами", "consult"],
      project: ["Понравился этот дом", "Купить проект", "buy"],
    }[context] || ["Начните с проекта", "Получить материалы", "project"];
    return `<footer class="site-footer"><div class="footer-top"><div class="footer-brand"><b>HBTECH</b><p>Готовые проекты, индивидуальная архитектура, адаптация и строительство загородных домов одной командой.</p></div><div class="footer-cta"><span>${action[0]}</span><h2>${action[1]}</h2><button class="primary" type="button" ${["architecture", "projects"].includes(action[2]) ? `data-view="${action[2]}"` : `data-lead="${action[2]}"`}>${action[1]}</button></div></div><div class="footer-extra"><span>Можно добавить</span><button data-lead="adapt">Адаптация проекта</button><button data-view="calc">Расчёт строительства</button><button data-lead="consult">Ипотека и рассрочка</button><button data-view="projects">Сравнить проекты</button></div><div class="footer-grid"><div class="footer-col"><b>Контакты</b><a href="tel:${D.company.phoneHref}">${D.company.phone}</a><a href="mailto:${D.company.email}">${D.company.email}</a><a href="${D.company.whatsapp}" target="_blank" rel="noopener">WhatsApp</a><a href="${D.company.telegram}" target="_blank" rel="noopener">Telegram</a><a href="${D.company.max}" target="_blank" rel="noopener">MAX</a><span>${D.company.region}</span><span>${D.company.hours}</span></div><div class="footer-col"><b>Продукты</b><button data-view="projects">Готовые проекты</button><button data-view="architecture">Индивидуальный проект</button><button data-lead="adapt">Адаптация</button><button data-lead="build">Строительство</button></div><div class="footer-col"><b>Компания</b><button data-view="experience">Опыт и объекты</button><button data-view="technology">Технологии</button><button data-view="materials">Материалы</button><button data-view="process">Как работаем</button></div><div class="footer-col"><b>Документы</b><button data-legal="privacy">Конфиденциальность</button><button data-legal="offer">Условия работы</button><button data-legal="details">Реквизиты</button></div></div><div class="footer-bottom"><span>© 2026 HBTECH</span><span>Проекты и строительство частных домов</span></div></footer>`;
  }
  qsa("[data-footer]").forEach(
    (el) => (el.innerHTML = footerHTML(el.dataset.footer)),
  );

  function setNavTone() {
    const panel = qs(`[data-view-panel="${activeView}"]`);
    nav.classList.toggle("light-tone", panel?.classList.contains("light-view"));
  }
  function openView(name, push = true) {
    if (!qs(`[data-view-panel="${name}"]`)) return;
    activeView = name;
    qsa(".view").forEach((v) =>
      v.classList.toggle("active", v.dataset.viewPanel === name),
    );
    qsa(".nav-links [data-view]").forEach((b) =>
      b.classList.toggle("active", b.dataset.view === name),
    );
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    projectDetail.classList.remove("open");
    projectDetail.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "hidden";
    qs(`[data-view-panel="${name}"]`).scrollTop = 0;
    setNavTone();
    observeReveals(qs(`[data-view-panel="${name}"]`));
    observeCounters(qs(`[data-view-panel="${name}"]`));
    if (name === "projects") requestAnimationFrame(() => movePill());
    if (name !== "calc") { const cb = qs("#calcBack"); if (cb) cb.hidden = true; }
    requestAnimationFrame(() =>
      centerHorizontalTracks(qs(`[data-view-panel="${name}"]`)),
    );
    updateCompareDock();
    if (push) history.replaceState(null, "", "#" + name);
  }
  document.addEventListener("click", (e) => {
    const view = e.target.closest("[data-view]");
    if (view) {
      e.preventDefault();
      openView(view.dataset.view);
      return;
    }
    const lead = e.target.closest("[data-lead]");
    if (lead) {
      e.preventDefault();
      openLead(lead.dataset.lead);
      return;
    }
    const legal = e.target.closest("[data-legal]");
    if (legal) {
      e.preventDefault();
      openLegal(legal.dataset.legal);
    }
  });
  menuToggle.onclick = () => {
    const open = !drawer.classList.contains("open");
    drawer.classList.toggle("open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    menuToggle.setAttribute("aria-expanded", String(open));
  };

  const homeGrid = qs("#homeGrid"),
    centerKicker = qs("#centerKicker"),
    centerTitle = qs("#centerTitle"),
    centerCopy = qs("#centerCopy");
  qsa("[data-home-card]").forEach((card) => {
    const activate = () => {
      homeGrid.classList.add("interacting");
      qsa("[data-home-card]").forEach((c) =>
        c.classList.toggle("selected", c === card),
      );
      centerKicker.textContent = card.dataset.kicker;
      centerTitle.textContent = card.dataset.title;
      centerCopy.textContent = card.dataset.copy;
    };
    card.addEventListener("mouseenter", activate);
    card.addEventListener("focus", activate);
  });
  homeGrid.addEventListener("mouseleave", () => {
    homeGrid.classList.remove("interacting");
    qsa("[data-home-card]").forEach((c) => c.classList.remove("selected"));
  });

  const projectEntries = Object.entries(D.projects);
  const catalogState = { task: "all", area: "all", floors: "all", sort: "pop" };
  function setFilter(key, v) {
    catalogState[key] = v;
    qsa(`[data-filter="${key}"] button`).forEach((x) => x.classList.toggle("on", x.dataset.v === v));
    renderCatalog();
  }
  const num = (s) => +String(s || "").replace(/[^\d]/g, "") || 0;
  function movePill() {
    const cap = qs(".capsule"), on = cap.querySelector("button.on"), pill = cap.querySelector(".capsule-pill");
    if (!on || !cap.offsetWidth) return;
    pill.style.width = on.offsetWidth + "px";
    pill.style.transform = `translateX(${on.offsetLeft}px)`;
  }
  qs("#filtersToggle").onclick = () => {
    const open = qs("#filtersPanel").classList.toggle("open");
    qs("#filtersToggle").setAttribute("aria-expanded", open);
  };
  window.addEventListener("resize", () => movePill());
  function renderCatalog() {
    const track = qs("#catalogGrid");
    let list = projectEntries.filter(([, p]) => {
      const a = num(p.area), f = num(p.floors);
      if (catalogState.area === "s" && a >= 150) return false;
      if (catalogState.area === "m" && (a < 150 || a > 220)) return false;
      if (catalogState.area === "l" && a <= 220) return false;
      if (catalogState.floors !== "all" && f !== +catalogState.floors) return false;
      if (catalogState.task !== "all" && !(p.tags || []).includes(catalogState.task)) return false;
      return true;
    });
    if (catalogState.sort === "price") list.sort((a, b) => num(a[1].projectPrice) - num(b[1].projectPrice));
    if (catalogState.sort === "price-d") list.sort((a, b) => num(b[1].projectPrice) - num(a[1].projectPrice));
    if (catalogState.sort === "area") list.sort((a, b) => num(a[1].area) - num(b[1].area));
    qs("#catalogCount").textContent = `${list.length} из ${projectEntries.length} проектов`;
    const n = ["area", "floors"].filter((k) => catalogState[k] !== "all").length + (catalogState.sort !== "pop" ? 1 : 0);
    qs("#filtersCount").textContent = n ? " · " + n : "";
    movePill();
    track.innerHTML = list.length
      ? list
          .map(
            ([name, p]) =>
              `<article class="project-card" data-project="${name}"><img src="${p.images[0]}" alt="Проект ${name}" loading="lazy">${p.badge ? `<span class="project-badge badge-${{"Хит": "hit", "Новинка": "new", "Акция": "sale"}[p.badge] || "hit"}">${p.badge === "Акция" && p.oldPrice ? `Акция −${Math.round((1 - num(p.projectPrice) / num(p.oldPrice)) * 100)}%` : p.badge}</span>` : ""}<div class="project-card-actions"><button class="circle-action" type="button" data-compare="${name}" aria-label="Добавить ${name} к сравнению">+</button></div><div class="project-card-content"><small>${p.type}</small><h3>${name}</h3><div class="project-card-meta"><span>${p.area}</span><span>${p.floors}</span><span>${p.bedrooms}</span></div><div class="project-card-price">${p.oldPrice ? `<s>${p.oldPrice}</s>` : ""}<b class="${p.oldPrice ? "promo" : ""}">${p.projectPrice}</b><span>стройка ${p.buildPrice}</span></div></div></article>`,
          )
          .join("")
      : `<div class="catalog-empty">Под эти условия проектов нет. <button type="button" id="catalogReset">Сбросить фильтры</button></div>`;
    const old = track.nextElementSibling;
    if (old && old.classList.contains("rail-dots")) old.remove();
    if (list.length) attachDots(track);
    track.scrollLeft = 0;
    try { updateCompareButtons(); } catch (err) {}
  }
  qsa("[data-filter]").forEach((seg) =>
    seg.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      seg.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      catalogState[seg.dataset.filter] = b.dataset.v;
      renderCatalog();
    }),
  );
  qs("#catalogSort").onchange = (e) => {
    catalogState.sort = e.target.value;
    renderCatalog();
  };
  qs("#catalogGrid").addEventListener("click", (e) => {
    if (!e.target.closest("#catalogReset")) return;
    catalogState.area = catalogState.floors = catalogState.task = "all";
    qsa("[data-filter]").forEach((seg) => seg.querySelectorAll("button").forEach((x, i) => x.classList.toggle("on", i === 0)));
    renderCatalog();
  });
  document.addEventListener("click", (e) => {
    const cmp = e.target.closest("[data-compare]");
    if (cmp) {
      e.stopPropagation();
      toggleCompare(cmp.dataset.compare);
      return;
    }
    const project = e.target.closest("[data-project]");
    if (project) {
      e.preventDefault();
      openProject(project.dataset.project);
    }
  });


  qs("#serviceRows").innerHTML = D.services
    .map(
      (s) =>
        `<article class="service-row reveal"><b>${s.no}</b><h3>${s.title}</h3><p>${s.text}</p><button class="primary" type="button" data-lead="${s.mode}" aria-label="${s.title}">+</button></article>`,
    )
    .join("");
  function rail(cards) {
    return cards
      .map(
        (c) =>
          `<article class="rail-card"><b>${c.no}</b><h3>${c.title}</h3><p>${c.text}</p></article>`,
      )
      .join("");
  }
  qs("#architectureTrack").innerHTML = rail(D.architecture);
  qs("#materialsTrack").innerHTML = rail(D.materials);
  qsa("[data-horizontal]").forEach((section) => {
    const track = qs(".horizontal-track", section),
      cards = qsa(".rail-card", track),
      dots = qs(".rail-dots", section);
    dots.innerHTML = cards
      .map(
        (_, i) =>
          `<button type="button" class="${i === 0 ? "active" : ""}" aria-label="Карточка ${i + 1}"></button>`,
      )
      .join("");
    const sync = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      const i = cards.reduce((best, card, n) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        return Math.abs(cardCenter - center) <
          Math.abs(
            cards[best].offsetLeft + cards[best].offsetWidth / 2 - center,
          )
          ? n
          : best;
      }, 0);
      qsa("button", dots).forEach((d, n) =>
        d.classList.toggle("active", n === i),
      );
    };
    track.addEventListener("scroll", sync, { passive: true });
    dots.onclick = (e) => {
      const i = qsa("button", dots).indexOf(e.target);
      if (i >= 0)
        cards[i].scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
    };
  });

  function centerHorizontalTracks(root = document) {
    qsa("[data-horizontal] .horizontal-track", root).forEach((track) => {
      const first = qs(".rail-card", track);
      if (first && track.scrollLeft === 0)
        track.scrollLeft = Math.max(
          0,
          first.offsetLeft - (track.clientWidth - first.offsetWidth) / 2,
        );
    });
  }

  qs("#systemList").innerHTML = D.systems
    .map(
      (s, i) =>
        `<button type="button" class="${i === 0 ? "active" : ""}" data-system="${i}"><b>${s.code}</b><span>${s.title}</span></button>`,
    )
    .join("");
  qs("#systemList").addEventListener("mouseover", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const s = D.systems[+b.dataset.system];
    qsa("button", qs("#systemList")).forEach((x) =>
      x.classList.toggle("active", x === b),
    );
    qs("#systemCode").textContent = s.code;
    qs("#systemTitle").textContent = s.title;
    qs("#systemText").textContent = s.text;
  });
  qs("#docGrid").innerHTML = D.documents
    .map(
      (d) =>
        `<article class="reveal"><b>${d.code}</b><h3>${d.title}</h3><p>${d.text}</p></article>`,
    )
    .join("");
  qs("#processList").innerHTML = D.process
    .map(
      (s, i) =>
        `<article class="process-step reveal" data-stage="${i}"><b>${s.no}</b><h3>${s.title}</h3><p>${s.text}</p><div class="process-result"><span>Результат</span><strong>${s.result}</strong></div><div class="process-meta"><span><b>Срок</b>${s.timing}</span><span><b>Стоимость</b>${s.price}</span><span><b>Ответственность</b>${s.responsibility}</span></div></article>`,
    )
    .join("");
  qs("#faqList").innerHTML = D.faq.map((f) => `<details><summary>${f.q}<i>+</i></summary><div class="faq-a"><p>${f.a}</p></div></details>`).join("");
  qs("#numberGrid").innerHTML = D.metrics
    .map(
      (m) =>
        `<article class="reveal"><span>${m.label}</span><b data-count="${parseInt(m.value, 10)}">0</b><p>${m.text}</p></article>`,
    )
    .join("");
  qs("#reviewGrid").innerHTML = D.reviews
    .map(
      (r) =>
        `<article class="review-card reveal"><blockquote>«${r.text}»</blockquote><footer><b>${r.name}</b><span>${r.project}</span></footer></article>`,
    )
    .join("");
  qs("#trustGrid").innerHTML = D.trust
    .map(
      (t) =>
        `<article class="reveal"><h3>${t.title}</h3><p>${t.text}</p></article>`,
    )
    .join("");
  qs("#partnerLine").innerHTML = D.partners
    .map((p) => `<span>${p}</span>`)
    .join("");

  const objectGalleries = projectEntries.map(([, p]) => p.images);
  let galleryItems = [],
    galleryPosition = 0,
    galleryMeta = { title: "", place: "" };
  const fitClass = (src) => (/facade|plan/.test(src) ? "contain" : "");
  function renderGallery() {
    const imgs = qsa("#viewerStage img"), th = qsa("#viewerThumbs button");
    imgs.forEach((im, i) => im.classList.toggle("on", i === galleryPosition));
    th.forEach((t, i) => t.classList.toggle("on", i === galleryPosition));
    qs("#viewerBg").style.backgroundImage = `url("${galleryItems[galleryPosition]}")`;
    qs("#galleryTitle").textContent = galleryMeta.title;
    qs("#galleryPlace").textContent = galleryMeta.place;
    qs("#galleryIndex").textContent = `${String(galleryPosition + 1).padStart(2, "0")} / ${String(galleryItems.length).padStart(2, "0")}`;
    qs("#viewerProg").style.width = ((galleryPosition + 1) / galleryItems.length) * 100 + "%";
  }
  function openGallery(items, meta, start = 0) {
    galleryItems = items;
    galleryMeta = meta;
    galleryPosition = start;
    qs("#viewerStage").innerHTML = items.map((src, i) => `<img src="${src}" alt="${meta.title}, изображение ${i + 1}" class="${fitClass(src)}">`).join("");
    qs("#viewerThumbs").innerHTML = items.length > 1 ? items.map((src, i) => `<button type="button" aria-label="Изображение ${i + 1}"><img src="${src}" alt=""></button>`).join("") : "";
    qsa("#viewerThumbs button").forEach((b, i) => (b.onclick = () => { galleryPosition = i; renderGallery(); }));
    gallerySheet.classList.toggle("single", items.length < 2);
    const gl = qs("#galleryLink");
    gl.hidden = !meta.project;
    gl.onclick = () => {
      closeSheet(gallerySheet);
      openProject(meta.project);
    };
    gallerySheet.classList.add("open");
    gallerySheet.setAttribute("aria-hidden", "false");
    renderGallery();
  }
  document.addEventListener("keydown", (e) => {
    if (!gallerySheet.classList.contains("open")) return;
    if (e.key === "ArrowLeft") moveGallery(-1);
    if (e.key === "ArrowRight") moveGallery(1);
  });
  let touchX = 0;
  gallerySheet.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  gallerySheet.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) moveGallery(dx < 0 ? 1 : -1);
  });
  function moveGallery(step) {
    if (!galleryItems.length) return;
    galleryPosition =
      (galleryPosition + step + galleryItems.length) % galleryItems.length;
    renderGallery();
  }
  qs("#objectGrid").className = "object-track";
  qs("#objectGrid").innerHTML = D.built
    .map(
      (o) =>
        `<article class="object-card"><figure class="ph-photo"><span>ФОТО ОБЪЕКТА<br><small>заменить на реальное</small></span></figure><div class="object-info"><span>${o.year} · ${o.area} · стройка ${o.term}</span><h3>${o.place}</h3><button type="button" class="pill-link" data-obj-open="${o.project}">по проекту «${o.project}» <i>↗︎</i></button></div></article>`,
    )
    .join("");
  qs("#objectGrid").addEventListener("click", (e) => {
    const open = e.target.closest("[data-obj-open]");
    if (open) openProject(open.dataset.objOpen);
  });
  qs("#teamRoles").innerHTML = D.team.map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join("");
  qs("#qualityGrid").innerHTML = D.quality.map(([t, x], i) => `<article class="reveal"><i>0${i + 1}</i><h3>${t}</h3><p>${x}</p></article>`).join("");
  qs("#bankList").innerHTML = D.banks.map((b) => `<span>${b}</span>`).join("");
  qs("#officeAddr").textContent = D.office;
  qs("#companyFaq").innerHTML = D.companyFaq.map(([q, a]) => `<details><summary>${q}<i>+</i></summary><div class="faq-a"><p>${a}</p></div></details>`).join("");
  qsa(".faq-list details").forEach((d) => {
    const sum = d.querySelector("summary"), body = d.querySelector(".faq-a");
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) {
        body.style.height = body.scrollHeight + "px";
        requestAnimationFrame(() => (body.style.height = "0px"));
        d.classList.remove("on");
        setTimeout(() => (d.open = false), 500);
      } else {
        d.open = true;
        body.style.height = "0px";
        requestAnimationFrame(() => { body.style.height = body.scrollHeight + "px"; d.classList.add("on"); });
        setTimeout(() => (body.style.height = "auto"), 520);
      }
    });
  });
  function attachDots(track) {
    const items = [...track.children];
    if (items.length < 2) return;
    const dots = document.createElement("div");
    dots.className = "rail-dots";
    dots.innerHTML = items.map((_, i) => `<button type="button" aria-label="Карточка ${i + 1}"></button>`).join("");
    track.after(dots);
    const btns = [...dots.children];
    const off = (it) => {
      const r = it.getBoundingClientRect(), t = track.getBoundingClientRect();
      return r.left + r.width / 2 - (t.left + t.width / 2);
    };
    const sync = () => {
      let best = 0;
      items.forEach((it, i) => {
        if (Math.abs(off(it)) < Math.abs(off(items[best]))) best = i;
      });
      btns.forEach((b, i) => b.classList.toggle("active", i === best));
    };
    btns.forEach((b, i) => (b.onclick = () => track.scrollTo({ left: track.scrollLeft + off(items[i]), behavior: "smooth" })));
    track.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
    sync();
  }
  attachDots(qs("#objectGrid"));
  renderCatalog();
  qs(".gallery-nav.prev").onclick = () => moveGallery(-1);
  qs(".gallery-nav.next").onclick = () => moveGallery(1);

  const stageObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const i = +entry.target.dataset.stage,
            s = D.process[i];
          qsa(".process-step").forEach((x) =>
            x.classList.toggle("active", x === entry.target),
          );
          qs("#stageNumber").textContent = s.no;
          qs("#stageLabel").textContent = s.title;
        }
      }),
    { root: qs('[data-view-panel="process"]'), rootMargin: "-48% 0px -48% 0px", threshold: 0 },
  );
  qsa(".process-step").forEach((x) => stageObserver.observe(x));

  function makeFigure(src, alt) {
    const f = document.createElement("figure"),
      img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    f.append(img);
    return f;
  }
  let returnProject = "";
  qs("#calcBack").onclick = () => { if (returnProject) openProject(returnProject); };
  function heroProgress() {
    const hero = qs("#pdHero");
    if (!hero) return;
    const t = Math.min(1, Math.max(0, projectScroll.scrollTop / (window.innerHeight * 0.55)));
    hero.style.setProperty("--p", t.toFixed(3));
  }
  projectScroll.addEventListener("scroll", () => requestAnimationFrame(heroProgress), { passive: true });
  function scrambleWord(el, word) {
    const text = word.toUpperCase(),
      pool = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
    clearInterval(el._t);
    el.innerHTML = [...text].map(() => "<span>·</span>").join("");
    const spans = [...el.children];
    const tint = () => {
      const w = el.scrollWidth, x0 = el.getBoundingClientRect().left;
      spans.forEach((s) => {
        s.style.backgroundSize = w + "px 100%";
        s.style.backgroundPosition = -(s.getBoundingClientRect().left - x0) + "px 0";
      });
    };
    tint();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spans.forEach((s, i) => (s.textContent = text[i]));
      tint();
      return;
    }
    const t0 = performance.now();
    el._t = setInterval(() => {
      const t = performance.now() - t0;
      let done = 0;
      spans.forEach((s, i) => {
        const stop = 500 + i * 170;
        if (t >= stop) {
          if (s.textContent !== text[i] || s.classList.contains("run")) {
            s.textContent = text[i];
            s.classList.remove("run");
          }
          done++;
        } else {
          s.textContent = pool[(Math.random() * pool.length) | 0];
          s.classList.add("run");
        }
      });
      if (done === spans.length) {
        clearInterval(el._t);
        tint();
      }
    }, 55);
  }
  function openProject(name) {
    const p = D.projects[name];
    if (!p) return;
    currentProject = name;
    openView("projects", false);
    projectDetail.classList.add("open");
    projectDetail.setAttribute("aria-hidden", "false");
    projectScroll.scrollTop = 0;
    const coveredHero = qs(".covered-hero", projectDetail);
    coveredHero.classList.remove("lit");
    projectScroll.onwheel = projectScroll.ontouchstart = projectScroll.ontouchmove = null;
    requestAnimationFrame(() => coveredHero.classList.add("lit"));
    qs("#pdType").textContent = p.type;
    qs("#pdTitle").textContent = name;
    scrambleWord(qs("#pdWord"), name);
    qs("#pdHeroImg").src = p.images[0];
    qs("#pdHeroImg").alt = `Проект ${name}`;
    heroProgress();
    qs("#pdLead").textContent = p.lead;
    qs("#pdStatement").textContent = p.statement;
    qs("#pdDescription").textContent = p.description;
    const facts = [
      [p.area, "Площадь"],
      [p.floors, "Этажность"],
      [p.bedrooms, "Спальни"],
      [p.projectPrice, "Стоимость проекта"],
    ];
    qs("#pdFacts").innerHTML = facts
      .map((x) => `<article><b>${x[0]}</b><span>${x[1]}</span></article>`)
      .join("");
    qs("#pdGallery").replaceChildren(
      ...p.images.map((src, i) =>
        makeFigure(src, `Проект ${name}, вид ${i + 1}`),
      ),
    );
    qsa("#pdGallery figure").forEach((figure, i) => {
      figure.tabIndex = 0;
      figure.setAttribute("role", "button");
      figure.onclick = () =>
        openGallery(
          p.images,
          { title: `Проект «${name}»`, place: "Дом со всех сторон" },
          i,
        );
      figure.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") figure.click();
      };
    });
    qs("#pdPlans").replaceChildren(
      ...p.plans.map((src, i) =>
        makeFigure(src, `Проект ${name}, план ${i + 1}`),
      ),
    );
    const base = priceNum(p.projectPrice);
    qs("#pdPackages").innerHTML = `<div class="pkg-head"><span></span>${D.packages.map((k, ci) => `<div data-c="${ci}">${k.id === "work" ? '<em class="pkg-rec">Рекомендуем</em>' : ""}<b>${k.title}</b><strong>${rub(base * k.k).toLocaleString("ru-RU")} ₽</strong><small>или 6 × ${rub((base * k.k) / 6).toLocaleString("ru-RU")} ₽ без %</small></div>`).join("")}</div>${D.packageRows.map((r, i) => `<div class="pkg-row"><span>${r}</span>${D.packages.map((k, ci) => `<i data-c="${ci}" class="${k.f[i] ? "yes" : "no"}">${k.f[i] ? "<span>✓</span>" : "—"}</i>`).join("")}</div>`).join("")}<div class="pkg-row pkg-buy"><span></span>${D.packages.map((k, ci) => `<div data-c="${ci}"><button type="button" class="${k.id === "work" ? "primary" : "ghost"}" data-buy="${k.id}">Купить</button></div>`).join("")}</div>`;
    const pc = qs("#pdPackages");
    pc.onmouseover = (ev) => { const c = ev.target.closest("[data-c]"); pc.dataset.hover = c ? c.dataset.c : ""; };
    pc.onmouseleave = () => (pc.dataset.hover = "");
    qsa("#pdPackages [data-buy]").forEach((b) => (b.onclick = () => { leadPackage = b.dataset.buy; openLead("buy", name); }));
    qs("#pdFreePdf").onclick = () => openLead("pdf", name);
    qs("#pdExtra").innerHTML = `<span>Дополнительно к проекту</span><button type="button" data-x="adapt"><b>Адаптация под участок</b><em>от 45 000 ₽</em><i>↗︎</i></button><button type="button" data-x="calc"><b>Строительство дома</b><em>${p.buildPrice} · ≈ ${monthly(priceNum(p.buildPrice) * (/млн/.test(p.buildPrice) ? 100000 : 1)).toLocaleString("ru-RU")} ₽/мес в ипотеку</em><i>↗︎</i></button>`;
    qs("#pdExtra").onclick = (ev) => { const x = ev.target.closest("[data-x]"); if (!x) return; if (x.dataset.x === "adapt") return openLead("adapt", name); returnProject = name; openView("calc"); const cb = qs("#calcBack"); cb.hidden = false; cb.textContent = `←︎ Вернуться к проекту «${name}»`; };
    const adapt = [
      {
        title: "Посадка на участок",
        summary: "Находим точное положение дома.",
        text: "Проверяем отступы, подъезд, солнце, рельеф, видовые направления и точки подключения сетей.",
        result:
          "Вы получаете схему посадки с привязками, отметками и рекомендациями по участку.",
        image: p.images[0],
      },
      {
        title: "Планировка",
        summary: "Настраиваем маршруты под вашу семью.",
        text: "Меняем состав и связи помещений, хранение, входную группу и хозяйственные зоны, не разрушая логику дома.",
        result:
          "Вы получаете согласованные планы с площадями и расстановкой мебели.",
        image: p.plans[0],
      },
      {
        title: "Конструктив",
        summary: "Привязываем несущую схему к условиям участка.",
        text: "Учитываем геологию, снеговые нагрузки и выбранные материалы стен, перекрытий и кровли.",
        result:
          "Вы получаете расчётную схему и рабочие решения для фундамента и конструкций.",
        image: p.images[1] || p.images[0],
      },
      {
        title: "Инженерия",
        summary: "Согласуем мощности и оборудование.",
        text: "Определяем отопление, вентиляцию, воду, электрику и места оборудования до начала работ.",
        result:
          "Вы получаете согласованные инженерные схемы и исходные данные для монтажа.",
        image: p.plans[1] || p.plans[0],
      },
    ];
    qs("#adaptOptions").innerHTML = adapt
      .map(
        (a, i) =>
          `<button type="button" data-adapt="${i}" class="${i === 0 ? "active" : ""}"><span><b>${a.title}</b><small>${a.summary}</small><em>${a.text}<strong>${a.result}</strong></em></span><i aria-hidden="true">+</i></button>`,
      )
      .join("");
    const setAdapt = (i) => {
      qsa("[data-adapt]").forEach((b, n) =>
        b.classList.toggle("active", n === i),
      );
      qs("#adaptImage").style.opacity = "0";
      setTimeout(() => {
        qs("#adaptImage").src = adapt[i].image;
        qs("#adaptImage").alt = adapt[i].title;
        qs("#adaptCaption").textContent = adapt[i].title + " · " + name;
        const im = qs("#adaptImage");
        const show = () => (im.style.opacity = "1");
        im.complete ? requestAnimationFrame(show) : (im.onload = show);
      }, 450);
    };
    qs("#adaptOptions").onclick = (e) => {
      const b = e.target.closest("[data-adapt]");
      if (b) setAdapt(+b.dataset.adapt);
    };
    setAdapt(0);
    const related = projectEntries.filter(([n]) => n !== name).slice(0, 2);
    qs("#pdRelated").innerHTML = related
      .map(
        ([n, r]) =>
          `<button class="related-card" type="button" data-project="${n}"><img src="${r.images[0]}" alt="Проект ${n}"><div><span>${r.type}</span><h3>${n}</h3></div></button>`,
      )
      .join("");
    qs("#pdPdf").onclick = () => openLead("pdf", name);
    qs("#pdBuy").onclick = () => openLead("buy", name);
    qs("#pdCompare").onclick = () => toggleCompare(name);
    updateCompareButtons();
    history.replaceState(null, "", "#project-" + p.slug);
  }
  qs("#projectClose").onclick = () => {
    projectDetail.classList.remove("open");
    projectDetail.setAttribute("aria-hidden", "true");
    history.replaceState(null, "", "#projects");
    updateCompareDock();
  };

  let compare = (() => {
    try {
      return JSON.parse(localStorage.getItem("hbtech-compare") || "[]")
        .filter((n) => D.projects[n])
        .slice(0, 3);
    } catch {
      return [];
    }
  })();
  function toggleCompare(name) {
    const i = compare.indexOf(name);
    if (i >= 0) compare.splice(i, 1);
    else if (compare.length < 3) compare.push(name);
    localStorage.setItem("hbtech-compare", JSON.stringify(compare));
    updateCompareButtons();
    updateCompareDock();
    if (compareSheet.classList.contains("open")) renderCompare();
  }
  function updateCompareButtons() {
    qsa("[data-compare]").forEach((b) => {
      const on = compare.includes(b.dataset.compare);
      b.textContent = on ? "✓" : "+";
      b.classList.toggle("active", on);
    });
    if (projectDetail.classList.contains("open"))
      qs("#pdCompare").textContent = compare.includes(currentProject)
        ? "Убрать из сравнения"
        : "Добавить к сравнению";
  }
  function updateCompareDock() {
    const show =
      compare.length > 0 &&
      (activeView === "projects" || projectDetail.classList.contains("open"));
    qs("#compareDock").classList.toggle("show", show);
    qs("#dockMini").textContent = `Сравнение · ${compare.length}`;
    qs("#compareSlots").innerHTML = Array.from({ length: 3 }, (_, i) =>
      compare[i]
        ? `<button type="button" data-remove-compare="${compare[i]}">${compare[i]} ×</button>`
        : `<button type="button" data-open-compare>+</button>`,
    ).join("");
  }
  qs("#compareSlots").onclick = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.removeCompare) toggleCompare(b.dataset.removeCompare);
    else openCompare();
  };
  qs("#openCompare").onclick = openCompare;
  qs("#dockHide").onclick = () => qs("#compareDock").classList.add("mini");
  qs("#dockMini").onclick = () => qs("#compareDock").classList.remove("mini");
  function openCompare() {
    renderCompare();
    compareSheet.classList.remove("light");
    compareSheet.classList.add("open");
    compareSheet.setAttribute("aria-hidden", "false");
  }
  function renderCompare() {
    qs("#comparePicker").innerHTML = projectEntries
      .map(([n]) => `<button type="button" data-pick-compare="${n}" class="${compare.includes(n) ? "active" : ""}">${compare.includes(n) ? "✓ " : "+ "}${n}</button>`)
      .join("");
    const cols = compare.slice();
    const groups = [
      ["Размеры", [["Площадь", "area"], ["Габариты", "dimensions"], ["Этажность", "floors"]]],
      ["Планировка", [["Спальни", "bedrooms"], ["Санузлы", "bathrooms"], ["Терраса", "terrace"]]],
      ["Стоимость", [["Проект", "projectPrice"], ["Строительство", "buildPrice"], ["Платёж в ипотеку", "_m"]]],
    ];
    const val = (n, k) => (k === "_m" ? `≈ ${monthly(priceNum(D.projects[n].buildPrice) * (/млн/.test(D.projects[n].buildPrice) ? 100000 : 1)).toLocaleString("ru-RU")} ₽/мес` : D.projects[n][k]);
    const diff = qs("#diffOnly").checked;
    const n = cols.length, empty = n < 3;
    const tpl = `grid-template-columns: minmax(150px,1fr) repeat(${n + (empty ? 1 : 0)}, minmax(0,1.4fr))`;
    const head = `<div class="cg-row cg-head" style="${tpl}"><span></span>${cols.map((c) => `<div class="cg-card"><img src="${D.projects[c].images[0]}" alt="Проект ${c}"><b>${c}</b><em>${D.projects[c].projectPrice}</em><span><button type="button" data-open-project="${c}">Открыть ↗︎</button><button type="button" data-remove-compare="${c}">Убрать</button></span></div>`).join("")}${empty ? `<button type="button" class="cg-add" id="cgAdd"><i>+</i>Добавить проект</button>` : ""}</div>`;
    const body = groups.map(([g, rows]) => {
      const rr = rows.filter(([, k]) => !diff || n < 2 || new Set(cols.map((c) => val(c, k))).size > 1);
      if (!rr.length) return "";
      return `<div class="cg-group">${g}</div>` + rr.map(([l, k]) => `<div class="cg-row" style="${tpl}"><span>${l}</span>${cols.map((c) => `<div>${val(c, k)}</div>`).join("")}${empty ? "<div></div>" : ""}</div>`).join("");
    }).join("");
    qs("#compareTable").innerHTML = n ? head + body : `<div class="cg-empty">Добавьте проекты, чтобы сравнить их.<button type="button" class="cg-add" id="cgAdd"><i>+</i>Добавить проект</button></div>`;
    qs("#comparePicker").hidden = n > 0 && !qs("#comparePicker").dataset.show;
  }
  qs("#diffOnly").onchange = renderCompare;
  qs("#compareTable").addEventListener("click", (e) => {
    if (e.target.closest("#cgAdd")) { const p = qs("#comparePicker"); p.dataset.show = "1"; p.hidden = false; p.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
    const o = e.target.closest("[data-open-project]");
    if (o) { closeSheet(compareSheet); openProject(o.dataset.openProject); }
  });
  qs("#comparePicker").onclick = (e) => {
    const b = e.target.closest("[data-pick-compare]");
    if (b) toggleCompare(b.dataset.pickCompare);
  };
  qs("#compareTable").onclick = (e) => {
    const b = e.target.closest("[data-remove-compare]");
    if (b) toggleCompare(b.dataset.removeCompare);
  };

  function setSheetTone(sheet) {
    const panel = qs(`[data-view-panel="${activeView}"]`);
    const light =
      !projectDetail.classList.contains("open") &&
      panel?.classList.contains("light-view");
    sheet.classList.toggle("light", Boolean(light));
  }
  function openDetail(data) {
    qs("#sheetEyebrow").textContent = data.label || "ПОДРОБНЕЕ";
    qs("#sheetTitle").textContent = data.title;
    qs("#sheetText").textContent = data.text;
    qs("#sheetPoints").innerHTML = (data.points || [])
      .map(
        (p, i) =>
          `<article><b>${String(i + 1).padStart(2, "0")}</b><span>${p}</span></article>`,
      )
      .join("");
    setSheetTone(detailSheet);
    detailSheet.classList.add("open");
    detailSheet.setAttribute("aria-hidden", "false");
  }
  document.addEventListener("click", (e) => {
    const card = e.target.closest("[data-detail]");
    if (card && e.target.closest("button"))
      openDetail(D.details[card.dataset.detail]);
  });
  function openLegal(type) {
    const content = {
      privacy: {
        label: "ДОКУМЕНТЫ",
        title: "Конфиденциальность",
        text: "Персональные данные используются только для подготовки выбранного материала или ответа на запрос.",
        points: [
          "Имя и контактные данные",
          "Цель обработки — выполнение запроса",
          "Передача третьим лицам не выполняется без основания",
          "Согласие можно отозвать обращением по email",
        ],
      },
      offer: {
        label: "УСЛОВИЯ",
        title: "Порядок работы",
        text: "Состав, стоимость, сроки и ответственность фиксируются в индивидуальном договоре.",
        points: [
          "Согласованный состав работ",
          "График и этапы оплаты",
          "Порядок внесения изменений",
          "Приёмка и гарантийные условия",
        ],
      },
      details: {
        label: "HBTECH",
        title: "Реквизиты",
        text: "Юридическая и платёжная информация размещается в договоре и счёте.",
        points: [
          D.company.region,
          D.company.phone,
          D.company.email,
          D.company.hours,
        ],
      },
    }[type];
    openDetail(content);
  }
  qsa("[data-close-sheet]").forEach(
    (b) => (b.onclick = () => closeSheet(detailSheet)),
  );
  qsa("[data-close-lead]").forEach(
    (b) => (b.onclick = () => closeSheet(leadSheet)),
  );
  qsa("[data-close-compare]").forEach(
    (b) => (b.onclick = () => closeSheet(compareSheet)),
  );
  qsa("[data-close-gallery]").forEach(
    (b) => (b.onclick = () => closeSheet(gallerySheet)),
  );
  qsa(".sheet").forEach((s) =>
    s.addEventListener("click", (e) => {
      if (e.target === s) closeSheet(s);
    }),
  );
  function closeSheet(s) {
    s.classList.remove("open");
    s.setAttribute("aria-hidden", "true");
  }

  const leadConfig = {
    mortgage: ["ИПОТЕКА И РАССРОЧКА", "Подобрать ипотеку", "Подберём программу банка-партнёра и рассчитаем платёж под ваш дом."],
    buy: [
      "ПОКУПКА ПРОЕКТА",
      "Купить проект",
      "Выберите комплект документации. Менеджер пришлёт договор и счёт, оплата после согласования.",
    ],
    project: [
      "ПОЛУЧИТЬ ПРОЕКТ",
      "Получить проект",
      "Оставьте имя и email — откроем материалы. Телефон можно не указывать. Мы не будем звонить или писать без отдельного разрешения.",
    ],
    pdf: [
      "ОЗНАКОМИТЕЛЬНЫЕ МАТЕРИАЛЫ",
      "Открыть PDF",
      "Имя и email обязательны для доступа к файлу. Свяжемся только если вы отдельно разрешите.",
    ],
    full: [
      "ПОКУПКА ПРОЕКТА",
      "Запросить полный проект",
      "Уточним нужный состав документации и подготовим условия покупки.",
    ],
    adapt: [
      "АДАПТАЦИЯ ПРОЕКТА",
      "Адаптировать проект",
      "Проверим участок, планировку, конструктив и инженерные исходные данные.",
    ],
    build: [
      "РАСЧЁТ СТРОИТЕЛЬСТВА",
      "Рассчитать дом",
      "Подготовим перечень исходных данных для сметы и календарного плана.",
    ],
    spec: [
      "КОМПЛЕКТАЦИЯ",
      "Получить спецификацию",
      "Покажем структуру ведомостей, правила выбора и контроля поставок.",
    ],
    consult: [
      "ОБСУДИТЬ ЗАДАЧУ",
      "Начать разговор",
      "Опишите задачу. Звонок или сообщение — только с вашего разрешения.",
    ],
  };
  let leadPackage = "work";
  const priceNum = (s) => +String(s || "").replace(/[^\d]/g, "") || 0;
  const rub = (n) => Math.round(n / 1000) * 1000;
  function renderPackages(show) {
    const box = qs("#leadPackages");
    box.hidden = !show;
    if (!show) return;
    const base = priceNum(D.projects[currentProject]?.projectPrice) || 590000;
    box.innerHTML = D.packages
      .map((k) => `<button type="button" class="pkg ${k.id === leadPackage ? "on" : ""}" data-pkg="${k.id}"><span>${k.title}</span><b>${rub(base * k.k).toLocaleString("ru-RU")} ₽</b><small>${k.inc}</small></button>`)
      .join("");
  }
  qs("#leadPackages").onclick = (e) => {
    const b = e.target.closest("[data-pkg]");
    if (!b) return;
    leadPackage = b.dataset.pkg;
    renderPackages(true);
  };
  function openLead(mode = "project", projectName) {
    leadMode = mode;
    if (projectName && D.projects[projectName]) currentProject = projectName;
    const c = leadConfig[mode] || leadConfig.project;
    qs("#leadEyebrow").textContent = c[0];
    qs("#leadTitle").textContent = projectName
      ? `${c[1]} «${projectName}»`
      : c[1];
    qs("#leadText").textContent = c[2];
    renderPackages(mode === "buy");
    const needsProject = ["project", "pdf", "full", "adapt", "build", "buy"].includes(
      mode,
    );
    const picker = qs("#leadProjectPicker");
    picker.innerHTML = needsProject
      ? `<span>ВЫБЕРИТЕ ПРОЕКТ</span><div>${projectEntries.map(([name]) => `<button type="button" data-lead-project="${name}" class="${name === currentProject ? "active" : ""}">${name}</button>`).join("")}</div>`
      : "";
    picker.hidden = !needsProject;
    qs("#leadForm").reset();
    qs("#leadForm").style.display = "grid";
    qs("#formSuccess").classList.remove("show");
    qs("#leadDownload").style.display = "none";
    setSheetTone(leadSheet);
    leadSheet.classList.add("open");
    leadSheet.setAttribute("aria-hidden", "false");
  }
  qs("#leadProjectPicker").onclick = (e) => {
    const button = e.target.closest("[data-lead-project]");
    if (!button) return;
    currentProject = button.dataset.leadProject;
    if (leadMode === "buy") renderPackages(true);
    qsa("[data-lead-project]", qs("#leadProjectPicker")).forEach((item) =>
      item.classList.toggle("active", item === button),
    );
  };
  qs("#leadForm").onsubmit = (e) => {
    e.preventDefault();
    const record = Object.fromEntries(new FormData(e.currentTarget));
    record.mode = leadMode;
    record.project = currentProject;
    record.createdAt = new Date().toISOString();
    const saved = JSON.parse(localStorage.getItem("hbtech-requests") || "[]");
    saved.push(record);
    localStorage.setItem("hbtech-requests", JSON.stringify(saved.slice(-20)));
    const m = record.messenger || "WhatsApp";
    const what = { build: "точную смету", buy: "договор и счёт", mortgage: "расчёт ипотеки", consult: "ответ", adapt: "расчёт адаптации", spec: "спецификацию" }[leadMode] || "ответ";
    qs("#successText").textContent = leadMode === "pdf" || leadMode === "project" ? `PDF доступен ниже. Также продублируем его в ${m}.` : `Пришлём ${what} в ${m} в течение 1–3 рабочих дней.`;
    e.currentTarget.style.display = "none";
    qs("#formSuccess").classList.add("show");
    if (leadMode === "pdf" || leadMode === "project") {
      const p = D.projects[currentProject] || D.projects["Север"];
      qs("#leadDownload").href = p.pdf;
      qs("#leadDownload").style.display = "inline-block";
    }
  };

  function observeCounters(root = document) {
    const counters = qsa("[data-count]:not([data-counted])", root);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target,
            target = Number(el.dataset.count) || 0;
          el.dataset.counted = "true";
          const started = performance.now(),
            duration = 1150;
          const tick = (now) => {
            const p = Math.min(1, (now - started) / duration);
            const eased = 1 - Math.pow(1 - p, 4);
            el.textContent = Math.round(target * eased).toLocaleString("ru-RU");
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        }),
      {
        root: root?.classList?.contains("view") ? root : null,
        threshold: 0.55,
      },
    );
    counters.forEach((el) => io.observe(el));
  }

  function observeReveals(root = document) {
    const items = qsa(".reveal:not(.in)", root),
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((x) => {
            if (x.isIntersecting) {
              x.target.classList.add("in");
              io.unobserve(x.target);
            }
          }),
        {
          root: root?.classList?.contains("view") ? root : null,
          threshold: 0.12,
        },
      );
    items.forEach((x) => io.observe(x));
  }
  qsa("[data-video-section]").forEach((section) => {
    const video = qs("video", section),
      bar = qs(".video-progress i", section),
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((x) => {
            if (x.isIntersecting) video.play().catch(() => {});
            else video.pause();
          }),
        { threshold: 0.45 },
      );
    io.observe(section);
    video.addEventListener(
      "timeupdate",
      () =>
        (bar.style.width =
          (video.currentTime / (video.duration || 1)) * 100 + "%"),
    );
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (gallerySheet.classList.contains("open")) closeSheet(gallerySheet);
    else if (compareSheet.classList.contains("open")) closeSheet(compareSheet);
    else if (leadSheet.classList.contains("open")) closeSheet(leadSheet);
    else if (detailSheet.classList.contains("open")) closeSheet(detailSheet);
    else if (projectDetail.classList.contains("open"))
      qs("#projectClose").click();
    else openView("home");
  });
  const hash = location.hash.slice(1),
    projectHash = projectEntries.find(([, p]) => "project-" + p.slug === hash);
  if (projectHash) openProject(projectHash[0]);
  else openView(qs(`[data-view-panel="${hash}"]`) ? hash : "home", false);
  updateCompareButtons();
  observeReveals(qs(".view.active"));
  const np = qs("#navPhone");
  np.textContent = D.company.phone;
  np.href = "tel:" + D.company.phoneHref;
  qs(".projects-hero [data-count]").dataset.count = projectEntries.length;
  qs("#homeGrid").addEventListener("pointermove", (e) => {
    const card = e.target.closest(".home-card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", e.clientX - r.left + "px");
    card.style.setProperty("--my", e.clientY - r.top + "px");
  });
  const five = qs(".process-five");
  if (five) five.textContent = D.process.length;
  const calcState = { floors: "m", mat: "gas", pack: "warm" };
  const fmtM = (v) => (v / 1e6).toFixed(1).replace(".", ",");
  const fmtK = (v) => Math.round(v / 1000) * 1000;
  function calcRender() {
    const C = D.calc, area = +qs("#calcArea").value;
    const rate = C.pack[calcState.pack] * C.mat[calcState.mat] * C.floors[calcState.floors];
    const lo = area * rate, hi = lo * C.spread;
    qs("#calcAreaOut").textContent = area + " м²";
    qs("#calcRange").textContent = `${fmtM(lo)}–${fmtM(hi)} млн ₽`;
    qs("#calcPer").textContent = `≈ ${fmtK(rate).toLocaleString("ru-RU")}–${fmtK(rate * C.spread).toLocaleString("ru-RU")} ₽ за м²`;
    qs("#calcInc").textContent = C.inc[calcState.pack];
    qs("#calcMort").textContent = `≈ от ${monthly(lo).toLocaleString("ru-RU")} ₽/мес в ипотеку (взнос 20%, ${D.mortgage.years} лет, от ${D.mortgage.rate}%)`;
  }
  qs("#calcArea").addEventListener("input", calcRender);
  qsa(".seg[data-calc]").forEach((seg) =>
    seg.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      seg.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      calcState[seg.dataset.calc] = b.dataset.v;
      calcRender();
    }),
  );
  calcRender();
  const NB = "\u00a0";
  function noWrapPrices(root = document.body) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const t = n.nodeValue;
      if (!/₽|млн/.test(t)) continue;
      const v = t
        .replace(/(\d) (?=\d{3}(\D|$))/g, "$1" + NB)
        .replace(/(\d) (?=(₽|млн|тыс))/g, "$1" + NB)
        .replace(/(млн|тыс\.?) ₽/g, "$1" + NB + "₽")
        .replace(/(^|\s)(от|до) (?=\d)/g, "$1$2" + NB)
        .replace(/(\d)[–-](?=\d)/g, "$1\u2011");
      if (v !== t) n.nodeValue = v;
    }
  }
  let nwTimer;
  new MutationObserver(() => {
    clearTimeout(nwTimer);
    nwTimer = setTimeout(() => noWrapPrices(), 60);
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
  noWrapPrices();
  qs("#cardBig").textContent = projectEntries.length;
  qs("#stageLabel").textContent = D.process[0].title;
  qs("#processPromises").innerHTML = D.promises.map(([t, x]) => `<div><b>${t}</b><span>${x}</span></div>`).join("");
  const MSG = [["WhatsApp", D.company.whatsapp], ["Telegram", D.company.telegram], ["MAX", D.company.max]];
  qs("#msgList").innerHTML = MSG.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join("");
  qs("#msgToggle").onclick = () => {
    const o = qs("#msgFab").classList.toggle("open");
    qs("#msgToggle").setAttribute("aria-expanded", o);
  };
  const pv = qs('[data-view-panel="process"]'), plist = qs("#processList");
  pv.addEventListener("scroll", () => {
    const r = plist.getBoundingClientRect(), mid = innerHeight / 2;
    plist.style.setProperty("--prog", Math.min(1, Math.max(0, (mid - r.top) / r.height)).toFixed(3));
  }, { passive: true });
  qs("#msgChoice").onclick = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    qsa("#msgChoice button").forEach((x) => x.classList.toggle("on", x === b));
    qs('#leadForm [name="messenger"]').value = b.dataset.v;
  };
  qs("#privacyLink").onclick = (e) => {
    e.preventDefault();
    openDetail({ label: "ДОКУМЕНТЫ", title: "Политика конфиденциальности", text: "Заглушка: здесь будет политика обработки персональных данных по 152-ФЗ — какие данные собираем, зачем, как храним и как отозвать согласие.", points: ["Оператор: ООО «HBTECH» (реквизиты — заглушка)", "Данные: имя, телефон, email, сообщение", "Цель: ответ на запрос и подготовка сметы", "Отзыв согласия: письмом на hello@hbtech.ru"] });
  };
  function monthly(sum) {
    const M = D.mortgage, r = M.rate / 1200, n = M.years * 12, L = sum * (1 - M.down);
    return Math.round((L * r) / (1 - Math.pow(1 + r, -n)) / 1000) * 1000;
  }
  window.hbMonthly = monthly;
  qs("#mortPrograms").innerHTML = D.mortgage.programs.map(([t, v]) => `<div><span>${t}</span><b>${v}</b></div>`).join("");
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-goto-mortgage]")) return;
    closeSheet(leadSheet);
    if (projectDetail.classList.contains("open")) projectDetail.classList.remove("open");
    openView("experience");
    setTimeout(() => qs(".mortgage-section").scrollIntoView({ behavior: "smooth", block: "start" }), 500);
  });
  const homeView = qs(".home-view");
  if (location.hash.startsWith("#project-")) homeView.classList.remove("intro");
  else setTimeout(() => homeView.classList.remove("intro"), 6600);
  observeCounters(qs(".view.active"));
})();
