from .schemas import EvidenceItem

def build_evidence(claim: str, source: str, text: str) -> EvidenceItem:
    """
    Creates an EvidenceItem linking a claim to its textual source.
    Example: 
    claim="Candidate has React experience", 
    source="cv", 
    text="Built dashboard using React and Context API"
    """
    return EvidenceItem(
        claim=claim,
        source=source,
        text=text
    )
