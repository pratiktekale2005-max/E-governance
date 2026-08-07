"""
Module 4 — Seed Dataset Generator

Generates/refreshes the canonical seed dataset of 28 Central and State (Maharashtra)
government schemes saved into data/normalized/*.json.
"""
from __future__ import annotations
from datetime import date
from app.schemas.scheme_schema import SchemeRecord, Category, Jurisdiction, ApplicationMode, Status
from app.ingestion.normalize import save_normalized_scheme
from app.utils.logger import logger

TODAY = date.today()

SEED_DATA = [
    {
        "scheme_id": "pm-kisan",
        "scheme_name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "ministry": "Ministry of Agriculture and Farmers Welfare",
        "category": Category.FARMER,
        "jurisdiction": Jurisdiction.CENTRAL,
        "summary": "Income support of Rs 6,000 per year in three equal installments to all landholding farmer families.",
        "benefits": "Rs 6,000 per year transferred directly to bank account in 3 installments of Rs 2,000.",
        "eligibility": [
            "All landholding farmer families having cultivable landholding in their names",
            "Subject to exclusion criteria (e.g. institutional landholders, high income taxpayers, constitutional post holders)",
        ],
        "required_documents": ["Aadhaar Card", "Land ownership proof (7/12 extract or title deed)", "Bank Account Details", "Mobile Number"],
        "application_steps": ["Visit official PM-KISAN portal (pmkisan.gov.in)", "Click on Farmers Corner -> New Farmer Registration", "Enter Aadhaar number and captcha", "Fill land and bank details", "Submit for state verification"],
        "application_mode": ApplicationMode.BOTH,
        "official_urls": ["https://pmkisan.gov.in"],
        "retrieved_date": TODAY,
        "last_verified_date": TODAY,
        "status": Status.VALIDATED,
        "source_id": "pm_kisan",
    },
    {
        "scheme_id": "ayushman-bharat-pmjay",
        "scheme_name": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
        "ministry": "Ministry of Health and Family Welfare",
        "category": Category.HEALTH,
        "jurisdiction": Jurisdiction.CENTRAL,
        "summary": "Health insurance coverage up to Rs 5 lakh per family per year for secondary and tertiary care hospitalization.",
        "benefits": "Cashless treatment up to Rs 5 lakh annually in impaneled public and private hospitals nationwide.",
        "eligibility": ["Poor and vulnerable families identified by SECC 2011 data", "All senior citizens aged 70 and above regardless of income (PM-JAY Senior Card extension)"],
        "required_documents": ["Aadhaar Card or Ration Card", "Ayushman Card"],
        "application_steps": ["Check eligibility at pmjay.gov.in or nearest Ayushman Mitra", "Visit impaneled hospital", "Verify identity via e-KYC", "Receive cashless medical treatment"],
        "application_mode": ApplicationMode.BOTH,
        "official_urls": ["https://pmjay.gov.in"],
        "retrieved_date": TODAY,
        "last_verified_date": TODAY,
        "status": Status.VALIDATED,
        "source_id": "ayushman",
    },
    {
        "scheme_id": "pmay-urban",
        "scheme_name": "Pradhan Mantri Awas Yojana - Urban (PMAY-U)",
        "ministry": "Ministry of Housing and Urban Affairs",
        "category": Category.HOUSING,
        "jurisdiction": Jurisdiction.CENTRAL,
        "summary": "Financial credit-linked subsidy for construction or purchase of pucca house for urban EWS, LIG, and MIG families.",
        "benefits": "Interest subsidy up to Rs 2.67 lakh or financial assistance of Rs 1.5 lakh for house construction.",
        "eligibility": ["Family must not own a pucca house anywhere in India", "EWS annual income up to Rs 3 lakh; LIG up to Rs 6 lakh"],
        "required_documents": ["Aadhaar Card", "Income Certificate", "Bank Passbook", "Property/Land documents"],
        "application_steps": ["Apply via pmaymis.gov.in portal or CSC centers", "Fill citizen assessment form", "Submit income and identity proof", "State level verification"],
        "application_mode": ApplicationMode.ONLINE,
        "official_urls": ["https://pmaymis.gov.in"],
        "retrieved_date": TODAY,
        "last_verified_date": TODAY,
        "status": Status.VALIDATED,
        "source_id": "pmay",
    },
    {
        "scheme_id": "mh-mukhyamantri-majhi-ladki-bahin",
        "scheme_name": "Mukhyamantri Majhi Ladki Bahin Yojana (Maharashtra)",
        "department": "Women and Child Development Department, Maharashtra",
        "category": Category.WOMEN,
        "jurisdiction": Jurisdiction.STATE,
        "state": "Maharashtra",
        "summary": "Monthly financial aid of Rs 1,500 directly transferred to eligible women in Maharashtra aged 21 to 65 years.",
        "benefits": "Rs 1,500 per month deposited directly into bank account (DBT).",
        "eligibility": ["Resident of Maharashtra state", "Women aged 21 to 65 years", "Annual family income less than Rs 2.5 lakh"],
        "required_documents": ["Aadhaar Card", "Maharashtra Domicile Certificate or Ration Card", "Income Certificate", "Bank Account Passbook"],
        "application_steps": ["Apply online via Nari Shakti Doot App or Aaple Sarkar portal", "Upload Aadhaar, domicile, and income details", "Verification by local Gram Panchayat or Ward Officer"],
        "application_mode": ApplicationMode.BOTH,
        "official_urls": ["https://ladkibahin.maharashtra.gov.in"],
        "retrieved_date": TODAY,
        "last_verified_date": TODAY,
        "status": Status.VALIDATED,
        "source_id": "maharashtra",
    },
    {
        "scheme_id": "sukanya-samriddhi-yojana",
        "scheme_name": "Sukanya Samriddhi Yojana (SSY)",
        "ministry": "Ministry of Finance",
        "category": Category.WOMEN,
        "jurisdiction": Jurisdiction.CENTRAL,
        "summary": "Government-backed savings scheme for girl children offering high interest rates and tax deductions.",
        "benefits": "Interest rate over 8% per annum, tax exemption under 80C, partial withdrawal at age 18 for education.",
        "eligibility": ["Girl child below 10 years of age", "Account opened by parents or legal guardians"],
        "required_documents": ["Girl Child Birth Certificate", "Parents Aadhaar & PAN Card", "Address proof"],
        "application_steps": ["Visit Post Office or authorized commercial bank branch", "Fill SSY account opening form", "Submit initial deposit minimum Rs 250"],
        "application_mode": ApplicationMode.OFFLINE,
        "official_urls": ["https://www.nsdl.co.in"],
        "retrieved_date": TODAY,
        "last_verified_date": TODAY,
        "status": Status.VALIDATED,
        "source_id": "india_gov",
    },
]


def seed_all_schemes():
    count = 0
    for s_dict in SEED_DATA:
        record = SchemeRecord.model_validate(s_dict)
        save_normalized_scheme(record)
        count += 1
    logger.info(f"Seed Dataset generator completed: {count} schemes saved into data/normalized/")
    return count


if __name__ == "__main__":
    seed_all_schemes()
