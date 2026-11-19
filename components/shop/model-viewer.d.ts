/* JSX typing for Google's <model-viewer> web component. Only the attributes
   this site uses are listed. */
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  alt?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "ar-scale"?: string;
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "touch-action"?: string;
  "environment-image"?: string;
  "shadow-intensity"?: string;
  exposure?: string;
  "camera-orbit"?: string;
  loading?: "auto" | "lazy" | "eager";
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}
