/**
 * The hero headline, composed the way the reference composes it: stacked
 * lines, wildly mismatched sizes, and one word deliberately cut in half so
 * "Frozen" arrives as two separate scraps of paper.
 *
 * The words and their order are exactly the sentence the app has always
 * shown — this only changes how the letters are glued down.
 *
 * Accessibility: the whole sentence lives on the h1's aria-label and every
 * scrap is aria-hidden, so a screen reader hears one clean line instead of
 * "FRO ZEN liquidity".
 */
const TEXT = 'Frozen liquidity you can actually verify.'

export function HeroTitle() {
  return (
    <h1 class="hero" aria-label={TEXT}>
      <span class="hl" aria-hidden="true">
        <span class="cut c-fro">Fro</span>
        <span class="cut c-zen">zen</span>
      </span>
      <span class="hl" aria-hidden="true">
        <span class="cut c-liquidity">liquidity</span>
      </span>
      <span class="hl" aria-hidden="true">
        <span class="cut c-you">you</span>
        <span class="cut c-can">can</span>
      </span>
      <span class="hl" aria-hidden="true">
        <span class="cut c-actually">actually</span>
      </span>
      <span class="hl" aria-hidden="true">
        <span class="cut c-verify">verify.</span>
      </span>
    </h1>
  )
}
