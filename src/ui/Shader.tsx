import { useEffect, useRef } from 'preact/hooks'

/**
 * The ice-versus-lava field.
 *
 * Ported from the reference shader. It is not decoration: the diagonal
 * frontier between cold proof and volcanic fake is the product's entire
 * argument, running behind the page the whole time someone is reading it.
 *
 * Three rules, because this is a fullscreen GPU loop in a page that also has
 * to stay polite:
 *
 *   1. `prefers-reduced-motion` and it never starts.
 *   2. Hidden tab and it stops — a background tab must cost nothing.
 *   3. No WebGL context and it removes itself, leaving the CSS backdrop.
 *
 * It renders at a fraction of device resolution: this is a low-frequency
 * noise field, and at 0.5x nothing about it looks different while the GPU
 * does a quarter of the work.
 */

const VERT = `
attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const FRAG = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
// 0 on Graphite, 1 on Aqua. The field is the same field either way — the two
// appearances differ in what a background is allowed to do to the text on it.
uniform float u_light;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = u_time * 0.45;

  // Split screen dynamic wave between Ice (Top/Left) and Lava (Bottom/Right)
  float n1 = snoise(uv * 3.5 + vec2(t * 0.2, -t * 0.15));
  float n2 = snoise(uv * 7.0 - vec2(t * 0.35, t * 0.25)) * 0.5;
  float combinedNoise = n1 + n2;

  // Diagonal frontier between Cold Tranquility and Volcanic Chaos
  float frontier = (uv.x * 0.8 + (1.0 - uv.y) * 0.7) - 0.75 + combinedNoise * 0.18;

  // Ice Palette (Peace, Tranquility, Proof)
  vec3 iceDeep  = vec3(0.03, 0.07, 0.12);
  vec3 iceCyan  = vec3(0.0, 0.94, 1.0);
  vec3 iceFrost = vec3(0.45, 0.85, 1.0);

  // Heat Palette (the term running out). Amber, not magenta: the amber is
  // the colour this product already uses for a lock about to open, and a
  // background that argues with the status pills is a background that lies.
  vec3 hotDeep   = vec3(0.10, 0.04, 0.01);
  vec3 hotAmber  = vec3(1.0, 0.44, 0.06);
  vec3 hotGold   = vec3(1.0, 0.80, 0.24);

  float icePulse = sin(uv.y * 12.0 + t + combinedNoise * 2.0) * 0.5 + 0.5;
  vec3 iceColor = mix(iceDeep, iceCyan * 0.35 + iceFrost * 0.2, icePulse * 0.6);

  float hotPulse = cos(uv.x * 14.0 - t * 1.5 + combinedNoise * 3.0) * 0.5 + 0.5;
  vec3 hotColor = mix(hotDeep, hotAmber * 0.5 + hotGold * 0.3, hotPulse * 0.8);

  // Dynamic boundary clash: sparks and crystal freeze line
  float borderLine = smoothstep(0.08, 0.0, abs(frontier));
  vec3 clashEnergy = mix(vec3(1.0, 0.9, 0.55), vec3(0.35, 0.95, 1.0),
                         sin(t * 3.0 + uv.x * 10.0) * 0.5 + 0.5);

  vec3 baseColor = mix(iceColor, hotColor, smoothstep(-0.06, 0.06, frontier));
  // The reference put 0.65 here, when this field was a screened overlay on a
  // black page with nothing on top of it. It is the page's background now and
  // the hero sits on it in white, so the frontier is damped to where it still
  // reads as a seam without becoming a white band under the headline.
  baseColor += borderLine * clashEnergy * 0.3;

  // The pointer warms the field it passes over, so the frontier answers to
  // whoever is reading rather than looping indifferently.
  vec2 m = u_mouse / u_resolution;
  float heat = smoothstep(0.42, 0.0, distance(uv, m));
  baseColor += heat * clashEnergy * 0.1;

  // Vignette for dramatic contrast. Floored well above the reference's 0.2:
  // this field is the page's actual background now, not a screened overlay,
  // and at 0.2 the corners went to black and took the header with them.
  float vig = uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y) * 16.0;
  baseColor *= clamp(pow(vig, 0.28), 0.5, 1.0);

  // Lift off pure black. A background that reaches 0,0,0 makes every panel
  // edge on top of it look like a cut-out rather than a sheet on a desk.
  baseColor += vec3(0.035, 0.055, 0.085);

  // Aqua is a light appearance and the canvas multiplies onto it, so the
  // field has to be inverted to survive the trip: what was a bright ridge on
  // black has to become a pale tint on white, or multiply turns the whole
  // page into the dark theme with worse contrast.
  vec3 lightColor = vec3(1.0) - baseColor * 0.42;
  baseColor = mix(baseColor, lightColor, u_light);

  gl_FragColor = vec4(baseColor, 1.0);
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

export function Shader() {
  const ref = useRef<HTMLCanvasElement>(null)

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

    const uRes = gl.getUniformLocation(prog, 'u_resolution')
    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')
    const uLight = gl.getUniformLocation(prog, 'u_light')

    // The appearance toggle writes to the root element, so the field watches
    // the same switch the stylesheet does rather than being told twice.
    const root = document.documentElement
    const readAppearance = () =>
      gl.uniform1f(uLight, root.dataset.appearance === 'aqua' ? 1 : 0)
    readAppearance()
    const themeWatch = new MutationObserver(readAppearance)
    themeWatch.observe(root, { attributes: true, attributeFilter: ['data-appearance'] })

    // Says the field is live, so the CSS caustics stand down. They are the
    // fallback — for no WebGL, for reduced motion — and running both at once
    // is two weather systems in one room.
    root.dataset.shader = 'on'

    // Pixel coordinates matching u_resolution, the ShaderToy convention the
    // reference uses. Passive: this must never delay a scroll.
    let mx = 0.5, my = 0.5
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / innerWidth
      my = 1 - e.clientY / innerHeight
    }
    addEventListener('pointermove', onMove, { passive: true })

    // Half resolution: the field is low-frequency noise, so nothing about it
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

    let raf = 0
    const start = performance.now()
    const frame = (now: number) => {
      gl.uniform1f(uTime, (now - start) / 1000)
      gl.uniform2f(uMouse, mx * canvas.width, my * canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(frame)
    }

    const play = () => {
      cancelAnimationFrame(raf)
      if (document.visibilityState === 'hidden') return
      raf = requestAnimationFrame(frame)
    }

    play()
    addEventListener('resize', resize)
    document.addEventListener('visibilitychange', play)

    return () => {
      cancelAnimationFrame(raf)
      themeWatch.disconnect()
      delete root.dataset.shader
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', play)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <canvas class="shader" ref={ref} aria-hidden="true" />
}
