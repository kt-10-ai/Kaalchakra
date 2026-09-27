using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

/// Programmatically assembles the Vijayanagara storyline scene so the whole
/// pipeline can run headlessly: `Unity -batchmode -executeMethod SceneBuilder.Build`
public static class SceneBuilder
{
    // Kept in sync by hand with src/storyline/beats.ts (the browser version).
    static readonly (float x, string era, string text)[] Beats = new[]
    {
        (-8f, "1300 CE", "The armies of the Delhi Sultanate have marched deep into the Deccan, under Alauddin Khalji's general Malik Kafur."),
        (5f, "1262-1289 CE — Rudramadevi", "For a generation, Rani Rudramadevi ruled the Kakatiya kingdom in her own name — one of the few women to reign outright in this era. She died in battle in 1289, still defending it."),
        (20f, "1323 CE — The Ruins", "Warangal falls. Its last king, Prataparudra, is captured and taken north as a prisoner. The Kakatiya kingdom Rudramadevi held together does not survive him."),
        (32f, "1343 CE — The Hoysala End", "Far to the south, the Hoysala king Veera Ballala III is killed at Madurai. The second great power of the old Deccan order is gone within a generation of the first."),
        (48f, "Tradition — Two Officers", "One widely told tradition holds that Harihara and Bukka did not begin as rebels at all — they served as Sultanate-appointed officers sent to govern the fractured Deccan on Delhi's behalf."),
        (61f, "Tradition — The Turn", "That same tradition credits the sage Vidyaranya, head of the Sringeri monastery, with persuading the brothers to break from Delhi and restore Hindu rule to the region. Historians debate how much of this is later legend — but it is the story Vijayanagara told about its own founding."),
        (68f, "1336 CE — The Founding", "On the riverbank near Hampi, at the sacred site of Pampa-kshetra, Harihara and Bukka lay the foundation stone of a new capital: Vijayanagara, the City of Victory."),
        (88f, "A Sanctuary for the Deccan", "Scholars, artisans, and refugees from Sultanate territory resettle here. Vijayanagara offers something the shattered old kingdoms no longer can: a place still standing."),
        (108f, "1340s CE — Consolidation", "Chieftains who once served Warangal or Dwarasamudra submit to the new capital, one territory at a time. Vijayanagara grows less by conquest than by absorption."),
        (125f, "1350 CE — The Rising City", "Vijayanagara stands fortified: temples, walls, a unified court. Two brothers' answer to conquest has become an empire built to check Sultanate expansion."),
        (145f, "A New Kind of State", "Vijayanagara governs through the nayaka system — regional military governors bound to the crown — and builds in a style that fuses Hindu temple form with Persian-influenced halls, a synthesis rather than a rejection of what came before."),
        (165f, "Kaalchakra", "The wheel of time turns. Vijayanagara will stand for two more centuries before falling at Talikota in 1565 — a story for another walk. Every region tells a different story from these same decades. This is only one of them."),
    };

    [MenuItem("Kaalchakra/Build Storyline Scene")]
    public static void Build()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        BuildEnvironment();
        BuildPlayer(out var playerCamera);
        BuildUIAndTriggers();
        BuildLighting();

        System.IO.Directory.CreateDirectory("Assets/Scenes");
        EditorSceneManager.SaveScene(scene, "Assets/Scenes/Vijayanagara.unity");

        EditorBuildSettings.scenes = new[]
        {
            new EditorBuildSettingsScene("Assets/Scenes/Vijayanagara.unity", true)
        };

        Debug.Log("SceneBuilder: Vijayanagara.unity built and saved.");
    }

    static void BuildEnvironment()
    {
        var fbxPath = "Assets/Models/vijayanagara.fbx";
        var asset = AssetDatabase.LoadAssetAtPath<GameObject>(fbxPath);
        if (asset == null)
        {
            Debug.LogError($"SceneBuilder: could not load {fbxPath} — check it imported correctly.");
            return;
        }
        var instance = (GameObject)PrefabUtility.InstantiatePrefab(asset);
        instance.name = "VijayanagaraSet";
    }

    static void BuildPlayer(out Camera cam)
    {
        var player = new GameObject("Player");
        player.tag = "Player";
        player.transform.position = new Vector3(Beats[0].x, 1f, 0f);

        var cc = player.AddComponent<CharacterController>();
        cc.height = 1.8f;
        cc.radius = 0.35f;
        cc.center = new Vector3(0, 0.9f, 0);

        var camGO = new GameObject("PlayerCamera");
        camGO.transform.SetParent(player.transform);
        camGO.transform.localPosition = new Vector3(0, 1.6f, 0);
        cam = camGO.AddComponent<Camera>();
        camGO.AddComponent<AudioListener>();
        camGO.tag = "MainCamera";

        var walker = player.AddComponent<FirstPersonWalker>();
        walker.cameraTransform = camGO.transform;

        // Trigger volumes need a collider on the player too (non-trigger) for physics contact.
        var col = player.AddComponent<CapsuleCollider>();
        col.height = 1.8f;
        col.radius = 0.35f;
        col.center = new Vector3(0, 0.9f, 0);
        col.isTrigger = false;

        var rb = player.AddComponent<Rigidbody>();
        rb.isKinematic = true; // CharacterController drives movement; Rigidbody only enables trigger events.
        rb.useGravity = false;
    }

    static void BuildUIAndTriggers()
    {
        var canvasGO = new GameObject("StoryCanvas");
        var canvas = canvasGO.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        canvasGO.AddComponent<CanvasScaler>();
        canvasGO.AddComponent<GraphicRaycaster>();

        var panel = new GameObject("NarrationPanel", typeof(RectTransform));
        panel.transform.SetParent(canvasGO.transform, false);
        var panelRT = panel.GetComponent<RectTransform>();
        panelRT.anchorMin = new Vector2(0.1f, 0.05f);
        panelRT.anchorMax = new Vector2(0.9f, 0.28f);
        panelRT.offsetMin = Vector2.zero;
        panelRT.offsetMax = Vector2.zero;
        var panelImg = panel.AddComponent<Image>();
        panelImg.color = new Color(0f, 0f, 0f, 0.55f);
        var group = panel.AddComponent<CanvasGroup>();
        group.alpha = 0f;

        var eraGO = new GameObject("EraLabel", typeof(RectTransform));
        eraGO.transform.SetParent(panel.transform, false);
        var eraRT = eraGO.GetComponent<RectTransform>();
        eraRT.anchorMin = new Vector2(0.03f, 0.62f);
        eraRT.anchorMax = new Vector2(0.97f, 0.92f);
        eraRT.offsetMin = Vector2.zero;
        eraRT.offsetMax = Vector2.zero;
        var eraText = eraGO.AddComponent<Text>();
        eraText.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        eraText.fontSize = 22;
        eraText.fontStyle = FontStyle.Bold;
        eraText.color = new Color(0.93f, 0.75f, 0.35f);
        eraText.text = "";

        var textGO = new GameObject("NarrationText", typeof(RectTransform));
        textGO.transform.SetParent(panel.transform, false);
        var textRT = textGO.GetComponent<RectTransform>();
        textRT.anchorMin = new Vector2(0.03f, 0.05f);
        textRT.anchorMax = new Vector2(0.97f, 0.6f);
        textRT.offsetMin = Vector2.zero;
        textRT.offsetMax = Vector2.zero;
        var narrationText = textGO.AddComponent<Text>();
        narrationText.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        narrationText.fontSize = 18;
        narrationText.color = Color.white;
        narrationText.text = "";

        var storyManagerGO = new GameObject("StoryManager");
        var manager = storyManagerGO.AddComponent<StoryManager>();
        manager.narrationText = narrationText;
        manager.eraLabel = eraText;

        var crosshairGO = new GameObject("Crosshair", typeof(RectTransform));
        crosshairGO.transform.SetParent(canvasGO.transform, false);
        var chRT = crosshairGO.GetComponent<RectTransform>();
        chRT.anchorMin = chRT.anchorMax = new Vector2(0.5f, 0.5f);
        chRT.sizeDelta = new Vector2(4, 4);
        var chImg = crosshairGO.AddComponent<Image>();
        chImg.color = Color.white;

        for (int i = 0; i < Beats.Length; i++)
        {
            var (x, era, text) = Beats[i];
            var trig = new GameObject($"StoryTrigger_{i}");
            trig.transform.position = new Vector3(x, 1f, 0f);
            var box = trig.AddComponent<BoxCollider>();
            box.isTrigger = true;
            box.size = new Vector3(8f, 6f, 24f);
            var st = trig.AddComponent<StoryTrigger>();
            st.beatIndex = i;
            st.era = era;
            st.text = text;
        }
    }

    static void BuildLighting()
    {
        var lightGO = new GameObject("Sun");
        var light = lightGO.AddComponent<Light>();
        light.type = LightType.Directional;
        light.intensity = 1.2f;
        lightGO.transform.rotation = Quaternion.Euler(55f, 35f, 0f);
        RenderSettings.sun = light;
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
        RenderSettings.ambientSkyColor = new Color(0.55f, 0.6f, 0.7f);
        RenderSettings.ambientGroundColor = new Color(0.3f, 0.28f, 0.22f);
    }
}
