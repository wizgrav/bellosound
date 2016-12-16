var shader = null;
var info = document.getElementById("info");

var uniforms = {
  iMusic: new Float32Array(16)
};

function getChunk(s) {
  var v = document.querySelector("div." + s + " input[type=text]").value;
  var c = document.querySelector("div." + s + " input[type=checkbox]").checked;
  if ( v ) localStorage.setItem("rhythm-debugger-"+s, v); else localStorage.removeItem("rhythm-debugger-"+s); 
  return v && c ? v : "0.0";
}

function init () {
  
  var txt = [
    "#define MUSIC1 mix(0.6,0.9,smoothstep(min(iMusic[0].w,iMusic[1].w)*0.9,1.0, min(iMusic[0].z,iMusic[1].z)))",
    "#define MUSIC2 0.2 + 0.8 * smoothstep(iMusic[2].y * iMusic[3].y,1.4 + iMusic[2].y * iMusic[3].x, dot(iMusic[3].yz, iMusic[2].yz))",
    "#define MUSIC3 0.33 + 0.66 * smoothstep(iMusic[1].y * iMusic[2].y,1.4 + iMusic[2].y * iMusic[1].x, dot(iMusic[1].yz, iMusic[2].yz))",
    "",
    "void mainImage(out vec4 color, vec2 fragCoord) {",
    " vec2 uv = fragCoord/iResolution.xy;",
    " float aspect = iResolution.x/iResolution.y;",
    " uv.x *= aspect;",
    " vec3 rv = vec3(0.);",
    " vec2 center = vec2(0.5 * aspect,0.5);",
    " rv.x = max(0.2, MUSIC1);",
    " rv.y = mix(0.05, rv.x * 0.8, MUSIC2);",
    " rv.z = mix(rv.y * 1.2, rv.x * 0.9, MUSIC3);",
    " rv *= 0.49;",
    " float d = distance(center, uv);",
    " float f = fwidth(d);",
    " float c1 = smoothstep(rv.x - f, rv.x + f, d);",
    " float c2 = smoothstep(rv.y - f, rv.y + f, d);",
    " float c3 = smoothstep(rv.z - f, rv.z + f, d);",
    " color.rgb = vec3(c3 < 1. ? ( c2 < 1. ? mix(iMusic[2].w * iMusic[2].y,c2, c2) : 1.0 - c3):mix(iMusic[0].w * iMusic[0].y,c1, c1));",
    "}"
  ].join("\n");  
  var s = new Shader(gl, { 
    source: txt, 
    uniforms: uniforms, 
    correct: needsCorrection
  });
  if(!s.programInfo) {
    alert("error compiling shader");
    return;
  }
  console.log(txt);
  if (shader) gl.deleteProgram(shader.programInfo.program);
  shader = s;
}

function  render(time) {
  currentTime = time;
  window.requestAnimationFrame(render);
  clubber.update(time);
  for(var i = 0; i< 4; i++) 
    data.bands[i](uniforms.iMusic, 4*i);
  uniforms.iResolution = [gl.canvas.width, gl.canvas.height,0];
  data.time = time/1000;
  gl.clear(gl.COLOR_BUFFER_BIT);
  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  shader.render(data, true);
}

init();
soundcloud("https://soundcloud.com/bellosound/oben-flats-presents-haus-music-volume-1-continuous-mix-by-bellosound");
render(0);