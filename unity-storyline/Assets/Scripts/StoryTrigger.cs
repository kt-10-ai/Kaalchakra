using UnityEngine;

/// Placed as an invisible trigger volume along the walk path.
/// Fires its narration beat once when the player enters.
public class StoryTrigger : MonoBehaviour
{
    public int beatIndex;
    [TextArea] public string era;
    [TextArea] public string text;

    void OnTriggerEnter(Collider other)
    {
        if (!other.CompareTag("Player")) return;
        StoryManager.Instance?.ShowBeat(beatIndex, era, text);
    }
}
