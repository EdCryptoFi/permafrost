#!/usr/bin/env node
/**
 * Publish a built bundle (or any asset) to Walrus and print the blob id.
 *
 * Two routes, and they are NOT the same shape:
 *
 *   epoch  — POST https://epoch-walrus.…workers.dev/walrus?epochs=52
 *            with a Content-Type header. Epoch's own worker, which pays the
 *            WAL for names registered through them. Taken from their app
 *            bundle, not guessed: the Walrus-native path returns a health
 *            check here and no blob.
 *   walrus — PUT  https://publisher.walrus-mainnet.walrus.space/v1/blobs?epochs=52
 *            the public publisher. Works, but the WAL comes out of your wallet.
 *
 *   node scripts/publish.mjs dist/badge/badge.html
 *   node scripts/publish.mjs assets/og.png walrus
 *
 * Then point the name at the blob with walrus_names::update_blob — the app's
 * own ?view=deploy screen does it with the wallet holding the NameCap.
 */
import { readFileSync } from 'node:fs'
import { extname } from 'node:path'

const EPOCHS = 52

const MIME = {
  '.html': 'text/html',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.txt': 'text/plain',
}

const file = process.argv[2]
const via = process.argv[3] ?? 'epoch'

if (!file) {
  console.error('usage: node scripts/publish.mjs <file> [epoch|walrus]')
  process.exit(1)
}

const body = readFileSync(file)
const type = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream'

const routes = {
  epoch: {
    url: `https://epoch-walrus.pupazzipunkapi.workers.dev/walrus?epochs=${EPOCHS}`,
    method: 'POST',
    headers: { 'Content-Type': type },
  },
  walrus: {
    url: `https://publisher.walrus-mainnet.walrus.space/v1/blobs?epochs=${EPOCHS}`,
    method: 'PUT',
    headers: {},
  },
}

const route = routes[via]
if (!route) {
  console.error(`unknown publisher "${via}" — use epoch or walrus`)
  process.exit(1)
}

console.error(`uploading ${(body.length / 1024).toFixed(1)} KB (${type}) via ${via}…`)

const res = await fetch(route.url, { method: route.method, headers: route.headers, body })
if (!res.ok) {
  console.error(`publisher returned HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  process.exit(1)
}

const json = await res.json()

/** The response shape differs per route and per whether the blob is new. */
const blobId =
  json?.blobId ??
  json?.newlyCreated?.blobObject?.blobId ??
  json?.alreadyCertified?.blobId ??
  null

if (!blobId) {
  console.error('no blob id in the response:')
  console.error(JSON.stringify(json, null, 2).slice(0, 600))
  process.exit(1)
}

console.error('blob id:')
console.log(blobId)
console.error(`\nverify: https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${blobId}`)
