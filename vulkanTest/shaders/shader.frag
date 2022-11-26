#version 450

layout(location = 0) out vec4 outColor;

vec2 resolution = vec2(800.0, 600.0);



void main() {
    vec2 st = gl_FragCoord.xy / resolution;
    vec3 color = vec3(st,1.0);


    outColor = vec4(color, 1.0);
}
