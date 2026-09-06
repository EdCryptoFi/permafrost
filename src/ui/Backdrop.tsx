import { useEffect, useRef } from 'preact/hooks'
import type { Frost } from '@/chain/frost'
import './backdrop.css'

/**
 * The room the page is standing in.
 *
 * Flowing satin: broad folds sweeping across a near-black violet ground, lit
 * in two colours, with fine striations running along each fold the way light
 * catches woven cloth. It is one effect and it is animated, because the thing
 * being copied is a movement — a still frame of it is a photograph of silk,
 * and silk that does not move is just a picture.
 *
 * This is a shader because the shape genuinely needs one. The folds are
 * domain-warped: a coordinate is displaced by a field that is itself made of
 * sines, which is what produces curves that fold back on themselves instead
 * of the parallel waves you get from displacing one axis. CSS gradients
 * cannot express that, and stacking blurred blobs to fake it was tried in the
 * previous version of this file and is why it read as a flat violet wash.
 *
 * Which room you are in stays information. The two lit colours are uniforms,
 * and they ease toward the scene's pair over about a second, so a lock going
 * from frozen to elapsed changes the temperature of the room rather than
 * cutting to a different one.
 *
 * When there is no WebGL context, or the reader has asked for less motion,
 * this removes itself and the CSS underneath is the whole picture.
 */
export type Scene = 'aurora' | 'frozen' | 'crack' | 'thaw' | 'blizzard' | 'blueprint'

/** The scene a given view and lock imply. One place, so nothing contradicts. */
export function sceneFor(
  view: 'verify' | 'new' | 'deploy' | 'ept' | 'guide',
  frost: Frost | null,
): Scene {
  if (view === 'new') return 'blizzard'
  if (view === 'deploy') return 'blueprint'
  if (view === 'guide') return 'aurora'
  // A burn is the one thing here that is not cold.
  if (view === 'ept') return 'crack'
  if (!frost) return 'aurora'
  switch (frost.phase) {
    case 'thawed':
      return 'thaw'
    case 'cracked':
      return 'crack'
    case 'absent':
      return 'aurora'
    default:
      return 'frozen'
  }
}

/**
 * Two lit colours per scene, linear-ish RGB.
 *
 * `crack` is the only one holding amber, because amber is this product's
 * expiry colour and spending it anywhere else makes the one place it means
 * something quieter.
 */
type Rgb = readonly [number, number, number]
const PALETTE: Record<Scene, readonly [Rgb, Rgb]> = {
  aurora: [[0.10, 0.42, 0.62], [0.52, 0.12, 0.58]],
  frozen: [[0.09, 0.40, 0.64], [0.16, 0.26, 0.66]],
  crack: [[0.72, 0.36, 0.06], [0.50, 0.10, 0.52]],
  thaw: [[0.08, 0.46, 0.44], [0.14, 0.34, 0.62]],
  blizzard: [[0.18, 0.44, 0.80], [0.62, 0.22, 0.76]],
  blueprint: [[0.10, 0.36, 0.62], [0.20, 0.28, 0.48]],
}

const VERT = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_a;
uniform vec3 u_b;
uniform float u_light;

/* Four sines at incommensurable frequencies. Nothing here repeats on any
   period a reader will sit through, which is the only reason a loop this
   cheap does not read as a loop. */
float field(vec2 p, float t) {
  float v = sin(p.x * 1.6 + p.y * 0.7 + t * 0.31);
  v += 0.70 * sin(p.x * 2.7 - p.y * 1.5 + t * 0.23);
  v += 0.50 * sin(p.x * 4.1 + p.y * 2.3 - t * 0.19);
  v += 0.32 * sin(p.x * 6.3 - p.y * 3.1 + t * 0.27);
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  /* Aspect-corrected, so the folds keep their shape on a phone instead of
     being squeezed into stripes. */
  vec2 p = (uv - 0.5) * vec2(u_res.x / u_res.y, 1.0) * 1.8;
  float t = u_time;

  /* Cloth has a DIRECTION, and that is the whole thing.

     The first attempt built the image out of an isotropic field — noise in
     every direction equally — and it came out as a lava lamp: round blobs
     with no grain. Satin is a set of lines running one way, bent. So a
     coordinate runs across the image and the field only BENDS it. Everything
     below is a function of that one bent coordinate, which is why the result
     has folds instead of blobs.

     The warp has to stay SMALLER than the linear term. At equal strength the
     bands close on themselves and you get islands; kept under it, they stay
     roughly parallel and merely sweep, which is what a fold is. */
  float warp = field(p, t) * 0.34 + field(p.yx * 1.7 + 9.0, -t * 0.7) * 0.15;
  float flow = p.y * 2.1 + p.x * 0.62 + warp;

  /* The folds. Each band is one turn of the cloth. */
  float band = sin(flow * 2.35 + t * 0.12);
  /* Wide, not narrow. smoothstep on a sine peaks briefly and drew neon
     contour lines on a dark ground; the reference lights broad areas of cloth
     and keeps the creases subtle. Linear in the band, gently shaped, is what
     gives a fold a lit SIDE rather than a lit edge. */
  float face = pow(0.5 + 0.5 * band, 1.45);

  /* Hue drifts slowly ALONG the flow, so the image has a teal end and a
     magenta end rather than one colour modulated everywhere. */
  float m = 0.5 + 0.5 * sin(flow * 0.55 + t * 0.09);
  vec3 lit = mix(u_a, u_b, smoothstep(0.15, 0.85, m));

  /* The weave: fine parallel lines running along each fold, which is most of
     what separates cloth from a gradient. */
  float weave = 0.04 * sin(flow * 30.0) * face;

  /* The lit colour never falls to zero. Measured against the reference, an
     earlier version had mean chroma 38 against its 55: the shadows had gone
     neutral, and cloth in shadow is still coloured cloth. */
  vec3 ground = vec3(0.039, 0.020, 0.075);
  vec3 col = ground + lit * (0.09 + face * 0.66 + weave);

  /* The specular edge, on the side of the fold turning fastest toward us. */
  float ridge = smoothstep(0.86, 1.0, face) * 0.06;
  col += ridge * mix(u_a, vec3(1.0), 0.4);

  /* Down at the corners, so the page's own edges stay quiet. */
  float vig = uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y) * 16.0;
  col *= clamp(pow(vig, 0.14), 0.72, 1.0);

  /* Aqua is paper. Same cloth, inverted and drained, so it reads as a pale
     watermark rather than turning the light appearance into the dark one. */
  vec3 pale = vec3(1.0) - col * 1.5;
  col = mix(col, clamp(pale, 0.80, 1.0), u_light);

  gl_FragColor = vec4(col, 1.0);
}`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)
  if (!sh) return null
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export function Backdrop({ scene }: { scene: Scene }) {
  const ref = useRef<HTMLCanvasElement>(null)
  // Read inside the loop rather than re-running the effect: a scene change
  // must retune the running animation, never restart it.
  const target = useRef<Scene>(scene)
  target.current = scene

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    })
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()
    if (!prog) return
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uA = gl.getUniformLocation(prog, 'u_a')
    const uB = gl.getUniformLocation(prog, 'u_b')
    const uLight = gl.getUniformLocation(prog, 'u_light')

    // The canvas says it is live, so the CSS fallback underneath steps aside.
    // Set only after a context, a linked program and a first frame — the last
    // version of this file set a flag before it could draw, and something else
    // in the stylesheet was hiding the canvas the whole time.
    const root = document.documentElement

    let light = root.dataset.appearance === 'aqua' ? 1 : 0
    const readAppearance = () => {
      light = root.dataset.appearance === 'aqua' ? 1 : 0
    }
    const themeWatch = new MutationObserver(readAppearance)
    themeWatch.observe(root, { attributes: true, attributeFilter: ['data-appearance'] })

    // Half resolution. The whole image is low-frequency, so nothing about it
    // reads differently while the GPU does a quarter of the work.
    const SCALE = 0.5
    const resize = () => {
      const w = Math.max(1, Math.floor(innerWidth * SCALE))
      const h = Math.max(1, Math.floor(innerHeight * SCALE))
      if (canvas.width === w && canvas.height === h) return
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      gl.uniform2f(uRes, w, h)
    }
    resize()

    const p0 = PALETTE[target.current]
    const cur: number[] = [...p0[0], ...p0[1]]
    let raf = 0
    let last = performance.now()
    const start = last
    let painted = false

    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now

      // Ease toward the scene rather than cutting: a lock crossing its unlock
      // date should change the temperature of the room, not swap the room.
      const want = PALETTE[target.current]
      const k = 1 - Math.exp(-dt * 3.2)
      for (let i = 0; i < 6; i++) {
        const to = want[i < 3 ? 0 : 1][i % 3] as number
        cur[i] = (cur[i] as number) + (to - (cur[i] as number)) * k
      }

      gl.uniform1f(uTime, (now - start) / 1000)
      gl.uniform3f(uA, cur[0]!, cur[1]!, cur[2]!)
      gl.uniform3f(uB, cur[3]!, cur[4]!, cur[5]!)
      gl.uniform1f(uLight, light)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      if (!painted) {
        painted = true
        root.dataset.cloth = 'on'
      }
      raf = requestAnimationFrame(frame)
    }

    const play = () => {
      cancelAnimationFrame(raf)
      if (document.visibilityState === 'hidden') return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    play()
    addEventListener('resize', resize)
    document.addEventListener('visibilitychange', play)

    return () => {
      cancelAnimationFrame(raf)
      themeWatch.disconnect()
      delete root.dataset.cloth
      removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', play)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <canvas class="cloth" ref={ref} aria-hidden="true" />
}
