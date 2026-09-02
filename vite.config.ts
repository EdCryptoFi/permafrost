import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { resolve } from 'node:path'

// Two separate single-file builds:
//   app   -> dist/app/index.html    (the full verifier, served by permafrost.epoch)
//   badge -> dist/badge/index.html  (the ~6 KB embed, served by a second .epoch name)
//
// Each Epoch Names record stores ONE Walrus blob id, so every build must collapse
// to exactly one self-contained HTML file. No code splitting, no external assets.
export default defineConfig(({ mode }) => {
  const isBadge = mode === 'badge'
  return {
    esbuild: { jsx: 'automatic', jsxImportSource: 'preact' },
    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
        '@': resolve(__dirname, 'src'),
      },
    },
    define: {
      // Lets the badge build tree-shake every wallet/transaction code path away.
      __BADGE_ONLY__: JSON.stringify(isBadge),
    },
    plugins: [
      viteSingleFile({ removeViteModuleLoader: true }),
      // The page is one blob, so it cannot ship a sibling .png. The social card
      // is published as its own Walrus blob and referenced through the public
      // aggregator; set VITE_OG_IMAGE to that URL before building. Unset, the
      // tags are omitted rather than emitted broken.
      {
        name: 'permafrost-og',
        transformIndexHtml(html: string) {
          const url = process.env.VITE_OG_IMAGE
          if (!url || isBadge) return html
          const tags = [
            `<meta property="og:image" content="${url}" />`,
            `<meta name="twitter:card" content="summary_large_image" />`,
            `<meta name="twitter:image" content="${url}" />`,
          ].join('\n    ')
          return html.replace('</head>', `  ${tags}\n  </head>`)
        },
      },
    ],
    build: {
      target: 'es2022',
      cssCodeSplit: false,
      assetsInlineLimit: 100_000_000,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        input: isBadge ? resolve(__dirname, 'badge.html') : resolve(__dirname, 'index.html'),
      },
    },
  }
})
