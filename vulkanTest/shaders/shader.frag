#version 450
layout(location = 0) in vec3 fragColor;
layout(location = 1) in float time;
layout(location = 0) out vec4 outColor;
vec2 resolution = vec2(800.0, 600.0);

#define PI 3.14159265359
#define POINT_COUNT 10


vec2 points[POINT_COUNT];
const float speed = -0.5;
const float len = 0.23;
const float scale = 0.012;
float intensity = 1.3;
float radius = 0.012;
float thickness = .0035;

vec2 pStep = vec2(0.05, 0.05);
vec2 ori = vec2(0.5,0.5);



float rand(vec2 seed) {
    return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
}


float sinc( float x, float k )
{
    float a = PI* ( (k*x-1.0) );
    return sin(a)/a;
}

float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C){    
    vec2 a = B - A;
    vec2 b = A - 2.0*B + C;
    vec2 c = a * 2.0;
    vec2 d = A - pos;

    float kk = 1.0 / dot(b,b);
    float kx = kk * dot(a,b);
    float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
    float kz = kk * dot(d,a);      

    float res = 0.0;

    float p = ky - kx*kx;
    float p3 = p*p*p;
    float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
    float h = q*q + 4.0*p3;
    
    if(h >= 0.0){ 
        h = sqrt(h);
        vec2 x = (vec2(h, -h) - q) / 2.0;
        vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
        float t = uv.x + uv.y - kx;
        t = clamp( t, 0.0, 1.0 );

        // 1 root
        vec2 qos = d + (c + b*t)*t;
        res = length(qos);
    }else{
        float z = sqrt(-p);
        float v = acos( q/(p*z*2.0) ) / 3.0;
        float m = cos(v);
        float n = sin(v)*1.732050808;
        vec3 t = vec3(m + m, -n - m, n - m) * z - kx;
        t = clamp( t, 0.0, 1.0 );

        // 3 roots
        vec2 qos = d + (c + b*t.x)*t.x;
        float dis = dot(qos,qos);
        
        res = dis;

        qos = d + (c + b*t.y)*t.y;
        dis = dot(qos,qos);
        res = min(res,dis);

        qos = d + (c + b*t.z)*t.z;
        dis = dot(qos,qos);
        res = min(res,dis);

        res = sqrt( res );
    }
    
    return res;
}



vec2 getHeartPosition(float t) {
	return vec2(
		16.0 * sin(t) * sin(t) * sin(t),
		(13.0 * cos(t) - 5. * cos(2.*t) - 2. * cos(3. * t) - cos(4. * t))
	);
}

float getGlow(float dist, float radius, float intensity){
	return pow(radius * dist, intensity);
}

float getSegment(float t, vec2 pos, float offset) {
	for (int i = 0; i < POINT_COUNT; i++) {
		points[i] = getHeartPosition(offset + float(i) * len+ speed * t * PI * 1.4);
	}
	
	vec2 c = (points[0] + points[1]) / 2.0;
	vec2 c_prev;
	float light = 0.;
	const float eps = 1e-10;
	
	for (int i = 0; i< POINT_COUNT -1; i++) {
		c_prev = c;
		c = (points[i] + points[i+1]) / 2.0;
		
		float d = sdBezier(pos, scale * c_prev, scale * points[i], scale * c);
		float e = i > 0 ? distance(pos, scale * c_prev) : 1000.;
        		
		light += 1.0 / max(d - thickness, eps);
		light -= 1.0 / max(e - thickness, eps);
		//light = 0.5 * e;
		//light = float(i) * 0.155;
		
		//light =step(distance(points[i] * .015,pos),0.02) * 65.0;	
	}
	
	
	
	return max(0.0,light);
	
}


void main( void ) {
	vec2 st = ( gl_FragCoord.xy / resolution.xy );
	float ratio = resolution.x / resolution.y;
    
	
	vec2 pos = ori - st;
	pos.y /= ratio;

    float noise = rand(pos);
	
	vec3 col = vec3(0.0);
	
	
	float dist = getSegment(time, pos, 0.0);
	//dist = step(distance(pos,point),0.1);
	float glow = getGlow(dist, radius, intensity);
	
	col += glow * vec3(1.0, 0.0, 0.);
	//col += 10. * vec3(sommthstep(0.006,0.003, dist));
	
	dist = getSegment(time, pos, 3.2);
	glow = getGlow(dist, radius, intensity);
	
	col += glow * vec3(.1, .4, 1.);
	
	
	vec3 color = vec3(col);
	
	color = 1.0 - exp(color);
	color = pow(col, vec3(0.4545));
	
    // color *= noise;
//    float pct = plot(st,y);
  //  color = (1.0-pct)*color+pct*vec3(0.0,1.0,0.0);

    outColor = vec4(color,1.0);

}