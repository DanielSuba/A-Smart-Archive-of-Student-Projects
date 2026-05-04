"""
Skill Profile Builder & Recommendation Engine
Agreguje technologie ze wszystkich projektów studenta,
oblicza wagi i rekomenduje kolejne technologie do nauki.
"""
from typing import List, Dict
from sqlalchemy.orm import Session
from database import User, Project, ProjectTechnology, Technology


TECH_PROGRESSION = {
    "JavaScript": ["TypeScript", "Node.js", "React", "Vue.js"],
    "TypeScript": ["React", "Angular", "NestJS", "GraphQL"],
    "React": ["Next.js", "React Native", "GraphQL", "TypeScript"],
    "Python": ["FastAPI", "Django", "scikit-learn", "TensorFlow", "Docker"],
    "FastAPI": ["PostgreSQL", "Redis", "Docker", "Kubernetes"],
    "Django": ["PostgreSQL", "Redis", "Celery", "Docker"],
    "Java": ["Spring Boot", "Maven", "PostgreSQL", "Docker", "Kubernetes"],
    "Spring Boot": ["Kubernetes", "Docker", "PostgreSQL", "Redis"],
    "Docker": ["Kubernetes", "CI/CD", "AWS", "Azure"],
    "PostgreSQL": ["Redis", "Elasticsearch", "Docker"],
    "Node.js": ["TypeScript", "NestJS", "GraphQL", "MongoDB"],
    "Vue.js": ["TypeScript", "Nuxt.js", "Pinia"],
    "Angular": ["TypeScript", "RxJS", "NgRx"],
    "Flutter": ["Dart", "Firebase", "REST API"],
    "scikit-learn": ["TensorFlow", "PyTorch", "pandas", "numpy"],
    "TensorFlow": ["Kubernetes", "Docker", "MLflow", "PyTorch"],
    "AWS": ["Kubernetes", "Terraform", "CI/CD"],
}

ECOSYSTEM_MAP = {
    "Frontend": ["React", "Vue.js", "Angular", "TypeScript", "TailwindCSS"],
    "Backend": ["FastAPI", "Django", "Flask", "Node.js", "Spring Boot"],
    "DevOps": ["Docker", "Kubernetes", "CI/CD", "Nginx", "AWS"],
    "Database": ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Elasticsearch"],
    "AI/ML": ["TensorFlow", "PyTorch", "scikit-learn"],
    "Mobile": ["Flutter", "React Native", "Swift", "Kotlin"],
}


def build_skill_profile(user_id: int, db: Session) -> Dict:
    """Build comprehensive skill profile for a student."""
    projects = db.query(Project).filter(Project.user_id == user_id).all()

    if not projects:
        return {
            "skills": [],
            "total_projects": 0,
            "top_technologies": [],
            "recommendations": ["Zacznij od React lub Python", "Dodaj swój pierwszy projekt"],
        }

    # Aggregate tech across projects
    tech_stats: Dict[str, Dict] = {}

    for project in projects:
        proj_techs = (
            db.query(ProjectTechnology, Technology)
            .join(Technology, ProjectTechnology.tech_id == Technology.id)
            .filter(ProjectTechnology.project_id == project.id)
            .all()
        )
        for pt, tech in proj_techs:
            name = tech.name
            if name not in tech_stats:
                tech_stats[name] = {
                    "technology": name,
                    "category": tech.category,
                    "project_count": 0,
                    "total_difficulty": 0.0,
                    "max_confidence": 0.0,
                    "weight": 0.0,
                }
            tech_stats[name]["project_count"] += 1
            tech_stats[name]["total_difficulty"] += project.difficulty_score
            tech_stats[name]["max_confidence"] = max(
                tech_stats[name]["max_confidence"], pt.confidence_level
            )

    # Calculate weight: project_count * avg_difficulty_score
    skills = []
    for name, stats in tech_stats.items():
        count = stats["project_count"]
        avg_diff = stats["total_difficulty"] / count if count else 0
        weight = round(count * avg_diff / 10, 2)  # normalize
        skills.append({
            "technology": name,
            "category": stats["category"],
            "weight": weight,
            "project_count": count,
            "avg_difficulty": round(avg_diff, 1),
        })

    skills.sort(key=lambda x: x["weight"], reverse=True)
    top_technologies = [s["technology"] for s in skills[:5]]

    # Recommendation engine
    recommendations = generate_recommendations(top_technologies, set(tech_stats.keys()))

    return {
        "skills": skills,
        "total_projects": len(projects),
        "top_technologies": top_technologies,
        "recommendations": recommendations,
    }


def generate_recommendations(top_techs: List[str], known_techs: set) -> List[str]:
    """Suggest next technologies based on current skill set."""
    candidates: Dict[str, int] = {}

    for tech in top_techs:
        next_steps = TECH_PROGRESSION.get(tech, [])
        for candidate in next_steps:
            if candidate not in known_techs:
                candidates[candidate] = candidates.get(candidate, 0) + 1

    if not candidates:
        # Fallback recommendations based on ecosystem gaps
        all_known_cats = set()
        for tech in known_techs:
            for cat, techs in ECOSYSTEM_MAP.items():
                if tech in techs:
                    all_known_cats.add(cat)

        missing_cats = set(ECOSYSTEM_MAP.keys()) - all_known_cats
        for cat in list(missing_cats)[:2]:
            candidates[ECOSYSTEM_MAP[cat][0]] = 1

    sorted_recs = sorted(candidates.items(), key=lambda x: x[1], reverse=True)
    return [tech for tech, _ in sorted_recs[:5]]
