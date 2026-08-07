from datetime import datetime
from app.database.db import engine, SessionLocal, Base
from app.database.models import User, GovernmentScheme
from app.auth.hashing import hash_password
from app.utils.logger import logger


SAMPLE_SCHEMES = [
    {
        "scheme_name": "PM Kisan Samman Nidhi (PM-KISAN)",
        "department": "Ministry of Agriculture & Farmers Welfare",
        "category": "Agriculture",
        "state": "Central",
        "summary": "Income support of Rs 6,000 per year in three equal installments to all landholding farmer families across India.",
        "official_url": "https://pmkisan.gov.in",
    },
    {
        "scheme_name": "Ayushman Bharat PM-JAY",
        "department": "Ministry of Health and Family Welfare",
        "category": "Healthcare",
        "state": "Central",
        "summary": "World's largest health insurance scheme giving secondary and tertiary hospitalization coverage up to Rs 5 lakh per family annually.",
        "official_url": "https://pmjay.gov.in",
    },
    {
        "scheme_name": "Pradhan Mantri Awas Yojana (PMAY-Urban)",
        "department": "Ministry of Housing and Urban Affairs",
        "category": "Housing",
        "state": "Central",
        "summary": "Financial subsidy for construction or purchase of pucca house for urban EWS, LIG, and MIG families.",
        "official_url": "https://pmaymis.gov.in",
    },
    {
        "scheme_name": "PM SVANidhi Scheme",
        "department": "Ministry of Housing and Urban Affairs",
        "category": "Financial Inclusion",
        "state": "Central",
        "summary": "Collateral-free micro-credit facility up to Rs 50,000 for urban street vendors to resume business livelihood.",
        "official_url": "https://pmsvanidhi.mohua.gov.in",
    },
    {
        "scheme_name": "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
        "department": "Ministry of Finance",
        "category": "Financial Inclusion",
        "state": "Central",
        "summary": "National mission for financial inclusion ensuring access to basic banking accounts, remittance, credit, insurance, and pension.",
        "official_url": "https://pmjdy.gov.in",
    },
    {
        "scheme_name": "PM MUDRA Yojana (PMMY)",
        "department": "Ministry of Finance",
        "category": "MSME & Livelihood",
        "state": "Central",
        "summary": "Loans up to Rs 10 Lakhs to non-corporate, non-farm small micro-enterprises under Shishu, Kishore, and Tarun categories.",
        "official_url": "https://www.mudra.org.in",
    },
    {
        "scheme_name": "Atal Pension Yojana (APY)",
        "department": "Ministry of Finance",
        "category": "Pensions",
        "state": "Central",
        "summary": "Guaranteed monthly pension scheme (Rs 1,000 to Rs 5,000) for unorganized sector workers aged 18 to 40.",
        "official_url": "https://www.npscra.nsdl.co.in",
    },
    {
        "scheme_name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "department": "Ministry of Agriculture & Farmers Welfare",
        "category": "Agriculture",
        "state": "Central",
        "summary": "Comprehensive crop insurance scheme protecting farmers against crop loss due to non-preventable natural risks.",
        "official_url": "https://pmfby.gov.in",
    },
    {
        "scheme_name": "Sukanya Samriddhi Yojana (SSY)",
        "department": "Ministry of Women and Child Development",
        "category": "Women & Child",
        "state": "Central",
        "summary": "High-interest savings scheme dedicated to the financial security and higher education of girl children.",
        "official_url": "https://wcd.nic.in",
    },
    {
        "scheme_name": "PM Poshan Shakti Nirman (MDM)",
        "department": "Ministry of Education",
        "category": "Education",
        "state": "Central",
        "summary": "Free cooked nutritious meal program for primary and upper primary students in government and aided schools.",
        "official_url": "https://pmposhan.education.gov.in",
    },
    {
        "scheme_name": "Mahatma Gandhi NREGA (MGNREGA)",
        "department": "Ministry of Rural Development",
        "category": "Employment",
        "state": "Central",
        "summary": "Guarantees 100 days of wage employment per financial year to rural households willing to do unskilled manual work.",
        "official_url": "https://nrega.nic.in",
    },
    {
        "scheme_name": "PM Vishwakarma Scheme",
        "department": "Ministry of Micro, Small and Medium Enterprises",
        "category": "MSME & Livelihood",
        "state": "Central",
        "summary": "Comprehensive financial, toolkit, skill development, and market support to traditional artisans and craftspeople.",
        "official_url": "https://pmvishwakarma.gov.in",
    },
    {
        "scheme_name": "Stand Up India Scheme",
        "department": "Ministry of Finance",
        "category": "Financial Inclusion",
        "state": "Central",
        "summary": "Bank loans between Rs 10 Lakh and Rs 1 Crore to SC/ST or Women borrowers for setting up greenfield enterprises.",
        "official_url": "https://www.standupmitra.in",
    },
    {
        "scheme_name": "Pradhan Mantri Ujjwala Yojana (PMUY)",
        "department": "Ministry of Petroleum and Natural Gas",
        "category": "Social Welfare",
        "state": "Central",
        "summary": "Deposit-free LPG connections to women from below poverty line (BPL) households across India.",
        "official_url": "https://www.pmuy.gov.in",
    },
    {
        "scheme_name": "National Social Assistance Programme (NSAP)",
        "department": "Ministry of Rural Development",
        "category": "Social Welfare",
        "state": "Central",
        "summary": "Social security pensions for elderly, widows, and disabled individuals from destitute BPL families.",
        "official_url": "https://nsap.nic.in",
    },
    {
        "scheme_name": "PM Matsya Sampada Yojana (PMMSY)",
        "department": "Department of Fisheries",
        "category": "Agriculture",
        "state": "Central",
        "summary": "Sustainable development of fisheries sector with modern infrastructure and financial credit.",
        "official_url": "https://pmmsy.dof.gov.in",
    },
    {
        "scheme_name": "Ladli Behna Yojana (Madhya Pradesh)",
        "department": "Department of Women and Child Development, MP",
        "category": "Women & Child",
        "state": "Madhya Pradesh",
        "summary": "Direct monthly financial support of Rs 1,250 to eligible women aged 21 to 60 years in Madhya Pradesh.",
        "official_url": "https://cmladlibehna.mp.gov.in",
    },
    {
        "scheme_name": "Majhi Ladki Bahin Yojana (Maharashtra)",
        "department": "Women and Child Development Department, Maharashtra",
        "category": "Women & Child",
        "state": "Maharashtra",
        "summary": "Direct benefit transfer of Rs 1,500 per month to economically weak women in Maharashtra.",
        "official_url": "https://ladkibahin.maharashtra.gov.in",
    },
    {
        "scheme_name": "Gruha Lakshmi Scheme (Karnataka)",
        "department": "Department of Women & Child Development, Karnataka",
        "category": "Social Welfare",
        "state": "Karnataka",
        "summary": "Monthly financial aid of Rs 2,000 to female head of household in eligible Karnataka families.",
        "official_url": "https://sevasindhu.karnataka.gov.in",
    },
    {
        "scheme_name": "Kanyashree Prakalpa (West Bengal)",
        "department": "Department of Women & Child Development, West Bengal",
        "category": "Education",
        "state": "West Bengal",
        "summary": "Conditional cash scholarship to prevent child marriage and promote higher education for unmarried adolescent girls.",
        "official_url": "https://wbkanyashree.gov.in",
    },
]


def seed_database():
    """
    Creates tables and populates default admin user, citizen user, and 20 government schemes.
    """
    logger.info("Initializing database schema via Base.metadata.create_all...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Seed Users
        users_seed = [
            {
                "full_name": "System Administrator",
                "email": "admin@citizenos.gov.in",
                "password": "AdminPassword123!",
                "role": "Admin",
                "state": "Delhi",
            },
            {
                "full_name": "Ramesh Kumar",
                "email": "citizen@example.com",
                "password": "CitizenPassword123!",
                "role": "Citizen",
                "state": "Maharashtra",
                "district": "Pune",
            },
            {
                "full_name": "Community Moderator",
                "email": "moderator@citizenos.gov.in",
                "password": "ModeratorPassword123!",
                "role": "Moderator",
                "state": "Karnataka",
            },
        ]

        for u in users_seed:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                new_user = User(
                    full_name=u["full_name"],
                    email=u["email"],
                    password_hash=hash_password(u["password"]),
                    role=u["role"],
                    state=u.get("state"),
                    district=u.get("district"),
                    is_verified=True,
                )
                db.add(new_user)
                logger.info(f"Seeded User: {u['email']} ({u['role']})")

        # Seed Schemes
        for s in SAMPLE_SCHEMES:
            existing_scheme = (
                db.query(GovernmentScheme)
                .filter(GovernmentScheme.scheme_name == s["scheme_name"])
                .first()
            )
            if not existing_scheme:
                scheme = GovernmentScheme(
                    scheme_name=s["scheme_name"],
                    department=s["department"],
                    category=s["category"],
                    state=s["state"],
                    summary=s["summary"],
                    official_url=s["official_url"],
                    status="Active",
                    last_verified=datetime.utcnow(),
                )
                db.add(scheme)
                logger.info(f"Seeded Scheme: {s['scheme_name']}")

        db.commit()
        logger.info("Database seeding completed successfully.")

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to seed database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
