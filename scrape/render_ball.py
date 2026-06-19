# Headless Blender: import the CC-BY basketball GLB, smooth it, spin 360 deg,
# render a 239-frame transparent PNG sequence (ball_sequence000.png .. 238.png)
# matching the original 700x700 frames.
import bpy, math, os, sys

ROOT = "/Users/paulbridges/Desktop/Medway Basketball Association"
GLB  = os.path.join(ROOT, "site/models/basketball-poly-google.glb")
OUT  = os.path.join(ROOT, "site-orange/assets/ball-orange/ball_sequence")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

# --- clean scene ---
bpy.ops.wm.read_factory_settings(use_empty=True)

# --- import the basketball ---
bpy.ops.import_scene.gltf(filepath=GLB)
mesh = next(o for o in bpy.context.scene.objects if o.type == 'MESH')

# center at origin, apply transforms
bpy.ops.object.select_all(action='DESELECT')
mesh.select_set(True)
bpy.context.view_layer.objects.active = mesh
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
mesh.location = (0, 0, 0)
mesh.rotation_euler = (0, 0, 0)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# This model is a low-poly ball whose tiny per-panel texture only reads as a
# basketball when flat-shaded (subdividing blurs panels into dots). Keep it crisp.
bpy.ops.object.shade_flat()
# keep texture sampling crisp, and richen the pale texture to a vivid basketball orange
for mat in mesh.data.materials:
    if not (mat and mat.use_nodes):
        continue
    nt = mat.node_tree
    tex = next((n for n in nt.nodes if n.type == 'TEX_IMAGE'), None)
    bsdf = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if tex:
        tex.interpolation = 'Closest'
    if tex and bsdf:
        hsv = nt.nodes.new('ShaderNodeHueSaturation')
        hsv.inputs['Saturation'].default_value = 2.4
        hsv.inputs['Value'].default_value = 0.92
        nt.links.new(tex.outputs['Color'], hsv.inputs['Color'])
        nt.links.new(hsv.outputs['Color'], bsdf.inputs['Base Color'])

# normalize size: scale so max dimension = 1.0
dim = max(mesh.dimensions)
if dim > 0:
    mesh.scale = (1.0/dim,)*3
    bpy.ops.object.transform_apply(scale=True)

# --- camera (orthographic, fills the frame consistently while spinning) ---
cam_data = bpy.data.cameras.new("Cam")
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 1.18
cam = bpy.data.objects.new("Cam", cam_data)
bpy.context.collection.objects.link(cam)
cam.location = (0, -3.0, 0)
cam.rotation_euler = (math.radians(90), 0, 0)   # look along +Y toward origin
bpy.context.scene.camera = cam

# --- lighting: soft studio key + fill, on transparent film ---
world = bpy.data.worlds.new("W"); bpy.context.scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.35  # ambient

def add_area(name, loc, rot, energy, size):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = energy; d.size = size
    o = bpy.data.objects.new(name, d); o.location = loc; o.rotation_euler = rot
    bpy.context.collection.objects.link(o)

add_area("Key",  (-2.2, -2.2, 2.6), (math.radians(55), 0, math.radians(-40)), 600, 4)
add_area("Fill", ( 2.6, -1.6, 0.6), (math.radians(80), 0, math.radians(55)),  220, 5)
add_area("Rim",  ( 0.4,  2.6, 1.6), (math.radians(120),0, math.radians(10)),  300, 4)

# --- render settings ---
scn = bpy.context.scene
scn.render.engine = 'CYCLES'
try:
    scn.cycles.samples = 32
    scn.cycles.use_denoising = True
except Exception as e:
    print("cycles cfg:", e)
scn.render.resolution_x = 700
scn.render.resolution_y = 700
scn.render.film_transparent = True
scn.render.image_settings.file_format = 'PNG'
scn.render.image_settings.color_mode = 'RGBA'
scn.render.filepath = OUT + "###"   # 3-digit padding -> ball_sequence000.png

# --- animate a full roll (rotate about X so it tumbles toward camera) ---
scn.frame_start = 0
scn.frame_end = 0 if os.environ.get("TEST") == "1" else 238
# make new keyframes linear by default (Blender 5.x: Action.fcurves removed)
try:
    bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'
except Exception as e:
    print("interp pref:", e)
mesh.rotation_euler = (0, 0, 0)
mesh.keyframe_insert(data_path="rotation_euler", frame=0)
mesh.rotation_euler = (math.radians(360), 0, math.radians(360))  # tumble: roll + spin
mesh.keyframe_insert(data_path="rotation_euler", frame=239)

print("RENDER_START frames", scn.frame_start, "-", scn.frame_end)
bpy.ops.render.render(animation=True)
print("RENDER_DONE ->", os.path.dirname(OUT))
