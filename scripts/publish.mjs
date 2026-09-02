#!/usr/bin/env node
/**
 * Publish a built single-file bundle to Walrus and print the blob id.
 *
 * The Epoch builder proxies uploads through their own worker, which is what
 * makes storage free for names registered there. Publishing straight to the
 * Walrus publisher works too, but then the WAL comes out of your wallet.
 *
 *   node scripts/publish.mjs dist/badge/badge.html
 *   node scripts/publish.mjs assets/og.png      # social card, same mechanism
 *
 * Then point the name at the blob:
 *   walrus_names::update_blob(name_cap, registry, <blob_id>)
 */
import { readFileSync } from 'node:fs'

const EPOCHS = 52
const PUBLISHERS = {
  epoch: 'https://epoch-walrus.pupazzipunkapi.workers.dev/walrus',
  walrus: 'https://publisher.walrus-mainnet.walrus.space',
}

const file = process.argv[2]
const via = process.argv[3] ?? 'epoch'

if (!file) {
  console.error('usage: node scripts/publish.mjs <file> [epoch|walrus]')
  process.exit(1)
}

const base = PUBLISHERS[via]
if (!base) {
  console.error(`unknown publisher "${via}" — use epoch or walrus`)
  process.exit(1)
}

const body = readFileSync(file)
const url = `${base}/v1/blobs?epochs=${EPOCHS}`

console.error(`uploading ${(body.length / 1024).toFixed(1)} KB to ${via}…`)
const res = await fetch(url, { method: 'PUT', body })

if (!res.ok) {
  console.error(`publisher returned HTTP ${res.status}: ${await res.text()}`)
  process.exit(1)
}

const json = await res.json()
const blobId =
  json?.newlyCreated?.blobObject?.blobId ?? json?.alreadyCertified?.blobId ?? null

if (!blobId) {
  console.error('could not find a blob id in the response:')
  console.error(JSON.stringify(json, null, 2))
  process.exit(1)
}

console.error('blob id:')
console.log(blobId)
console.error(`\ncheck it: https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${blobId}`)
