/**
 * @file JobMetricsChart.jsx
 * @description Reusable chart component for visualizing job performance metrics using Recharts
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 2025-01-22
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-01-22
 */

import { useState, useMemo } from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    RadialBarChart,
    RadialBar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import {
    BarChart3,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
    Activity,
    TrendingUp,
    TrendingDown,
    Minus
} from "lucide-react";
import PropTypes from "prop-types";
import styles from "./JobMetricsChart.module.css";

/**
 * Custom tooltip component for chart data points
 * @param {Object} props - Tooltip props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Tooltip data payload
 * @param {string} props.label - Tooltip label
 * @returns {JSX.Element|null} The rendered tooltip or null
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    return (
        <div className={styles.customTooltip}>
            <p className={styles.tooltipLabel}>{label}</p>
            {payload.map((entry, index) => (
                <p
                    key={`item-${index}`}
                    className={styles.tooltipItem}
                    style={{ color: entry.color }}
                >
                    {`${entry.name}: ${entry.value}`}
                    {entry.payload.percentage && ` (${entry.payload.percentage.toFixed(1)}%)`}
                </p>
            ))}
        </div>
    );
};

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.string
};

/**
 * Custom legend component for consistent styling
 * @param {Object} props - Legend props
 * @param {Array} props.payload - Legend data payload
 * @param {function} props.onClick - Legend item click handler
 * @returns {JSX.Element} The rendered legend
 */
const CustomLegend = ({ payload, onClick }) => {
    if (!payload) {
        return null;
    }

    return (
        <div className={styles.customLegend}>
            {payload.map((entry, index) => (
                <div
                    key={`legend-${index}`}
                    className={styles.legendItem}
                    onClick={() => onClick && onClick(entry)}
                >
                    <span
                        className={styles.legendColor}
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className={styles.legendText}>{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

CustomLegend.propTypes = {
    payload: PropTypes.array,
    onClick: PropTypes.func
};

/**
 * Reusable Job Metrics Chart Component using Recharts
 * @param {Object} props - Component props
 * @param {string} props.type - Chart type: 'bar', 'line', 'pie', 'radial'
 * @param {Array} props.data - Chart data array
 * @param {Object} props.config - Chart configuration options
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Chart subtitle
 * @param {boolean} props.showLegend - Whether to show legend
 * @param {boolean} props.showTooltip - Whether to show tooltip on hover
 * @param {function} props.onDataPointClick - Callback for data point click
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} The rendered chart component
 */
const JobMetricsChart = ({
    type = "bar",
    data = [],
    config = {},
    title = "",
    subtitle = "",
    showLegend = true,
    showTooltip = true,
    onDataPointClick,
    loading = false
}) => {
    const [activeIndex, setActiveIndex] = useState(null);

    /**
     * Gets computed color values from CSS variables
     * Recharts doesn't resolve CSS variables, so we need to get the actual computed colors
     * @param {string} cssVar - CSS variable name (e.g., 'var(--chart-1)' or '--chart-1')
     * @returns {string} Computed color value
     */
    const getComputedColor = (cssVar) => {
        // Extract variable name from var() syntax if present
        const varName = cssVar.replace(/var\((.*?)\)/, '$1').trim();

        // Get computed style from document root
        const computedColor = getComputedStyle(document.documentElement)
            .getPropertyValue(varName)
            .trim();

        return computedColor || cssVar;
    };

    /**
     * Merges default configuration with user-provided configuration
     * @returns {Object} Merged configuration object
     */
    const mergedConfig = useMemo(() => {
        const defaultConfig = {
            colors: [
                "var(--color-chart-1)",
                "var(--color-chart-2)",
                "var(--color-chart-3)",
                "var(--color-chart-4)",
                "var(--color-chart-5)"
            ],
            bar: {
                barSize: 40,
                barGap: 4,
                radius: [4, 4, 0, 0]
            },
            line: {
                strokeWidth: 3,
                dotSize: 6,
                strokeDasharray: "0"
            },
            pie: {
                innerRadius: 0,
                outerRadius: "80%",
                paddingAngle: 2
            },
            radial: {
                innerRadius: "10%",
                outerRadius: "80%",
                startAngle: 180,
                endAngle: 0
            },
            margin: { top: 20, right: 30, left: 20, bottom: 40 }
        };

        // Resolve CSS variable colors to actual values
        const resolvedColors = (config.colors || defaultConfig.colors).map(color =>
            color.startsWith('var(') ? getComputedColor(color) : color
        );

        return {
            ...defaultConfig,
            ...config,
            colors: resolvedColors,
            [type]: {
                ...defaultConfig[type],
                ...(config[type] || {})
            }
        };
    }, [type, config]);

    /**
     * Processes chart data for different chart types
     * @returns {Array} Processed chart data
     */
    const processedData = useMemo(() => {
        if (!data || data.length === 0) {
            return [];
        }

        // For pie/radial charts, calculate percentages
        if (type === "pie" || type === "radial") {
            const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
            return data.map((item, index) => ({
                ...item,
                percentage: total > 0 ? ((item.value || 0) / total) * 100 : 0,
                color: mergedConfig.colors[index % mergedConfig.colors.length]
            }));
        }

        // For bar/line charts, add color mapping
        return data.map((item, index) => ({
            ...item,
            color: mergedConfig.colors[index % mergedConfig.colors.length]
        }));
    }, [data, type, mergedConfig.colors]);

    /**
     * Gets chart icon based on chart type
     * @returns {JSX.Element} Chart icon component
     */
    const getChartIcon = () => {
        const iconProps = { size: 20 };
        switch (type) {
            case "bar":
                return <BarChart3 {...iconProps} />;
            case "line":
                return <LineChartIcon {...iconProps} />;
            case "pie":
                return <PieChartIcon {...iconProps} />;
            case "radial":
                return <Activity {...iconProps} />;
            default:
                return <BarChart3 {...iconProps} />;
        }
    };

    /**
     * Gets trend icon based on trend value
     * @param {number} trend - Trend value
     * @returns {JSX.Element} Trend icon component
     */
    const getTrendIcon = (trend) => {
        const iconProps = { size: 16 };
        if (trend > 0) return <TrendingUp {...iconProps} className={styles.trendUp} />;
        if (trend < 0) return <TrendingDown {...iconProps} className={styles.trendDown} />;
        return <Minus {...iconProps} className={styles.trendNeutral} />;
    };

    /**
     * Handles pie chart sector mouse events
     * @param {Object} _ - Event data (unused)
     * @param {number} index - Index of the hovered sector
     */
    const handlePieMouseEnter = (_, index) => {
        setActiveIndex(index);
    };

    /**
     * Handles pie chart sector mouse leave
     */
    const handlePieMouseLeave = () => {
        setActiveIndex(null);
    };

    /**
     * Handles data point click events
     * @param {Object} data - Clicked data point
     * @param {number} index - Index of clicked data point
     */
    const handleClick = (data, index) => {
        if (onDataPointClick) {
            onDataPointClick(data, index);
        }
    };

    /**
     * Renders bar chart using Recharts
     * @returns {JSX.Element} Bar chart component
     */
    const renderBarChart = () => (
        <BarChart
            data={processedData}
            margin={mergedConfig.margin}
            onClick={handleClick}
        >
            <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
            />
            <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
            />
            {showTooltip && (
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                />
            )}
            <Bar
                dataKey="value"
                radius={mergedConfig.bar.radius}
                barSize={mergedConfig.bar.barSize}
                className={styles.bar}
            >
                {processedData.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={entry.color || mergedConfig.colors[index % mergedConfig.colors.length]}
                    />
                ))}
            </Bar>
        </BarChart>
    );

    /**
     * Renders line chart using Recharts
     * @returns {JSX.Element} Line chart component
     */
    const renderLineChart = () => (
        <LineChart
            data={processedData}
            margin={mergedConfig.margin}
            onClick={handleClick}
        >
            <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
            />
            <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
            />
            {showTooltip && (
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                />
            )}
            <Line
                type="monotone"
                dataKey="value"
                stroke={mergedConfig.colors[0]}
                strokeWidth={mergedConfig.line.strokeWidth}
                strokeDasharray={mergedConfig.line.strokeDasharray}
                dot={{ r: mergedConfig.line.dotSize, fill: "var(--background)" }}
                activeDot={{ r: 8 }}
                className={styles.line}
            />
        </LineChart>
    );

    /**
     * Renders pie chart using Recharts
     * @returns {JSX.Element} Pie chart component
     */
    const renderPieChart = () => {
        const renderLabel = (entry) => `${entry.name}: ${entry.value}`;

        return (
            <PieChart margin={mergedConfig.margin}>
                <Pie
                    data={processedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={mergedConfig.pie.outerRadius}
                    innerRadius={mergedConfig.pie.innerRadius}
                    paddingAngle={mergedConfig.pie.paddingAngle}
                    dataKey="value"
                    onClick={handleClick}
                    onMouseEnter={handlePieMouseEnter}
                    onMouseLeave={handlePieMouseLeave}
                    activeIndex={activeIndex}
                    className={styles.pie}
                >
                    {processedData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.color || mergedConfig.colors[index % mergedConfig.colors.length]}
                            stroke="var(--background)"
                            strokeWidth={2}
                            className={styles.cell}
                        />
                    ))}
                </Pie>
                {showTooltip && <Tooltip content={<CustomTooltip />} />}
            </PieChart>
        );
    };

    /**
     * Renders radial chart using Recharts
     * @returns {JSX.Element} Radial chart component
     */
    const renderRadialChart = () => (
        <RadialBarChart
            data={processedData}
            cx="50%"
            cy="50%"
            innerRadius={mergedConfig.radial.innerRadius}
            outerRadius={mergedConfig.radial.outerRadius}
            startAngle={mergedConfig.radial.startAngle}
            endAngle={mergedConfig.radial.endAngle}
            margin={mergedConfig.margin}
            onClick={handleClick}
        >
            <RadialBar
                label={{ fill: "var(--foreground)", position: "insideStart" }}
                background={{ fill: "var(--muted)" }}
                dataKey="value"
                className={styles.radialBar}
            >
                {processedData.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={entry.color || mergedConfig.colors[index % mergedConfig.colors.length]}
                        stroke="var(--background)"
                        strokeWidth={2}
                    />
                ))}
            </RadialBar>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
        </RadialBarChart>
    );

    /**
     * Renders chart based on type
     * @returns {JSX.Element} Chart component
     */
    const renderChart = () => {
        switch (type) {
            case "bar":
                return renderBarChart();
            case "line":
                return renderLineChart();
            case "pie":
                return renderPieChart();
            case "radial":
                return renderRadialChart();
            default:
                return renderBarChart();
        }
    };

    /**
     * Renders legend component
     * @returns {JSX.Element|null} Legend component or null
     */
    const renderLegend = () => {
        if (!showLegend || processedData.length === 0) {
            return null;
        }

        return (
            <div className={styles.legendContainer}>
                {processedData.map((item, index) => (
                    <div
                        key={index}
                        className={styles.legendItem}
                        onClick={() => handleClick(item, index)}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        <div
                            className={styles.legendColor}
                            style={{
                                backgroundColor: item.color || mergedConfig.colors[index % mergedConfig.colors.length]
                            }}
                        />
                        <span className={styles.legendLabel}>
                            {item.name || `Item ${index + 1}`}
                        </span>
                        <span className={styles.legendValue}>
                            {item.value}
                            {item.trend && getTrendIcon(item.trend)}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    /**
     * Calculates chart statistics
     * @returns {Object} Chart statistics object
     */
    const chartStats = useMemo(() => {
        if (processedData.length === 0) {
            return { total: 0, average: 0, max: 0, min: 0 };
        }

        const values = processedData.map((item) => item.value || 0);
        const total = values.reduce((sum, value) => sum + value, 0);
        const average = values.length > 0 ? total / values.length : 0;
        const max = Math.max(...values);
        const min = Math.min(...values);

        return { total, average, max, min };
    }, [processedData]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading chart data...</p>
            </div>
        );
    }

    if (processedData.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <div className={styles.emptyIcon}>
                    {getChartIcon()}
                </div>
                <h4>No data available</h4>
                <p>Chart data will appear here once available</p>
            </div>
        );
    }

    return (
        <div className={`${styles.jobMetricsChart} ${styles[`type-${type}`]}`}>
            {/* Chart Header */}
            {(title || subtitle) && (
                <div className={styles.chartHeader}>
                    {title && <h3 className={styles.chartTitle}>{title}</h3>}
                    {subtitle && <p className={styles.chartSubtitle}>{subtitle}</p>}
                </div>
            )}

            {/* Chart Body */}
            <div className={styles.chartBody}>
                <div className={styles.chartVisualization}>
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                        {renderChart()}
                    </ResponsiveContainer>
                </div>
                {renderLegend()}
            </div>

            {/* Chart Footer */}
            <div className={styles.chartFooter}>
                <div className={styles.chartStats}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Data Points:</span>
                        <span className={styles.statValue}>{processedData.length}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total:</span>
                        <span className={styles.statValue}>{chartStats.total.toFixed(1)}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Average:</span>
                        <span className={styles.statValue}>{chartStats.average.toFixed(1)}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Range:</span>
                        <span className={styles.statValue}>
                            {chartStats.min.toFixed(1)} - {chartStats.max.toFixed(1)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Prop validation using PropTypes
JobMetricsChart.propTypes = {
    type: PropTypes.oneOf(["bar", "line", "pie", "radial"]),
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            trend: PropTypes.number,
            color: PropTypes.string
        })
    ),
    config: PropTypes.object,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    showLegend: PropTypes.bool,
    showTooltip: PropTypes.bool,
    onDataPointClick: PropTypes.func,
    loading: PropTypes.bool
};

// Default props
JobMetricsChart.defaultProps = {
    type: "bar",
    data: [],
    config: {},
    title: "",
    subtitle: "",
    showLegend: true,
    showTooltip: true,
    loading: false
};

export default JobMetricsChart;