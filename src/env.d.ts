/// <reference types="node" />
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent;
  export default component;
}

declare module "*.wasm" {
  const url: string;
  export default url;
}
declare module "*.css";
