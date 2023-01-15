uniform sampler2D uBakedTexture;
uniform sampler2D uBakedLightMapTexture;
uniform vec3 uTvBackLightColor;
uniform vec3 uDeskBackLightColor;
uniform vec3 uMonitorBackLightColor;
uniform float uTvBackLightIntensity;
uniform float uDeskBackLightIntensity;
uniform float uMonitorBackLightIntensity;

varying vec2 vUv;

void main() {
    vec3 bakedColor = texture(uBakedTexture, vUv).rgb;
    vec3 lightMapColor = texture(uBakedLightMapTexture, vUv).rgb;

    lightMapColor.r = lightMapColor.r * uTvBackLightIntensity;
    lightMapColor.g = lightMapColor.g * uDeskBackLightIntensity;
    lightMapColor.b = lightMapColor.b * uMonitorBackLightIntensity;

    bakedColor = mix(bakedColor, uTvBackLightColor, lightMapColor.r);
    bakedColor = mix(bakedColor, uDeskBackLightColor, lightMapColor.g);
    bakedColor = mix(bakedColor, uMonitorBackLightColor, lightMapColor.b);

    gl_FragColor = vec4(bakedColor, 1.0);
}