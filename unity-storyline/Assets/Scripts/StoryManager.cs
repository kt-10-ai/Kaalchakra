using UnityEngine;
using UnityEngine.UI;

/// Shows narration text beats as the player walks the storyline path.
/// Attach to a Canvas root with a child Text named "NarrationText".
public class StoryManager : MonoBehaviour
{
    public static StoryManager Instance { get; private set; }

    public Text narrationText;
    public Text eraLabel;
    public float fadeSpeed = 2f;

    CanvasGroup group;
    float targetAlpha = 0f;
    int lastBeat = -1;

    void Awake()
    {
        Instance = this;
        group = narrationText.transform.parent.GetComponent<CanvasGroup>();
        if (group == null)
            group = narrationText.transform.parent.gameObject.AddComponent<CanvasGroup>();
        group.alpha = 0f;
    }

    void Update()
    {
        group.alpha = Mathf.MoveTowards(group.alpha, targetAlpha, fadeSpeed * Time.deltaTime);
    }

    public void ShowBeat(int index, string era, string text)
    {
        if (index == lastBeat) return;
        lastBeat = index;
        narrationText.text = text;
        if (eraLabel != null) eraLabel.text = era;
        targetAlpha = 1f;
        CancelInvoke(nameof(FadeOut));
        Invoke(nameof(FadeOut), 8f);
    }

    void FadeOut()
    {
        targetAlpha = 0f;
    }
}
