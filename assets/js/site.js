// Goon Client site: nav, screenshot tabs, themes and scroll reveals. No tracking, no dependencies.
(function () {
	"use strict";

	var root = document.documentElement;

	function store(key, value) {
		try {
			if (value === undefined) {
				return window.localStorage.getItem(key);
			}
			window.localStorage.setItem(key, value);
		} catch (e) {
			// Storage blocked (private window etc.): the page still works, it just won't remember
		}
		return null;
	}

	// ---------- Nav ----------
	var nav = document.getElementById("nav");
	var toggle = document.getElementById("nav-toggle");

	function onScroll() {
		if (nav) nav.classList.toggle("scrolled", window.scrollY > 12);
	}

	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	if (toggle && nav) {
		toggle.addEventListener("click", function () {
			var open = nav.classList.toggle("open");
			toggle.setAttribute("aria-expanded", open ? "true" : "false");
			toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
		});
		nav.querySelectorAll(".nav-links a").forEach(function (link) {
			link.addEventListener("click", function () {
				nav.classList.remove("open");
				toggle.setAttribute("aria-expanded", "false");
				toggle.setAttribute("aria-label", "Open menu");
			});
		});
	}

	// ---------- Screenshot tabs ----------
	var captions = {
		hud: "<strong>In game.</strong> FPS and memory pills, Potions, Keybinds, Cooldowns and Inventory panels, a target card and automatic panel spacing and the glass hotbar.",
		menu: "<strong>ClickGUI.</strong> Press Right Shift for one glass window with category tabs and icon cards. Options opens settings; Enabled switches the module; Ctrl+F searches.",
		settings: "<strong>Settings.</strong> The HUD page: a card with a switch for every element, next to pages for the interface, themes and saved setups.",
		module: "<strong>Module settings.</strong> Every module has its own panel of switches, sliders and option lists, with its shortcut key at the top.",
		editor: "<strong>HUD editor.</strong> Drag panels anywhere and scroll to resize. Select one and all its settings sit right beside it.",
		configs: "<strong>Configs.</strong> Save your setup, load a built-in one like Combatant, Survival, Builder or Boss run, undo if you change your mind, or link a setup to a world or server.",
		title: "<strong>Main menu.</strong> The Goon mark, glass buttons over the animated background (or your own picture) and a compact tools dock.",
		pause: "<strong>Pause menu.</strong> Back to the game, Goon Client, your Adventure Log and the usual options, plus what you've done this session.",
		log: "<strong>Adventure Log.</strong> Press J for everything that happened in this world: deaths and what killed you, bosses, rare finds, advancements and trips.",
		options: "<strong>Goon Options.</strong> A settings hub with cards for every page, a field-of-view slider and the low-resource preset."
	};
	var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
	var viewer = document.getElementById("viewer");
	var caption = document.getElementById("caption");

	function select(tab, focus) {
		if (!viewer) return;
		var shot = tab.getAttribute("data-shot");
		tabs.forEach(function (t) {
			var on = t === tab;
			t.setAttribute("aria-selected", on ? "true" : "false");
			t.tabIndex = on ? 0 : -1;
		});
		viewer.querySelectorAll(".stage img").forEach(function (img) {
			img.classList.toggle("active", img.getAttribute("data-shot") === shot);
		});
		viewer.setAttribute("aria-labelledby", tab.id);
		if (caption) caption.innerHTML = captions[shot] || "";
        showShots(selectedTheme);
		if (focus) {
			tab.focus();
		}
	}

	tabs.forEach(function (tab, i) {
		tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
		tab.addEventListener("click", function () {
			select(tab, false);
		});
		tab.addEventListener("keydown", function (e) {
			var next = null;
			if (e.key === "ArrowRight") {
				next = tabs[(i + 1) % tabs.length];
			} else if (e.key === "ArrowLeft") {
				next = tabs[(i - 1 + tabs.length) % tabs.length];
			} else if (e.key === "Home") {
				next = tabs[0];
			} else if (e.key === "End") {
				next = tabs[tabs.length - 1];
			}
			if (next) {
				e.preventDefault();
				select(next, true);
			}
		});
	});

	// ---------- Themes (the client's sixteen); themed screenshots follow along ----------
	var swatches = Array.prototype.slice.call(document.querySelectorAll(".swatch"));

	// Themed screenshots exist once per theme: shot-hud-1600.webp (Noir), shot-hud-mint-1600.webp, ...
	function shotFile(key, theme, size) {
		var suffix = theme && theme !== "Noir" ? "-" + theme.toLowerCase() : "";
		return "assets/img/shot-" + key + suffix + "-" + size + ".webp?v=0.18.3";
	}

    var selectedTheme = "Noir";
    var themedImages = Array.prototype.slice.call(document.querySelectorAll("img[data-themed], img[data-theme-shot], img[data-launcher-shot]"));
    var launcherPalettes = { Noir:"Noir", Sky:"Sky", Aurora:"Aurora", Violet:"Violet", Mint:"Mint", Amber:"Amber", Rose:"Rose", White:"White", Classic:"Sky", Azure:"Sky", Blue:"Sky", Legacy:"White", Purple:"Violet", Nitro:"Violet", Sunset:"Rose", Red:"Rose" };
    function showShots(theme) {
        selectedTheme = theme;
        themedImages.forEach(function (img) {
            var launcher = img.hasAttribute("data-launcher-shot");
            var key = img.getAttribute("data-theme-shot") || img.getAttribute("data-shot");
            var palette = launcherPalettes[theme] || "Sky";
            var src = launcher ? "assets/img/launcher-" + palette.toLowerCase() + ".webp?v=0.18.3" : shotFile(key, theme, 1600);
            var srcset = launcher ? "" : shotFile(key, theme, 800) + " 800w, " + src + " 1600w";
            // Inactive tour images wait until their tab opens. Preserve the displayed image while loading.
            var visible = launcher || img.classList.contains("active") || img.hasAttribute("data-theme-shot");
            img.dataset.requestedSrc = src;
            if (!visible || img.getAttribute("src") === src || img.dataset.loadingSrc === src) return;
            img.dataset.loadingSrc = src;
            var next = new Image();
            next.sizes = img.sizes;
            next.onload = function () {
                if (img.dataset.loadingSrc === src) delete img.dataset.loadingSrc;
                if (img.dataset.requestedSrc !== src) return;
                if (srcset) img.srcset = srcset; else img.removeAttribute("srcset");
                img.src = src;
                if (launcher) img.alt = "Goon Client Launcher in the " + palette + " palette: Play, release notes and shortcuts";
            };
            next.onerror = function () { if (img.dataset.loadingSrc === src) delete img.dataset.loadingSrc; };
            if (srcset) next.srcset = srcset;
            next.src = src;
        });
    }

	// Light accents (White, Mint, Classic...) get dark text on accent buttons
	function onAccent(hex) {
		var c = hex.trim().replace("#", "");
		var channel = function (i) {
			var v = parseInt(c.substr(i, 2), 16) / 255;
			return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
		};
		var luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
		// Choose whichever label has the higher contrast against this accent.
        return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? "#000" : "#fff";
	}

	function applyTheme(swatch) {
		var style = swatch.style;
		root.style.setProperty("--a1", style.getPropertyValue("--s1"));
		root.style.setProperty("--a2", style.getPropertyValue("--s2"));
		root.style.setProperty("--on-accent", onAccent(style.getPropertyValue("--s1")));
		swatches.forEach(function (s) {
			s.setAttribute("aria-pressed", s === swatch ? "true" : "false");
		});
		var theme = swatch.getAttribute("data-theme");
        document.querySelectorAll("img[data-brand]").forEach(function (img) {
            img.src = "assets/img/mark-" + theme.toLowerCase() + ".svg?v=0.17.1";
        });
        showShots(theme);
	}

	swatches.forEach(function (swatch) {
		swatch.addEventListener("click", function () {
			applyTheme(swatch);
			store("goon-theme", swatch.getAttribute("data-theme"));
		});
	});

	var initial = swatches.find(function (s) { return s.getAttribute("aria-pressed") === "true"; });
    if (initial) applyTheme(initial);
	var saved = store("goon-theme");
	if (saved) {
		swatches.forEach(function (swatch) {
			if (swatch.getAttribute("data-theme") === saved) {
				applyTheme(swatch);
			}
		});
	}

	// ---------- Reveal on scroll ----------
	var reveals = document.querySelectorAll(".reveal");
	if ("IntersectionObserver" in window) {
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add("in");
					observer.unobserve(entry.target);
				}
			});
		}, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
		reveals.forEach(function (el) {
			observer.observe(el);
		});
	} else {
		reveals.forEach(function (el) {
			el.classList.add("in");
		});
	}

	// ---------- Footer year ----------
	document.querySelectorAll("[data-year]").forEach(function (el) {
		el.textContent = String(new Date().getFullYear());
	});
})();
