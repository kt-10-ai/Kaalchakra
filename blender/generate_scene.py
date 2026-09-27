"""
Generates the Vijayanagara founding storyline set, procedurally, headlessly.
Run with: blender --background --python generate_scene.py

Three zones along the +X axis, meant to be walked west-to-east:
  Zone 1 (x ~   0- 40): The Ruins    — Warangal/Dwarasamudra after Delhi's 1300s campaigns
  Zone 2 (x ~  50- 90): The Founding — Harihara & Bukka at the Tungabhadra, 1336
  Zone 3 (x ~ 100-150): The Rising City — Vijayanagara/Hampi consolidated, ~1350
"""

import bpy
import math
import random

random.seed(42)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block_collection in (bpy.data.meshes, bpy.data.materials, bpy.data.lights):
        for block in list(block_collection):
            block_collection.remove(block)


def make_material(name, rgba, roughness=0.8, metallic=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = roughness
    if "Metallic" in bsdf.inputs:
        bsdf.inputs["Metallic"].default_value = metallic
    return mat


def add_box(name, loc, scale, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    obj.rotation_euler = rot
    obj.data.materials.append(mat)
    return obj


def add_cylinder(name, loc, radius, depth, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = rot
    obj.data.materials.append(mat)
    return obj


def add_cone(name, loc, radius, depth, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(radius1=radius, depth=depth, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = rot
    obj.data.materials.append(mat)
    return obj


def add_sphere(name, loc, radius, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    return obj


def add_ground(name, loc, size, mat):
    bpy.ops.mesh.primitive_plane_add(size=size, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    return obj


def make_figure(name, loc, mat_cloth, mat_skin):
    """Very simplified low-poly humanoid: cylinder body + sphere head."""
    body = add_cylinder(f"{name}_body", (loc[0], loc[1], loc[2] + 0.9), 0.28, 1.8, mat_cloth)
    head = add_sphere(f"{name}_head", (loc[0], loc[1], loc[2] + 2.0), 0.26, mat_skin)
    return body, head


def gopuram(name, loc, mat_stone, mat_gold, base_size=4.0, tiers=5):
    """A stepped, tapering temple tower — stylized South Indian gopuram."""
    objs = []
    for i in range(tiers):
        t = i / tiers
        size = base_size * (1 - 0.15 * i)
        z = loc[2] + i * 1.6
        mat = mat_gold if i == tiers - 1 else mat_stone
        objs.append(
            add_box(f"{name}_tier{i}", (loc[0], loc[1], z), (size, size, 0.8), mat)
        )
    return objs


def join_meshes_by_material():
    """Batch all mesh objects sharing a single material into one object each.
    Cuts draw-call count drastically (this scene has ~150+ individual
    primitives) without changing the visuals — important for real-time
    rendering in a browser/mobile GPU."""
    by_material = {}
    for obj in bpy.data.objects:
        if obj.type != "MESH" or not obj.data.materials:
            continue
        mat_name = obj.data.materials[0].name if obj.data.materials[0] else "none"
        by_material.setdefault(mat_name, []).append(obj)

    for mat_name, objs in by_material.items():
        if len(objs) < 2:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        for obj in objs:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        bpy.context.active_object.name = f"Merged_{mat_name}"


def main():
    clear_scene()

    mat_stone = make_material("Stone", (0.55, 0.52, 0.47, 1), roughness=0.9)
    mat_stone_dark = make_material("StoneDark", (0.32, 0.30, 0.27, 1), roughness=0.9)
    mat_grass = make_material("Grass", (0.22, 0.33, 0.16, 1), roughness=1.0)
    mat_dust = make_material("Dust", (0.45, 0.38, 0.28, 1), roughness=1.0)
    mat_water = make_material("Water", (0.09, 0.28, 0.42, 1), roughness=0.15, metallic=0.2)
    mat_gold = make_material("Gold", (0.72, 0.53, 0.12, 1), roughness=0.35, metallic=0.6)
    mat_cloth_royal = make_material("ClothRoyal", (0.65, 0.1, 0.12, 1), roughness=0.8)
    mat_cloth_sage = make_material("ClothSage", (0.9, 0.85, 0.75, 1), roughness=0.9)
    mat_skin = make_material("Skin", (0.55, 0.38, 0.25, 1), roughness=0.7)
    mat_cloth_queen = make_material("ClothQueen", (0.1, 0.35, 0.4, 1), roughness=0.8)
    mat_cloth_officer = make_material("ClothOfficer", (0.18, 0.24, 0.42, 1), roughness=0.7, metallic=0.1)
    mat_banner_dark = make_material("BannerDark", (0.25, 0.22, 0.2, 1), roughness=0.9)

    # ---- Ground strip spanning all zones ----
    add_ground("Ground_Ruins", (20, 0, 0), 44, mat_dust)
    add_ground("Ground_Founding", (70, 0, 0), 44, mat_grass)
    add_ground("Ground_City", (140, 0, 0), 80, mat_grass)

    # ============ ZONE 1: THE RUINS (Warangal / Dwarasamudra, sacked) ============
    toppled_positions = [
        (5, -6, 0), (10, 4, 0), (16, -3, 0), (22, 7, 0), (28, -8, 0), (34, 2, 0),
    ]
    for i, (x, y, z) in enumerate(toppled_positions):
        rot = (random.uniform(1.1, 1.5), 0, random.uniform(0, math.pi))
        add_cylinder(f"Ruin_Pillar_{i}", (x, y, z + 0.4), 0.5, 4.0, mat_stone_dark, rot=rot)

    # Rudramadevi — the Kakatiya queen who held this kingdom together before it fell
    make_figure("Rudramadevi", (5, 3, 0), mat_cloth_queen, mat_skin)
    add_cylinder("Rudramadevi_Plinth", (5, 3, -0.15), 0.9, 0.3, mat_stone)

    # A cracked, partial gopuram base — broken mid-height
    for i in range(3):
        size = 3.5 * (1 - 0.15 * i)
        add_box(f"Ruin_Base_{i}", (12, -1, 0.4 + i * 1.6), (size, size, 0.8), mat_stone_dark)

    # A toppled throne — Prataparudra captured when Warangal fell
    add_box("Toppled_Throne_Seat", (20, 4, 0.5), (1.0, 1.0, 1.0), mat_stone_dark, rot=(0, 1.4, 0.3))
    add_box("Toppled_Throne_Back", (20.6, 3.6, 0.9), (1.0, 0.15, 1.3), mat_stone_dark, rot=(0, 1.4, 0.3))

    # The Hoysala end — Veera Ballala III's fallen banner at Madurai, 1343
    add_cylinder("Fallen_Banner_Pole", (32, -4, 0.3), 0.12, 5.5, mat_banner_dark, rot=(1.45, 0, 0.6))
    add_cylinder("Fallen_Banner_Shield", (32, -1, 0.4), 0.9, 0.15, mat_banner_dark, rot=(1.5, 0, 0))

    # rubble scatter
    for i in range(14):
        x = random.uniform(0, 38)
        y = random.uniform(-10, 10)
        s = random.uniform(0.3, 0.9)
        add_box(
            f"Rubble_{i}", (x, y, s / 2), (s, s, s), mat_stone_dark,
            rot=(random.uniform(0, 1), random.uniform(0, 1), random.uniform(0, 3)),
        )

    # ============ ZONE 2: THE FOUNDING (Tungabhadra riverbank, 1336) ============
    add_ground("River_Tungabhadra", (70, -18, 0.02), 1, mat_water)
    bpy.data.objects["River_Tungabhadra"].scale = (46, 10, 1)

    # boulders characteristic of the Hampi landscape
    for i in range(10):
        x = 50 + random.uniform(0, 40)
        y = random.uniform(-8, 12)
        r = random.uniform(0.8, 2.2)
        add_sphere(f"Boulder_{i}", (x, y, r * 0.6), r, mat_stone)

    # The brothers as they were first — Sultanate-appointed officers of the Deccan
    make_figure("Harihara_Officer", (48, 3, 0), mat_cloth_officer, mat_skin)
    make_figure("Bukka_Officer", (50, 3, 0), mat_cloth_officer, mat_skin)

    # Vidyaranya's counsel — the turn back toward Hindu rule
    make_figure("Sage_Vidyaranya_Counsel", (61, -3, 0), mat_cloth_sage, mat_skin)
    add_cone("Counsel_Fire", (61, 0, 0.3), 0.4, 0.7, mat_gold)

    # The founding itself
    make_figure("Harihara", (68, 2, 0), mat_cloth_royal, mat_skin)
    make_figure("Bukka", (71, 2, 0), mat_cloth_royal, mat_skin)
    make_figure("Sage_Vidyaranya", (69.5, 5, 0), mat_cloth_sage, mat_skin)
    # a small founding-stone / consecration marker between the figures
    add_cone("Foundation_Marker", (69.5, -0.5, 0.5), 0.6, 1.0, mat_gold)

    # A sanctuary for the Deccan — scholars and refugees resettling
    for i, (dx, dy) in enumerate([(-2, 6), (1, 8), (3, 5), (-3, 3)]):
        make_figure(f"Refugee_{i}", (88 + dx, dy, 0), mat_cloth_sage if i % 2 else mat_cloth_officer, mat_skin)

    # ============ ZONE 3: THE RISING CITY (Vijayanagara consolidated, ~1350) ============

    # Consolidating the Deccan — a chieftain submits at the city's gate
    make_figure("Chieftain", (108, -3, 0), mat_cloth_officer, mat_skin)
    bpy.data.objects["Chieftain_body"].scale = (1, 1, 0.6)  # kneeling, lowered
    bpy.data.objects["Chieftain_head"].location.z -= 0.7

    gopuram("City_Gopuram", (125, 0, 0.5), mat_stone, mat_gold, base_size=5.0, tiers=6)

    # fortification wall ring (simplified as a rectangle of wall segments)
    wall_positions = []
    for x in range(105, 146, 8):
        wall_positions.append((x, 20, 1.2))
        wall_positions.append((x, -20, 1.2))
    for y in range(-16, 17, 8):
        wall_positions.append((104, y, 1.2))
        wall_positions.append((146, y, 1.2))
    for i, (x, y, z) in enumerate(wall_positions):
        add_box(f"Wall_{i}", (x, y, z), (4.2, 0.6, 2.4), mat_stone)

    # secondary shrines flanking the main gopuram
    for i, (dx, dy) in enumerate([(-12, 10), (12, 10), (-12, -10), (12, -10)]):
        gopuram(f"Shrine_{i}", (125 + dx, dy, 0.4), mat_stone, mat_gold, base_size=2.2, tiers=3)

    # a unified coalition of figures out front — the empire's founding court
    for i in range(6):
        x = 118 + i * 1.6
        make_figure(f"Citizen_{i}", (x, -6, 0), mat_cloth_royal if i % 2 == 0 else mat_cloth_sage, mat_skin)

    # A new kind of state — a pillared audience hall (nayaka administration,
    # the Persian-influenced/Hindu-temple architectural synthesis Vijayanagara
    # became known for — the same style later seen in the Lotus Mahal).
    add_box("Nayaka_Hall_Roof", (145, 0, 3.2), (7, 4, 0.3), mat_stone)
    for i, (dx, dy) in enumerate([(-6, -3), (-6, 3), (-2, -3), (-2, 3), (2, -3), (2, 3), (6, -3), (6, 3)]):
        add_cylinder(f"Nayaka_Hall_Pillar_{i}", (145 + dx, dy, 1.5), 0.3, 3.0, mat_stone)

    # Epilogue plaza — a quiet vantage point looking back over the empire
    add_cylinder("Epilogue_Platform", (165, 0, 0.15), 6, 0.3, mat_stone)
    add_cone("Epilogue_Marker", (165, 0, 1.5), 0.5, 2.2, mat_banner_dark)

    # ---- Lighting ----
    bpy.ops.object.light_add(type="SUN", location=(60, -40, 60))
    sun = bpy.context.active_object
    sun.data.energy = 3.5
    sun.rotation_euler = (math.radians(55), 0, math.radians(35))

    # ---- Path-marker empties for the walkthrough camera (used by Unity import) ----
    path_points = [(-8, 0, 1.7), (5, 0, 1.7), (20, 0, 1.7), (32, 0, 1.7),
                   (48, 0, 1.7), (61, 0, 1.7), (68, 0, 1.7), (88, 0, 1.7),
                   (108, 0, 1.7), (125, 0, 1.7), (145, 0, 1.7), (165, 0, 1.7)]
    for i, p in enumerate(path_points):
        bpy.ops.object.empty_add(type="PLAIN_AXES", location=p)
        bpy.context.active_object.name = f"PathPoint_{i:02d}"

    bpy.context.scene.frame_end = 1

    join_meshes_by_material()

    # ---- Export ----
    export_path = bpy.path.abspath("//output/vijayanagara.glb")
    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
    )
    print(f"EXPORTED: {export_path}")

    fbx_path = bpy.path.abspath("//output/vijayanagara.fbx")
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.fbx(
        filepath=fbx_path,
        use_selection=True,
        apply_unit_scale=True,
        bake_space_transform=True,
        object_types={"MESH", "EMPTY"},
        mesh_smooth_type="FACE",
    )
    print(f"EXPORTED: {fbx_path}")


main()
