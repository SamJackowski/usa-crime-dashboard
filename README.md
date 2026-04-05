# USA Crime Dashboard

An interactive geospatial dashboard for visualizing crime rates across the United States over time. This project combines p5.js and Leaflet.js to create a dynamic choropleth map with linked data exploration and trend visualization.

## Overview

This application allows users to explore historical crime data across all 50 U.S. states using an interactive map interface. Users can adjust the year, select different crime categories, and view both spatial patterns and temporal trends.  

The dashboard integrates map-based visualization with a linked chart, enabling deeper analysis of how crime rates vary by state and over time.  

## Features
### Interactive Choropleth Map  
Displays crime rates by state using color scaling based on data distribution.  
Time Slider  
Adjust the year (1960–2021) to dynamically update the map and data.  
### Crime Type Selection  
Dropdown menu to switch between multiple crime categories, including:  
Violent Crime Rate  
Property Crime Rate  
Murder, Robbery, Assault, and more  
### State Hover Interaction  
Hover over a state to view:  
State name  
Crime rate (per 100,000 people)  
### Linked Trend Chart  
Displays a line graph of crime trends for a selected state.  
### Alaska, Hawaii, and DC Insets  
Separate inset maps improve visibility and layout for non-contiguous regions.  
### Dynamic Legend  
Updates automatically based on selected data and classification breaks.  

## Tech Stack
p5.js (UI elements, chart rendering, interaction)  
Leaflet.js (interactive mapping)  
JavaScript (ES6)  
HTML / CSS  
GeoJSON (U.S. state boundaries)  
TSV dataset (crime data)  

## Project Structure  
Main HTML file that loads the map and scripts  
sketch.js — Core logic for map rendering, interaction, and data binding  
states.js — GeoJSON data for U.S. state boundaries  
crimebystate.tsv — Dataset containing crime rates by state and year  
style.css — Styling for UI elements and map overlays  
p5 and Leaflet libraries included via CDN  
