# Use a remote ACE-Step API

Remiqora can keep its UI, backend, track database, and generated audio on your
computer while forwarding ACE-Step API requests to a remote ACE-Step server.
This is an opt-in setting; leaving it unset preserves the normal local setup.

1. Copy `backend/.env.example` to `backend/.env` if you do not already have one.
2. Add the remote API base URL (no `/health` suffix and no trailing slash):

   ```ini
   ACE_STEP_API_URL=https://your-pod-8000.proxy.runpod.net
   ```

   If the server requires a Bearer token, also set `ACE_STEP_API_TOKEN`.
3. Start Remiqora on Windows with `dev.bat` and open `http://localhost:5173`.
   The browser continues to call the local Remiqora backend; that backend checks
   the remote `/health` endpoint when ACE-Step is selected and forwards its
   `/api/ace/...` requests to the configured API.

No Vite proxy change or SSH tunnel is needed when the remote API URL is
reachable over HTTPS. Leave `ACE_STEP_API_URL` unset to launch a local
ACE-Step process as usual.

This mode covers ACE-Step generation requests. Features that require files on
the ACE-Step host (for example, LoRA training or local model downloads) still
need their own local setup and are not transferred to the remote pod by this
proxy.

## RunPod setup

You can run ACE-Step on a long-running RunPod.io GPU Pod using the existing
container image such as:

```text
valyriantech/ace-step-1.5:latest
```

1. Create a Pod from the ACE-Step template or set the container image to the
   image above.
2. Select an NVIDIA GPU with enough VRAM for the selected ACE-Step model.
3. Expose the API port as `8000/http`.
4. Optionally expose `22/tcp` for direct SSH access. The browser-based RunPod
   Web Terminal does not require port 22.
5. Attach a network volume when model files and downloaded assets should
   survive Pod restarts. Mount it at `/workspace` and deploy the Pod in the
   volume's data center.
6. Use the template's existing start command when one is supplied. Do not add
   a second ACE-Step process if the image already starts the API.
7. Wait until the Pod logs show that the API is listening, then verify it:

   ```bash
   curl http://127.0.0.1:8000/health
   ```

The RunPod proxy URL is:

```text
https://POD_ID-8000.proxy.runpod.net
```

Check it from your computer:

```bash
curl https://POD_ID-8000.proxy.runpod.net/health
```

Then configure the local Remiqora backend:

```ini
ACE_STEP_API_URL=https://POD_ID-8000.proxy.runpod.net
ACE_STEP_API_TOKEN=
```

Leave `ACE_STEP_API_TOKEN` empty unless the remote API has an authentication
layer that validates Bearer tokens. RunPod's HTTP proxy URL is public by
default; the `valyriantech/ace-step-1.5:latest` API should be protected by an
authenticated reverse proxy before being exposed permanently.

Keep large generated outputs, model caches, or custom checkpoints on the
network volume. Data written only to the container disk does not survive a Pod
restart.

If `health` works through RunPod but Remiqora returns an upstream error, confirm
that the API was started with host `0.0.0.0`, that port `8000/http` is exposed,
and that the Pod is not still loading its model.
