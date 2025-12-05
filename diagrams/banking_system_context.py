import xml.etree.ElementTree as ET
from xml.dom import minidom

def create_drawio_xml():
    # Root element definitions for Draw.io
    mxfile = ET.Element('mxfile', host="Electron", modified="2024-01-01T00:00:00.000Z", agent="5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) draw.io/21.0.0 Chrome/112.0.0.0 Electron/24.0.0 Safari/537.36", etag="abcdef", version="21.0.0", type="device")
    diagram = ET.SubElement(mxfile, 'diagram', id="C4_Context_Diagram", name="Page-1")
    mxGraphModel = ET.SubElement(diagram, 'mxGraphModel', dx="1422", dy="794", grid="1", gridSize="10", guides="1", tooltips="1", connect="1", arrows="1", fold="1", page="1", pageScale="1", pageWidth="827", pageHeight="1169", math="0", shadow="0")
    root = ET.SubElement(mxGraphModel, 'root')

    # Default Layers
    ET.SubElement(root, 'mxCell', id="0")
    ET.SubElement(root, 'mxCell', id="1", parent="0")

    # --- STYLES ---
    # Blue Style (Internet Banking)
    style_blue_system = "html=1;dashed=0;whitespace=wrap;fillColor=#1168bd;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;"
    # Grey Style (Email, Mainframe)
    style_grey_system = "html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;"
    # Person Style (Customer) - Using C4 Person shape
    style_person = "html=1;dashed=0;whitespace=wrap;fillColor=#08427b;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.person;align=center;metaEdit=1;resizable=0;"
    # Edge Style
    style_edge = "endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;"

    # --- NODES ---
    
    # 1. Personal Banking Customer
    # Note: Using HTML labels for formatting bold text and newlines
    customer_val = "<b>Personal Banking Customer</b><br>[Person]<br><br>A customer of the bank, with<br>personal bank accounts."
    customer = ET.SubElement(root, 'mxCell', id="customer", value=customer_val, style=style_person, parent="1", vertex="1")
    # FIX: Pass 'as' in a dictionary because it is a reserved keyword in Python
    ET.SubElement(customer, 'mxGeometry', {'as': 'geometry'}, x="320", y="40", width="200", height="180")

    # 2. Internet Banking System
    ib_val = "<b>Internet Banking System</b><br>[Software System]<br><br>Allows customers to view<br>information about their bank<br>accounts, and make payments."
    ib_system = ET.SubElement(root, 'mxCell', id="internet_banking", value=ib_val, style=style_blue_system, parent="1", vertex="1")
    ET.SubElement(ib_system, 'mxGeometry', {'as': 'geometry'}, x="100", y="300", width="240", height="140")

    # 3. E-mail System
    email_val = "<b>E-mail System</b><br>[Software System]<br><br>The internal Microsoft Exchange<br>e-mail system."
    email_system = ET.SubElement(root, 'mxCell', id="email_system", value=email_val, style=style_grey_system, parent="1", vertex="1")
    ET.SubElement(email_system, 'mxGeometry', {'as': 'geometry'}, x="520", y="300", width="240", height="140")

    # 4. Mainframe Banking System
    mainframe_val = "<b>Mainframe Banking<br>System</b><br>[Software System]<br><br>Stores all of the core banking<br>information about customers,<br>accounts, transactions, etc."
    mainframe = ET.SubElement(root, 'mxCell', id="mainframe", value=mainframe_val, style=style_grey_system, parent="1", vertex="1")
    ET.SubElement(mainframe, 'mxGeometry', {'as': 'geometry'}, x="100", y="560", width="240", height="150")

    # --- EDGES ---

    # 1. Customer -> Internet Banking (Uses)
    edge1 = ET.SubElement(root, 'mxCell', id="edge1", value="Uses", style=style_edge, parent="1", source="customer", target="internet_banking", edge="1")
    ET.SubElement(edge1, 'mxGeometry', {'as': 'geometry'}, relative="1")

    # 2. Internet Banking -> Mainframe (Uses)
    edge2 = ET.SubElement(root, 'mxCell', id="edge2", value="Uses", style=style_edge, parent="1", source="internet_banking", target="mainframe", edge="1")
    ET.SubElement(edge2, 'mxGeometry', {'as': 'geometry'}, relative="1")

    # 3. Internet Banking -> E-mail System (Sends e-mail using [SMTP])
    edge3 = ET.SubElement(root, 'mxCell', id="edge3", value="Sends e-mail<br>using<br>[SMTP]", style=style_edge, parent="1", source="internet_banking", target="email_system", edge="1")
    ET.SubElement(edge3, 'mxGeometry', {'as': 'geometry'}, relative="1")

    # 4. E-mail System -> Customer (Sends e-mails to)
    # Note: We need to adjust exit/entry points to make it look like the diagram (side to side/top)
    edge4 = ET.SubElement(root, 'mxCell', id="edge4", value="Sends e-mails to", style=style_edge, parent="1", source="email_system", target="customer", edge="1")
    # Adding entryX/Y to make the arrow point to the side/bottom of the customer node nicely
    edge4.set('style', style_edge + "entryX=1;entryY=0.75;entryDx=0;entryDy=0;exitX=0;exitY=0;exitDx=0;exitDy=0;") 
    ET.SubElement(edge4, 'mxGeometry', {'as': 'geometry'}, relative="1")


    # Generate string
    xml_str = minidom.parseString(ET.tostring(mxfile)).toprettyxml(indent="  ")
    
    with open("banking_system_context.drawio", "w", encoding="utf-8") as f:
        f.write(xml_str)
    
    print("Successfully created 'banking_system_context.drawio'.")

if __name__ == "__main__":
    create_drawio_xml()