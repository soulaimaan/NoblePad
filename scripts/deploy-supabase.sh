#!/usr/bin/env bash
# ------------------------------------------------------------
# NoblePad – Supabase Deployment Script (v2‑compatible)
#
# Usage (local dev):
#   ./deploy.sh                # will prompt for project ID if not set
#
# Usage (CI / non‑interactive):
#   export SUPABASE_PROJECT_ID=your-project-ref
#   export SUPABASE_ACCESS_TOKEN=your-pat   # optional – used instead of login UI
#   ./deploy.sh
#
# You can also pass the project ID as the first argument:
#   ./deploy.sh your-project-ref
#
# ------------------------------------------------------------

# Exit on error, treat unset variables as errors, fail on pipe errors
set -euo pipefail

# ------------------------------------------------------------
# Helper functions (pretty output)
# ------------------------------------------------------------
log()   { printf "\n🚀 %s\n" "$*"; }
info()  { printf "ℹ️  %s\n" "$*"; }
warn()  { printf "⚠️  %s\n" "$*"; }
error() { printf "❌ %s\n" "$*" >&2; }
die()   { error "$*"; exit 1; }

# Detect if we are attached to an interactive terminal
is_tty() { [[ -t 0 && -t 1 ]]; }

# ------------------------------------------------------------
# 1️⃣ Find / install the Supabase CLI
# ------------------------------------------------------------
SUPABASE_CLI="supabase"

if ! command -v "$SUPABASE_CLI" >/dev/null 2>&1; then
    log "Supabase CLI not found – attempting global install"
    if npm install -g supabase@latest; then
        log "Supabase CLI installed globally"
    else
        warn "Global install failed (likely permission issue). Falling back to npx."
        SUPABASE_CLI="npx supabase"
    fi
fi

# Verify the CLI works and grab its version (optional, but nice to see)
if "$SUPABASE_CLI" --version >/dev/null 2>&1; then
    CLI_VER=$("$SUPABASE_CLI" --version | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+')
    log "Using Supabase CLI v$CLI_VER"
else
    die "Unable to execute Supabase CLI"
fi

# ------------------------------------------------------------
# 2️⃣ Authentication – make sure we are logged in
# ------------------------------------------------------------
# The CLI stores credentials in ~/.supabase/config.json.
# If there is no access token we either use a PAT (env var) or ask the user to log in.
if ! "$SUPABASE_CLI" status --json 2>/dev/null | grep -q '"access_token"'; then
    if [[ -n "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
        log "Logging in via SUPABASE_ACCESS_TOKEN environment variable"
        "$SUPABASE_CLI" login --token "$SUPABASE_ACCESS_TOKEN"
    else
        if is_tty; then
            log "You are not logged in – opening interactive login flow"
            "$SUPABASE_CLI" login
        else
            die "Not logged in and SUPABASE_ACCESS_TOKEN not set (non‑interactive mode)."
        fi
    fi
fi

# ------------------------------------------------------------
# 3️⃣ Determine the project ID (ref)
# ------------------------------------------------------------
# Priority: command‑line arg > env var > interactive prompt
PROJECT_ID="${SUPABASE_PROJECT_ID:-}"
if [[ $# -ge 1 && -n "$1" ]]; then
    PROJECT_ID="$1"
fi

if [[ -z "$PROJECT_ID" ]]; then
    if is_tty; then
        read -rp "🔑 Enter your Supabase project ID (ref): " PROJECT_ID
    else
        die "SUPABASE_PROJECT_ID is not set and script is non‑interactive."
    fi
fi

[[ -z "$PROJECT_ID" ]] && die "Project ID cannot be empty"
log "Target project ref: $PROJECT_ID"

# ------------------------------------------------------------
# 4️⃣ Initialise / link the local repo (idempotent)
# ------------------------------------------------------------
if [[ ! -f "supabase/config.toml" ]]; then
    log "First‑time setup – running 'supabase init'"
    "$SUPABASE_CLI" init
fi

log "Linking local folder to remote project $PROJECT_ID"
"$SUPABASE_CLI" link --project-ref "$PROJECT_ID"

# ------------------------------------------------------------
# 5️⃣ Push database migrations
# ------------------------------------------------------------
log "Pushing database migrations"
"$SUPABASE_CLI" db push --project-ref "$PROJECT_ID"

# ------------------------------------------------------------
# 6️⃣ Deploy Edge Functions
# ------------------------------------------------------------
# Ensure we are in a directory that contains supabase/functions/
if [[ ! -d "supabase/functions" ]]; then
    warn "Directory supabase/functions not found – you may be running the script from the wrong location."
fi

# List your function directories (relative to supabase/functions/)
FUNCTIONS=(
    get-presales
    get-presale-details
    create-presale
    admin-actions
    commit-to-presale
    user-tier
)

log "Deploying Edge Functions"
for fn in "${FUNCTIONS[@]}"; do
    log "▶ Deploying $fn"
    "$SUPABASE_CLI" functions deploy "$fn" --project-ref "$PROJECT_ID"
done

# ------------------------------------------------------------
# 7️⃣ Reminder – set function secrets in the Supabase Dashboard
# ------------------------------------------------------------
log "🔧 Remember to add the following function secrets in the Supabase dashboard"
cat <<'EOF'
ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4,0x...
WALLETCONNECT_PROJECT_ID=your_project_id
EOF

# ------------------------------------------------------------
# 8️⃣ Create / configure the storage bucket (v2 CLI syntax)
# ------------------------------------------------------------
BUCKET="kyc-documents"
log "Creating storage bucket \"$BUCKET\" (no‑op if it already exists)"
# The create command returns a non‑zero exit code if the bucket already exists,
# so we swallow that error and continue.
if ! "$SUPABASE_CLI" storage bucket create "$BUCKET" --project-ref "$PROJECT_ID" 2>/dev/null; then
    log "Bucket probably already exists – continuing"
fi

log "Setting bucket \"$BUCKET\" to private"
"$SUPABASE_CLI" storage bucket update "$BUCKET" --public false --project-ref "$PROJECT_ID"

# ------------------------------------------------------------
# 9️⃣ Finish up
# ------------------------------------------------------------
log "✅ Supabase deployment completed successfully!"

cat <<EOS

Next steps:
  1️⃣ Add SUPABASE_URL and SUPABASE_ANON_KEY (or SERVICE_ROLE_KEY) to your .env.local
  2️⃣ Add the function secrets shown above in the Supabase dashboard
  3️⃣ Test locally: npm run dev
  4️⃣ Deploy your frontend (Vercel, Netlify, etc.) – e.g. npm run build && vercel --prod

🔗 Supabase dashboard: https://app.supabase.com/project/${PROJECT_ID}
EOS
