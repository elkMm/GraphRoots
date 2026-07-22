<script lang="ts">
  import { onMount, tick } from "svelte";
  import * as d3 from "d3";
  import { withBase } from "../../domain/base-path";
  import { filterGraphPayload } from "../../domain/graph/filter-payload";
  import type {
    GraphEdgePayload,
    GraphNodePayload,
    GraphPayload,
  } from "../../domain/types";

  export let dataUrl: string;
  export let displayMode: "explorer" | "preview" = "explorer";

  interface SimulationNode extends GraphNodePayload, d3.SimulationNodeDatum {
    radius: number;
  }

  interface SimulationEdge extends d3.SimulationLinkDatum<SimulationNode> {
    id: string;
    slug: string;
    entityAId: string;
    entityBId: string;
    relationshipType: GraphEdgePayload["relationshipType"];
    orientation: GraphEdgePayload["orientation"];
    evidenceCategory: GraphEdgePayload["evidenceCategory"];
    explanation: string;
    reviewStatus: GraphEdgePayload["reviewStatus"];
    disputeStatus: GraphEdgePayload["disputeStatus"];
  }

  let graph: GraphPayload | undefined;
  let svgElement: SVGSVGElement;
  let stageElement: HTMLDivElement;
  let simulation: d3.Simulation<SimulationNode, SimulationEdge> | undefined;
  let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | undefined;
  let nodeSelection:
    d3.Selection<SVGGElement, SimulationNode, SVGGElement, unknown> | undefined;
  let edgeSelection:
    | d3.Selection<SVGPathElement, SimulationEdge, SVGGElement, unknown>
    | undefined;
  let selectedId: string | undefined;
  let searchQuery = "";
  let entityTypeFilter = "all";
  let relationshipTypeFilter = "all";
  let evidenceFilter = "all";
  let includeProvisional = true;
  let activeGroups: string[] = [];
  let loading = true;
  let errorMessage = "";
  let visibleNodes: GraphNodePayload[] = [];
  let visibleEdges: GraphEdgePayload[] = [];

  $: selectedNode = graph?.nodes.find((node) => node.id === selectedId);
  $: selectedRelationships = visibleEdges.filter(
    (edge) => edge.entityAId === selectedId || edge.entityBId === selectedId,
  );
  $: entityTypes = [
    ...new Set(graph?.nodes.map((node) => node.entityType) ?? []),
  ].sort();
  $: relationshipTypes = [
    ...new Set(
      graph?.edges
        .filter(
          (edge) => edge.reviewStatus === "reviewed" || includeProvisional,
        )
        .map((edge) => edge.relationshipType) ?? [],
    ),
  ].sort();
  $: evidenceCategories = [
    ...new Set(
      graph?.edges
        .filter(
          (edge) => edge.reviewStatus === "reviewed" || includeProvisional,
        )
        .map((edge) => edge.evidenceCategory) ?? [],
    ),
  ].sort();
  $: networkGroups = availableNetworkGroups(graph?.nodes ?? []);

  const networkGroupMeta: Record<string, { label: string; color: string }> = {
    roots: { label: "African & Early American Roots", color: "#2f6b5e" },
    delta: { label: "Delta Blues", color: "#a4402f" },
    texas_piedmont: {
      label: "Texas & Piedmont Blues",
      color: "#c8963e",
    },
    classic: { label: "Classic / Vaudeville Blues", color: "#8b5a8f" },
    chicago: { label: "Chicago & Electric Blues", color: "#3d6ea5" },
    rock_crossover: {
      label: "Rock & Roll Crossover",
      color: "#c1652f",
    },
    british: { label: "British Blues Invasion", color: "#7d6b9e" },
    modern: { label: "Modern Blues & Blues-Rock", color: "#4f9d69" },
  };

  const evidenceLabels: Record<GraphEdgePayload["evidenceCategory"], string> = {
    directly_documented: "Directly documented",
    historically_corroborated: "Historically corroborated",
    contextual_or_inferential: "Contextual or inferential",
    interpretive_or_debated: "Interpretive or debated",
  };

  const relationshipLabels: Record<
    GraphEdgePayload["relationshipType"],
    string
  > = {
    influenced_style: "Influenced style",
    mentored: "Mentored",
    learned_from: "Learned from",
    performed_with: "Performed with",
    recorded_with: "Recorded with",
    member_of: "Member of",
    covered_work_by: "Work covered by",
    adapted_composition: "Adapted composition",
    shared_scene: "Shared scene",
    recorded_by_label: "Recorded by label",
    associated_with_place: "Associated with place",
    migrated_to: "Migrated to",
    revived_or_reintroduced: "Revived or reintroduced",
    historical_parallel: "Historical parallel",
    provisional_unspecified: "Provisional",
  };

  function entityPath(node: GraphNodePayload): string {
    if (node.entityType === "artist") {
      return withBase(`/artists/${node.slug}`);
    }
    if (node.entityType === "ensemble") {
      return withBase(`/ensembles/${node.slug}`);
    }
    if (node.entityType === "tradition") {
      return withBase(`/traditions/${node.slug}`);
    }
    return withBase(`/entities/${node.slug}`);
  }

  function availableNetworkGroups(nodes: GraphNodePayload[]): string[] {
    const graphGroups = new Set(
      nodes
        .map((node) => node.networkGroup)
        .filter((group): group is string => Boolean(group)),
    );
    const knownGroups = Object.keys(networkGroupMeta).filter((group) =>
      graphGroups.has(group),
    );
    const additionalGroups = [...graphGroups]
      .filter((group) => !networkGroupMeta[group])
      .sort();
    return [...knownGroups, ...additionalGroups];
  }

  function groupLabel(group: string): string {
    return networkGroupMeta[group]?.label ?? group.replaceAll("_", " ");
  }

  function groupColor(group: string | undefined): string {
    return group ? (networkGroupMeta[group]?.color ?? "#a89880") : "#a89880";
  }

  function entityAId(edge: SimulationEdge): string {
    return typeof edge.source === "string" ? edge.source : edge.source.id;
  }

  function entityBId(edge: SimulationEdge): string {
    return typeof edge.target === "string" ? edge.target : edge.target.id;
  }

  function defaultMarker(edge: SimulationEdge): string | null {
    if (edge.orientation !== "directed") return null;
    if (edge.disputeStatus === "contested") return "url(#arrow-debated)";
    return "url(#arrow)";
  }

  function applyHighlight(focusId = selectedId): void {
    if (!nodeSelection || !edgeSelection) return;
    const neighbors: string[] = [];
    if (focusId) {
      for (const edge of visibleEdges) {
        if (edge.entityAId === focusId && !neighbors.includes(edge.entityBId)) {
          neighbors.push(edge.entityBId);
        }
        if (edge.entityBId === focusId && !neighbors.includes(edge.entityAId)) {
          neighbors.push(edge.entityAId);
        }
      }
    }

    nodeSelection
      .classed("is-selected", (node) => node.id === selectedId)
      .classed(
        "is-dimmed",
        (node) =>
          Boolean(focusId) &&
          node.id !== focusId &&
          !neighbors.includes(node.id),
      )
      .classed(
        "is-lit",
        (node) => node.id === focusId || neighbors.includes(node.id),
      );
    edgeSelection
      .classed(
        "is-active",
        (edge) => entityAId(edge) === focusId || entityBId(edge) === focusId,
      )
      .classed(
        "is-dimmed",
        (edge) =>
          Boolean(focusId) &&
          entityAId(edge) !== focusId &&
          entityBId(edge) !== focusId,
      )
      .attr("marker-end", (edge) => {
        if (edge.orientation !== "directed") return null;
        if (!focusId) return defaultMarker(edge);
        return entityAId(edge) === focusId || entityBId(edge) === focusId
          ? "url(#arrow-lit)"
          : "url(#arrow-dim)";
      });
  }

  function focusNode(node: GraphNodePayload, updateUrl = true): void {
    selectedId = node.id;
    applyHighlight();

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("entity", node.slug);
      window.history.replaceState({}, "", url);
    }
  }

  function clearSelection(): void {
    selectedId = undefined;
    applyHighlight();
    const url = new URL(window.location.href);
    url.searchParams.delete("entity");
    window.history.replaceState({}, "", url);
  }

  function fitGraph(duration = 250): void {
    if (!nodeSelection || !zoomBehavior || nodeSelection.empty()) return;
    const nodes = nodeSelection.data();
    const xs = nodes.map((node) => node.x ?? 0);
    const ys = nodes.map((node) => node.y ?? 0);
    const x0 = d3.min(xs) ?? 0;
    const x1 = d3.max(xs) ?? 1;
    const y0 = d3.min(ys) ?? 0;
    const y1 = d3.max(ys) ?? 1;
    const width = stageElement.clientWidth;
    const height = stageElement.clientHeight;
    const graphWidth = Math.max(1, x1 - x0);
    const graphHeight = Math.max(1, y1 - y0);
    const padding = 60;
    const scale = Math.max(
      0.15,
      Math.min(
        4,
        Math.min(
          (width - padding * 2) / graphWidth,
          (height - padding * 2) / graphHeight,
        ),
      ),
    );
    const transform = d3.zoomIdentity
      .translate(
        width / 2 - (scale * (x0 + x1)) / 2,
        height / 2 - (scale * (y0 + y1)) / 2,
      )
      .scale(scale);
    const safeDuration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : duration;
    d3.select(svgElement)
      .transition()
      .duration(safeDuration)
      .call(zoomBehavior.transform, transform);
  }

  function renderGraph(): void {
    if (!graph || !svgElement || !stageElement) return;
    simulation?.stop();

    const filteredGraph = filterGraphPayload(graph, {
      entityType: entityTypeFilter,
      relationshipType: relationshipTypeFilter,
      evidenceCategory: evidenceFilter,
      networkGroups: activeGroups,
      includeProvisional,
    });
    visibleNodes = filteredGraph.nodes;
    visibleEdges = filteredGraph.edges;
    const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));

    if (selectedId && !visibleNodeIds.has(selectedId)) selectedId = undefined;

    const width = Math.max(stageElement.clientWidth, 320);
    const height = Math.max(stageElement.clientHeight, 460);
    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const defs = svg.append("defs");
    [
      ["arrow", "#c8963e"],
      ["arrow-debated", "#8b5a8f"],
      ["arrow-lit", "#c8963e"],
      ["arrow-dim", "#4a3d2c"],
    ].forEach(([id, color]) => {
      const markerPath = defs
        .append("marker")
        .attr("id", id)
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 9)
        .attr("refY", 5)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M0,0 L10,5 L0,10 z")
        .attr("fill", color);
      if (id === "arrow-dim") markerPath.attr("fill-opacity", 0.08);
    });

    const root = svg.append("g");
    const edgeGroup = root.append("g").attr("aria-hidden", "true");
    const nodeGroup = root.append("g");
    zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4])
      .on("zoom", (event) => root.attr("transform", event.transform));
    svg.call(zoomBehavior);

    svg.on("click.clear-selection", (event) => {
      if (event.target === svgElement) clearSelection();
    });

    const radiusScale = d3
      .scaleSqrt()
      .domain(
        d3.extent(visibleNodes, (node) => node.connectionCount) as [
          number,
          number,
        ],
      )
      .range([6, 20]);

    const nodes: SimulationNode[] = visibleNodes.map((node) => ({
      ...node,
      radius: radiusScale(node.connectionCount),
    }));
    const edges: SimulationEdge[] = visibleEdges.map((edge) => ({
      ...edge,
      source: edge.entityAId,
      target: edge.entityBId,
    }));

    edgeSelection = edgeGroup
      .selectAll<SVGPathElement, SimulationEdge>("path")
      .data(edges)
      .join("path")
      .attr("class", "graph-edge")
      .classed("is-provisional", (edge) => edge.reviewStatus === "provisional")
      .classed("is-symmetric", (edge) => edge.orientation === "symmetric")
      .classed("is-debated", (edge) => edge.disputeStatus === "contested")
      .attr("stroke-dasharray", (edge) =>
        edge.reviewStatus === "provisional"
          ? "4 5"
          : edge.disputeStatus === "contested"
            ? "7 6"
            : null,
      )
      .attr("marker-end", defaultMarker);

    const drag = d3
      .drag<SVGGElement, SimulationNode>()
      .on("start", (event, node) => {
        if (!event.active) simulation?.alphaTarget(0.25).restart();
        node.fx = node.x;
        node.fy = node.y;
      })
      .on("drag", (event, node) => {
        node.fx = event.x;
        node.fy = event.y;
      })
      .on("end", (event, node) => {
        if (!event.active) simulation?.alphaTarget(0);
        node.fx = null;
        node.fy = null;
      });

    nodeSelection = nodeGroup
      .selectAll<SVGGElement, SimulationNode>("g")
      .data(nodes)
      .join("g")
      .attr("class", "graph-node")
      .attr("role", "button")
      .attr("tabindex", 0)
      .attr("aria-label", (node) => `Select ${node.name}, ${node.entityType}`)
      .on("click", (event, node) => {
        event.stopPropagation();
        focusNode(node);
      })
      .on("mouseenter", (_event, node) => {
        if (!selectedId) applyHighlight(node.id);
      })
      .on("mouseleave", () => {
        if (!selectedId) applyHighlight();
      })
      .on("keydown", (event, node) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          focusNode(node);
        }
      })
      .call(drag);

    nodeSelection
      .append("circle")
      .attr("r", (node) => node.radius)
      .attr("fill", (node) => groupColor(node.networkGroup))
      .attr("fill-opacity", 0.85);
    nodeSelection
      .append("text")
      .attr("x", (node) => node.radius + 5)
      .attr("y", 4)
      .text((node) => node.name);

    simulation = d3
      .forceSimulation<SimulationNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimulationNode, SimulationEdge>(edges)
          .id((node) => node.id)
          .distance(130)
          .strength(0.3),
      )
      .force("charge", d3.forceManyBody().strength(-420))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide<SimulationNode>().radius((node) => node.radius + 38),
      )
      .on("tick", () => {
        edgeSelection?.attr("d", (edge) => {
          const source = edge.source as SimulationNode;
          const target = edge.target as SimulationNode;
          const sourceX = source.x ?? 0;
          const sourceY = source.y ?? 0;
          const targetX = target.x ?? 0;
          const targetY = target.y ?? 0;
          const deltaX = targetX - sourceX;
          const deltaY = targetY - sourceY;
          const distance = Math.hypot(deltaX, deltaY) || 1;
          const targetRadius = target.radius + 3;
          const endX = targetX - (deltaX / distance) * targetRadius;
          const endY = targetY - (deltaY / distance) * targetRadius;
          return `M${sourceX},${sourceY} L${endX},${endY}`;
        });
        nodeSelection?.attr(
          "transform",
          (node) => `translate(${node.x ?? 0},${node.y ?? 0})`,
        );
      })
      .on("end", () => {
        fitGraph(500);
      });

    const requestedSlug = new URL(window.location.href).searchParams.get(
      "entity",
    );
    const requestedQuery = new URL(window.location.href).searchParams
      .get("query")
      ?.trim()
      .toLowerCase();
    if (requestedQuery) searchQuery = requestedQuery;
    const requestedNode = requestedSlug
      ? graph.nodes.find((node) => node.slug === requestedSlug)
      : requestedQuery
        ? graph.nodes.find((node) =>
            node.name.toLowerCase().includes(requestedQuery),
          )
        : undefined;
    if (requestedNode && visibleNodeIds.has(requestedNode.id))
      focusNode(requestedNode, false);
    else applyHighlight();
  }

  function submitSearch(event: SubmitEvent): void {
    event.preventDefault();
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const match = graph?.nodes.find((node) =>
      node.name.toLowerCase().includes(normalizedQuery),
    );
    if (!match) {
      errorMessage = normalizedQuery
        ? `No entity matches “${searchQuery}”.`
        : "";
      return;
    }
    errorMessage = "";
    focusNode(match);
  }

  async function updateFilters(): Promise<void> {
    await tick();
    renderGraph();
  }

  async function resetExplorer(): Promise<void> {
    searchQuery = "";
    entityTypeFilter = "all";
    relationshipTypeFilter = "all";
    evidenceFilter = "all";
    includeProvisional = true;
    activeGroups = availableNetworkGroups(graph?.nodes ?? []);
    selectedId = undefined;
    errorMessage = "";
    const url = new URL(window.location.href);
    url.searchParams.delete("entity");
    url.searchParams.delete("query");
    window.history.replaceState({}, "", url);
    await updateFilters();
  }

  async function toggleGroup(group: string): Promise<void> {
    activeGroups = activeGroups.includes(group)
      ? activeGroups.filter((candidate) => candidate !== group)
      : [...activeGroups, group];
    await updateFilters();
  }

  async function toggleProvisional(): Promise<void> {
    includeProvisional = !includeProvisional;
    if (
      !includeProvisional &&
      relationshipTypeFilter === "provisional_unspecified"
    ) {
      relationshipTypeFilter = "all";
    }
    await updateFilters();
  }

  onMount(() => {
    const controller = new AbortController();
    const resizeObserver = new ResizeObserver(() => renderGraph());

    async function load(): Promise<void> {
      try {
        const response = await fetch(dataUrl, { signal: controller.signal });
        if (!response.ok)
          throw new Error(`Graph data request failed: ${response.status}`);
        const payload = (await response.json()) as GraphPayload;
        graph = payload;
        activeGroups = availableNetworkGroups(graph.nodes);
        visibleNodes = graph.nodes;
        visibleEdges = graph.edges;
        loading = false;
        await tick();
        resizeObserver.observe(stageElement);
        renderGraph();
      } catch (error) {
        if (controller.signal.aborted) return;
        loading = false;
        errorMessage =
          error instanceof Error ? error.message : "Unable to load graph data.";
      }
    }

    void load();

    return () => {
      controller.abort();
      resizeObserver.disconnect();
      simulation?.stop();
    };
  });
</script>

<div class="explorer-shell" class:preview={displayMode === "preview"}>
  {#if displayMode === "explorer"}
    <section class="controls" aria-label="Graph controls">
      <form class="search" onsubmit={submitSearch}>
        <label for="graph-search">Search an artist or tradition</label>
        <div>
          <input
            id="graph-search"
            list="entity-options"
            bind:value={searchQuery}
            autocomplete="off"
            placeholder="Try Muddy Waters"
          />
          <button type="submit">Focus</button>
        </div>
        <datalist id="entity-options">
          {#each graph?.nodes ?? [] as node (node.id)}
            <option value={node.name}></option>
          {/each}
        </datalist>
      </form>

      <label>
        Entity type
        <select bind:value={entityTypeFilter} onchange={updateFilters}>
          <option value="all">All entity types</option>
          {#each entityTypes as entityType (entityType)}
            <option value={entityType}>{entityType}</option>
          {/each}
        </select>
      </label>

      <label>
        Relationship
        <select bind:value={relationshipTypeFilter} onchange={updateFilters}>
          <option value="all">All visible types</option>
          {#each relationshipTypes as relationshipType (relationshipType)}
            <option value={relationshipType}
              >{relationshipLabels[relationshipType]}</option
            >
          {/each}
        </select>
      </label>

      <label>
        Evidence basis
        <select bind:value={evidenceFilter} onchange={updateFilters}>
          <option value="all">All evidence categories</option>
          {#each evidenceCategories as evidenceCategory (evidenceCategory)}
            <option value={evidenceCategory}
              >{evidenceLabels[evidenceCategory]}</option
            >
          {/each}
        </select>
      </label>

      <button class="reset" type="button" onclick={resetExplorer}
        >Reset view</button
      >

      <fieldset class="group-filter">
        <legend>Network grouping</legend>
        <div class="group-chips">
          {#each networkGroups as group (group)}
            <button
              class="chip"
              class:off={!activeGroups.includes(group)}
              style={`--group-color: ${groupColor(group)}`}
              type="button"
              aria-pressed={activeGroups.includes(group)}
              onclick={() => toggleGroup(group)}
            >
              <span class="dot"></span>{groupLabel(group)}
            </button>
          {/each}
        </div>
      </fieldset>
    </section>
  {/if}

  {#if errorMessage}
    <p class="status error" role="alert">{errorMessage}</p>
  {/if}

  <div class="workspace">
    <div class="graph-stage" bind:this={stageElement}>
      <button
        class="provisional-toggle"
        class:active={includeProvisional}
        type="button"
        aria-pressed={includeProvisional}
        onclick={toggleProvisional}
      >
        {includeProvisional ? "Show reviewed only" : "Show exploratory paths"}
      </button>
      {#if loading}
        <p class="status">Loading the Blues network…</p>
      {/if}
      <svg
        bind:this={svgElement}
        role="group"
        aria-label={displayMode === "preview"
          ? "Featured interactive Blues network with arrows for directed claims and arrowless symmetric links."
          : "Interactive GraphRoots Blues relationship graph. Use Tab to reach selectable nodes."}
      ></svg>
      <p class="graph-hint">
        Drag nodes · Scroll to zoom · Tab and Enter to select
      </p>
      <div class="legend" aria-label="Graph legend">
        <span><i class="edge-key directed"></i>Directed</span>
        <span><i class="edge-key symmetric"></i>Symmetric</span>
        <span
          ><i class="edge-key provisional"></i>Provisional · under review</span
        >
        <span><i class="edge-key debated"></i>Debated</span>
      </div>
    </div>

    {#if selectedNode}
      <aside
        class="detail-panel"
        aria-live="polite"
        aria-labelledby="selected-entity-heading"
      >
        <button
          class="close"
          type="button"
          aria-label="Close selected entity panel"
          onclick={clearSelection}>×</button
        >
        <span
          class="entity-tag"
          style={`--group-color: ${groupColor(selectedNode.networkGroup)}`}
          >{selectedNode.networkGroup
            ? groupLabel(selectedNode.networkGroup)
            : selectedNode.entityType}</span
        >
        <h2 id="selected-entity-heading">{selectedNode.name}</h2>
        <p class="meta-line">
          {[selectedNode.dateDisplay, selectedNode.primaryRegion]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p>{selectedNode.summary}</p>
        <a class="full-record" href={entityPath(selectedNode)}
          >Open full record →</a
        >

        <h3>Network neighbourhood</h3>
        {#if selectedRelationships.length === 0}
          <p>No visible network relationships are available for this entity.</p>
        {:else}
          <ul class="neighbourhood">
            {#each selectedRelationships as edge (edge.id)}
              {@const incoming = edge.entityBId === selectedNode.id}
              {@const otherId = incoming ? edge.entityAId : edge.entityBId}
              {@const other = graph?.nodes.find((node) => node.id === otherId)}
              <li>
                <span
                  >{edge.orientation === "symmetric"
                    ? "Connected with"
                    : edge.orientation === "undetermined"
                      ? "Provisional connection"
                      : incoming
                        ? "Incoming from"
                        : "Outgoing to"}</span
                >
                <button type="button" onclick={() => other && focusNode(other)}
                  >{other?.name}</button
                >
                {#if edge.reviewStatus === "provisional"}
                  <small>Provisional path · Classification pending</small>
                  <details class="edge-note">
                    <summary>Why this path appears</summary>
                    <p>{edge.explanation}</p>
                  </details>
                {:else}
                  <small
                    >{relationshipLabels[edge.relationshipType]} · {evidenceLabels[
                      edge.evidenceCategory
                    ]}</small
                  >
                  <a href={withBase(`/relationships/${edge.slug}`)}
                    >Evidence record</a
                  >
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </aside>
    {/if}
  </div>

  {#if displayMode === "explorer"}
    <details class="table-alternative">
      <summary
        >Browse the graph as an accessible list ({visibleNodes.length} entities)</summary
      >
      <div class="table-wrap">
        <table>
          <thead
            ><tr
              ><th scope="col">Entity</th><th scope="col">Type</th><th
                scope="col">Region</th
              ><th scope="col">Visible connections</th></tr
            ></thead
          >
          <tbody>
            {#each visibleNodes as node (node.id)}
              <tr>
                <th scope="row"><a href={entityPath(node)}>{node.name}</a></th>
                <td>{node.entityType}</td>
                <td>{node.primaryRegion ?? "Not reviewed"}</td>
                <td>{node.connectionCount}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </details>
  {/if}
</div>

<style>
  .explorer-shell {
    min-width: 0;
  }

  .controls {
    display: grid;
    grid-template-columns:
      minmax(14rem, 1.5fr) repeat(3, minmax(9rem, 1fr))
      auto;
    gap: 0.65rem;
    align-items: end;
    border-block: 1px solid var(--color-border);
    padding: 0.85rem;
    background: var(--color-surface);
  }

  .controls label,
  .search > label,
  .group-filter legend {
    display: grid;
    gap: 0.35rem;
    color: var(--color-text-muted);
    font-family: var(--font-meta);
    font-size: 0.64rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .search div {
    display: grid;
    grid-template-columns: 1fr auto;
  }

  input,
  select,
  button {
    min-height: 2.65rem;
    border: 1px solid var(--color-border);
    border-radius: 0.15rem;
    padding: 0.55rem 0.7rem;
    background: var(--color-surface-raised);
    color: var(--color-text);
    font: inherit;
  }

  button {
    cursor: pointer;
    color: var(--color-gold);
    font-family: var(--font-meta);
    font-size: 0.7rem;
    text-transform: uppercase;
  }

  button:hover {
    border-color: var(--color-gold);
  }

  .group-filter {
    grid-column: 1 / -1;
    min-width: 0;
    margin: 0;
    border: 0;
    padding: 0;
  }

  .group-filter legend {
    margin-bottom: 0.35rem;
  }

  .group-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .chip {
    display: inline-flex;
    min-height: auto;
    align-items: center;
    gap: 6px;
    border-radius: 2px;
    padding: 6px 11px;
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-size: 11px;
    letter-spacing: 0.03em;
    text-transform: none;
    transition: opacity 150ms ease;
    user-select: none;
  }

  .chip.off {
    opacity: 0.35;
  }

  .chip .dot {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--group-color);
  }

  .workspace {
    position: relative;
    min-height: 68vh;
  }

  .preview .workspace,
  .preview .graph-stage {
    min-height: 66vh;
  }

  .preview svg {
    height: 66vh;
    min-height: 34rem;
  }

  .graph-stage {
    position: relative;
    min-height: 68vh;
    overflow: hidden;
    background: var(--color-bg);
  }

  .provisional-toggle {
    position: absolute;
    z-index: 2;
    top: 0.85rem;
    left: 0.85rem;
    min-height: 2.2rem;
    background: color-mix(in srgb, var(--color-surface) 92%, transparent);
    box-shadow: var(--shadow);
  }

  .provisional-toggle.active {
    border-color: #8f7754;
    color: var(--color-text);
  }

  svg {
    display: block;
    width: 100%;
    height: 68vh;
    min-height: 32rem;
    cursor: grab;
  }

  svg:active {
    cursor: grabbing;
  }

  :global(.graph-edge) {
    fill: none;
    stroke: var(--color-gold);
    stroke-width: 1.8;
    stroke-opacity: 0.88;
    transition: opacity 150ms ease;
  }

  :global(.graph-edge.is-provisional) {
    stroke: #8f7754;
    stroke-width: 1.35;
    stroke-opacity: 0.72;
  }

  :global(.graph-edge.is-symmetric) {
    stroke-width: 2;
  }

  :global(.graph-edge.is-debated) {
    stroke: var(--color-violet);
    stroke-width: 1.8;
    stroke-opacity: 0.9;
  }

  .preview :global(.graph-edge.is-provisional) {
    stroke-width: 1.5;
    stroke-opacity: 0.78;
  }

  .preview .graph-hint {
    color: var(--color-text-muted);
  }

  :global(.graph-edge.is-active) {
    stroke: var(--color-gold);
    stroke-opacity: 0.9;
  }

  :global(.graph-edge.is-dimmed) {
    opacity: 0.06;
  }

  :global(.graph-node) {
    cursor: pointer;
    transition: opacity 150ms ease;
  }

  :global(.graph-node circle) {
    stroke: #14100c;
    stroke-width: 1.5;
  }

  :global(.graph-node text) {
    fill: var(--color-text-muted);
    font-family: var(--font-meta);
    font-size: 10.5px;
    pointer-events: none;
  }

  :global(.graph-node:focus circle),
  :global(.graph-node.is-selected circle) {
    stroke: var(--color-gold);
    stroke-width: 3;
  }

  :global(.graph-node.is-lit text),
  :global(.graph-node.is-selected text) {
    fill: var(--color-text);
    font-weight: 500;
  }

  :global(.graph-node.is-dimmed) {
    opacity: 0.12;
  }

  .detail-panel {
    position: absolute;
    z-index: 3;
    top: 16px;
    right: 16px;
    width: min(300px, calc(100% - 32px));
    max-height: calc(100% - 32px);
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    padding: 18px 20px;
    background: var(--color-surface);
    box-shadow: var(--shadow);
  }

  .detail-panel h2 {
    margin: 0 2rem 2px 0;
    font-size: 26px;
    letter-spacing: 0.01em;
  }

  .detail-panel h3 {
    margin: 14px 0 6px;
    color: var(--color-gold);
    font-family: var(--font-meta);
    font-size: 10.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .close {
    position: absolute;
    top: 14px;
    right: 16px;
    min-width: 0;
    min-height: 0;
    border: 0;
    padding: 0;
    background: none;
    color: var(--color-text-muted);
    font-size: 18px;
    line-height: 1;
  }

  .entity-tag,
  .meta-line,
  .neighbourhood span,
  .neighbourhood small {
    color: var(--color-text-muted);
    font-family: var(--font-meta);
    font-size: 0.65rem;
    text-transform: uppercase;
  }

  .entity-tag {
    display: inline-block;
    margin-bottom: 10px;
    border: 1px solid color-mix(in srgb, var(--group-color) 33%, transparent);
    border-radius: 2px;
    padding: 3px 8px;
    background: color-mix(in srgb, var(--group-color) 13%, transparent);
    color: var(--group-color);
    font-size: 10px;
    letter-spacing: 0.1em;
  }

  .detail-panel > p:not(.meta-line) {
    margin: 0 0 14px;
    color: #d8cbb6;
    font-size: 13.5px;
    line-height: 1.55;
  }

  .meta-line {
    margin: 0 0 12px;
    font-size: 12px;
  }

  .full-record {
    font-family: var(--font-meta);
    font-size: 0.72rem;
    text-transform: uppercase;
  }

  .neighbourhood {
    display: grid;
    gap: 0.7rem;
    padding: 0;
    list-style: none;
  }

  .neighbourhood li {
    display: grid;
    gap: 0.2rem;
    border-bottom: 1px solid var(--color-border);
    padding: 5px 0;
  }

  .neighbourhood button {
    min-height: 0;
    border: 0;
    padding: 0;
    background: none;
    text-align: left;
  }

  .neighbourhood a {
    font-size: 0.78rem;
  }

  .edge-note summary {
    cursor: pointer;
    color: var(--color-gold);
    font-family: var(--font-meta);
    font-size: 0.68rem;
  }

  .edge-note p {
    margin: 0.35rem 0 0;
    color: #d8cbb6;
    font-size: 0.78rem;
    line-height: 1.45;
  }

  .graph-hint,
  .legend {
    position: absolute;
    z-index: 1;
    bottom: 0.8rem;
    margin: 0;
    color: #7d6b55;
    font-family: var(--font-meta);
    font-size: 0.64rem;
    pointer-events: none;
  }

  .graph-hint {
    left: 0.85rem;
  }

  .legend {
    right: 0.85rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.7rem;
  }

  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  .edge-key {
    position: relative;
    width: 1.3rem;
    border-top: 2px solid var(--color-gold);
  }

  .edge-key.directed::after {
    position: absolute;
    top: -4px;
    right: -1px;
    border-block: 3px solid transparent;
    border-left: 5px solid var(--color-gold);
    content: "";
  }

  .edge-key.symmetric {
    border-top-width: 3px;
  }

  .edge-key.provisional {
    border-color: #8f7754;
    border-top-style: dashed;
  }

  .edge-key.debated {
    border-color: var(--color-violet);
    border-top-style: dashed;
  }

  .status {
    margin: 0;
    padding: 0.7rem 1rem;
    background: var(--color-surface-raised);
    color: var(--color-text-muted);
    font-family: var(--font-meta);
  }

  .status.error {
    color: #f0a895;
  }

  .table-alternative {
    border-block: 1px solid var(--color-border);
    padding: 1rem;
    background: var(--color-surface);
  }

  .table-alternative summary {
    cursor: pointer;
    color: var(--color-gold);
    font-family: var(--font-meta);
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    margin-top: 1rem;
    border-collapse: collapse;
    text-align: left;
  }

  th,
  td {
    border-bottom: 1px solid var(--color-border);
    padding: 0.65rem;
  }

  thead th {
    color: var(--color-text-muted);
    font-family: var(--font-meta);
    font-size: 0.68rem;
    text-transform: uppercase;
  }

  tbody th {
    font-weight: 400;
  }

  @media (max-width: 75rem) {
    .controls {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 48rem) {
    .controls {
      grid-template-columns: 1fr 1fr;
    }

    .search {
      grid-column: 1 / -1;
    }

    .graph-hint,
    .legend {
      display: none;
    }
  }

  @media (max-width: 32rem) {
    .controls {
      grid-template-columns: 1fr;
    }

    .search {
      grid-column: auto;
    }
  }
</style>
