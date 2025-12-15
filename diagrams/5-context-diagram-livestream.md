<mxGraphModel dx="1241" dy="682" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2336" pageHeight="1654" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    <object label="&lt;b&gt;Admin User&lt;/b&gt;&lt;br&gt;[Person]&lt;br&gt;&lt;br&gt;Content creator who broadcasts&lt;br&gt;live product demonstrations&lt;br&gt;and beauty tutorials&#xa;" id="admin">
      <mxCell parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#08427b;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.person;align=center;metaEdit=1;resizable=0;" vertex="1">
        <mxGeometry height="180" width="200" x="558" y="410" as="geometry" />
      </mxCell>
    </object>
    <object label="&lt;b&gt;Customer User&lt;/b&gt;&lt;br&gt;[Person]&lt;br&gt;&lt;br&gt;Watches live streams,&lt;br&gt;interacts via chat, and&lt;br&gt;purchases featured products&#xa;" id="customer">
      <mxCell parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#08427b;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.person;align=center;metaEdit=1;resizable=0;" vertex="1">
        <mxGeometry height="180" width="200" x="1578" y="410" as="geometry" />
      </mxCell>
    </object>
    <mxCell id="wrencos" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#1168bd;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;" value="&lt;b&gt;WrenCos Livestream System&lt;/b&gt;&lt;br&gt;[Software System]&lt;br&gt;&lt;br&gt;Enables real-time video streaming&amp;nbsp;&lt;div&gt;with product showcasing, chat, and analytics&lt;/div&gt;" vertex="1">
      <mxGeometry height="160" width="280" x="1038" y="420" as="geometry" />
    </mxCell>
    <mxCell id="webrtc" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;" value="&lt;b&gt;WebRTC Infrastructure&lt;/b&gt;&lt;br&gt;[Software System]&lt;br&gt;&lt;br&gt;Google STUN/TURN servers for&amp;nbsp;&lt;div&gt;peer-to-peer connection establishment&lt;/div&gt;" vertex="1">
      <mxGeometry height="150" width="240" x="638" y="740" as="geometry" />
    </mxCell>
    <mxCell id="mongodb" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;" value="&lt;b&gt;MongoDB Atlas&lt;/b&gt;&lt;br&gt;[Software System]&lt;br&gt;&lt;br&gt;Cloud-hosted database for&amp;nbsp;&lt;div&gt;livestream metadata, chat history,&lt;/div&gt;&lt;div&gt;&amp;nbsp;and analytics&lt;/div&gt;" vertex="1">
      <mxGeometry height="150" width="240" x="1058" y="740" as="geometry" />
    </mxCell>
    <mxCell id="storage" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;" value="&lt;b&gt;File Storage&lt;/b&gt;&lt;br&gt;[Software System]&lt;br&gt;&lt;br&gt;Stores recorded livestream&amp;nbsp;&lt;div&gt;videos and thumbnails&lt;/div&gt;" vertex="1">
      <mxGeometry height="150" width="240" x="1478" y="740" as="geometry" />
    </mxCell>
    <mxCell id="edge1" edge="1" parent="1" source="admin" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;" target="wrencos" value="Creates and broadcasts livestreams&lt;br&gt;[HTTPS/WSS]">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="edge2" edge="1" parent="1" source="customer" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;" target="wrencos" value="Watches livestreams and interacts&lt;br&gt;[HTTPS/WSS]">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="edge3" edge="1" parent="1" source="wrencos" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;" target="webrtc" value="Establishes P2P connections&lt;br&gt;[WebRTC/ICE]">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="edge4" edge="1" parent="1" source="wrencos" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;" target="mongodb" value="Reads/writes data&lt;br&gt;[MongoDB Protocol]">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="edge5" edge="1" parent="1" source="wrencos" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;" target="storage" value="Uploads/retrieves videos&lt;br&gt;[HTTP]">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="title" parent="1" style="text;whiteSpace=wrap;html=1;" value="&lt;b&gt;&lt;font style=&quot;font-size: 17px;&quot;&gt;Livestream&amp;nbsp;&lt;/font&gt;&lt;/b&gt;&lt;b&gt;&lt;font style=&quot;font-size: 17px;&quot;&gt;System Context Diagram&lt;/font&gt;&lt;/b&gt;" vertex="1">
      <mxGeometry height="40" width="600" x="1028" y="940" as="geometry" />
    </mxCell>
  </root>
</mxGraphModel>
