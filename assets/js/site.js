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
		hud: "<strong>In game.</strong> Coordinates, the compass strip with waypoint markers, Mob Info on the husk you're looking at, potion timers, armour durability and the item counter.",
		menu: "<strong>ClickGUI.</strong> Press Right Shift for every module, sorted into categories with search and a count of what's on.",
		settings: "<strong>Settings.</strong> Every module has its own page of toggles and sliders, like Zoom's level, scroll and smoothing options.",
		editor: "<strong>HUD editor.</strong> Drag panels anywhere, scroll to resize and right-click to hide. Positions stay put at any resolution.",
		title: "<strong>Main menu.</strong> A custom title screen over a blurred panorama, in the same glass style as the rest of the client."
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

	// ---------- Accent presets (same as the client's Interface module) ----------
	var swatches = Array.prototype.slice.call(document.querySelectorAll(".swatch"));

	function applyAccent(swatch) {
		var style = swatch.style;
		root.style.setProperty("--a1", style.getPropertyValue("--s1"));
		root.style.setProperty("--a2", style.getPropertyValue("--s2"));
		swatches.forEach(function (s) {
			s.setAttribute("aria-pressed", s === swatch ? "true" : "false");
		});
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
