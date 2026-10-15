---
name: "Oracle Cloud Infrastructure API"
provider: "Oracle"
category: "developer-platform"
status: "active"
officialDocs: "https://docs.oracle.com/en-us/iaas/api/"
homepage: "https://www.oracle.com/cloud/"
baseUrl: "https://iaas.{region}.oraclecloud.com"
auth: "RSA key pair with API key fingerprint, signed requests"
versioning: "Service-specific API versions in endpoint paths"
resourceGroups: ["Compute", "Networking", "Block Storage", "Identity", "Database"]
pagination: "opc-next-page response header for list operations"
errors: "OCI error codes with opc-request-id for tracking"
webhooks: "Events service with Notifications integration"
sdks: ["Python", "Java", "Go", "TypeScript", "Ruby", ".NET"]
summary: "REST APIs for provisioning and managing Oracle Cloud Infrastructure resources including compute instances, networking, and storage."
pricing: "Pay-as-you-go plus Always Free tier (Ampere A1, AMD E2 Micro)"
rateLimit: "Service-specific throttling with 429 responses and retry-after"
formats: ["JSON"]
protocols: ["REST"]
bestFor: ["Cloud infrastructure automation", "Free tier ARM instances", "Enterprise Oracle workloads"]
cautions: ["Availability domain names include a prefix (e.g. ncBE:US-SANJOSE-1-AD-1) — using it raw in query parameters returns 401.", "Free tier A1 capacity is frequently exhausted; expect OutOfCapacity errors and retry.", "API signing requires precise header canonicalization."]
verifiedAt: "2026-10-15"
sourceUrls: ["https://docs.oracle.com/en-us/iaas/api/", "https://docs.oracle.com/en-us/iaas/Content/API/Concepts/signingrequests.htm"]
mutableFacts:
  - label: "Always Free A1 shape"
    value: "VM.Standard.A1.Flex, up to 4 OCPU / 24 GB RAM"
    sourceUrl: "https://www.oracle.com/cloud/free/"
    verifiedAt: "2026-10-15"
---

# Oracle Cloud Infrastructure API

Oracle Cloud's REST API for infrastructure automation. Notable for a generous Always Free tier including ARM-based Ampere A1 compute.

## Authentication

API requests are signed with an RSA private key. Register the public key in the OCI Console (Identity > Users > API Keys) and note the fingerprint.

```bash
# Key fingerprint format
fingerprint: "64:e8:46:46:b2:76:70:4b:0e:0d:a2:b4:25:ff:ce:14"
```

The OCI CLI handles signing automatically once configured.

## Launching an A1 instance

```bash
oci compute instance launch \
  --availability-domain "ncBE:US-SANJOSE-1-AD-1" \
  --compartment-id "ocid1.tenancy.oc1..aaaa..." \
  --shape "VM.Standard.A1.Flex" \
  --shape-config '{"ocpus":2,"memoryInGBs":12}' \
  --image-id "ocid1.image.oc1.us-sanjose-1.aaaa..." \
  --subnet-id "ocid1.subnet.oc1.us-sanjose-1.aaaa..." \
  --assign-public-ip true \
  --display-name "a1-free-tier" \
  --ssh-authorized-keys-file ~/.ssh/id_ed25519.pub
```

## Real-world notes

**Availability domain prefix.** The AD name as shown in the Console includes a tenancy-specific prefix (e.g. `ncBE:US-SANJOSE-1-AD-1`). Passing the bare `US-SANJOSE-1-AD-1` or misusing the prefixed form in query parameters can return 401. Use the exact value from `oci iam availability-domain list`.

**Out of capacity.** Free tier A1 shapes are capacity-constrained. `OutOfCapacity` / `TooManyRequests` are normal — implement a retry loop with backoff rather than treating them as fatal errors.

**Hung calls.** Launch calls can occasionally hang with no response. Wrap CLI invocations in a timeout (e.g. `timeout 150`) and retry.

## Pagination

List operations return an `opc-next-page` header. Pass it as the `page` query parameter to fetch the next page.
