import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig(({ mode }) => {
  return {
    // Define Node.js globals for browser compatibility
    define: {
      global: 'globalThis',
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    
    // Server configuration
    server: {
      host: "::", // Listen on all IPv6 addresses
      port: 8080, // Dev server port
      strictPort: true, // Error if port is already in use
      open: true, // Auto-open browser on server start
    },
    
    // Plugins setup - cleaner conditional logic
    plugins: mode === "development" 
      ? [react(), componentTagger()] 
      : [react()],
    
    // Resolve aliases and Node.js polyfills
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Node.js polyfills for browser
        buffer: "buffer",
        process: "process/browser",
        // Fix CommonJS modules with export issues
        "mustache": "mustache/mustache.js",
        "secp256k1": "secp256k1",
        "randombytes": "randombytes",
      },
      // Add fallbacks for Node.js modules
      fallback: {
        buffer: "buffer",
        process: "process/browser",
        crypto: "crypto-browserify",
        stream: "stream-browserify",
        util: "util",
        path: "path-browserify",
        fs: false,
        os: false,
      },
    },
    
    // Optimize dependencies - fix all CommonJS/ES module issues
    optimizeDeps: {
      include: [
        "react", 
        "react-dom", 
        "buffer", 
        "process",
        // Stellar/NEAR dependencies with export issues
        "mustache", 
        "@near-js/utils", 
        "@hot-wallet/sdk", 
        "@creit.tech/stellar-wallets-kit",
        // Crypto dependencies with export issues
        "secp256k1",
        "elliptic",
        "randombytes",
        "crypto-browserify"
      ],
      // Exclude problematic dependencies from pre-bundling
      exclude: ["@near-js/crypto"],
      // Force re-optimization on restart
      force: true,
    },
    
    // Build configuration
    build: {
      // Generate source maps for better debugging
      sourcemap: mode === "development",
      // Reduce bundle size warnings threshold
      chunkSizeWarningLimit: 1000,
      // Handle ALL CommonJS modules properly
      commonjsOptions: {
        include: [
          /mustache/, 
          /near-js/, 
          /@hot-wallet/, 
          /@creit\.tech/, 
          /secp256k1/,
          /elliptic/,
          /randombytes/,
          /crypto-browserify/,
          /node_modules/
        ],
        transformMixedEsModules: true,
      },
      rollupOptions: {
        // Handle Node.js globals in build
        external: [],
        output: {
          // Better chunk splitting
          manualChunks: {
            vendor: ['react', 'react-dom'],
            stellar: ['@creit.tech/stellar-wallets-kit'],
            crypto: ['secp256k1', 'randombytes', 'crypto-browserify'],
          },
        },
      },
    },
    
    // Environment variables configuration
    // Access via import.meta.env.VITE_* in your code
    envPrefix: 'VITE_',
  };
});
