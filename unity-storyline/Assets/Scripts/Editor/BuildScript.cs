using UnityEditor;
using UnityEditor.Build.Reporting;

public static class BuildScript
{
    [MenuItem("Kaalchakra/Build WebGL")]
    public static void BuildWebGL()
    {
        SceneBuilder.Build();
        var options = new BuildPlayerOptions
        {
            scenes = new[] { "Assets/Scenes/Vijayanagara.unity" },
            locationPathName = "Builds/WebGL",
            target = BuildTarget.WebGL,
            options = BuildOptions.None,
        };
        var report = BuildPipeline.BuildPlayer(options);
        UnityEngine.Debug.Log($"WebGL build result: {report.summary.result}, size: {report.summary.totalSize} bytes");
    }

    [MenuItem("Kaalchakra/Build Mac Standalone")]
    public static void BuildMac()
    {
        SceneBuilder.Build();
        var options = new BuildPlayerOptions
        {
            scenes = new[] { "Assets/Scenes/Vijayanagara.unity" },
            locationPathName = "Builds/Mac/Kaalchakra.app",
            target = BuildTarget.StandaloneOSX,
            options = BuildOptions.None,
        };
        var report = BuildPipeline.BuildPlayer(options);
        UnityEngine.Debug.Log($"Mac build result: {report.summary.result}, size: {report.summary.totalSize} bytes");
    }
}
