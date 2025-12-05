<mxGraphModel dx="4109" dy="2677" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2336" pageHeight="1654" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-1" parent="1" style="text;whiteSpace=wrap;html=1;fontSize=18;fontStyle=1;" value="Container Diagram - Wrencos Platform" vertex="1">
      <mxGeometry height="40" width="600" x="530" y="330" as="geometry" />
    </mxCell>
    <object label="&lt;b&gt;System User&lt;/b&gt;&lt;br&gt;[Person]&lt;br&gt;&lt;br&gt;Guests, Customers,&lt;br&gt;Admins" id="oIwzMl8jUtzINjWurzOE-2">
      <mxCell parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#08427b;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.person;align=center;metaEdit=1;resizable=0;" vertex="1">
        <mxGeometry height="160" width="160" x="530" y="460" as="geometry" />
      </mxCell>
    </object>
    <mxCell id="oIwzMl8jUtzINjWurzOE-3" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#438dd5;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.webBrowserContainer;align=center;fontSize=12;" value="&lt;b&gt;Web Browser - Admin&lt;/b&gt;&lt;br&gt;[Container: Vue.js SPA]&lt;br&gt;&lt;br&gt;Admin interface for managing products,&lt;br&gt;orders, livestreams, AI chat, and operations." vertex="1">
      <mxGeometry height="180" width="260" x="780" y="390" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-4" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#438dd5;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.webBrowserContainer;align=center;fontSize=12;" value="&lt;b&gt;Web Browser - Customer&lt;/b&gt;&lt;br&gt;[Container: Vue.js SPA]&lt;br&gt;&lt;br&gt;Customer interface for browsing,&lt;br&gt;livestream shopping, chat, checkout." vertex="1">
      <mxGeometry height="180" width="260" x="1100" y="390" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-5" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#438dd5;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.mobileDeviceContainer;align=center;fontSize=12;" value="&lt;b&gt;Mobile App - Admin&lt;/b&gt;&lt;br&gt;[Container: React Native]&lt;br&gt;&lt;br&gt;Manage livestreams, broadcast video,&lt;br&gt;pin products, chat with customers." vertex="1">
      <mxGeometry height="180" width="260" x="790" y="600" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-6" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#438dd5;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.mobileDeviceContainer;align=center;fontSize=12;" value="&lt;b&gt;Mobile App - Customer&lt;/b&gt;&lt;br&gt;[Container: React Native]&lt;br&gt;&lt;br&gt;Watch livestreams, purchase products,&lt;br&gt;chat with admins, get AI advice." vertex="1">
      <mxGeometry height="180" width="260" x="1100" y="600" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-7" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#1168bd;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;fontSize=12;" value="&lt;b&gt;API Gateway / Backend Server&lt;/b&gt;&lt;br&gt;[Container: Node.js + Express]&lt;br&gt;&lt;br&gt;REST API endpoints for auth, products,&lt;br&gt;orders, livestreams, chat, payments." vertex="1">
      <mxGeometry height="200" width="280" x="760" y="820" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-8" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#1168bd;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;fontSize=12;" value="&lt;b&gt;WebSocket Server&lt;/b&gt;&lt;br&gt;[Container: Node.js + ws]&lt;br&gt;&lt;br&gt;Real-time chat, viewer count, likes,&lt;br&gt;pinned products, WebRTC signaling." vertex="1">
      <mxGeometry height="200" width="280" x="1110" y="810" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-9" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#1168bd;strokeColor=#0b3d91;fontColor=#000000;shape=cylinder;gradientColor=none;align=center;fontSize=12;" value="&lt;b&gt;Database (MongoDB)&lt;/b&gt;&lt;br&gt;[Container]&lt;br&gt;&lt;br&gt;Users, products, orders, livestreams,&lt;br&gt;chat history, transactions, analytics." vertex="1">
      <mxGeometry height="180" width="260" x="1530" y="810" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-10" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#1168bd;strokeColor=#0b3d91;fontColor=#000000;shape=cylinder;gradientColor=none;align=center;fontSize=12;" value="&lt;b&gt;Vector Database (Qdrant)&lt;/b&gt;&lt;br&gt;[Container]&lt;br&gt;&lt;br&gt;Embeddings for RAG responses and&lt;br&gt;product recommendations." vertex="1">
      <mxGeometry height="180" width="260" x="1530" y="1070" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-11" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;fontSize=12;" value="&lt;b&gt;Google Gemini AI API&lt;/b&gt;&lt;br&gt;[External Service]&lt;br&gt;&lt;br&gt;AI dermatology, recommendations,&lt;br&gt;chat responses." vertex="1">
      <mxGeometry height="180" width="260" x="530" y="1070" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-12" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;fontSize=12;" value="&lt;b&gt;VNPay Payment Gateway&lt;/b&gt;&lt;br&gt;[External Service]&lt;br&gt;&lt;br&gt;Payment processing and transactions." vertex="1">
      <mxGeometry height="180" width="260" x="830" y="1070" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-13" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;fontSize=12;" value="&lt;b&gt;SMTP Email Server&lt;/b&gt;&lt;br&gt;[External Service]&lt;br&gt;&lt;br&gt;Transactional emails, marketing,&lt;br&gt;newsletters." vertex="1">
      <mxGeometry height="180" width="260" x="1180" y="1070" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-14" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.container;align=center;fontSize=12;" value="&lt;b&gt;Agora SDK&lt;/b&gt;&lt;br&gt;[External Service]&lt;br&gt;&lt;br&gt;Live video streaming for mobile apps." vertex="1">
      <mxGeometry height="180" width="260" x="1168" y="1290" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-15" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-2" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-3" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-16" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-2" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-4" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-17" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-3" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-7" value="HTTP/REST" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-18" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-3" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-8" value="WebSocket" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-19" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-4" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-7" value="HTTP/REST" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-20" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-4" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-8" value="WebSocket" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-21" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-5" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-7" value="HTTP/REST" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-22" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-5" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-8" value="WebSocket" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-23" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-6" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-7" value="HTTP/REST" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-24" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-6" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-8" value="WebSocket" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-25" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-7" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-9" value="Read/Write" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-26" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-7" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-10" value="Query/Store" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-27" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-8" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-9" value="Read/Write" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-28" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-7" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-11" value="AI Queries" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-29" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-7" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-12" value="Payment Requests" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-30" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-7" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-13" value="Send Emails" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-31" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-5" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-14" value="Video Stream" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-32" edge="1" parent="1" source="oIwzMl8jUtzINjWurzOE-6" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=2;endFill=1;" target="oIwzMl8jUtzINjWurzOE-14" value="Video Stream" />
    <mxCell id="oIwzMl8jUtzINjWurzOE-33" parent="1" style="text;whiteSpace=wrap;html=1;fontSize=12;fontStyle=1;" value="Legend:" vertex="1">
      <mxGeometry height="20" width="100" x="530" y="1560" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-34" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#1168bd;strokeColor=none;fontColor=#ffffff;fontSize=10;" value="Internal Container" vertex="1">
      <mxGeometry height="30" width="150" x="530" y="1590" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-35" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;fontSize=10;" value="External Service" vertex="1">
      <mxGeometry height="30" width="150" x="700" y="1590" as="geometry" />
    </mxCell>
    <mxCell id="oIwzMl8jUtzINjWurzOE-36" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#438dd5;strokeColor=none;fontColor=#ffffff;fontSize=10;" value="Client Application" vertex="1">
      <mxGeometry height="30" width="150" x="870" y="1590" as="geometry" />
    </mxCell>
  </root>
</mxGraphModel>
