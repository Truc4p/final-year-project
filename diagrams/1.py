import xml.etree.ElementTree as ET
from xml.dom import minidom

def create_drawio_xml():
    # Root element definitions for Draw.io
    mxfile = ET.Element('mxfile', host="Electron", modified="2024-01-01T00:00:00.000Z", agent="5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) draw.io/21.0.0 Chrome/112.0.0.0 Electron/24.0.0 Safari/537.36", etag="abcdef", version="21.0.0", type="device")
    diagram = ET.SubElement(mxfile, 'diagram', id="C4_Container_Diagram", name="Container Diagram")
    mxGraphModel = ET.SubElement(diagram, 'mxGraphModel', dx="1422", dy="794", grid="1", gridSize="10", guides="1", tooltips="1", connect="1", arrows="1", fold="1", page="1", pageScale="1", pageWidth="1169", pageHeight="827", math="0", shadow="0")
    root = ET.SubElement(mxGraphModel, 'root')

    # Default Layers
    ET.SubElement(root, 'mxCell', id="0")
    ET.SubElement(root, 'mxCell', id="1", parent="0")

    # --- STYLES ---
    # Standard Container (Blue Box) - Web App, API
    style_container = "html=1;dashed=0;whitespace=wrap;fillColor=#438DD5;strokeColor=#3C7FC0;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;metaEdit=1;resizable=0;"
    
    # Database (Blue Cylinder) - Explicitly using cylinder3 shape to guarantee cylinder look
    style_db = "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#438DD5;strokeColor=#3C7FC0;fontColor=#ffffff;align=center;metaEdit=1;resizable=0;"
    
    # Mobile App (Rounded Box to mimic device)
    style_mobile = "shape=rect;rounded=1;arcSize=10;html=1;dashed=0;whitespace=wrap;fillColor=#438DD5;strokeColor=#3C7FC0;fontColor=#ffffff;align=center;metaEdit=1;resizable=0;"
    
    # SPA (Browser Window look) - Using a simple container for compatibility, but ensuring specific label
    style_spa = "html=1;dashed=0;whitespace=wrap;fillColor=#438DD5;strokeColor=#3C7FC0;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;metaEdit=1;resizable=0;"

    # External System (Grey)
    style_ext_system = "html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;"
    
    # Person (Dark Blue)
    style_person = "html=1;dashed=0;whitespace=wrap;fillColor=#08427b;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.person;align=center;metaEdit=1;resizable=0;"
    
    # Boundary (Dashed Box)
    style_boundary = "html=1;dashed=1;whitespace=wrap;fillColor=none;strokeColor=#444444;strokeWidth=2;shape=mxgraph.group;align=left;verticalAlign=bottom;fontColor=#000000;fontSize=12;"
    
    # Edge Style
    style_edge = "endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;fontSize=10;"

    # --- NODES ---

    # 1. Customer (Top Center)
    customer_val = "<b>Personal Banking Customer</b><br>[Person]<br><br>A customer of the bank, with<br>personal bank accounts."
    customer = ET.SubElement(root, 'mxCell', id="customer", value=customer_val, style=style_person, parent="1", vertex="1")
    ET.SubElement(customer, 'mxGeometry', {'as': 'geometry'}, x="450", y="20", width="200", height="180")

    # 2. System Boundary
    boundary = ET.SubElement(root, 'mxCell', id="boundary", value="<b>Internet Banking System</b><br>[Software System]", style=style_boundary, parent="1", vertex="1")
    ET.SubElement(boundary, 'mxGeometry', {'as': 'geometry'}, x="40", y="260", width="680", height="500")

    # --- INSIDE BOUNDARY ---

    # 3. Web Application
    webapp_val = "<b>Web Application</b><br>[Container: Java and Spring MVC]<br><br>Delivers the static content and the<br>Internet banking single page<br>application."
    webapp = ET.SubElement(root, 'mxCell', id="webapp", value=webapp_val, style=style_container, parent="boundary", vertex="1")
    ET.SubElement(webapp, 'mxGeometry', {'as': 'geometry'}, x="20", y="40", width="180", height="150")

    # 4. Single-Page Application (Updated Text)
    spa_val = "<b>Single-Page Application</b><br>[Container: JavaScript and Angular]<br><br>Provides all of the Internet banking<br>functionality to customers via their<br>web browser."
    spa = ET.SubElement(root, 'mxCell', id="spa", value=spa_val, style=style_spa, parent="boundary", vertex="1")
    ET.SubElement(spa, 'mxGeometry', {'as': 'geometry'}, x="240", y="40", width="180", height="150")

    # 5. Mobile App (Updated Text & Style)
    mobile_val = "<b>Mobile App</b><br>[Container: Xamarin]<br><br>Provides a limited subset of the<br>Internet banking functionality to<br>customers via their mobile device."
    mobile = ET.SubElement(root, 'mxCell', id="mobile", value=mobile_val, style=style_mobile, parent="boundary", vertex="1")
    ET.SubElement(mobile, 'mxGeometry', {'as': 'geometry'}, x="460", y="40", width="180", height="150")

    # 6. Database (Updated Text & Style)
    db_val = "<b>Database</b><br>[Container: Relational Database Schema]<br><br>Stores user registration information,<br>hashed authentication credentials,<br>access logs, etc."
    db = ET.SubElement(root, 'mxCell', id="db", value=db_val, style=style_db, parent="boundary", vertex="1")
    ET.SubElement(db, 'mxGeometry', {'as': 'geometry'}, x="20", y="300", width="180", height="160")

    # 7. API Application
    api_val = "<b>API Application</b><br>[Container: Java and Spring MVC]<br><br>Provides Internet banking<br>functionality via a JSON/HTTPS API."
    api = ET.SubElement(root, 'mxCell', id="api", value=api_val, style=style_container, parent="boundary", vertex="1")
    ET.SubElement(api, 'mxGeometry', {'as': 'geometry'}, x="340", y="300", width="180", height="150")

    # --- EXTERNAL SYSTEMS ---

    # 8. E-mail System
    email_val = "<b>E-mail System</b><br>[Software System]<br><br>The internal Microsoft Exchange<br>e-mail system."
    email = ET.SubElement(root, 'mxCell', id="email", value=email_val, style=style_ext_system, parent="1", vertex="1")
    ET.SubElement(email, 'mxGeometry', {'as': 'geometry'}, x="800", y="280", width="200", height="130")

    # 9. Mainframe Banking System
    mainframe_val = "<b>Mainframe Banking<br>System</b><br>[Software System]<br><br>Stores all of the core banking<br>information about customers,<br>accounts, transactions, etc."
    mainframe = ET.SubElement(root, 'mxCell', id="mainframe", value=mainframe_val, style=style_ext_system, parent="1", vertex="1")
    ET.SubElement(mainframe, 'mxGeometry', {'as': 'geometry'}, x="800", y="550", width="200", height="150")

    # --- EDGES ---

    def create_edge(edge_id, val, source, target, parent="1", style_extra=""):
        e = ET.SubElement(root, 'mxCell', id=edge_id, value=val, style=style_edge + style_extra, parent=parent, source=source, target=target, edge="1")
        ET.SubElement(e, 'mxGeometry', {'as': 'geometry'}, relative="1")
        return e

    # Edges
    create_edge("e1", "Uses<br>[HTTPS]", "customer", "webapp", style_extra="entryX=0.5;entryY=0;")
    create_edge("e2", "Uses", "customer", "spa", style_extra="entryX=0.5;entryY=0;")
    create_edge("e3", "Uses", "customer", "mobile", style_extra="entryX=0.5;entryY=0;")
    create_edge("e4", "Delivers", "webapp", "spa")
    create_edge("e5", "Uses<br>[JSON/HTTPS]", "spa", "api")
    create_edge("e6", "Uses<br>[JSON/HTTPS]", "mobile", "api")
    
    # API -> Database (Corrected connection points for visual clarity)
    create_edge("e7", "Reads from and<br>writes to<br>[JDBC]", "api", "db", style_extra="entryX=1;entryY=0.5;exitX=0;exitY=0.5;")
    
    create_edge("e8", "Uses<br>[XML/HTTPS]", "api", "mainframe")
    create_edge("e9", "Sends e-mail<br>using<br>[SMTP]", "api", "email")
    create_edge("e10", "Sends e-mails to", "email", "customer", style_extra="entryX=1;entryY=0.5;edgeStyle=orthogonalEdgeStyle;curved=1;")

    # Generate string
    xml_str = minidom.parseString(ET.tostring(mxfile)).toprettyxml(indent="  ")
    
    with open("banking_container_diagram.drawio", "w", encoding="utf-8") as f:
        f.write(xml_str)
    
    print("Successfully created 'banking_container_diagram.drawio'.")

if __name__ == "__main__":
    create_drawio_xml()