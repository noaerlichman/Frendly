import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { authService } from '../utils/api';

const GroupStats = ({ groupId, isAdmin }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const svgRef = useRef();
  const hourlySvgRef = useRef();

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '20px',
      color: '#1c1e21'
    },
    loading: {
      textAlign: 'center',
      padding: '20px',
      color: '#65676b'
    },
    error: {
      color: '#dc3545',
      textAlign: 'center',
      padding: '20px'
    },
    chartContainer: {
      marginBottom: '40px'
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get userId from token
        const token = authService.getToken();
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const { user_id } = JSON.parse(jsonPayload);

        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/${groupId}/stats?userId=${user_id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch group statistics');
        }

        const data = await response.json();
        console.log('Received stats data:', data.stats);
        setStats(data.stats);
      } catch (err) {
        console.error('Error fetching group stats:', err);
        setError('Failed to load group statistics');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [groupId, isAdmin]);

  useEffect(() => {
    if (!stats || !svgRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 60, right: 20, bottom: 100, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 20);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
      .domain(stats.memberActivity.map(d => d.memberName))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stats.memberActivity, d => d.postCount)])
      .range([height, 0])
      .nice();

    // Add X axis with adjusted label positioning
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .style('font-size', '12px');

    // Add Y axis with consistent integer ticks
    const maxCount = d3.max(stats.memberActivity, d => d.postCount);
    const tickCount = maxCount + 1;
    g.append('g')
      .call(d3.axisLeft(y)
        .ticks(tickCount)
        .tickFormat(d3.format('d'))
        .tickValues(d3.range(0, maxCount + 1)));

    // Add bars
    g.selectAll('rect')
      .data(stats.memberActivity)
      .enter()
      .append('rect')
      .attr('x', d => x(d.memberName))
      .attr('y', d => y(d.postCount))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.postCount))
      .attr('fill', '#1877f2')
      .attr('rx', 4)
      .attr('ry', 4);

    // Add value labels
    g.selectAll('.value-label')
      .data(stats.memberActivity)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => x(d.memberName) + x.bandwidth() / 2)
      .attr('y', d => y(d.postCount) - 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(d => d.postCount);

    // Add title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Member Post Activity');

  }, [stats]);

  // New useEffect for hourly activity line chart
  useEffect(() => {
    if (!stats || !hourlySvgRef.current || !stats.hourlyActivity) return;

    // Clear previous SVG content
    d3.select(hourlySvgRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 60, right: 20, bottom: 100, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(hourlySvgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 20);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
      .domain(stats.hourlyActivity.map(d => d.label))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stats.hourlyActivity, d => d.count)])
      .range([height, 0])
      .nice();

    // Create line generator
    const line = d3.line()
      .x(d => x(d.label) + x.bandwidth() / 2)
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .style('font-size', '12px');

    // Add Y axis with consistent integer ticks
    const maxCount = d3.max(stats.hourlyActivity, d => d.count);
    const tickCount = maxCount + 1;
    g.append('g')
      .call(d3.axisLeft(y)
        .ticks(tickCount)
        .tickFormat(d3.format('d'))
        .tickValues(d3.range(0, maxCount + 1)));

    // Add the line path
    g.append('path')
      .datum(stats.hourlyActivity)
      .attr('fill', 'none')
      .attr('stroke', '#1877f2')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    g.selectAll('.dot')
      .data(stats.hourlyActivity)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.label) + x.bandwidth() / 2)
      .attr('cy', d => y(d.count))
      .attr('r', 4)
      .attr('fill', '#1877f2');

    // Add value labels
    g.selectAll('.value-label')
      .data(stats.hourlyActivity)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(d => d.count);

    // Add title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Most Active Hours');

  }, [stats]);

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return <div style={styles.loading}>Loading statistics...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Group Statistics</h2>
      <div style={styles.chartContainer}>
        <svg ref={svgRef}></svg>
      </div>
      {stats.hourlyActivity && (
        <div style={styles.chartContainer}>
          <svg ref={hourlySvgRef}></svg>
        </div>
      )}
    </div>
  );
};

export default GroupStats; 