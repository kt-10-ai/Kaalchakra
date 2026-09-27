# Narrator-King — Character Production Plan (v5)

Purpose: produce a consistent AI-generated character (the Narrator-King) used across the Kaalchakra SIH pitch/demo video set. This doc lists every image and video asset needed, the order to generate them in, and how they stitch together into the final videos.

**v5 changelog — root cause: identity drift.** Prompt #2's result had a different face/beard than the locked #1 (thin mustache, no full beard, no grey) and the loose chest chain reappeared despite being excluded in v4. Diagnosis: a pure text-to-image prompt samples a *new* person each generation who merely satisfies the text — vague adjectives like "trimmed dark beard" leave huge room to wander, and "do not add X" negatives are less reliable than positively stating what IS there. Two-part fix: (1) if the generation tool supports image-reference/character-lock/seed-lock, use image #1 as a conditioning reference for every subsequent generation — this is the real fix for identity drift, no amount of text alone solves it; (2) in the meantime, the descriptive block below now pins down measurable specifics (beard shape/coverage/color ratio) instead of vague adjectives, and the chain exclusion is now a positive statement about what's on the neck/chest, not just a "don't."

**v6 changelog — tool-specific workflow confirmed.** Images are generated in **Nano Banana Pro**, video in **Veo 3**. Both support reference conditioning, so text-only generation should be treated as a fallback, not the primary method:
- **Images (Nano Banana Pro):** attach the locked `01-front-full-body` image as a reference input alongside the text prompt for every one of #2–13. This locks face/beard/build identity directly instead of relying on prose to redescribe it each time. Keep the pose/framing/gaze instructions in text as before — only identity (face, beard, build) should come from the reference image.
- **Video (Veo 3):** use image-to-video mode. Feed the corresponding locked Stage B still (e.g. #7 for V1, #9 for V2) as the starting frame, and use the text prompt only for the motion/camera instructions in Section 3 — not to redescribe the character. This is what Section 3 already assumes ("anchor image"); it now specifically means "use it as the Veo 3 starting frame," not just a visual reference to imitate in text.

**v3 changelog:** fixed systemic prompt weaknesses found across all 13 images — slash-notation ambiguity (turban rendered as a rigid tiara), garment described by label instead of construction (dhoti rendered as a saree), framing instruction too weak (cropped at mid-thigh instead of full body), "hyper-detail" was abstract buzzwords instead of renderable detail, and no negative constraints anywhere. See Section 0 for the full audit.

**v4 changelog:** image #1 locked (turban, dhoti, full-body framing, gaze all correct). Two residual issues fixed: (1) output was letterboxed with black bars instead of filling the frame — added an explicit no-letterboxing constraint; (2) an unrequested loose gold chain/thread appeared on the bare chest — excluded it explicitly so it doesn't become an inconsistent detail across the other 12 images. Skin-texture instruction moved into negative constraints too, since it's still being under-weighted.

---

## 0. Mistake log (read before generating)

### v1 → v2
1. Gaze was never locked to the lens ("facing camera" only sets body orientation, not eye direction) → fixed with an explicit gaze clause.
2. No camera height/lens specified → Veo defaulted to a low-angle hero shot → fixed with eye-level + 50mm lens.
3. No "static camera" instruction → drift/parallax in clips → fixed with locked-off tripod instruction.
4. Gestures looped instead of playing once → fixed with explicit single-motion-then-hold instruction.
5. Detail language too generic → fixed with micro-detail call-outs.

### v2 → v3 (first-principles audit after seeing image #1)
1. **Slash-notation ambiguity.** "Crown/turban" and "dhoti/veshti" told the model to pick either, and it defaulted to whichever pattern is most common in training data — a rigid gold tiara, not a wrapped fabric turban. **Fix:** name exactly one object, never an either/or.
2. **Garment described by label, not construction.** "Royal Indian silk drape" pattern-matches to sari imagery; "crown" pattern-matches to a tiara/circlet. **Fix:** describe *how the cloth/metal physically sits on the body* — wrapping, folding, pinning — not just what it's called.
3. **Framing instruction too weak.** Stated once, mid-paragraph, "full body head to feet" lost against the model's default bias toward face/medium shots. Result: cropped at mid-thigh, no feet visible. **Fix:** framing stated as a short directive up front, reinforced with a second concrete cue, plus a portrait aspect ratio that physically forces room for a full figure.
4. **"Hyper-detailed / 8k UHD" are style tags, not instructions.** The model doesn't know what detail to add from an adjective. **Fix:** name the actual physical detail (skin pores on the cheeks, fine creases at the eye corners, single flyaway eyebrow hairs).
5. **No negative constraints.** Never told the model what to avoid, even for failure modes already seen. **Fix:** add explicit "do not" lines for the known failure modes (no tiara, no saree-style chest drape, no cropped feet).
6. **No priority ordering.** Long descriptive prose weights every clause roughly equally; a model can under-weight something stated only once near the end. **Fix:** hard constraints go first, as short directives, before the flowing descriptive prose.

---

## 1. Character Prompt Block (reuse everywhere)

**Hard constraints — state first, exactly like this, every time:**

> Full-length portrait, entire body from the top of the head to the soles of the feet fully inside the frame — do not crop above the ankles, feet and sandals must be visible at the bottom edge of frame. The image fills the entire frame edge to edge — no letterboxing, no black bars, no padding of any kind. Portrait orientation, tall vertical framing (2:3 aspect ratio). Camera at the character's own eye level, not low-angle, not high-angle. Locked-off static shot, 50mm lens equivalent, minimal distortion.
> He is wearing a soft maroon silk turban made of wound cloth folds, with visible fabric creases and a single gold-and-emerald ornament pinned at the center front — this is a fabric turban, NOT a rigid metal crown, tiara, or circlet; no hard metal band should be visible anywhere on the head.
> His lower body is wrapped in a men's ivory silk dhoti — cloth wound around the waist and both legs like loose trousers, reaching the ankles, with a pleated front fold — this is a man's dhoti, NOT a woman's saree; there is no pallu drape hanging loose over the chest or shoulder from the lower garment.
> Separately, a maroon-and-gold silk angavastram shawl is draped diagonally across his bare chest and over one shoulder — this is the only cloth crossing his torso. Aside from his necklaces, no other chain, thread, or cord hangs loose on the bare chest.

**Descriptive block — after the hard constraints:**

> A South Indian Deccan ruler, age 48. Face shape: square jaw, broad forehead, medium-set brown eyes, thick straight eyebrows. Beard: a full, dense beard covering the entire jawline, chin, and both cheeks up to the cheekbones, connected seamlessly to a full mustache — not a mustache-only or patchy look, uniform medium-short length (about 2cm), color roughly 70% black and 30% grey, with the grey concentrated at the sideburns and chin rather than evenly scattered. Build: medium-tall, broad-shouldered, warrior's upright posture. Skin: warm bronze tone with clearly visible individual pores on the cheeks and nose, fine creases at the outer corners of the eyes, a faint sheen on the forehead and collarbones. On the bare chest and neck, the ONLY things present are the layered gold necklaces described below — the skin between and around them is bare and unbroken, with no thread, string, chain, or cord of any kind crossing it. Layered gold necklaces (three graduated strands), gem-studded gold armlets on both upper arms, simple leather sandals. The turban fabric shows individual visible wrinkles and fold lines; the dhoti and angavastram show a visible woven silk thread structure with fine gold-thread embroidery along the borders; the gold jewelry shows individually engraved micro-patterns and sharp specular point-reflections on each facet. Photorealistic, cinematic lighting, muted maroon-ivory-gold palette, shot on a simplified shallow-depth-of-field temple-pillar background (softly blurred, not competing for detail with the character), no motion blur.

**Negative constraints — include every time:**

> Do not render: a metal crown, tiara, or circlet; a woman's saree or any pallu drape over the chest; a cropped frame that excludes the feet; letterboxing or black bars around the image; smooth/plastic-looking skin with no visible pore texture — skin must show real pore-level texture, not an airbrushed look; any loose chain, thread, or cord on the bare chest besides the necklaces; a watermark or logo anywhere in frame.

**Gaze clause — include in every prompt below except #12:**

> His eyes are looking directly into the camera lens the entire time, as if speaking one-on-one to the person watching — never glancing up, down, or to the side.

Do not vary turban construction, dhoti construction, beard, palette, camera height, or gaze direction between assets — that consistency is what keeps the character locked across all 13 images.

---

## 2. Generation Order (do not skip ahead)

### Stage A — Lock the design (images only)

| # | Asset | Type | Depends on |
|---|-------|------|-----------|
| 1 | Front, full body | Image | Prompt block |
| 2 | 3/4 front, full body | Image | #1 approved |
| 3 | Full profile | Image | #1 approved |
| 4 | 3/4 back | Image | #1 approved |
| 5 | Straight back | Image | #1 approved |

**Gate:** Only proceed to Stage B once all 5 are visually consistent — same face, same turban (fabric, not metal), same dhoti (not saree), full body with feet visible, same eye-level camera.

#### Image prompts

**1. Front, full body**
`[Hard constraints]. [Negative constraints]. [Gaze clause]. [Descriptive block]. Standing straight, feet shoulder-width apart, arms relaxed at sides, symmetrical neutral standing pose. Fine detail on sandal straps and toenails, dhoti fabric folds catching soft rim light, individual gold beads on each necklace strand distinguishable.`

**2. 3/4 front, full body**
`[Hard constraints]. [Negative constraints]. [Gaze clause]. [Descriptive block]. Body turned 45 degrees from camera, face turned back toward the lens maintaining direct eye contact, weight on back leg, arms relaxed. Visible fabric drape wrinkles, individual embroidery threads along the angavastram border, sharp micro-reflections on the armlet engravings.`

**3. Full profile (side view)**
`[Hard constraints]. [Negative constraints]. [Gaze clause — for this shot only, eyes turn as far toward the lens as the profile angle physically allows, eyebrow and eye corner turned toward camera]. [Descriptive block]. Body turned 90 degrees to camera, facing right, arms relaxed, chin level. Fine detail on ear jewelry, beard texture in profile, turban side-fold detail and the front ornament's side profile.`

**4. 3/4 back**
`[Hard constraints]. [Negative constraints]. [Descriptive block]. Back turned 135 degrees from camera, showing back of shoulder and side of face only, weight even, angavastram drape visible from behind with fine fabric-fold detail and gold border embroidery, turban's back wrap-folds visible (no ornament visible from this angle, it's front-only).`

**5. Straight back**
`[Hard constraints]. [Negative constraints]. [Descriptive block]. Back fully to camera, turban and shoulder silhouette visible, arms relaxed at sides, fine detail on the back-drape knot, woven fabric texture across the shoulders, dhoti's back pleats visible reaching the ankles.`

### Stage B — Expression & pose library (images only)

| # | Asset | Type | Depends on |
|---|-------|------|-----------|
| 6 | Neutral / calm close-up | Image | Stage A |
| 7 | Speaking mid-word close-up | Image | Stage A |
| 8 | Slight smile close-up | Image | Stage A |
| 9 | Serious / grave close-up | Image | Stage A |
| 10 | Seated, hand on sword hilt | Image | Stage A |
| 11 | Standing, arm gesturing outward | Image | Stage A |
| 12 | Holding/unrolling scroll | Image | Stage A |
| 13 | 3/4, hand raised mid-gesture | Image | Stage A |

**Gate:** These 13 images become the fixed reference set fed into every video-gen step below. Close-ups (6–9) don't need the full-body framing constraint — replace it with a close-up framing constraint (below) but keep everything else identical.

**Close-up framing override (use instead of the full-body hard constraint, for #6–9 only):**

> Close-up portrait, head and shoulders only, filling most of the frame. Camera at the character's own eye level, locked-off static shot, 50mm lens equivalent.

#### Image prompts

**6. Neutral / calm**
`[Close-up framing override]. [Negative constraints]. [Gaze clause]. [Descriptive block]. Calm neutral expression, mouth closed, soft directional key light from upper left revealing skin pore texture and fine beard strands, sharp catchlight visible in both eyes, shallow depth of field on the blurred temple-pillar background.`

**7. Speaking (mid-word)**
`[Close-up framing override]. [Negative constraints]. [Gaze clause]. [Descriptive block]. Mouth slightly open mid-speech, eyebrows lightly raised in engagement, eyes still locked on the lens, soft key light showing fine skin texture and individual beard hairs, sharp eye catchlights, shallow depth of field.`

**8. Slight smile / warm authority**
`[Close-up framing override]. [Negative constraints]. [Gaze clause — even at this three-quarter head angle, the pupils turn to hold the camera lens directly]. [Descriptive block]. Three-quarter head angle, subtle warm confident smile, soft key light, fine skin and fabric detail, shallow depth of field.`

**9. Serious / grave**
`[Close-up framing override]. [Negative constraints]. [Gaze clause]. [Descriptive block]. Grave serious expression, brow slightly furrowed, jaw set, low dramatic side lighting with deeper shadows that still reveal skin pore-level detail and beard texture, sharp eye catchlight, shallow depth of field.`

**10. Seated, hand on sword hilt**
`[Hard constraints, but seated: entire seated body from head to feet inside frame, feet flat on the ground visible]. [Negative constraints]. [Gaze clause]. [Descriptive block]. Seated on a carved stone throne with fine visible stone-relief detail, upright posture, one hand resting on the hilt of a sheathed sword standing point-down beside the throne — detailed engraved hilt and scabbard visible — other hand resting on the throne arm, cinematic side lighting, shallow depth of field on background.`

**11. Standing, arm gesturing outward**
`[Hard constraints]. [Negative constraints]. [Gaze clause — head and eyes stay on the lens even as the arm gestures]. [Descriptive block]. Standing, one arm extended outward and slightly upward mid-gesture as if presenting something to the viewer, other arm relaxed at side, fine detail on hand and finger positioning, ring and armlet engraving visible, mid-shot from knees up (framing exception: this is the one full-body pose allowed to crop at the knee, since the gesture is the focal point).`

**12. Holding/unrolling scroll**
`[Close-up framing override, widened to mid-shot from the waist up]. [Negative constraints]. [Descriptive block]. Head tilted slightly downward toward the scroll, both hands holding an unrolled palm-leaf manuscript with visible fine script markings and frayed leaf-edge texture, eyes reading the scroll — intentionally the one reference where eyes are down, not on the lens, for the "reading" cutaway only. Soft top-down lighting.`

**13. Three-quarter, hand raised mid-gesture**
`[Close-up framing override, widened to mid-shot from the chest up]. [Negative constraints]. [Gaze clause]. [Descriptive block]. Three-quarter angle, one hand raised to chest height mid-gesture as if emphasizing a spoken point, mouth slightly open as if speaking, eyes locked on the lens throughout, fine detail on knuckles, rings, and armlet.`

---

## 3. Video Clips (built from Stage B stills)

**Universal video rules — apply to every clip below:**
- Gaze clause applies throughout the entire clip duration — he never breaks eye contact with the lens, no glancing away.
- **Locked-off camera, no drift** — tripod-static unless a push-in is explicitly called out.
- **Gestures happen once, then stop.** Any hand/arm movement completes a single natural motion and then returns to a calm resting position and holds still for the remainder of the clip. No looping, no repeated raising/lowering, no fidgeting.
- Same negative constraints as the images (no tiara, no saree drape, no watermark).
- Hyper-detail: skin pore texture, individual beard/hair strands, fine fabric weave and embroidery thread, engraved gold facet reflections — all visible and stable throughout the motion, not smoothed out by the video model.

| # | Clip | Anchor image | Motion (single, non-looping) | Length |
|---|------|--------------|-------------------------------|--------|
| V1 | Cold open / hook | #7 (speaking) | Mouth speaks the opening line; a single small head lean-in toward camera on the last word, then holds still. Eyes on lens throughout. | 15–20s |
| V2 | Problem statement | #9 (serious) | Slow single head tilt downward then back up once, grave delivery, then holds still and continues speaking with eyes locked on lens. | 20–25s |
| V3 | Concept intro | #11 (arm gesturing) | Arm raises once from resting position to the gesture position, holds for 2–3s, then lowers once back to rest — happens exactly once, not repeated. Eyes remain on lens throughout, even during the gesture. | 20–25s |
| V4 | Mechanics walkthrough | #6 (neutral) or absent — mostly screen capture | Narrator absent or static small PIP, no motion required. | 30–40s |
| V5 | The five regions | #13 (hand raised) | Hand raises once to the gesture position and holds still there (no repeated raising/lowering) while head makes one slow pan toward each of five named region-card overlays, eyes returning to lens between pans. | 25–30s |
| V6 | Consequence moment | #9 (serious) → #8 (smile) | One slow cross-dissolve from grave to thoughtful-warm expression, no hand movement at all, eyes locked on lens throughout. | 20–25s |
| V7 | Tech/porting pitch | none — screen capture | Narrator absent or small static PIP. | 20–30s |
| V8 | Closing CTA | #10 (seated, hand on hilt) | Single slow camera push-in (this is the one clip where the camera itself moves, deliberately, for a closing feel) with one calm nod, eyes on lens throughout, hand stays resting on the hilt without adjusting. | 15–20s |

---

## 4. Final Stitch Order (edit timeline)

```
V1 Cold open
  → V2 Problem statement
    → V3 Concept intro
      → V4 Mechanics walkthrough (screen capture, narrator VO)
        → V5 Five regions intro
          → V6 Consequence moment (the core hook — place near the end, it's the payoff)
            → V7 Tech/porting pitch (screen capture, narrator VO)
              → V8 Closing CTA
```

Notes on stitching:
- Cut on the narrator's blinks/breath pauses between clips, not mid-gesture, so the character reads as continuous even though each clip is a separate generation.
- V4 and V7 are screen-capture-led; keep the narrator either absent or as a small static PIP using image #6, not a new video generation — cheaper and avoids extra drift risk.
- Use image #12 (scroll) as a recurring cutaway/B-roll insert between any two clips if you need a transition beat or need to cover a cut that doesn't match well. This is the only reference where his eyes are down instead of on the lens.
- Total on-camera character video generations needed: **6** (V1, V2, V3, V5, V6, V8). V4/V7 are screen-capture + optional static image PIP.
- V8 is the only clip with camera movement (push-in) — every other clip is locked-off static.

---

## 5. Asset Checklist Summary

- **13 reference images** (Stage A + B) — generate and lock first, all at eye-level camera with gaze locked to lens (except #12, the reading cutaway), turban and dhoti explicitly locked by construction, feet visible in all full-body shots except #11.
- **6 character video clips** (V1, V2, V3, V5, V6, V8) — single non-looping gestures, eyes on lens throughout, locked-off camera except V8's push-in.
- **2 screen-capture segments** (V4, V7) — no new character generation, narrator optional as static PIP.
- **1 optional B-roll cutaway** (scroll image #12) for transition coverage.
