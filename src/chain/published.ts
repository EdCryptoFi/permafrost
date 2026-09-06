/**
 * The blobs currently published to Walrus, per name.
 *
 * Deploying used to mean pasting a 43-character id by hand — and one of them
 * starts with a hyphen, which is exactly the kind of string that gets mangled
 * on the way through a clipboard or a shell. Recording them here turns the
 * deploy screen into pick-a-name, confirm, sign.
 *
 * Updated by `npm run publish:all`, which writes this file from the ids the
 * publisher returned, so it cannot drift from what is actually stored.
 *
 * One circularity worth knowing about: Walrus addresses blobs by content, so
 * the app can never contain its own id — recording it changes the file, which
 * changes the id. The entry for the app is therefore always the build that was
 * published BEFORE the currently-running one. This matters only if you open
 * the deploy screen from the deployed site; from the working copy, publish:all
 * has just written the id you need. The badge has no such problem: it does not
 * import this file, so republishing identical content returns the same id.
 */
export type PublishedBlob = {
  /** The .epoch name, without the suffix. */
  name: string
  blobId: string
  /** Bytes, as verified against the aggregator at publish time. */
  bytes: number
  publishedAt: string
}

export const PUBLISHED: PublishedBlob[] = [
  {
    name: 'permafrost',
    blobId: 'Nplc51jJT8QYdUcmgU9PHlM5Xh7xXOdOTaVX2Zt8ato',
    bytes: 222846,
    publishedAt: '2026-09-06',
  },
  {
    name: 'frostbadge',
    blobId: 'P9Ew4Zu57rLdmwj-fQJVD9z1fz9i5jHy-fWgRyDf72w',
    bytes: 51730,
    publishedAt: '2026-09-06',
  },
]

export const suggestedBlobFor = (name: string): PublishedBlob | undefined =>
  PUBLISHED.find((p) => p.name === name)
