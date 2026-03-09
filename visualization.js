/**
 * Unlimited Stacked Bar Chart for Looker Studio
 * Uses D3.js for rendering with support for unlimited series
 */

// Color palette generator for unlimited series
function generateColorPalette(count) {
  const colors = [];
  const baseColors = [
    "#4285F4",
    "#EA4335",
    "#FBBC04",
    "#34A853",
    "#FF6D01",
    "#46BDC6",
    "#7BAAF7",
    "#F07B72",
    "#FDD663",
    "#81C995",
    "#9334E6",
    "#E52592",
    "#039BE5",
    "#0F9D58",
    "#F4511E",
  ];

  // Use base colors first
  for (let i = 0; i < Math.min(count, baseColors.length); i++) {
    colors.push(baseColors[i]);
  }

  // Generate additional colors using HSL if needed
  if (count > baseColors.length) {
    const hueStep = 360 / (count - baseColors.length);
    for (let i = baseColors.length; i < count; i++) {
      const hue = (i - baseColors.length) * hueStep;
      const saturation = 60 + (i % 3) * 10;
      const lightness = 45 + (i % 4) * 5;
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
  }

  return colors;
}

// Configuration schema
const config = {
  data: [
    {
      id: "dimensions",
      label: "Dimension",
      elements: [
        {
          id: "category",
          label: "Category",
          type: "DIMENSION",
          options: {
            min: 1,
            max: 1,
          },
        },
      ],
    },
    {
      id: "metrics",
      label: "Metrics (Series)",
      elements: [
        {
          id: "values",
          label: "Values",
          type: "METRIC",
          options: {
            min: 1,
            max: 1000, // Support up to 1000 series
          },
        },
      ],
    },
  ],
  style: [
    {
      id: "orientation",
      label: "Orientation",
      elements: [
        {
          id: "chartOrientation",
          label: "Chart Orientation",
          type: "SELECT_SINGLE",
          options: [
            { label: "Vertical", value: "vertical" },
            { label: "Horizontal", value: "horizontal" },
          ],
          defaultValue: "vertical",
        },
      ],
    },
    {
      id: "colors",
      label: "Colors",
      elements: [
        {
          id: "colorScheme",
          label: "Color Scheme",
          type: "SELECT_SINGLE",
          options: [
            { label: "Auto (Generated)", value: "auto" },
            { label: "Custom", value: "custom" },
          ],
          defaultValue: "auto",
        },
      ],
    },
    {
      id: "axes",
      label: "Axes",
      elements: [
        {
          id: "showAxisLabels",
          label: "Show Axis Labels",
          type: "CHECKBOX",
          defaultValue: true,
        },
        {
          id: "axisLabelFontSize",
          label: "Axis Label Font Size",
          type: "FONT_SIZE",
          defaultValue: "12px",
        },
      ],
    },
    {
      id: "legend",
      label: "Legend",
      elements: [
        {
          id: "showLegend",
          label: "Show Legend",
          type: "CHECKBOX",
          defaultValue: true,
        },
        {
          id: "legendPosition",
          label: "Legend Position",
          type: "SELECT_SINGLE",
          options: [
            { label: "Right", value: "right" },
            { label: "Bottom", value: "bottom" },
            { label: "Top", value: "top" },
          ],
          defaultValue: "right",
        },
        {
          id: "legendMaxHeight",
          label: "Legend Max Height (px)",
          type: "TEXTINPUT",
          defaultValue: "300",
        },
      ],
    },
    {
      id: "chart",
      label: "Chart",
      elements: [
        {
          id: "barPadding",
          label: "Bar Padding",
          type: "SLIDER",
          defaultValue: 0.1,
          options: {
            min: 0,
            max: 0.5,
            step: 0.05,
          },
        },
        {
          id: "showValues",
          label: "Show Values on Bars",
          type: "CHECKBOX",
          defaultValue: false,
        },
      ],
    },
  ],
  interactions: [
    {
      id: "tooltip",
      label: "Enable Tooltip",
      type: "CHECKBOX",
      value: true,
      supportedActions: ["FILTER"],
    },
  ],
};

// Main draw function
function drawViz(data) {
  // Clear existing visualization
  const container = document.getElementById("container");
  container.innerHTML = "";

  // Get style configuration
  const styleConfig = data.style;
  const orientation = styleConfig.chartOrientation || "vertical";
  const showLegend = styleConfig.showLegend !== false;
  const legendPosition = styleConfig.legendPosition || "right";
  const showAxisLabels = styleConfig.showAxisLabels !== false;
  const barPadding = parseFloat(styleConfig.barPadding) || 0.1;
  const showValues = styleConfig.showValues || false;
  const legendMaxHeight = parseInt(styleConfig.legendMaxHeight) || 300;

  // Parse data
  const fields = data.fields;
  const rows = data.tables.DEFAULT;

  if (!rows || rows.length === 0) {
    container.innerHTML =
      '<div style="padding: 20px; text-align: center;">No data available</div>';
    return;
  }

  // Get dimension and metrics
  const dimensionId = fields.category[0].id;
  const metricIds = fields.values.map((m) => m.id);
  const metricNames = fields.values.map((m) => m.name);

  // Transform data
  const categories = [];
  const seriesData = {};

  // Initialize series
  metricNames.forEach((name) => {
    seriesData[name] = [];
  });

  rows.forEach((row) => {
    const category = row[dimensionId];
    categories.push(category);

    metricIds.forEach((metricId, idx) => {
      const value = parseFloat(row[metricId]) || 0;
      seriesData[metricNames[idx]].push(value);
    });
  });

  // Generate colors
  const colors = generateColorPalette(metricNames.length);

  // Set up dimensions
  const margin = {
    top: 20,
    right: showLegend && legendPosition === "right" ? 200 : 20,
    bottom: 60,
    left: 80,
  };
  const width = container.offsetWidth - margin.left - margin.right;
  const height =
    container.offsetHeight -
    margin.top -
    margin.bottom -
    (showLegend && legendPosition === "bottom" ? 100 : 0);

  // Create SVG
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", container.offsetWidth)
    .attr("height", container.offsetHeight);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Prepare stacked data
  const stackedData = d3.stack().keys(metricNames)(
    categories.map((cat, i) => {
      const obj = { category: cat };
      metricNames.forEach((name) => {
        obj[name] = seriesData[name][i];
      });
      return obj;
    }),
  );

  // Create scales
  let xScale, yScale;

  if (orientation === "vertical") {
    xScale = d3
      .scaleBand()
      .domain(categories)
      .range([0, width])
      .padding(barPadding);

    const maxValue = d3.max(stackedData[stackedData.length - 1], (d) => d[1]);
    yScale = d3.scaleLinear().domain([0, maxValue]).range([height, 0]).nice();
  } else {
    const maxValue = d3.max(stackedData[stackedData.length - 1], (d) => d[1]);
    xScale = d3.scaleLinear().domain([0, maxValue]).range([0, width]).nice();

    yScale = d3
      .scaleBand()
      .domain(categories)
      .range([0, height])
      .padding(barPadding);
  }

  // Draw bars
  const series = g
    .selectAll(".series")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("class", "series")
    .attr("fill", (d, i) => colors[i]);

  if (orientation === "vertical") {
    series
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.data.category))
      .attr("y", (d) => yScale(d[1]))
      .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("class", "bar")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 0.8);
        showTooltip(event, d, this.parentNode.__data__.key);
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 1);
        hideTooltip();
      });
  } else {
    series
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("y", (d) => yScale(d.data.category))
      .attr("x", (d) => xScale(d[0]))
      .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
      .attr("height", yScale.bandwidth())
      .attr("class", "bar")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 0.8);
        showTooltip(event, d, this.parentNode.__data__.key);
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 1);
        hideTooltip();
      });
  }

  // Add axes
  if (showAxisLabels) {
    if (orientation === "vertical") {
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", styleConfig.axisLabelFontSize || "12px");

      g.append("g")
        .call(d3.axisLeft(yScale))
        .style("font-size", styleConfig.axisLabelFontSize || "12px");
    } else {
      g.append("g")
        .call(d3.axisLeft(yScale))
        .style("font-size", styleConfig.axisLabelFontSize || "12px");

      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .style("font-size", styleConfig.axisLabelFontSize || "12px");
    }
  }

  // Add legend
  if (showLegend) {
    addLegend(
      svg,
      metricNames,
      colors,
      legendPosition,
      container.offsetWidth,
      container.offsetHeight,
      legendMaxHeight,
    );
  }

  // Tooltip functions
  function showTooltip(event, d, seriesName) {
    const tooltip = d3.select("#tooltip");
    if (tooltip.empty()) {
      d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.8)")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000");
    }

    const value = d[1] - d[0];
    const total = d.data[seriesName];

    d3
      .select("#tooltip")
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 10 + "px")
      .style("display", "block").html(`
        <strong>${d.data.category}</strong><br/>
        ${seriesName}: ${value.toLocaleString()}<br/>
        Total: ${total.toLocaleString()}
      `);
  }

  function hideTooltip() {
    d3.select("#tooltip").style("display", "none");
  }
}

// Add legend function
function addLegend(svg, names, colors, position, width, height, maxHeight) {
  const legendItemHeight = 20;
  const legendItemWidth = 180;

  let legendX, legendY, legendWidth, legendHeight;

  if (position === "right") {
    legendX = width - 180;
    legendY = 20;
    legendWidth = 180;
    legendHeight = Math.min(names.length * legendItemHeight, maxHeight);
  } else if (position === "bottom") {
    legendX = 80;
    legendY = height - 80;
    legendWidth = width - 160;
    legendHeight = 80;
  } else {
    legendX = 80;
    legendY = 10;
    legendWidth = width - 160;
    legendHeight = 60;
  }

  const legendGroup = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${legendX},${legendY})`);

  // Add scrollable container if needed
  if (names.length * legendItemHeight > maxHeight && position === "right") {
    legendGroup
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1);

    const clipId = "legend-clip-" + Math.random().toString(36).substr(2, 9);
    legendGroup
      .append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("width", legendWidth - 10)
      .attr("height", legendHeight);

    const scrollableGroup = legendGroup
      .append("g")
      .attr("clip-path", `url(#${clipId})`);

    names.forEach((name, i) => {
      const item = scrollableGroup
        .append("g")
        .attr("transform", `translate(5,${i * legendItemHeight + 5})`);

      item
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colors[i]);

      item
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(name.length > 20 ? name.substring(0, 20) + "..." : name)
        .style("font-size", "11px")
        .attr("title", name);
    });
  } else {
    // Regular legend
    const itemsPerRow =
      position === "right" ? 1 : Math.floor(legendWidth / legendItemWidth);

    names.forEach((name, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;

      const item = legendGroup
        .append("g")
        .attr(
          "transform",
          `translate(${col * legendItemWidth},${row * legendItemHeight})`,
        );

      item
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colors[i]);

      item
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(name.length > 20 ? name.substring(0, 20) + "..." : name)
        .style("font-size", "11px")
        .attr("title", name);
    });
  }
}

// Subscribe to data changes
dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });

// Export config for Looker Studio
window.componentConfig = config;
