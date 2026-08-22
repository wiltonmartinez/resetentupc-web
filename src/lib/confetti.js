const COLORES = ["#0f766e", "#25d366", "#f59e0b", "#ef4444", "#6366f1", "#facc15"];

let estilosInyectados = false;
function inyectarEstilos() {
  if (estilosInyectados) return;
  estilosInyectados = true;
  const style = document.createElement("style");
  style.textContent = `
    .reset-confeti-contenedor {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    }
    .reset-confeti-pieza {
      position: absolute;
      top: -10px;
      width: 8px;
      height: 14px;
      opacity: 0.9;
      animation: reset-confeti-caida linear forwards;
    }
    @keyframes reset-confeti-caida {
      to {
        transform: translateY(110vh) rotate(var(--rot, 360deg));
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export function lanzarConfeti(cantidad = 60) {
  if (typeof document === "undefined") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  inyectarEstilos();

  const contenedor = document.createElement("div");
  contenedor.className = "reset-confeti-contenedor";
  document.body.appendChild(contenedor);

  for (let i = 0; i < cantidad; i++) {
    const pieza = document.createElement("span");
    pieza.className = "reset-confeti-pieza";
    pieza.style.left = `${Math.random() * 100}%`;
    pieza.style.background = COLORES[i % COLORES.length];
    pieza.style.setProperty("--rot", `${360 + Math.random() * 360}deg`);
    pieza.style.animationDuration = `${2.2 + Math.random() * 1.3}s`;
    pieza.style.animationDelay = `${Math.random() * 0.4}s`;
    pieza.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    contenedor.appendChild(pieza);
  }

  setTimeout(() => contenedor.remove(), 4000);
}
