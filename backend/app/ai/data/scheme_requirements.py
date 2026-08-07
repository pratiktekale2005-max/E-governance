"""
Required documents & application steps per scheme.

In production this should come from the same source-of-truth store that
feeds the retrieval engine's metadata (so it stays in sync with official
scheme data). This lookup is a placeholder/example keyed by scheme_id.
"""

from __future__ import annotations

REQUIREMENTS: dict[str, dict] = {
    "pm-kisan": {
        "required_documents": [
            "Aadhaar card (for identity verification only, never shared with this assistant)",
            "Land ownership records / Khatauni",
            "Bank account passbook",
        ],
        "application_steps": [
            "Visit the PM-KISAN official portal or nearest Common Service Centre (CSC).",
            "Complete the farmer registration form with land and bank details.",
            "Submit the form for verification by the local revenue officer.",
            "Track application status using your registration number.",
        ],
    },
    "pmay-g": {
        "required_documents": [
            "Aadhaar card",
            "Proof of residence",
            "Income certificate",
            "SECC (Socio Economic Caste Census) reference, if available",
        ],
        "application_steps": [
            "Check SECC eligibility list at your Gram Panchayat office.",
            "Submit application via the PMAY-G portal or through the Panchayat.",
            "Attend the verification survey conducted by local officials.",
            "Receive sanction and installment-wise fund disbursal.",
        ],
    },
    "nsap-obds": {
        "required_documents": [
            "Age proof",
            "BPL card / income certificate",
            "Bank account details",
        ],
        "application_steps": [
            "Obtain the pension application form from the local Panchayat/ULB office.",
            "Attach age proof and BPL certification.",
            "Submit to the District Social Welfare Office for verification.",
            "Pension is credited monthly upon approval.",
        ],
    },
}


def get_requirements(scheme_id: str) -> dict:
    return REQUIREMENTS.get(scheme_id, {"required_documents": [], "application_steps": []})
