import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# Set the style for more professional looking charts
plt.style.use('ggplot')

# ==========================================
# 1. Platform Fragmentation (Bar Chart)
# ==========================================
def plot_fragmentation():
    # Data preparation
    categories = ['5+ Systems', '7–8 Systems', '9+ Systems']
    percentages = [79, 33, 19]

    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.bar(categories, percentages, color=['#e74c3c', '#c0392b', '#922b21'])

    # Add data labels on top of bars
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height}%',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', fontweight='bold')

    ax.set_ylabel('Percentage of Respondents')
    ax.set_title('Weekly Disparate System Management\n(Severe Platform Fragmentation)', fontweight='bold')
    ax.set_ylim(0, 100)
    plt.tight_layout()
    plt.savefig('fragmentation_bar_chart.png')
    plt.show()

# ==========================================
# 2. Daily Productivity Loss (Donut Chart)
# ==========================================
def plot_productivity_loss():
    # Data preparation
    # 71% spent 2+ hours. We infer the remaining 29% spent less than 2 hours.
    labels = ['spent 2+ hours daily\nswitching systems', 'spent <2 hours daily']
    sizes = [71, 29]
    colors = '#e67e22', '#ecf0f1'

    fig, ax = plt.subplots(figsize=(8, 8))
    
    # Create a pie chart
    wedges, texts, autotexts = ax.pie(sizes, labels=labels, autopct='%1.1f%%',
                                      startangle=90, colors=colors, wedgeprops=dict(width=0.4),
                                      textprops={'fontsize': 12})

    # Stylize percentages
    for autotext in autotexts:
        autotext.set_color('black')
        autotext.set_fontweight('bold')

    # Add center text
    plt.text(0, 0, "71%\nLost 2+ Hours\nDaily", ha='center', va='center', fontsize=14, fontweight='bold')

    ax.set_title('Daily Productivity Loss Due to Context-Switching', fontweight='bold')
    plt.tight_layout()
    plt.savefig('productivity_loss_donut.png')
    plt.show()

# ==========================================
# 3. User Experience Dissatisfaction (Stacked Bar)
# ==========================================
def plot_ux_dissatisfaction():
    # Data preparation
    categories = ['Satisfaction Rating (1-5)']
    dissatisfied = [65] # Ratings 1-2
    neutral = [100 - 65 - 12] # Calculated remainder (Ratings 3)
    satisfied = [12] # Ratings 4-5

    fig, ax = plt.subplots(figsize=(10, 4))

    # Create stacked bars
    ax.barh(categories, dissatisfied, color='#c0392b', label='Dissatisfied (1-2)')
    ax.barh(categories, neutral, left=dissatisfied, color='#bdc3c7', label='Neutral (3)')
    ax.barh(categories, satisfied, left=np.add(dissatisfied, neutral), color='#27ae60', label='Satisfied (4-5)')

    # Add data labels
    ax.text(dissatisfied[0]/2, 0, f'{dissatisfied[0]}%', ha='center', va='center', color='white', fontweight='bold', fontsize=14)
    ax.text(dissatisfied[0] + neutral[0]/2, 0, f'{neutral[0]}%', ha='center', va='center', color='black', fontsize=12)
    ax.text(dissatisfied[0] + neutral[0] + satisfied[0]/2, 0, f'{satisfied[0]}%', ha='center', va='center', color='white', fontweight='bold', fontsize=12)

    ax.set_xlim(0, 100)
    ax.set_title('Current Tools UI/UX Satisfaction Levels', fontweight='bold')
    ax.legend(loc='upper center', bbox_to_anchor=(0.5, -0.1), ncol=3)
    plt.tight_layout()
    plt.savefig('ux_dissatisfaction_stacked.png')
    plt.show()

# ==========================================
# 4. High-Priority Feature Demand (Horizontal Bar)
# ==========================================
def plot_feature_demand():
    # Data
    features = ['Unified Analytics', 'AI Recommendations', 'AI Dermatology Consultation', 'Live Shopping']
    demand_pct = [92, 90, 85, 81]

    # Sort data for better visualization
    df = pd.DataFrame({'Feature': features, 'Demand': demand_pct})
    df = df.sort_values('Demand', ascending=True)

    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.barh(df['Feature'], df['Demand'], color='#3498db')

    # Add labels to the end of the bars
    for bar in bars:
        width = bar.get_width()
        ax.text(width + 1, bar.get_y() + bar.get_height()/2, 
                f'{width}%', 
                ha='left', va='center', fontweight='bold', color='#2c3e50')

    ax.set_xlim(0, 110) # Give space for labels
    ax.set_xlabel('Percentage Rated 4-5 (Strong Demand)')
    ax.set_title('High-Priority Feature Demand', fontweight='bold')
    plt.tight_layout()
    plt.savefig('feature_demand_hbar.png')
    plt.show()

# ==========================================
# Run the functions to generate the images
# ==========================================
if __name__ == "__main__":
    print("Generating visualizations...")
    plot_fragmentation()
    plot_productivity_loss()
    plot_ux_dissatisfaction()
    plot_feature_demand()
    print("Visualizations generated and saved as PNG files in your working directory.")