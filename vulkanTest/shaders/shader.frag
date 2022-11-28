#version 450
layout(location = 0) in vec3 fragColor;
layout(location = 0) out vec4 outColor;

vec2 resolution = vec2(800.0, 600.0);

float rand(vec2 seed) {
    return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 st = gl_FragCoord.xy / resolution;
    float temp = rand(st);
    vec3 color = vec3(temp);

    outColor = vec4(color, 1.0);
}
