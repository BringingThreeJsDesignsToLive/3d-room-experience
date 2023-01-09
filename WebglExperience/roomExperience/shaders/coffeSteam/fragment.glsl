#pragma glslify: perlin3d = require("../utils/perlin2D.glsl");
varying vec2 vUv;
uniform float uTime;
uniform float uTimeFrequency;
uniform vec2 uUvFrequency;
void main() {
    float borderAlphaX = min(vUv.x * 2.0, (1.0 - vUv.x) * 2.0);
    float borderAlpha = (borderAlphaX * vUv.y);
    vec2 uv = vUv * uUvFrequency;
    uv.y += uTime * uTimeFrequency;
    float perlin = perlin3d(uv);
    perlin *= borderAlpha;
    perlin = min(perlin, 1.0);
    gl_FragColor = vec4(1.0, 1.0, 1.0, perlin);
}