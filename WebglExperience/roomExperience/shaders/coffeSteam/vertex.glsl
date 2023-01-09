#pragma glslify: perlin3d = require("../utils/perlin2D.glsl");
uniform float uTime;
varying vec2 vUv;

void main() {
    vec3 newPosition = position;

    vec2 displacementUv = uv;
    displacementUv *= 2.0;
    displacementUv.y += uTime * 0.001;

    float perlin = perlin3d(displacementUv);
    newPosition.y += perlin * 0.01;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    vUv = uv;
}