<mxGraphModel dx="4109" dy="974" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2336" pageHeight="1654" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    <mxCell id="boundary" parent="1" style="shape=mxgraph.c4.softwareSystem;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#444444;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;fontStyle=1;fontSize=16;dashed=1;" value="Wrencos Platform" vertex="1">
      <mxGeometry height="630" width="1380" x="-1660" y="380" as="geometry" />
    </mxCell>
    <object label="&lt;b&gt;System User&lt;/b&gt;&lt;br&gt;[Person]&lt;br&gt;&lt;br&gt;Represents all users&lt;br&gt;interact with&lt;br&gt;the system." id="actor_customer">
      <mxCell parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#08427b;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.person;align=center;metaEdit=1;resizable=0;" vertex="1">
        <mxGeometry height="180" width="200" x="-940" y="130" as="geometry" />
      </mxCell>
    </object>
    <object label="&lt;b&gt;Web Application&lt;/b&gt;&lt;br&gt;[Container: Vue.js 3 + Vite]&lt;br&gt;&lt;br&gt;Provides all Wrencos functionalities&lt;br&gt; to users via web browsers.&#xa;" id="web_app">
      <mxCell parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#2374BB;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;metaEdit=1;resizable=0;" vertex="1">
        <mxGeometry height="120" width="240" x="-900" y="430" as="geometry" />
      </mxCell>
    </object>
    <object label="&lt;b&gt;Mobile App&lt;/b&gt;&lt;br&gt;[Container: React Native]&lt;br&gt;&lt;br&gt;Provides a mobile-optimized version&lt;br&gt; of Wrencos functionalities for&lt;br&gt; users on smartphones.&#xa;" id="mobile_customer">
      <mxCell parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#2374BB;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;metaEdit=1;resizable=0;" vertex="1">
        <mxGeometry height="120" width="240" x="-1240" y="430" as="geometry" />
      </mxCell>
    </object>
    <object label="&lt;b&gt;API Application&lt;/b&gt;&lt;br&gt;[Container: Node.js + Express]&lt;br&gt;&lt;br&gt;Provides all core business logic&lt;br&gt; and APls for Wrencos.&#xa;" id="backend_api">
      <mxCell parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#2374BB;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;metaEdit=1;resizable=0;" vertex="1">
        <mxGeometry height="130" width="280" x="-920" y="660" as="geometry" />
      </mxCell>
    </object>
    <object label="&lt;b&gt;WebSocket Server&lt;/b&gt;&lt;br&gt;[Container: Node.js / ws]&lt;br&gt;&lt;br&gt;Handles real-time chat &lt;br&gt;and livestream interactions." id="ws_server">
      <mxCell parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#2374BB;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;metaEdit=1;resizable=0;" vertex="1">
        <mxGeometry height="130" width="240" x="-540" y="660" as="geometry" />
      </mxCell>
    </object>
    <object label="&lt;b&gt;Cache Database&lt;/b&gt;&lt;br&gt;[Container: Redis]&lt;br&gt;&lt;br&gt;Provides fast, temporary storage&lt;br&gt;for frequently accessed data.&#xa;" id="ai_service">
      <mxCell parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#2374BB;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;metaEdit=1;resizable=0;" vertex="1">
        <mxGeometry height="130" width="240" x="-1260" y="660" as="geometry" />
      </mxCell>
    </object>
    <mxCell id="gemini_api" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;metaEdit=1;resizable=0;" value="&lt;b&gt;Google Gemini API&lt;/b&gt;&lt;br&gt;[External System]&lt;br&gt;&lt;br&gt;LLM for text and vision analysis." vertex="1">
      <mxGeometry height="120" width="240" x="-1580" y="1062.98" as="geometry" />
    </mxCell>
    <mxCell id="rel1" edge="1" parent="1" source="actor_customer" style="endArrow=block;dashed=1;html=1;entryX=1;entryY=0;entryDx=0;entryDy=0;" target="mobile_customer">
      <mxGeometry relative="1" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="2" connectable="0" parent="rel1" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="Uses" vertex="1">
      <mxGeometry relative="1" x="-0.2" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="rel5" edge="1" parent="1" source="mobile_customer" style="endArrow=block;dashed=1;html=1;exitX=0.75;exitY=1;entryX=0;entryY=0;" target="backend_api">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="3" connectable="0" parent="rel5" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="Makes API calls to" vertex="1">
      <mxGeometry relative="1" x="-0.1" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="rel6" edge="1" parent="1" source="web_app" style="endArrow=block;dashed=1;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" target="backend_api">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="oDDEBpYRjdkLeGvCa5Oo-12" connectable="0" parent="rel6" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="Makes API calls to" vertex="1">
      <mxGeometry relative="1" x="-0.4234" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="rel_agora" edge="1" parent="1" source="mobile_customer" style="endArrow=block;dashed=1;html=1;exitX=0.75;exitY=0;exitDx=0;exitDy=0;entryX=0.75;entryY=1;entryDx=0;entryDy=0;" target="a47yvYg4aUPpDwWcxuq1-13">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-1361.9999999999995" y="495" as="sourcePoint" />
        <mxPoint x="-1381.9999999999995" y="340" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="5" connectable="0" parent="rel_agora" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="Views&amp;nbsp;&lt;div&gt;Livestream&lt;/div&gt;" vertex="1">
      <mxGeometry relative="1" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="rel10" edge="1" parent="1" source="backend_api" style="endArrow=block;dashed=1;html=1;exitX=0.25;exitY=1;entryX=0.855;entryY=0;entryDx=0;entryDy=4.35;entryPerimeter=0;exitDx=0;exitDy=0;" target="oDDEBpYRjdkLeGvCa5Oo-9">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-800" y="960" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="6" connectable="0" parent="rel10" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="Reads/Writes" vertex="1">
      <mxGeometry relative="1" x="-0.1" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="rel11" edge="1" parent="1" source="backend_api" style="endArrow=block;dashed=1;html=1;exitX=0;exitY=0.5;entryX=1;entryY=0.5;" target="ai_service">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="7" connectable="0" parent="rel11" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="Consultation&lt;div&gt;Request&lt;/div&gt;" vertex="1">
      <mxGeometry relative="1" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="rel12" edge="1" parent="1" source="backend_api" style="endArrow=block;dashed=1;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" target="ws_server">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="8" connectable="0" parent="rel12" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="Uses" vertex="1">
      <mxGeometry relative="1" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="rel13" edge="1" parent="1" source="7t0b3FOrYshlknEaaBgg-9" style="endArrow=block;dashed=1;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;exitDx=0;exitDy=0;entryDx=0;entryDy=0;exitPerimeter=0;" target="gemini_api">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-1690" y="770" as="sourcePoint" />
        <mxPoint x="-1846.0000000000002" y="778.5" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="9" connectable="0" parent="rel13" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="Inference" vertex="1">
      <mxGeometry relative="1" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="rel14" edge="1" parent="1" source="backend_api" style="endArrow=block;dashed=1;html=1;exitX=0.75;exitY=1;entryX=0.5;entryY=0;entryDx=0;entryDy=0;exitDx=0;exitDy=0;" target="9aan3jv_lLGqRGX-_A-J-9">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-439.99999999999955" y="990.0000000000002" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="9aan3jv_lLGqRGX-_A-J-10" connectable="0" parent="rel14" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="Processes Payments" vertex="1">
      <mxGeometry relative="1" x="-0.256" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="rel15" edge="1" parent="1" source="backend_api" style="endArrow=block;dashed=1;html=1;exitX=1;exitY=0;entryX=0.25;entryY=1;entryDx=0;entryDy=0;exitDx=0;exitDy=0;" target="RC61DSTwRKu_zYTK57IX-9">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-1460" y="620" as="sourcePoint" />
        <mxPoint x="-962" y="800" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="98gjBMlvYOJHKWevBrgb-9" connectable="0" parent="rel15" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="&lt;span style=&quot;font-size: 10px;&quot;&gt;Sends e-mail using&lt;/span&gt;" vertex="1">
      <mxGeometry relative="1" x="-0.1171" y="1" as="geometry">
        <mxPoint y="-1" as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="title" parent="1" style="text;whiteSpace=wrap;html=1;fontSize=20;fontStyle=1" value="Container Diagram (Level 2) - Wrencos Platform" vertex="1">
      <mxGeometry height="40" width="500" x="-1118" y="1252.98" as="geometry" />
    </mxCell>
    <mxCell id="7t0b3FOrYshlknEaaBgg-9" parent="1" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#dae8fc;strokeColor=#6c8ebf;" value="&lt;b style=&quot;text-wrap-mode: nowrap;&quot;&gt;Vector Database&amp;nbsp;&lt;/b&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;p class=&quot;p1&quot; style=&quot;margin: 0px; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 13px; line-height: normal; font-family: &amp;quot;Helvetica Neue&amp;quot;; text-align: start;&quot;&gt;[Container: LangChain + Qdrant]&lt;/p&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;span style=&quot;text-wrap-mode: nowrap;&quot;&gt;Embeddings for RAG responses&lt;/span&gt;&lt;span style=&quot;font-family: &amp;quot;Helvetica Neue&amp;quot;; font-size: 13px; text-align: start; background-color: transparent; color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));&quot;&gt;,&amp;nbsp;&lt;/span&gt;&lt;div&gt;&lt;span style=&quot;font-family: &amp;quot;Helvetica Neue&amp;quot;; font-size: 13px; text-align: start; background-color: transparent; color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));&quot;&gt;Dermatology AI&lt;/span&gt;&lt;span class=&quot;Apple-converted-space&quot; style=&quot;font-family: &amp;quot;Helvetica Neue&amp;quot;; font-size: 13px; text-align: start; background-color: transparent; color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));&quot;&gt;&amp;nbsp;&lt;/span&gt;&lt;span style=&quot;background-color: transparent; color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255)); text-wrap-mode: nowrap;&quot;&gt;and&amp;nbsp;&lt;/span&gt;&lt;span style=&quot;background-color: transparent; color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255)); text-wrap-mode: nowrap;&quot;&gt;recommendations.&lt;/span&gt;&lt;/div&gt;" vertex="1">
      <mxGeometry height="167" width="268" x="-1616" y="641.5" as="geometry" />
    </mxCell>
    <mxCell id="oDDEBpYRjdkLeGvCa5Oo-9" parent="1" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#dae8fc;strokeColor=#6c8ebf;" value="&lt;b style=&quot;text-wrap-mode: nowrap;&quot;&gt;MongoDB Atlas&lt;/b&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;span style=&quot;text-wrap-mode: nowrap;&quot;&gt;[External System]&lt;/span&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;span style=&quot;text-wrap-mode: nowrap;&quot;&gt;Cloud database storing all&lt;/span&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;span style=&quot;text-wrap-mode: nowrap;&quot;&gt;application data (users, products,&lt;/span&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;span style=&quot;text-wrap-mode: nowrap;&quot;&gt;orders, conversations).&lt;/span&gt;" vertex="1">
      <mxGeometry height="167" width="268" x="-1208" y="1044.48" as="geometry" />
    </mxCell>
    <mxCell id="oDDEBpYRjdkLeGvCa5Oo-10" edge="1" parent="1" source="ai_service" style="endArrow=block;dashed=1;html=1;exitX=0;exitY=0.5;entryX=1;entryY=0.5;exitDx=0;exitDy=0;entryDx=0;entryDy=0;entryPerimeter=0;" target="7t0b3FOrYshlknEaaBgg-9">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-1266" y="760" as="sourcePoint" />
        <mxPoint x="-1516" y="930" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="oDDEBpYRjdkLeGvCa5Oo-11" connectable="0" parent="oDDEBpYRjdkLeGvCa5Oo-10" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="Reads from" vertex="1">
      <mxGeometry relative="1" x="-0.1" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="oDDEBpYRjdkLeGvCa5Oo-14" edge="1" parent="1" source="actor_customer" style="endArrow=block;dashed=1;html=1;entryX=0.25;entryY=0;exitX=0.683;exitY=0.996;exitDx=0;exitDy=0;exitPerimeter=0;entryDx=0;entryDy=0;" target="web_app">
      <mxGeometry relative="1" as="geometry">
        <mxPoint as="offset" />
        <mxPoint x="-1040" y="400" as="sourcePoint" />
        <mxPoint x="-1100" y="490" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="oDDEBpYRjdkLeGvCa5Oo-15" connectable="0" parent="oDDEBpYRjdkLeGvCa5Oo-14" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="Uses" vertex="1">
      <mxGeometry relative="1" x="-0.2" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="RC61DSTwRKu_zYTK57IX-9" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;fontSize=12;" value="&lt;b&gt;SMTP Email Server&lt;/b&gt;&lt;br&gt;[External Service]&lt;br&gt;&lt;br&gt;Transactional emails, marketing,&lt;br&gt;newsletters." vertex="1">
      <mxGeometry height="170" width="220" x="-520" y="180" as="geometry" />
    </mxCell>
    <mxCell id="9aan3jv_lLGqRGX-_A-J-9" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;" value="&lt;b&gt;VNPay Payment Gateway&lt;/b&gt;&lt;br&gt;[External System]&lt;br&gt;&lt;br&gt;Processes customer payments&lt;br&gt;and handles transactions&lt;br&gt;for orders." vertex="1">
      <mxGeometry height="150" width="240" x="-818" y="1047.98" as="geometry" />
    </mxCell>
    <mxCell id="0zyA0w4Eob8Z5ikgockP-9" edge="1" parent="1" source="RC61DSTwRKu_zYTK57IX-9" style="endArrow=block;dashed=1;html=1;exitX=0;exitY=0.5;entryX=0.992;entryY=0.487;exitDx=0;exitDy=0;entryDx=0;entryDy=0;entryPerimeter=0;" target="actor_customer">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-170" y="430" as="sourcePoint" />
        <mxPoint x="328" y="610" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="0zyA0w4Eob8Z5ikgockP-10" connectable="0" parent="0zyA0w4Eob8Z5ikgockP-9" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="&lt;span style=&quot;font-size: 10px;&quot;&gt;Sends e-mail to&lt;/span&gt;" vertex="1">
      <mxGeometry relative="1" x="-0.1171" y="1" as="geometry">
        <mxPoint y="-1" as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="a47yvYg4aUPpDwWcxuq1-9" edge="1" parent="1" source="ws_server" style="endArrow=block;dashed=1;html=1;exitX=0.5;exitY=0;entryX=1;entryY=1;entryDx=0;entryDy=0;exitDx=0;exitDy=0;" target="web_app">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-610" y="900" as="sourcePoint" />
        <mxPoint x="-435" y="590" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="a47yvYg4aUPpDwWcxuq1-10" connectable="0" parent="a47yvYg4aUPpDwWcxuq1-9" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="&lt;span style=&quot;font-size: 10px;&quot;&gt;Updates status&lt;/span&gt;" vertex="1">
      <mxGeometry relative="1" x="-0.1171" y="1" as="geometry">
        <mxPoint y="-1" as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="a47yvYg4aUPpDwWcxuq1-11" edge="1" parent="1" source="ws_server" style="endArrow=block;dashed=1;html=1;exitX=0;exitY=0;entryX=1;entryY=1;entryDx=0;entryDy=0;exitDx=0;exitDy=0;">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-760" y="660" as="sourcePoint" />
        <mxPoint x="-1000" y="550" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="a47yvYg4aUPpDwWcxuq1-12" connectable="0" parent="a47yvYg4aUPpDwWcxuq1-11" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="&lt;span style=&quot;font-size: 10px;&quot;&gt;Updates status&lt;/span&gt;" vertex="1">
      <mxGeometry relative="1" x="-0.1171" y="1" as="geometry">
        <mxPoint y="-1" as="offset" />
      </mxGeometry>
    </mxCell>
    <object label="&lt;b&gt;Agora Cloud&lt;/b&gt;&lt;br&gt;[External System]&lt;br&gt;&lt;br&gt;Video streaming infrastructure." id="a47yvYg4aUPpDwWcxuq1-13">
      <mxCell parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;metaEdit=1;resizable=0;" vertex="1">
        <mxGeometry height="150" width="240" x="-1300" y="150" as="geometry" />
      </mxCell>
    </object>
    <object label="&lt;b&gt;Cache Database&lt;/b&gt;&lt;br&gt;[Container: Redis]&lt;br&gt;&lt;br&gt;Provides fast, temporary storage&lt;br&gt;for frequently accessed data.&#xa;" id="a47yvYg4aUPpDwWcxuq1-16">
      <mxCell parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#2374BB;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;metaEdit=1;resizable=0;" vertex="1">
        <mxGeometry height="130" width="240" x="-1030" y="840" as="geometry" />
      </mxCell>
    </object>
    <mxCell id="oienwoptsgb4J4KwYMog-10" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;" value="&lt;div&gt;&lt;b&gt;Secret Manager&lt;/b&gt;&lt;/div&gt;&lt;div&gt;[External System]&lt;/div&gt;&lt;div&gt;&lt;br&gt;&lt;/div&gt;&lt;div&gt;Manages sensitive information such as&amp;nbsp;&lt;/div&gt;&lt;div&gt;API keys, passwords, and other secrets&lt;/div&gt;" vertex="1">
      <mxGeometry height="150" width="240" x="-530" y="1052.98" as="geometry" />
    </mxCell>
    <mxCell id="oienwoptsgb4J4KwYMog-11" edge="1" parent="1" source="backend_api" style="endArrow=block;dashed=1;html=1;exitX=1;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" target="oienwoptsgb4J4KwYMog-10">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-700" y="930" as="sourcePoint" />
        <mxPoint x="-688" y="1188" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="oienwoptsgb4J4KwYMog-12" connectable="0" parent="oienwoptsgb4J4KwYMog-11" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="&lt;p class=&quot;p1&quot; style=&quot;margin: 0px; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; line-height: normal; font-family: &amp;quot;Helvetica Neue&amp;quot;; text-align: start; text-wrap-mode: wrap;&quot;&gt;&lt;font style=&quot;font-size: 11px;&quot;&gt;Access and manage secrets in&lt;/font&gt;&lt;/p&gt;" vertex="1">
      <mxGeometry relative="1" x="-0.256" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="VLZVtgdhS1FrFmfIG7Xu-9" edge="1" parent="1" source="mobile_customer" style="endArrow=block;dashed=1;html=1;exitX=0.25;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;" target="a47yvYg4aUPpDwWcxuq1-13" value="&lt;div&gt;&lt;br&gt;&lt;/div&gt;&lt;div&gt;&lt;br&gt;&lt;/div&gt;">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-1182" y="450" as="sourcePoint" />
        <mxPoint x="-1230" y="320" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="VLZVtgdhS1FrFmfIG7Xu-10" connectable="0" parent="VLZVtgdhS1FrFmfIG7Xu-9" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="Broadcasts&lt;div&gt;Livestream&lt;/div&gt;" vertex="1">
      <mxGeometry relative="1" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
  </root>
</mxGraphModel>
