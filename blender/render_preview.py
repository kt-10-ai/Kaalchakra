import bpy, math

bpy.ops.wm.open_mainfile(filepath="dummy") if False else None
bpy.ops.import_scene.gltf(filepath="output/vijayanagara.glb")

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1000
scene.render.resolution_y = 500
scene.render.filepath = "output/preview.png"

bpy.ops.object.camera_add(location=(70, -70, 45), rotation=(math.radians(58), 0, math.radians(20)))
scene.camera = bpy.context.active_object

bpy.ops.object.light_add(type='SUN', location=(60, -40, 60))
bpy.context.active_object.data.energy = 3.5

bpy.ops.render.render(write_still=True)
print("RENDERED")
