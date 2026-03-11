from fastapi import APIRouter

router = APIRouter()

@router.get("/milestones")
def get_dashboard_milestones():
    # In a real app, these would be aggregated from the database
    # For now, returning static realistic data for the Recharts graphs
    return {
        "metrics": {
            "total_members": {"value": "4,208", "trend": 12},
            "active_startups": {"value": "342", "trend": 8},
            "matches_made": {"value": "12.5k", "trend": 24},
            "total_funding": {"value": "₹45Cr", "trend": 0}
        },
        "growth_chart": [
            {"month": "Sep", "students": 1200, "startups": 150},
            {"month": "Oct", "students": 1800, "startups": 210},
            {"month": "Nov", "students": 2400, "startups": 280},
            {"month": "Dec", "students": 3100, "startups": 320},
            {"month": "Jan", "students": 3800, "startups": 390},
            {"month": "Feb", "students": 4208, "startups": 450}
        ]
    }
