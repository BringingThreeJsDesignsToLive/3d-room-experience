uniform vec3 uColor;
varying vec2 vUv;
#define PI 3.1415926535897932384626433832795;

void main() {
    // float distanceToCenter = distance();
    float distanceToCenter = distance(vUv, vec2(0.5));
    distanceToCenter = (0.5 / distanceToCenter) - 0.5 * 2.0;
    gl_FragColor = vec4(uColor, distanceToCenter);
}