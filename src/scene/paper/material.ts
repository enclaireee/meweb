/**
 * One paper material for every sheet (architecture.md §6.3). Stock colours travel as vertex
 * attributes (night + morning), and one uniform, uRelight, rolls the whole box from one light to the
 * other, each sheet delayed by its distance from the window (aOrder). One program, one draw per merge.
 */
import { Color, MeshBasicMaterial, MeshStandardMaterial, RepeatWrapping, NoColorSpace, TextureLoader, Vector2, type Texture } from "three";
import { paper, ui } from "@/design/tokens";

export const relightUniform = { value: 0 };
export const glowUniform = { value: 1 };

let paperMat: MeshStandardMaterial | null = null;
let glowMat: MeshBasicMaterial | null = null;

function grain(url: string): Texture {
  const t = new TextureLoader().load(url);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.colorSpace = NoColorSpace; // data, not colour
  t.anisotropy = 4;
  return t;
}

export function paperMaterial(): MeshStandardMaterial {
  if (paperMat) return paperMat;
  const m = new MeshStandardMaterial({
    roughness: paper.roughness,
    metalness: paper.metalness,
    normalMap: grain("/textures/grain-normal.webp"),
    roughnessMap: grain("/textures/grain-rough.webp"),
    normalScale: new Vector2(paper.normalScale, paper.normalScale),
  });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uRelight = relightUniform;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute vec3 colorNight;
attribute vec3 colorMorning;
attribute float aOrder;
uniform float uRelight;
varying vec3 vStock;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
// the relight roll: sheets nearest the window (aOrder 0) change first
float k = smoothstep(aOrder * 0.6, aOrder * 0.6 + 0.4, uRelight);
vStock = mix(colorNight, colorMorning, k);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vStock;")
      .replace("vec4 diffuseColor = vec4( diffuse, opacity );", "vec4 diffuseColor = vec4( vStock, opacity );");
  };
  m.customProgramCacheKey = () => "nw-paper-v1";
  paperMat = m;
  return m;
}

/**
 * Small lights: cut-out glows, unlit, each in its own colour (vertex colour), out in the morning
 * (design.md §5.2).
 */
export function glowMaterial(): MeshBasicMaterial {
  if (glowMat) return glowMat;
  const off = new Color(ui.morning.sky);
  const m = new MeshBasicMaterial({ color: 0xffffff, fog: false });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uGlow = glowUniform;
    shader.uniforms.uOff = { value: off };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec3 colorNight;\nvarying vec3 vGlow;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlow = colorNight;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uGlow;\nuniform vec3 uOff;\nvarying vec3 vGlow;")
      .replace("vec4 diffuseColor = vec4( diffuse, opacity );", "vec4 diffuseColor = vec4( mix( uOff, vGlow, uGlow ), opacity );");
  };
  m.customProgramCacheKey = () => "nw-glow-v2";
  glowMat = m;
  return m;
}
