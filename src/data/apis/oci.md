---
name: "Oracle Cloud Infrastructure API"
provider: "Oracle"
category: "developer-platform"
status: "active"
officialDocs: "https://docs.oracle.com/en-us/iaas/api/"
homepage: "https://www.oracle.com/cloud/"
baseUrl: "Service-specific regional endpoints, e.g. https://iaas.us-ashburn-1.oraclecloud.com"
auth: "RSA key pair with API key fingerprint, signed requests"
versioning: "Service-specific API versions in endpoint paths"
resourceGroups: ["Compute", "Networking", "Block Storage", "Identity", "Database"]
pagination: "opc-next-page response header for list operations"
errors: "OCI error codes with opc-request-id for tracking"
webhooks: "Events service with Notifications integration"
sdks: ["Python", "Java", "Go", "TypeScript", "Ruby", ".NET"]
summary: "REST APIs for provisioning and managing Oracle Cloud Infrastructure resources including compute instances, networking, and storage."
pricing: "Pay-as-you-go plus Always Free tier (Ampere A1, AMD E2 Micro)"
rateLimit: "Many APIs throttle with HTTP 429; use exponential backoff"
formats: ["JSON"]
protocols: ["REST"]
bestFor: ["Cloud infrastructure automation", "Free tier ARM instances", "Enterprise Oracle workloads"]
cautions: ["Always Free A1 availability depends on home-region capacity.", "API requests require signed authentication.", "Many API requests throttle with HTTP 429; use exponential backoff."]
verifiedAt: "2026-10-15"
sourceUrls: ["https://docs.oracle.com/en-us/iaas/api/", "https://docs.oracle.com/en-us/iaas/Content/API/Concepts/usingapi.htm", "https://docs.oracle.com/en-us/iaas/Content/API/Concepts/signingrequests.htm", "https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm"]
mutableFacts:
  - label: "Base URL"
    value: "Service-specific regional endpoint; iaas.us-ashburn-1.oraclecloud.com is one example"
    sourceUrl: "https://docs.oracle.com/en-us/iaas/Content/API/Concepts/usingapi.htm"
    verifiedAt: "2026-10-15"
  - label: "Authentication"
    value: "Signed API requests with an RSA signing key"
    sourceUrl: "https://docs.oracle.com/en-us/iaas/Content/API/Concepts/usingapi.htm"
    verifiedAt: "2026-10-15"
  - label: "Pricing"
    value: "Pay As You Go plus Always Free resources; A1 includes 1,500 OCPU-hours and 9,000 GB-hours/month"
    sourceUrl: "https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm"
    verifiedAt: "2026-10-15"
  - label: "Rate limits"
    value: "Many API requests return HTTP 429 when throttled; use exponential backoff"
    sourceUrl: "https://docs.oracle.com/en-us/iaas/Content/API/Concepts/usingapi.htm"
    verifiedAt: "2026-10-15"
  - label: "Always Free A1 shape"
    value: "VM.Standard.A1.Flex; Always Free tenancies: 2 OCPUs and 12 GB memory total"
    sourceUrl: "https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm"
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

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /20160918/instances` | Launch compute instance |
| `GET /20160918/instances` | List instances |
| `GET /20160918/instances/{id}` | Instance details |
| `DELETE /20160918/instances/{id}` | Terminate instance |
| `POST /20160918/instances/{id}/actions` | Instance actions (start/stop) |
| `GET /20160918/shapes` | List available shapes |
| `GET /20160918/images` | List images |
| `GET /20160918/vnicAttachments` | List VNIC attachments |

## Real-world notes

**Availability domains.** Use the availability domain name returned for your tenancy and region by `oci iam availability-domain list`.

**Always Free A1.** The current allowance for Always Free tenancies is 2 OCPUs and 12 GB memory total. A1 capacity in the home region can be temporarily unavailable. Handle throttling with exponential backoff.

**API endpoints.** OCI uses service-specific regional endpoints; `iaas` is one example, not a universal base URL.

## Pagination

List operations return an `opc-next-page` header. Pass it as the `page` query parameter to fetch the next page.
