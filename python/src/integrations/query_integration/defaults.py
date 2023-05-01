from ...models import QueryDefaults

DEFAULTS: QueryDefaults = QueryDefaults(
    ttl_minutes=60,
    cached=True,
    timeout_minutes=20,
    retry_interval_seconds=0.5,
    page_size=100000,
    page_number=1,
    max_age_minutes=5,
)
