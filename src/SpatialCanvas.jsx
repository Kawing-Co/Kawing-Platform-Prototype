import React, { useEffect, useRef, useState } from "react";
// Original procedural café miniatures. The optional scene renders only on demand.
function geometry(stage) {
  const points = [];
  const ink = [0.16, 0.22, 0.19],
    green = [0.19, 0.37, 0.29],
    sage = [0.57, 0.67, 0.48],
    paper = [0.98, 0.96, 0.88],
    wood = [0.76, 0.61, 0.43],
    sand = [0.87, 0.82, 0.69],
    gold = [0.81, 0.62, 0.29],
    clay = [0.67, 0.39, 0.29];
  const tri = (a, b, c, color) => {
    const u = b.map((v, i) => v - a[i]),
      v = c.map((n, i) => n - a[i]);
    const n = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
    const l = Math.hypot(...n) || 1;
    const light =
      0.69 +
      0.22 * Math.max(0, n[1] / l) +
      0.14 * Math.max(0, ((-n[0] + n[2]) * 0.7) / l);
    for (const p of [a, b, c])
      points.push(...p, ...color.map((x) => Math.min(1, x * light)));
  };
  // A bevelled rectangular extrusion; flat=true turns its face into a tabletop.
  const slab = (cx, cy, cz, w, h, d, r, color, flat = false) => {
    const edge = [];
    for (const [x, y, start] of [
      [w / 2 - r, h / 2 - r, 0],
      [-w / 2 + r, h / 2 - r, 90],
      [-w / 2 + r, -h / 2 + r, 180],
      [w / 2 - r, -h / 2 + r, 270],
    ])
      for (let i = 0; i <= 4; i++) {
        const a = ((start + i * 22.5) * Math.PI) / 180;
        edge.push([x + r * Math.cos(a), y + r * Math.sin(a)]);
      }
    const at = (x, y, z) =>
      flat ? [cx + x, cy + z, cz - y] : [cx + x, cy + y, cz + z];
    edge.forEach(([x, y], i) => {
      const [nx, ny] = edge[(i + 1) % edge.length];
      tri(at(0, 0, d / 2), at(x, y, d / 2), at(nx, ny, d / 2), color);
      tri(at(0, 0, -d / 2), at(nx, ny, -d / 2), at(x, y, -d / 2), color);
      tri(at(x, y, -d / 2), at(nx, ny, -d / 2), at(nx, ny, d / 2), color);
      tri(at(x, y, -d / 2), at(nx, ny, d / 2), at(x, y, d / 2), color);
    });
  };
  const cylinder = (x, y, z, r, h, color, topRadius = r) => {
    for (let i = 0; i < 28; i++) {
      const a = (i * Math.PI) / 14,
        b = ((i + 1) * Math.PI) / 14;
      const lo = (t) => [x + r * Math.cos(t), y - h / 2, z + r * Math.sin(t)];
      const hi = (t) => [
        x + topRadius * Math.cos(t),
        y + h / 2,
        z + topRadius * Math.sin(t),
      ];
      tri([x, y + h / 2, z], hi(b), hi(a), color);
      tri([x, y - h / 2, z], lo(a), lo(b), color);
      tri(lo(a), hi(a), hi(b), color);
      tri(lo(a), hi(b), lo(b), color);
    }
  };
  const cup = (x, y, z) => {
    cylinder(x, y, z, 0.14, 0.32, paper, 0.19);
    cylinder(x, y + 0.164, z, 0.155, 0.008, [0.32, 0.19, 0.11]);
    cylinder(x + 0.02, y + 0.171, z, 0.065, 0.005, sand);
    // Small open handle, its centre parallel to the front of the cup.
    for (let i = 0; i < 20; i++)
      for (let j = 0; j < 6; j++) {
        const at = (a, b) => [
          x + 0.18 + (0.1 + 0.027 * Math.cos(b)) * Math.cos(a),
          y + (0.1 + 0.027 * Math.cos(b)) * Math.sin(a),
          z + 0.027 * Math.sin(b),
        ];
        const a = (i * Math.PI) / 10,
          b = (j * Math.PI) / 3,
          da = Math.PI / 10,
          db = Math.PI / 3;
        tri(at(a, b), at(a + da, b), at(a + da, b + db), paper);
        tri(at(a, b), at(a + da, b + db), at(a, b + db), paper);
      }
  };
  const plant = (x, y, z) => {
    cylinder(x, y, z, 0.17, 0.29, clay, 0.23);
    cylinder(x, y + 0.15, z, 0.2, 0.012, [0.28, 0.24, 0.17]);
    cylinder(x, y + 0.36, z, 0.022, 0.43, green);
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4,
        cy = y + 0.25 + i * 0.04;
      const end = [x + Math.cos(a) * 0.34, cy + 0.25, z + Math.sin(a) * 0.34];
      const mid = [x + Math.cos(a) * 0.16, cy + 0.12, z + Math.sin(a) * 0.16];
      const left = [
        mid[0] + Math.cos(a + 1.57) * 0.12,
        mid[1],
        mid[2] + Math.sin(a + 1.57) * 0.12,
      ];
      const right = [
        mid[0] - Math.cos(a + 1.57) * 0.12,
        mid[1],
        mid[2] - Math.sin(a + 1.57) * 0.12,
      ];
      tri([x, cy, z], left, end, i % 2 ? green : sage);
      tri([x, cy, z], end, right, i % 2 ? sage : green);
    }
  };
  const desk = () => {
    slab(0, -0.53, 0, 3.65, 1.88, 0.13, 0.23, wood, true);
    for (const x of [-1.38, 1.38])
      for (const z of [-0.59, 0.59]) cylinder(x, -0.84, z, 0.055, 0.52, ink);
  };
  const monitor = (x, y, z, w, h) => {
    slab(x, y, z, w, h, 0.13, 0.07, ink);
    slab(x, y, z + 0.075, w - 0.14, h - 0.14, 0.018, 0.035, paper);
    slab(x, y - h / 2 - 0.18, z, 0.12, 0.35, 0.09, 0.025, ink);
    slab(x, -0.43, z + 0.05, w * 0.55, 0.5, 0.05, 0.08, ink, true);
  };
  // One small plinth, with a baked contact shadow, grounds every story stage.
  slab(0, -1.12, 0, 4.48, 2.58, 0.012, 0.36, [0.75, 0.74, 0.66], true);
  slab(0, -1.05, 0, 4.4, 2.5, 0.13, 0.36, sand, true);
  desk();
  if (stage === 0) {
    // Table entry: a QR stand, a customer phone, coffee and a live plant.
    slab(-0.62, -0.39, 0.05, 0.91, 0.56, 0.065, 0.07, green, true);
    slab(-0.62, 0.08, 0, 0.76, 0.95, 0.095, 0.035, green);
    slab(-0.62, 0.09, 0.057, 0.62, 0.69, 0.018, 0.02, paper);
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 6; j++)
        if ((i * 7 + j * 13 + i * j) % 5 < 3)
          slab(
            -0.845 + i * 0.09,
            -0.135 + j * 0.09,
            0.072,
            0.06,
            0.06,
            0.012,
            0,
            ink,
          );
    slab(0.5, 0.23, -0.18, 0.77, 1.37, 0.12, 0.09, ink);
    slab(0.5, 0.24, -0.108, 0.66, 1.21, 0.012, 0.055, paper);
    slab(0.5, 0.44, -0.095, 0.55, 0.47, 0.012, 0.025, green);
    slab(0.5, 0.12, -0.094, 0.49, 0.045, 0.012, 0.01, sage);
    slab(0.5, -0.05, -0.094, 0.5, 0.15, 0.012, 0.025, sand);
    slab(0.5, -0.23, -0.094, 0.5, 0.1, 0.012, 0.025, green);
    slab(0.5, 0.81, -0.087, 0.17, 0.026, 0.008, 0.01, ink);
    cup(1.28, -0.3, 0.43);
    plant(-1.4, -0.3, -0.43);
  } else if (stage === 1) {
    // Kitchen tickets: verification, preparation and ready are visibly separate.
    monitor(-0.15, 0.33, -0.29, 2.45, 1.4);
    for (let i = 0; i < 3; i++) {
      const x = -0.92 + i * 0.77;
      slab(
        x,
        0.29,
        -0.198,
        0.65,
        0.94,
        0.015,
        0.025,
        i === 2 ? sage : [0.89, 0.88, 0.79],
      );
      slab(x, 0.62, -0.18, 0.48, 0.09, 0.012, 0.018, green);
      for (let n = 0; n < 3; n++)
        slab(x, 0.36 - n * 0.17, -0.177, 0.43, 0.035, 0.014, 0.008, wood);
    }
    slab(1.47, -0.23, 0.25, 0.55, 0.46, 0.62, 0.065, green);
    slab(1.47, -0.36, 0.61, 0.4, 0.38, 0.018, 0.01, paper);
    for (let n = 0; n < 3; n++)
      slab(1.47, -0.26 - n * 0.08, 0.628, 0.28, 0.018, 0.012, 0, sage);
    cup(-1.48, -0.3, 0.45);
  } else {
    // Owner's desk: loyalty membership beside a deliberately illustrative chart.
    monitor(-0.83, 0.3, -0.25, 1.53, 1.36);
    slab(-0.83, 0.62, -0.162, 1.22, 0.12, 0.014, 0.02, green);
    for (let i = 0; i < 6; i++) {
      const x = -1.22 + (i % 3) * 0.39,
        y = 0.29 - Math.floor(i / 3) * 0.38;
      slab(x, y, -0.16, 0.27, 0.27, 0.014, 0.125, i < 4 ? green : sand);
    }
    slab(-0.83, -0.24, -0.16, 1.14, 0.07, 0.015, 0.02, sage);
    for (let i = 0; i < 4; i++) {
      const h = 0.35 + i * 0.24;
      slab(
        0.38 + i * 0.36,
        -0.45 + h / 2,
        0.08,
        0.23,
        h,
        0.31,
        0.055,
        i === 3 ? green : sage,
      );
    }
    cylinder(1.32, -0.42, 0.65, 0.23, 0.08, gold);
    cylinder(1.32, -0.34, 0.65, 0.23, 0.08, gold);
  }
  return new Float32Array(points);
}
export default function SpatialCanvas({
  stage,
  angle,
  onAngle,
  zoom = 1,
  onZoom,
}) {
  const canvas = useRef(null),
    api = useRef(null),
    drag = useRef(null),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    const c = canvas.current;
    let gl;
    try {
      gl = c.getContext("webgl", {
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: false,
      });
      if (!gl) throw new Error("WebGL unavailable");
      const compile = (type, source) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
          throw new Error("Shader unavailable");
        return s;
      };
      const vs = compile(
          gl.VERTEX_SHADER,
          `attribute vec3 pos;attribute vec3 color;varying vec3 vcolor;uniform float angle;uniform float aspect;uniform float zoom;void main(){float s=sin(angle),c=cos(angle);vec3 p=vec3(pos.x*c+pos.z*s,pos.y,-pos.x*s+pos.z*c);float t=0.38; p=vec3(p.x,p.y*cos(t)-p.z*sin(t),p.y*sin(t)+p.z*cos(t));p.y+=0.22;float z=p.z-5.5;gl_Position=vec4(p.x*2.1*zoom/aspect,p.y*2.1*zoom,(-z-0.2),-z);vcolor=color;}`,
        ),
        fs = compile(
          gl.FRAGMENT_SHADER,
          `precision mediump float;varying vec3 vcolor;void main(){gl_FragColor=vec4(vcolor,1.0);}`,
        );
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Program unavailable");
      const buffer = gl.createBuffer();
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      for (const [name, offset] of [
        ["pos", 0],
        ["color", 12],
      ]) {
        const loc = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 24, offset);
      }
      gl.enable(gl.DEPTH_TEST);
      const ua = gl.getUniformLocation(program, "angle"),
        ur = gl.getUniformLocation(program, "aspect"),
        uz = gl.getUniformLocation(program, "zoom");
      let currentStage = stage,
        currentAngle = angle,
        currentZoom = zoom,
        cachedGeometry = geometry(stage);
      const draw = () => {
        const r = c.getBoundingClientRect(),
          ratio = Math.min(devicePixelRatio, 1.5);
        c.width = Math.max(1, r.width * ratio);
        c.height = Math.max(1, r.height * ratio);
        gl.viewport(0, 0, c.width, c.height);
        gl.clearColor(0.91, 0.9, 0.86, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const points = cachedGeometry;
        gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
        gl.uniform1f(ua, currentAngle);
        gl.uniform1f(ur, c.width / c.height);
        gl.uniform1f(uz, currentZoom);
        gl.drawArrays(gl.TRIANGLES, 0, points.length / 6);
      };
      api.current = {
        update: (s, a, z) => {
          if (s !== currentStage) cachedGeometry = geometry(s);
          currentStage = s;
          currentAngle = a;
          currentZoom = z;
          draw();
        },
      };
      const ro = new ResizeObserver(draw);
      ro.observe(c);
      const lost = (e) => {
        e.preventDefault();
        api.current = null;
        ro.disconnect();
        setFailed(true);
      };
      c.addEventListener("webglcontextlost", lost);
      draw();
      return () => {
        ro.disconnect();
        c.removeEventListener("webglcontextlost", lost);
        api.current = null;
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      };
    } catch {
      setFailed(true);
    }
  }, []);
  useEffect(
    () => api.current?.update(stage, angle, zoom),
    [stage, angle, zoom],
  );
  return failed ? (
    <div className="spatial-fallback">
      <img
        src="/images/story-scene.jpg"
        alt="Kawing connected workflow illustration"
      />
      <p>3D isn’t available in this browser. The full demo still works.</p>
    </div>
  ) : (
    <canvas
      ref={canvas}
      className="spatial-canvas"
      tabIndex={0}
      role="img"
      data-angle={angle}
      data-zoom={zoom}
      aria-label="Interactive 3D café illustration. Drag horizontally or use Left and Right to rotate. Plus and Minus zoom; Home resets. A vertical swipe scrolls the page."
      onKeyDown={(e) => {
        const actions = {
          ArrowLeft: () => onAngle(angle - 0.3),
          ArrowRight: () => onAngle(angle + 0.3),
          "+": () => onZoom?.(Math.min(1.35, zoom + 0.15)),
          "=": () => onZoom?.(Math.min(1.35, zoom + 0.15)),
          "-": () => onZoom?.(Math.max(1, zoom - 0.15)),
          Home: () => {
            onAngle(-0.35);
            onZoom?.(1);
          },
        };
        if (actions[e.key]) {
          e.preventDefault();
          actions[e.key]();
        }
      }}
      onLostPointerCapture={() => {
        drag.current = null;
      }}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        drag.current = { x: e.clientX, angle };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current)
          onAngle(drag.current.angle + (e.clientX - drag.current.x) * 0.008);
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    />
  );
}
