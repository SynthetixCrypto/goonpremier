// Goon Client site: nav, screenshot tabs, accent presets and scroll reveals. No tracking, no dependencies.
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
		nav.classList.toggle("scrolled", window.scrollY > 12);
	}

	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	if (toggle) {
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
		hud: "<strong>In game.</strong> Mob Info beside the crosshair, a health bar and damage number over the husk, potion timers, armour, the Loot Tracker and shield status.",
		tools: "<strong>Boss Prep.</strong> A checklist before the Wither, the Warden or a raid: armour, weapon, food, healing, totems, arrows, blocks and space, with the FPS graph above.",
		menu: "<strong>ClickGUI.</strong> Press Right Shift for every module, sorted into categories with search and a count of what's on.",
		settings: "<strong>Settings.</strong> Every module has its own page of toggles and sliders, like the Custom Crosshair's style, size, spacing and colour.",
		editor: "<strong>HUD editor.</strong> Drag panels anywhere, scroll to resize and right-click to hide. Panels you leave alone make room for each other.",
		"minimap-settings": "<strong>Minimap.</strong> Xaero's map is part of your Goon HUD: move, resize or hide it in the editor, open map and radar settings here, and let nearby panels make room.",
		overlays: "<strong>Overlays.</strong> At night the Spawn Overlay marks every block a mob could spawn on, with chunk borders and spawn range rings for farm planning.",
		log: "<strong>Adventure Log.</strong> Press J for everything that happened in this world: deaths and what killed you, bosses, rare finds, advancements and trips.",
		pause: "<strong>Pause menu.</strong> Back to the game, Goon Client, your Adventure Log and the usual options, plus what you've done this session.",
		title: "<strong>Main menu.</strong> Buttons that slide in over the animated Goon background (or your own picture), with a What's new card straight from the changelog.",
		options: "<strong>Goon Options.</strong> A custom settings hub with a field-of-view slider and quick access to game settings, modules and the low-resource preset. Fresh installs skip the narrator welcome screen.",
		performance: "<strong>Low-resource preset.</strong> Reduce view distance, effects and menu overhead in one click. Your previous settings are saved so you can restore them even after a restart.",
		screenshots: "<strong>Screenshots.</strong> Browse your captures, click for a large preview, open images or copy their paths. Removed images go into a recovery folder, with undo in the gallery."
	};
	var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
	var viewer = document.getElementById("viewer");
	var caption = document.getElementById("caption");

	function select(tab, focus) {
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
		caption.innerHTML = captions[shot] || "";
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

	// ---------- Accent presets (same as the client's Interface module); screenshots follow along ----------
	var swatches = Array.prototype.slice.call(document.querySelectorAll(".swatch"));

	// Every client screenshot exists once per accent: shot-menu-1600.webp (Mint), shot-menu-sky-1600.webp, ...
	function shotFile(key, accent, size) {
		var suffix = accent && accent !== "Mint" ? "-" + accent.toLowerCase() : "";
		return "assets/img/shot-" + key + suffix + "-" + size + ".webp";
	}

	function showShots(accent) {
		document.querySelectorAll("img[data-shot], img[data-accent-shot]").forEach(function (img) {
			var key = img.getAttribute("data-shot") || img.getAttribute("data-accent-shot");
			var src = shotFile(key, accent, 1600);
			var srcset = shotFile(key, accent, 800) + " 800w, " + src + " 1600w";
			if (img.getAttribute("src") === src) {
				return;
			}
			var visible = img.classList.contains("active") || img.hasAttribute("data-accent-shot");
			if (!visible) {
				img.srcset = srcset;
				img.src = src;
				return;
			}
			// Load the new picture first so the visible one never goes blank
			var next = new Image();
			next.sizes = img.sizes;
			next.onload = function () {
				img.srcset = srcset;
				img.src = src;
			};
			next.srcset = srcset;
			next.src = src;
		});
	}

	function applyAccent(swatch) {
		var style = swatch.style;
		root.style.setProperty("--a1", style.getPropertyValue("--s1"));
		root.style.setProperty("--a2", style.getPropertyValue("--s2"));
		swatches.forEach(function (s) {
			s.setAttribute("aria-pressed", s === swatch ? "true" : "false");
		});
		showShots(swatch.getAttribute("data-accent"));
	}

	swatches.forEach(function (swatch) {
		swatch.addEventListener("click", function () {
			applyAccent(swatch);
			store("goon-accent", swatch.getAttribute("data-accent"));
		});
	});

	var saved = store("goon-accent");
	if (saved) {
		swatches.forEach(function (swatch) {
			if (swatch.getAttribute("data-accent") === saved) {
				applyAccent(swatch);
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
