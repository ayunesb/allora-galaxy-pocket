
# Industry Kits Module Documentation

## What the Module Does

The Industry Kits module provides industry-specific templates, strategies, KPI metrics, and agent configurations that are automatically assigned during user onboarding. This ensures that new users get a relevant and tailored experience based on their industry selection.

Key features:
- Industry-specific starter strategies
- Pre-configured KPI metrics with relevant targets
- Recommended agent configurations
- Tailored onboarding flow

## Supported Industry Verticals

1. **SaaS/Tech** - Default templates for SaaS companies
2. **E-commerce** - Templates for online stores with conversion-focused metrics
3. **Coaching/Education** - Templates for course creators and coaching businesses

## How to Test

1. Create a new workspace and go through the onboarding flow
2. Select different industries and verify the correct kit is applied
3. After onboarding, check:
   - Strategies page for industry-specific strategies
   - KPI dashboard for industry-specific metrics
   - Agent configurations for recommended setups

## Linked Supabase Tables

- `company_profiles`: Stores industry selection
- `strategies`: Populated with industry-specific strategies
- `kpi_metrics`: Populated with industry-specific KPI metrics
- `agent_profiles`: Potentially configured based on industry

## Known Limitations

- Limited number of industry verticals supported (currently SaaS, E-commerce, and Coaching)
- Industry selection cannot be changed after onboarding without manual database updates
- Some industries default to the SaaS kit when a specific kit is not available

## Extension Points

- Adding new industry verticals by creating additional kit files
- Expanding kits with more detailed strategies, KPIs, and agent configurations
- Adding industry-specific templates for campaigns and content
