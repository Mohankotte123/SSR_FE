/**
 * Helpers for inlining venture layout SVGs and painting plot shapes.
 */

const DANGEROUS_TAGS = /<\/?(?:script|foreignObject|iframe|object|embed)\b[^>]*>/gi;
const DANGEROUS_ATTRS =
  /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

/** Only geometry — never paint fills onto text labels. */
export const PLOT_SHAPE_SELECTOR = "polygon, path, rect";

export function sanitizeSvgMarkup(raw: string): string {
  let svg = raw.trim();
  svg = svg.replace(/<\?xml[\s\S]*?\?>/i, "");
  svg = svg.replace(/<!DOCTYPE[\s\S]*?>/i, "");
  svg = svg.replace(DANGEROUS_TAGS, "");
  svg = svg.replace(DANGEROUS_ATTRS, "");

  svg = svg.replace(/<svg\b([^>]*)>/i, (_match, attrs: string) => {
    let next = attrs
      .replace(/\swidth\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i, "")
      .replace(/\sheight\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i, "");
    if (!/\bpreserveAspectRatio\s*=/i.test(next)) {
      next += ` preserveAspectRatio="xMidYMid meet"`;
    }
    return `<svg${next} width="100%" height="100%" style="max-width:100%;height:auto;display:block">`;
  });

  return svg;
}

export function plotElementCandidates(plot: {
  svgElementId: string | null;
  plotNumber: string;
}): string[] {
  const ids = new Set<string>();
  if (plot.svgElementId?.trim()) ids.add(plot.svgElementId.trim());
  const num = String(plot.plotNumber).trim();
  if (num) {
    ids.add(`plot-${num}`);
    ids.add(`plot-${num.toLowerCase()}`);
    ids.add(`plot-${num.toUpperCase()}`);
    ids.add(num);
  }
  return Array.from(ids);
}

export function findPlotElement(
  root: ParentNode,
  plot: { svgElementId: string | null; plotNumber: string }
): Element | null {
  for (const id of plotElementCandidates(plot)) {
    const byId = root.querySelector(`#${cssEscape(id)}`);
    if (byId) return byId;
  }

  const target = String(plot.plotNumber).trim().toLowerCase();
  const all = root.querySelectorAll("[id]");
  for (const el of Array.from(all)) {
    const id = el.id.toLowerCase();
    if (
      id === `plot-${target}` ||
      id === target ||
      id.replace(/^plot-/, "") === target
    ) {
      return el;
    }
  }
  return null;
}

export function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}

/**
 * Tag unlabeled text nodes as plot-num / plot-dim so CSS can force white labels.
 */
export function ensurePlotTextClasses(
  plotEl: Element,
  plotNumber?: string
): void {
  const collect = new Set<SVGTextElement>();

  plotEl.querySelectorAll("text").forEach((t) => {
    collect.add(t as SVGTextElement);
  });

  // Bare shape ids often have label <text> as siblings under the same parent
  if (isShapeElement(plotEl) && plotEl.parentElement) {
    const parent = plotEl.parentElement;
    const num = (plotNumber || "").toLowerCase();
    Array.from(parent.children).forEach((child) => {
      if (child.tagName.toLowerCase() !== "text") return;
      const text = child as SVGTextElement;
      const content = (text.textContent || "").toLowerCase();
      if (
        !num ||
        content.includes(num) ||
        content.includes(`#${num}`) ||
        content.includes(`plot-${num}`)
      ) {
        collect.add(text);
      }
    });
  }

  const texts = Array.from(collect);
  if (texts.length === 0) return;

  const unclassified = texts.filter(
    (t) =>
      !t.classList.contains("plot-num") && !t.classList.contains("plot-dim")
  );

  // Always reinforce pointer-events on already-classified labels
  texts.forEach((t) => {
    t.style.pointerEvents = "none";
  });

  if (unclassified.length === 0) return;

  const scored = unclassified.map((t) => {
    const fs =
      parseFloat(t.getAttribute("font-size") || "") ||
      parseFloat(
        typeof window !== "undefined" ? getComputedStyle(t).fontSize : "12"
      ) ||
      12;
    return { t, fs };
  });
  scored.sort((a, b) => b.fs - a.fs);

  scored.forEach((item, i) => {
    if (i === 0) item.t.classList.add("plot-num");
    else item.t.classList.add("plot-dim");
  });
}

function isShapeElement(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  return tag === "polygon" || tag === "path" || tag === "rect";
}

/**
 * Apply status colors ONLY to polygon/path/rect — never to <text>.
 */
export function paintPlotShape(
  el: Element,
  opts: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
    interactive: boolean;
    selected?: boolean;
    plotNumber?: string;
  }
): void {
  ensurePlotTextClasses(el, opts.plotNumber);

  const shapes: Element[] = [];
  if (isShapeElement(el)) {
    shapes.push(el);
  } else {
    el.querySelectorAll(PLOT_SHAPE_SELECTOR).forEach((child) => shapes.push(child));
  }

  // Clear inherited fill on the plot group so text doesn't turn green
  if (el.tagName.toLowerCase() === "g") {
    el.removeAttribute("fill");
    const g = el as SVGElement;
    g.style.fill = "none";
    g.style.cursor = opts.interactive ? "pointer" : "default";
    g.style.pointerEvents = opts.interactive ? "auto" : "none";
    g.style.opacity = String(opts.opacity);
  }

  shapes.forEach((node) => {
    node.setAttribute("fill", opts.fill);
    node.setAttribute("stroke", opts.stroke);
    node.setAttribute("stroke-width", String(opts.strokeWidth));
    node.classList.add("plot-shape");
    if (opts.selected) node.classList.add("plot-shape--selected");
    else node.classList.remove("plot-shape--selected");

    const svgEl = node as SVGElement;
    svgEl.style.fill = opts.fill;
    svgEl.style.stroke = opts.stroke;
    svgEl.style.strokeWidth = String(opts.strokeWidth);
    svgEl.style.cursor = opts.interactive ? "pointer" : "default";
    svgEl.style.pointerEvents = opts.interactive ? "auto" : "none";
    svgEl.style.transformOrigin = "center";
    svgEl.style.transformBox = "fill-box";
    svgEl.style.transition =
      "opacity 0.2s ease, stroke-width 0.2s ease, transform 0.2s ease, filter 0.2s ease";
    // Opacity lives on the group when possible; keep shapes fully opaque for crisp text overlay
    if (isShapeElement(el)) {
      svgEl.style.opacity = String(opts.opacity);
    } else {
      svgEl.style.opacity = "1";
    }
  });

  // Explicitly neutralize text fills so status color never bleeds onto labels
  el.querySelectorAll("text, tspan").forEach((text) => {
    const t = text as SVGElement;
    t.style.pointerEvents = "none";
    t.style.transform = "none";
    t.style.filter = "none";
    // Let CSS !important rules win; clear conflicting presentation attrs
    if (t.tagName.toLowerCase() === "text" || t.tagName.toLowerCase() === "tspan") {
      t.removeAttribute("fill");
      t.style.fill = "";
    }
  });
}
