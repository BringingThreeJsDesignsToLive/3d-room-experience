uniform sampler2D uBakedDayTexture;
uniform sampler2D uBakedNightTexture;
uniform sampler2D uBakedLightMapTexture;
uniform float uIsDayTime;

uniform vec3 uTvBackLightColor;
uniform vec3 uDeskBackLightColor;
uniform vec3 uMonitorBackLightColor;

uniform float uTvBackLightIntensity;
uniform float uDeskBackLightIntensity;
uniform float uMonitorBackLightIntensity;

varying vec2 vUv;

void main() {
    vec3 bakedDayColor = texture(uBakedDayTexture, vUv).rgb;
    vec3 bakedNightColor = texture(uBakedNightTexture, vUv).rgb;

    vec3 bakedColor = mix(bakedNightColor, bakedDayColor, uIsDayTime);
    vec3 lightMapColor = texture(uBakedLightMapTexture, vUv).rgb;

    lightMapColor.r = lightMapColor.r * uTvBackLightIntensity;
    lightMapColor.g = lightMapColor.g * uDeskBackLightIntensity;
    lightMapColor.b = lightMapColor.b * uMonitorBackLightIntensity;

    bakedColor = mix(bakedColor, uTvBackLightColor, lightMapColor.r);
    bakedColor = mix(bakedColor, uDeskBackLightColor, lightMapColor.g);
    bakedColor = mix(bakedColor, uMonitorBackLightColor, lightMapColor.b);

    gl_FragColor = vec4(bakedColor, 1.0);
}