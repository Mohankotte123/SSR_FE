"use client";

import { useState } from "react";
import { SVGLayoutViewer } from "@/components/public/SVGLayoutViewer";
import { PlotDetailDrawer } from "@/components/public/PlotDetailDrawer";
import type { Plot, VentureDetail } from "@/types/database";

export interface VentureExplorerProps {
  venture: VentureDetail;
}

/**
 * Client shell for interactive layout + plot drawer.
 */
export function VentureExplorer({ venture }: VentureExplorerProps) {
  const [selected, setSelected] = useState<Plot | null>(null);

  return (
    <>
      <SVGLayoutViewer
        svgUrl={venture.svgLayoutUrl}
        plots={venture.plots}
        selectedPlotId={selected?.id ?? null}
        onPlotSelect={setSelected}
        ventureName={venture.title}
        ventureLocation={venture.location}
      />
      <PlotDetailDrawer
        open={!!selected}
        plot={selected}
        onClose={() => setSelected(null)}
        ventureId={venture.id}
        ventureName={venture.title}
        brochurePdfUrl={venture.brochurePdfUrl}
      />
    </>
  );
}
