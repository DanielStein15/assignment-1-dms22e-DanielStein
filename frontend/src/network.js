import * as d3 from "d3";

export function drawNetwork(svgElement, data) {
    const svg = d3.select(svgElement);

    svg.selectAll("*").remove();

    const width = svgElement.clientWidth || 1000;
    const height = svgElement.clientHeight || 650;

    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({
        ...d,
        source: String(d.source),
        target: String(d.target)
    }));

    const container = svg.append("g");

    const zoom = d3.zoom()
    .scaleExtent([0.02, 20])
    .on("zoom", event => {
        container.attr("transform", event.transform);
    });

    svg.call(zoom);

    const link = container
        .append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity",0.4)
        .attr("stroke-width", d=>
            Math.sqrt(d.value)
    );

    const node = container
        .append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 4)
        .attr("fill", "#782F40")
        .attr("fill-opacity", 0.75);

    node.append("title")
        .text(d => 
            `Title: ${d.title};
    Year: ${d.year}
    Venue: ${d.venue}
    Authors: ${d.authors}`
            );

    const simulation = d3.forceSimulation(nodes)
        .force(
            "link",
            d3.forceLink(links)
            .id(d=>String(d.id))
            .distance(25)
        )
        .force(
            "charge",
            d3.forceManyBody().strength(-12)
        )
        .force("center",
            d3.forceCenter(width/2, height/2)

        )
        .force(
            "x",
            d3.forceX(width/2).strength(0.05)
        )
        .force(
            "y",
            d3.forceY(height/2).strength(0.05)
        );

    const drag = d3.drag()
        .on("start", (event, d) => {
            event.sourceEvent.stopPropagation();
            if(!event.active){
                simulation.alphaTarget(0.1).restart();
            }

            d.fx = d.x;
            d.fy = d.y;
        })
        .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
        })
        .on("end", (event, d) => {
            if(!event.active) {
                simulation.alphaTarget(0);
            }

            d.fx = null;
            d.fy = null;
    });
    node.call(drag);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y)

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    function zoomToFit(){
        const xExtent = d3.extent(nodes, d => d.x);
        const yExtent = d3.extent(nodes, d => d.y);
        
        if(xExtent[0] == null || yExtent[0] == null){
            return;
        }

        const graphWidth = Math.max(
            xExtent[1] - xExtent[0], 1
        );

        const graphHeight = Math.max(
            yExtent[1] - yExtent[0], 1
        );

        const scale = Math.min(
            0.9*width/graphWidth,
            0.9*height/graphHeight
        );

        const centerX = (
            xExtent[0] + xExtent[1]
        )/2;

        const centerY = (
            yExtent[0] + yExtent[1]
        )/2;

        const transform = d3.zoomIdentity
            .translate(
                width/2 - scale*centerX,
                height/2 - scale*centerY
            )
            .scale(scale);

        svg.call(zoom.transform, transform);
    }
    
    let fitted = false;

    simulation.on("end", () => {
        if(!fitted) {
            zoomToFit();
            fitted = true;
        }
    });

    return () => {
        simulation.stop();
        svg.on(".zoom", null);
        svg.selectAll("*").remove(); 
    };
}













