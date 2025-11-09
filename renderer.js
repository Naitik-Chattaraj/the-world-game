window.addEventListener("DOMContentLoaded", () => {
  const mapObject = document.getElementById("world-map");

  mapObject.addEventListener("load", () => {
    const svgDoc = mapObject.contentDocument;
    const svgRoot = svgDoc.documentElement;
    const allPaths = svgDoc.querySelectorAll("path");

    const countries = {};

    // Group paths by name or class
    allPaths.forEach(path => {
      const name =
        path.getAttribute("class") ||
        path.getAttribute("name") ||
        path.getAttribute("data-name") ||
        path.getAttribute("id");

      if (name) {
        if (!countries[name]) countries[name] = [];
        countries[name].push(path);
      }
    });

    // === COUNTRY INTERACTIONS ===
    Object.keys(countries).forEach(name => {
      countries[name].forEach(path => {
        path.style.cursor = "pointer";

        path.addEventListener("mouseenter", () => {
          countries[name].forEach(p => (p.style.fillOpacity = 0.7));
        });

        path.addEventListener("mouseleave", () => {
          countries[name].forEach(p => (p.style.fillOpacity = 1));
        });

        path.addEventListener("click", () => {
          showCountryPanel(name); // <-- call the correct panel function
          allPaths.forEach(p => (p.style.fill = "#ececec"));
          countries[name].forEach(p => (p.style.fill = "#90caf9"));
        });
      });
    });

    // === ZOOM + PAN LOGIC ===
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isPanning = false;
    let startX = 0;
    let startY = 0;

    function applyTransform() {
      svgRoot.style.transformOrigin = "0 0";
      svgRoot.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    svgRoot.addEventListener("wheel", e => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const rect = svgRoot.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const newScale = Math.min(Math.max(scale * zoomFactor, 0.5), 5);
      translateX = cx - (cx - translateX) * (newScale / scale);
      translateY = cy - (cy - translateY) * (newScale / scale);

      scale = newScale;
      applyTransform();
    });

    svgRoot.addEventListener("mousedown", e => {
      isPanning = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      svgRoot.style.cursor = "grabbing";
    });

    svgRoot.addEventListener("mouseup", () => {
      isPanning = false;
      svgRoot.style.cursor = "default";
    });

    svgRoot.addEventListener("mouseleave", () => {
      isPanning = false;
      svgRoot.style.cursor = "default";
    });

    svgRoot.addEventListener("mousemove", e => {
      if (!isPanning) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      applyTransform();
    });

    svgRoot.addEventListener("dblclick", () => {
      scale = 1;
      translateX = 0;
      translateY = 0;
      applyTransform();
    });

    applyTransform();
  });
});

// ✅ Replaced showCountryInfo() with showCountryPanel()
async function showCountryPanel(name) {
  const panel = document.getElementById("country-panel");
  const nameEl = document.getElementById("country-name");
  const popEl = document.getElementById("country-pop");
  const gdpEl = document.getElementById("country-gdp");
  const milEl = document.getElementById("country-mil");
  const resEl = document.getElementById("country-res");

  try {
    const res = await fetch("./assets/data/countries.json");
    const data = await res.json();

    if (data[name]) {
      const c = data[name];
      nameEl.textContent = name;
      popEl.textContent = c.population;
      gdpEl.textContent = c.gdp;
      milEl.textContent = c.military;
      resEl.textContent = c.resources.join(", ");
    } else {
      nameEl.textContent = name;
      popEl.textContent = "Unknown";
      gdpEl.textContent = "Unknown";
      milEl.textContent = "Unknown";
      resEl.textContent = "Unknown";
    }

    panel.classList.remove("hidden");
    panel.classList.add("visible");

  } catch (err) {
    console.error("Failed to load country data:", err);
  }
}

document.getElementById("close-panel").addEventListener("click", () => {
  document.getElementById("country-panel").classList.remove("visible");
});
document.getElementById("close-panel").addEventListener("click", () => {
  const panel = document.getElementById("country-panel");
  panel.classList.remove("visible");
  panel.classList.add("hidden");
});