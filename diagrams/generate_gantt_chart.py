import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta
import pandas as pd

# Define project data
sprints = [
    # Sprint, Start Week, Duration (weeks), Phase, Focus Area
    (1, 1, 2, "Phase 1: Discovery & Planning", "Project Setup & Backend Foundation"),
    (2, 3, 2, "Phase 2: Foundation Development", "Authentication & Authorization"),
    (3, 5, 2, "Phase 2: Foundation Development", "Product Catalog Management"),
    (4, 7, 2, "Phase 2: Foundation Development", "E-Commerce Core (Backend)"),
    (5, 9, 2, "Phase 2: Foundation Development", "Order Management System"),
    (6, 11, 2, "Phase 3: Feature Development (Core)", "Web Customer UI"),
    (7, 13, 2, "Phase 3: Feature Development (Core)", "Web Admin UI"),
    (8, 15, 2, "Phase 3: Feature Development (Core)", "Analytics Dashboard"),
    (9, 17, 2, "Phase 3: Feature Development (Core)", "Financial Management"),
    (10, 19, 2, "Phase 3: Feature Development (Core)", "AI Chat Foundation"),
    (11, 21, 2, "Phase 3: Feature Development (Core)", "AI Chat Enhancement"),
    (12, 23, 2, "Phase 3: Feature Development (Core)", "Live Streaming Backend"),
    (13, 25, 2, "Phase 3: Feature Development (Core)", "Live Streaming Frontend"),
    (14, 27, 2, "Phase 4: Feature Development (Advanced)", "Skin Study (Backend & RAG)"),
    (15, 29, 2, "Phase 4: Feature Development (Advanced)", "Skin Study (Voice & Image)"),
    (16, 31, 2, "Phase 4: Feature Development (Advanced)", "Mobile App (Customer) - Core"),
    (17, 33, 2, "Phase 4: Feature Development (Advanced)", "Mobile App (Customer) - Skin Study"),
    (18, 35, 2, "Phase 4: Feature Development (Advanced)", "Mobile App (Admin)"),
    (19, 37, 2, "Phase 5: Integration & Finalization", "Email Marketing & Secondary Features"),
    (20, 39, 2, "Phase 5: Integration & Finalization", "Testing, Documentation & Deployment"),
]

# Milestones
milestones = [
    ("M1: Dev Environment Ready", 2),
    ("M2: Core Backend APIs Functional", 10),
    ("M3: Web Platform MVP Complete", 26),
    ("M4: Mobile Apps Deployed", 36),
    ("M5: Production Deployment", 40),
]

# Project start date: March 1, 2025
project_start = datetime(2025, 3, 1)

# Convert weeks to dates
def week_to_date(week_num):
    return project_start + timedelta(weeks=week_num - 1)

# Prepare data for plotting
sprint_data = []
for sprint_num, start_week, duration, phase, focus in sprints:
    start_date = week_to_date(start_week)
    end_date = start_date + timedelta(weeks=duration)
    sprint_data.append({
        'Sprint': f'Sprint {sprint_num}',
        'Start': start_date,
        'End': end_date,
        'Phase': phase,
        'Focus': focus
    })

df = pd.DataFrame(sprint_data)

# Create figure and axis
fig, ax = plt.subplots(figsize=(16, 10))

# Define colors for each phase
phase_colors = {
    "Phase 1: Discovery & Planning": "#FF6B6B",
    "Phase 2: Foundation Development": "#4ECDC4",
    "Phase 3: Feature Development (Core)": "#45B7D1",
    "Phase 4: Feature Development (Advanced)": "#FFA07A",
    "Phase 5: Integration & Finalization": "#98D8C8"
}

# Plot sprints
for idx, row in df.iterrows():
    start = mdates.date2num(row['Start'])
    end = mdates.date2num(row['End'])
    duration = end - start
    
    ax.barh(idx, duration, left=start, height=0.6, 
            color=phase_colors[row['Phase']], 
            edgecolor='black', linewidth=0.5,
            alpha=0.8)
    
    # Add sprint label
    mid_point = start + duration / 2
    ax.text(mid_point, idx, f"S{idx+1}", 
            ha='center', va='center', fontsize=8, fontweight='bold', color='white')

# Add milestones
for milestone_name, milestone_week in milestones:
    milestone_date = mdates.date2num(week_to_date(milestone_week))
    ax.axvline(x=milestone_date, color='red', linestyle='--', linewidth=2, alpha=0.7)
    ax.text(milestone_date, len(sprints) + 0.5, milestone_name, 
            rotation=45, ha='left', va='bottom', fontsize=9, fontweight='bold', color='red')

# Format x-axis
ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
ax.xaxis.set_major_locator(mdates.MonthLocator())
plt.xticks(rotation=45, ha='right')

# Set y-axis labels
ax.set_yticks(range(len(df)))
ax.set_yticklabels([f"{row['Sprint']}\n{row['Focus']}" for idx, row in df.iterrows()], 
                     fontsize=9)

# Set labels and title
ax.set_xlabel('Timeline (March - December 2025)', fontsize=12, fontweight='bold')
ax.set_ylabel('Sprints', fontsize=12, fontweight='bold')
ax.set_title('Wrencos Project Gantt Chart (10 Months, 20 Sprints)', 
             fontsize=16, fontweight='bold', pad=20)

# Add grid
ax.grid(axis='x', alpha=0.3, linestyle='--')

# Add legend for phases
from matplotlib.patches import Patch
legend_elements = [Patch(facecolor=color, edgecolor='black', label=phase) 
                   for phase, color in phase_colors.items()]
ax.legend(handles=legend_elements, loc='upper right', fontsize=9, 
          title='Project Phases', title_fontsize=10)

# Set x-axis limits
ax.set_xlim(mdates.date2num(project_start - timedelta(weeks=1)), 
            mdates.date2num(week_to_date(41)))

# Adjust layout
plt.tight_layout()

# Save the figure
plt.savefig('/Users/phamthanhtruc/Documents/uni/FYP-c1682/wrencos/report/gantt_chart.png', 
            dpi=300, bbox_inches='tight')
print("Gantt chart saved as 'gantt_chart.png'")

# Also create a high-resolution PDF version
plt.savefig('/Users/phamthanhtruc/Documents/uni/FYP-c1682/wrencos/report/gantt_chart.pdf', 
            format='pdf', bbox_inches='tight')
print("Gantt chart saved as 'gantt_chart.pdf'")

plt.show()
