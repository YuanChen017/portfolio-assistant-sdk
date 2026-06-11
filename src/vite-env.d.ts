/// <reference types="vite/client" />

// Augment Vite's ?raw import support
declare module '*.css?raw' {
  const content: string;
  export default content;
}
