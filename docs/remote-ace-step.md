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
