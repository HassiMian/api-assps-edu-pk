declare module "bwip-js" {
  export type ToBufferOptions = {
    bcid: string;
    text: string;
    scale?: number;
    height?: number;
    includetext?: boolean;
    textxalign?: "left" | "center" | "right" | string;
    backgroundcolor?: string;
    textsize?: number;
    [key: string]: unknown;
  };

  const bwipjs: {
    toBuffer(options: ToBufferOptions): Promise<Buffer>;
  };

  export default bwipjs;
}
