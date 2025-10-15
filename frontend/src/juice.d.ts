declare module 'juice' {
  export interface Options {
    applyAttributesTableElements?: boolean;
    applyHeightAttributes?: boolean;
    applyStyleTags?: boolean;
    applyWidthAttributes?: boolean;
    extraCss?: string;
    insertPreservedExtraCss?: boolean;
    preserveFontFaces?: boolean;
    preserveImportant?: boolean;
    preserveKeyFrames?: boolean;
    preserveMediaQueries?: boolean;
    preservePseudos?: boolean;
    removeStyleTags?: boolean;
    url?: string;
    webResources?: any;
    inlinePseudoElements?: boolean;
    xmlMode?: boolean;
  }

  export default function juice(html: string, options?: Options): string;
  export function juiceResources(html: string, options: Options, callback: (error: Error | null, result: string) => void): void;
  export function inlineContent(html: string, css: string, options?: Options): string;
  export function inlineDocument(document: Document, options?: Options): string;
}
