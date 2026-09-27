using UnityEngine;

/// Minimal WASD + mouse-look walker for the storyline demo.
[RequireComponent(typeof(CharacterController))]
public class FirstPersonWalker : MonoBehaviour
{
    public float moveSpeed = 6f;
    public float lookSpeed = 2f;
    public Transform cameraTransform;

    CharacterController controller;
    float pitch;

    void Awake()
    {
        controller = GetComponent<CharacterController>();
        Cursor.lockState = CursorLockMode.Locked;
    }

    void Update()
    {
        float yaw = Input.GetAxis("Mouse X") * lookSpeed;
        pitch -= Input.GetAxis("Mouse Y") * lookSpeed;
        pitch = Mathf.Clamp(pitch, -60f, 60f);

        transform.Rotate(0f, yaw, 0f);
        if (cameraTransform != null)
            cameraTransform.localEulerAngles = new Vector3(pitch, 0f, 0f);

        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        Vector3 move = transform.right * h + transform.forward * v;
        controller.SimpleMove(move * moveSpeed);

        if (Input.GetKeyDown(KeyCode.Escape))
            Cursor.lockState = Cursor.lockState == CursorLockMode.Locked
                ? CursorLockMode.None
                : CursorLockMode.Locked;
    }
}
