from pathlib import Path

import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

DATA_DIR = Path(__file__).resolve().parent / "data"


def build_network():
    #loads citation links
    edges = pd.read_csv(
        DATA_DIR / "paper_citation_links_within_fsu.csv"
    )

    #count duplicate edges
    edge_counts = (
        edges.groupby(["source", "target"])
        .size()
        .reset_index(name="value")
    )

    #get all unique paper IDs
    node_ids = set(edges["source"]) | set(edges["target"])

    #load paper info
    papers = pd.read_csv(
        DATA_DIR / "fsu_works_2021_2026.csv"
    )

    papers = (
        papers.drop_duplicates("openalex_id")
        .set_index("openalex_id")
    )

    #build nodes
    nodes = []

    for paper_id in sorted(node_ids):
        if paper_id in papers.index:
            paper = papers.loc[paper_id]

            field = paper["primary_field"]

            nodes.append({
                "id": str(paper_id),
                "group": (
                    str(field)
                    if pd.notna(field)
                    else "unknown"
                ),
                "title": (
                    str(paper["title"])
                    if pd.notna(paper["title"])
                    else "Untitled"
                ),
                "year": (
                    int(paper["publication_year"])
                    if pd.notna(paper["publication_year"])
                    else None
                ),
                "venue": (
                    str(paper["venue"])
                    if(pd.notna(paper["venue"]))
                    else "Unknown"
                ),
                "authors": (
                    str(paper["authors"])
                    if pd.notna(paper["authors"])
                    else ""
                )
            })

        else:
            nodes.append({
                "id": str(paper_id),
                "group": "Unknown",
                "title": "Unknown",
                "year": None,
                "venue": "Unknown",
                "authors": ""
            })

    #build links
    links = [
        {
            "source": str(row.source),
            "target": str(row.target),
            "value": int(row.value)
        }
        for row in edge_counts.itertuples(index=False)
    ]

    return{
        "nodes": nodes,
        "links": links
    }


@app.get("/api/network")
def network():
    return jsonify(build_network())

@app.get("/api/stats")
def stats():
    data = build_network()

    return jsonify({
        "nodes": len(data["nodes"]),
        "edges": len(data["links"])
    })

if __name__ == "__main__":
    app.run(port=5001, debug=True)