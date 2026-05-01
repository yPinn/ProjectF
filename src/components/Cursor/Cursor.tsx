import { useEffect, useRef } from 'react'

const VERT = `precision mediump float;
varying vec2 vUv;attribute vec2 a_position;
void main(){vUv=.5*(a_position+1.);gl_Position=vec4(a_position,0.,1.);}`

const FRAG = `precision mediump float;
varying vec2 vUv;
uniform float u_time,u_ratio,u_size,u_smile,u_flat_color;
uniform vec2 u_pointer,u_target_pointer;
uniform vec3 u_main_color,u_border_color;
uniform sampler2D u_texture;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)),x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m;m=m*m;
  vec3 x=2.*fract(p*C.www)-1.,h=abs(x)-.5,ox=floor(x+.5),a0=x-ox;
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}
vec2 rot(vec2 v,float a){return vec2(v.x*cos(a)-v.y*sin(a),v.x*sin(a)+v.y*cos(a));}
float eyes(vec2 u){
  u.y-=.5;u.y*=.8;u.x=abs(u.x);
  u.y+=u_smile*.3*pow(u.x,1.3);u.x-=(.6+.2*u_smile);
  return 1.-pow(clamp(length(u),0.,1.),.08);
}
float mouth(vec2 u){
  u.y+=1.5;u.x*=(.5+.5*abs(1.-u_smile));
  u.y*=(3.-2.*abs(1.-u_smile));u.y-=u_smile*4.*pow(u.x,2.);
  return 1.-pow(clamp(length(u),0.,1.),.07);
}
void main(){
  vec2 p=u_pointer;p.x*=u_ratio;
  vec2 uv=vUv;uv.x*=u_ratio;uv-=p;
  float shape=texture2D(u_texture,vec2(vUv.x,1.-vUv.y)).r;
  float noise=snoise(uv*vec2(.7/u_size,.6/u_size)+vec2(0.,.0015*u_time));
  noise+=1.2;noise*=2.1;noise+=smoothstep(-.8,-.2,uv.y/u_size);
  vec2 fuv=rot(uv,5.*(u_target_pointer.x-u_pointer.x))/(.27*u_size);
  shape-=10.*eyes(fuv)+20.*mouth(fuv);
  shape*=noise;
  vec3 border=(1.-u_border_color);border.g+=.2*sin(.005*u_time);border*=.5;
  vec3 color=u_main_color;
  color-=(1.-u_flat_color)*border*smoothstep(0.,.01,shape);
  shape=u_flat_color*smoothstep(.8,1.,shape)+(1.-u_flat_color)*shape;
  gl_FragColor=vec4(color*shape,shape);
}`

export interface CursorProps {
  size?: number
  mainColor?: [number, number, number]
  borderColor?: [number, number, number]
  flatColor?: boolean
  tailDots?: number
  spring?: number
  friction?: number
}

export default function Cursor({
  size = 0.034,
  mainColor = [0.98, 0.96, 0.96],
  borderColor = [0.2, 0.5, 0.7],
  flatColor = false,
  tailDots = 25,
  spring = 1.4,
  friction = 0.3,
}: CursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const arrowRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const arrow = arrowRef.current!
    const arrowState = {
      prevX: 0,
      prevY: 0,
      angle: 0,
      prevAngle: 0,
      angleDisplace: 0,
      degrees: 57.296,
      size: 20,
    }
    const dpr = Math.min(devicePixelRatio, 2)

    // WebGL init
    const gl = (canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext
    if (!gl) return

    const mkShader = (src: string, type: number) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, mkShader(VERT, gl.VERTEX_SHADER))
    gl.attachShader(prog, mkShader(FRAG, gl.FRAGMENT_SHADER))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    // Collect uniforms
    const u: Record<string, WebGLUniformLocation | null> = {}
    for (let i = 0, n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS); i < n; i++) {
      const name = gl.getActiveUniform(prog, i)!.name
      u[name] = gl.getUniformLocation(prog, name)
    }

    // Full-screen quad
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const posLoc = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    // Texture canvas
    const tex = document.createElement('canvas')
    const ctx = tex.getContext('2d')!
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
    for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER])
      gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR)
    for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T])
      gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE)
    gl.uniform1i(u.u_texture, 0)

    // Static uniforms
    gl.uniform1f(u.u_size, size)
    gl.uniform1f(u.u_flat_color, flatColor ? 1 : 0)
    gl.uniform3f(u.u_main_color, ...mainColor)
    gl.uniform3f(u.u_border_color, ...borderColor)

    // Trail particles — sprites pre-rendered, rebuilt only on resize
    const dotR = (i: number) => size * innerHeight * (1 - 0.2 * ((3 * i) / tailDots - 1) ** 2)

    function makeTrailSprite(opacity: number, bordered: number, r: number): HTMLCanvasElement {
      const dim = Math.ceil(r * 2) + 2
      const offscreen = document.createElement('canvas')
      offscreen.width = dim
      offscreen.height = dim
      const oc = offscreen.getContext('2d')!
      const cx = dim / 2
      const g = oc.createRadialGradient(cx, cx, r * bordered, cx, cx, r)
      g.addColorStop(0, `rgba(255,255,255,${opacity})`)
      g.addColorStop(1, 'rgba(255,255,255,0)')
      oc.fillStyle = g
      oc.beginPath()
      oc.arc(cx, cx, r, 0, Math.PI * 2)
      oc.fill()
      return offscreen
    }

    const trail = Array.from({ length: tailDots }, (_, i) => {
      const opacity = 0.04 + 0.3 * (1 - i / tailDots) ** 4
      const bordered = 0.6 * (1 - i / tailDots)
      const r = dotR(i)
      const sprite = makeTrailSprite(opacity, bordered, r)
      return {
        x: 0.25 * innerWidth,
        y: 0.8 * innerHeight,
        vx: 0,
        vy: 0,
        opacity,
        bordered,
        r,
        sprite,
        spriteHalf: sprite.width / 2,
      }
    })

    // Mouse state
    const mouse = { x: 0.25, y: 0.8, tX: 0.25, tY: 0.8, moving: false }
    let smile = 1,
      gravity = 0,
      rafId = 0,
      moveTimer = 0

    const resize = () => {
      canvas.width = innerWidth * dpr
      canvas.height = innerHeight * dpr
      // Half-res texture — 4× less GPU upload bandwidth, visually transparent since trail is blurry
      tex.width = Math.ceil(innerWidth * 0.5)
      tex.height = Math.ceil(innerHeight * 0.5)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform1f(u.u_ratio, canvas.width / canvas.height)
      trail.forEach((p, i) => {
        p.r = dotR(i)
        p.sprite = makeTrailSprite(p.opacity, p.bordered, p.r)
        p.spriteHalf = p.sprite.width / 2
      })
    }
    resize()

    const loop = () => {
      const now = performance.now()

      // Smile / gravity animation
      if (mouse.moving) {
        smile = Math.max(smile - 0.05, -0.1)
        gravity = Math.max(gravity - 10 * size, 0)
      } else {
        smile = Math.min(smile + 0.01, 1)
        gravity =
          gravity > 25 * size ? (25 + 5 * (1 + Math.sin(0.002 * now))) * size : gravity + size
      }

      // Smooth mouse
      mouse.x += (mouse.tX - mouse.x) * 0.1
      mouse.y += (mouse.tY - mouse.y) * 0.1

      // Draw trail to half-res texture — physics in full-resolution coords, canvas scaled 0.5×
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, tex.width, tex.height)
      ctx.setTransform(0.5, 0, 0, 0.5, 0, 0)
      const mx = mouse.x * innerWidth,
        my = mouse.y * innerHeight
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i]
        if (i === 0) {
          p.x = mx
          p.y = my
        } else {
          const q = trail[i - 1]
          p.vx = (p.vx + (q.x - p.x) * spring) * friction
          p.vy = (p.vy + (q.y - p.y) * spring) * friction + gravity
          p.x += p.vx
          p.y += p.vy
        }
        ctx.drawImage(p.sprite, p.x - p.spriteHalf, p.y - p.spriteHalf)
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      // Render
      gl.uniform1f(u.u_time, now)
      gl.uniform1f(u.u_smile, smile)
      gl.uniform2f(u.u_pointer, mouse.x, 1 - mouse.y)
      gl.uniform2f(u.u_target_pointer, mouse.tX, 1 - mouse.tY)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    // Events
    const onMove = (eX: number, eY: number) => {
      mouse.moving = true
      clearTimeout(moveTimer)
      moveTimer = setTimeout(() => {
        mouse.moving = false
      }, 300) as unknown as number
      const dx = arrowState.prevX - eX
      const dy = arrowState.prevY - eY
      const dist = Math.sqrt(dx * dx + dy * dy)
      arrow.style.opacity = '1'
      arrow.style.transform = `translate3d(${eX}px, ${eY}px, 0)`
      if (dist > 1) {
        const unsorted = Math.atan(Math.abs(dy) / Math.abs(dx)) * arrowState.degrees
        arrowState.prevAngle = arrowState.angle
        if (dx <= 0 && dy >= 0) arrowState.angle = 90 - unsorted
        else if (dx < 0 && dy < 0) arrowState.angle = unsorted + 90
        else if (dx >= 0 && dy <= 0) arrowState.angle = 90 - unsorted + 180
        else if (dx > 0 && dy > 0) arrowState.angle = unsorted + 270
        if (!isNaN(arrowState.angle)) {
          const diff = arrowState.angle - arrowState.prevAngle
          if (diff <= -270) arrowState.angleDisplace += 360 + diff
          else if (diff >= 270) arrowState.angleDisplace += diff - 360
          else arrowState.angleDisplace += diff
        }
        arrow.style.left = `${-arrowState.size / 2}px`
        arrow.style.top = `0px`
        arrow.style.transform += ` rotate(${arrowState.angleDisplace}deg)`
      } else {
        arrow.style.transform += ` rotate(${arrowState.angleDisplace}deg)`
      }
      arrowState.prevX = eX
      arrowState.prevY = eY
      const s = size * innerHeight
      mouse.tX = (eX + s) / innerWidth
      mouse.tY = Math.max(eY - s, s) / innerHeight
    }
    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) =>
      onMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY)

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(rafId)
      else rafId = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('click', onMouse)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(moveTimer)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('click', onMouse)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10000,
        }}
      />
      <svg
        ref={arrowRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: 20,
          height: 20,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 10001,
          opacity: 0,
          transition: '250ms, transform 100ms',
          userSelect: 'none',
        }}
      >
        <path
          d="M25,30a5.82,5.82,0,0,1-1.09-.17l-.2-.07-7.36-3.48a.72.72,0,0,0-.35-.08.78.78,0,0,0-.33.07L8.24,29.54a.66.66,0,0,1-.2.06,5.17,5.17,0,0,1-1,.15,3.6,3.6,0,0,1-3.29-5L12.68,4.2a3.59,3.59,0,0,1,6.58,0l9,20.74A3.6,3.6,0,0,1,25,30Z"
          fill="#F2F5F8"
        />
        <path
          d="M16,3A2.59,2.59,0,0,1,18.34,4.6l9,20.74A2.59,2.59,0,0,1,25,29a5.42,5.42,0,0,1-.86-.15l-7.37-3.48a1.84,1.84,0,0,0-.77-.17,1.69,1.69,0,0,0-.73.16l-7.4,3.31a5.89,5.89,0,0,1-.79.12,2.59,2.59,0,0,1-2.37-3.62L13.6,4.6A2.58,2.58,0,0,1,16,3m0-2h0A4.58,4.58,0,0,0,11.76,3.8L2.84,24.33A4.58,4.58,0,0,0,7,30.75a6.08,6.08,0,0,0,1.21-.17,1.87,1.87,0,0,0,.4-.13L16,27.18l7.29,3.44a1.64,1.64,0,0,0,.39.14A6.37,6.37,0,0,0,25,31a4.59,4.59,0,0,0,4.21-6.41l-9-20.75A4.62,4.62,0,0,0,16,1Z"
          fill="#111920"
        />
      </svg>
    </>
  )
}
