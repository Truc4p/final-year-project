<mxGraphModel dx="1241" dy="682" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2336" pageHeight="1654" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    <mxCell id="client_container" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;verticalAlign=top;spacingTop=10;fontSize=14;dashed=1;" value="&lt;b&gt;CLIENT-SIDE (Mobile Device)&lt;/b&gt;&lt;br&gt;React Native / Expo App" vertex="1">
      <mxGeometry height="560" width="400" x="40" y="80" as="geometry" />
    </mxCell>
    <mxCell id="server_container" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;verticalAlign=top;spacingTop=10;fontSize=14;dashed=1;" value="&lt;b&gt;SERVER-SIDE (Backend API)&lt;/b&gt;&lt;br&gt;(Node.js, Python, etc.)" vertex="1">
      <mxGeometry height="560" width="360" x="520" y="80" as="geometry" />
    </mxCell>
    <mxCell id="network_line" edge="1" parent="1" style="endArrow=none;dashed=1;html=1;strokeWidth=3;strokeColor=#FF3333;fontSize=14;fontStyle=1" value="NETWORK / INTERNET (HTTP/JSON)">
      <mxGeometry height="50" relative="1" width="50" x="-0.9667" as="geometry">
        <mxPoint as="offset" />
        <mxPoint x="480" y="660" as="sourcePoint" />
        <mxPoint x="480" y="60" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="rn_view" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=14;" value="&lt;b&gt;VIEW&lt;/b&gt;&lt;br&gt;RN Components (Screens/UI)" vertex="1">
      <mxGeometry height="70" width="140" x="150" y="280" as="geometry" />
    </mxCell>
    <mxCell id="rn_controller" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;fontSize=14;" value="&lt;b&gt;CLIENT CONTROLLER&lt;/b&gt;&lt;br&gt;Hooks, State, API Calls&lt;br&gt;(useEffect, fetch)" vertex="1">
      <mxGeometry height="70" width="180" x="150" y="460" as="geometry" />
    </mxCell>
    <mxCell id="api_router" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=14;" value="&lt;b&gt;API ROUTER&lt;/b&gt;&lt;br&gt;Endpoints (e.g., /api/products)" vertex="1">
      <mxGeometry height="60" width="180" x="550" y="150" as="geometry" />
    </mxCell>
    <mxCell id="server_controller" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=14;" value="&lt;b&gt;SERVER CONTROLLER&lt;/b&gt;&lt;br&gt;Business Logic" vertex="1">
      <mxGeometry height="60" width="180" x="550" y="300" as="geometry" />
    </mxCell>
    <mxCell id="server_model" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=14;" value="&lt;b&gt;MODEL&lt;/b&gt;&lt;br&gt;Data Schema/ORM" vertex="1">
      <mxGeometry height="60" width="120" x="580" y="420" as="geometry" />
    </mxCell>
    <mxCell id="db_mobile" parent="1" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=16;" value="DB" vertex="1">
      <mxGeometry height="70" width="80" x="600" y="540" as="geometry" />
    </mxCell>
    <mxCell id="f1" edge="1" parent="1" style="endArrow=classic;html=1;fontSize=12;" target="rn_view" value="1. Taps UI">
      <mxGeometry height="50" relative="1" width="50" as="geometry">
        <mxPoint x="100" y="310.55555555555554" as="sourcePoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="f2" edge="1" parent="1" source="rn_view" style="endArrow=classic;html=1;fontSize=12;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" target="rn_controller" value="2. Triggers Action/Hook">
      <mxGeometry height="50" relative="1" width="50" x="-0.44" y="4" as="geometry">
        <mxPoint x="1" as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="f3" edge="1" parent="1" source="rn_controller" style="endArrow=classic;html=1;fontSize=12;exitX=1;exitY=0.25;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;fillColor=#f8cecc;strokeColor=#b85450;strokeWidth=2;" target="api_router" value="&lt;b&gt;3. HTTP Request (GET/POST)&lt;/b&gt;">
      <mxGeometry relative="1" x="0.1892" y="1" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="f4" edge="1" parent="1" source="api_router" style="endArrow=classic;html=1;fontSize=12;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" target="server_controller" value="4. Routes">
      <mxGeometry height="50" relative="1" width="50" as="geometry" />
    </mxCell>
    <mxCell id="f5a" edge="1" parent="1" source="server_controller" style="endArrow=classic;html=1;fontSize=12;exitX=0.75;exitY=1;exitDx=0;exitDy=0;entryX=0.75;entryY=0;entryDx=0;entryDy=0;" target="server_model" value="">
      <mxGeometry height="50" relative="1" width="50" as="geometry" />
    </mxCell>
    <mxCell id="f5b" edge="1" parent="1" source="server_model" style="endArrow=classic;html=1;fontSize=12;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" target="db_mobile" value="">
      <mxGeometry height="50" relative="1" width="50" as="geometry" />
    </mxCell>
    <mxCell id="f5c" edge="1" parent="1" source="db_mobile" style="endArrow=classic;html=1;fontSize=12;exitX=1;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;curved=1;" target="server_controller" value="5. Fetch Data">
      <mxGeometry height="50" relative="1" width="50" as="geometry">
        <Array as="points">
          <mxPoint x="760" y="440" />
        </Array>
      </mxGeometry>
    </mxCell>
    <mxCell id="f6" edge="1" parent="1" source="server_controller" style="endArrow=classic;html=1;fontSize=12;exitX=0;exitY=0.75;exitDx=0;exitDy=0;entryX=1;entryY=0.75;entryDx=0;entryDy=0;fillColor=#d5e8d4;strokeColor=#82b366;strokeWidth=2;" target="rn_controller" value="&lt;b&gt;6. JSON Data Response&lt;/b&gt;">
      <mxGeometry relative="1" x="0.1964" y="15" as="geometry">
        <mxPoint as="offset" />
      </mxGeometry>
    </mxCell>
    <mxCell id="f7" edge="1" parent="1" source="rn_controller" style="endArrow=classic;html=1;fontSize=12;exitX=0;exitY=0.25;exitDx=0;exitDy=0;entryX=0;entryY=0.75;entryDx=0;entryDy=0;curved=1;" target="rn_view" value="&lt;b&gt;7. Updates State &amp;amp; Re-renders UI&lt;/b&gt;">
      <mxGeometry height="50" relative="1" width="50" x="-0.3015" y="-25" as="geometry">
        <mxPoint as="offset" />
        <Array as="points">
          <mxPoint x="80" y="420" />
        </Array>
      </mxGeometry>
    </mxCell>
    <mxCell id="title_rn" parent="1" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" value="&lt;font style=&quot;font-size: 20px;&quot;&gt;&lt;b&gt;MVC Architecture: React Native / Expo Mobile App (Client-Side Rendering)&lt;/b&gt;&lt;/font&gt;" vertex="1">
      <mxGeometry height="40" width="770" x="60" y="10" as="geometry" />
    </mxCell>
    <mxCell id="dAnP7NFrNrdKoUesFF62-2" parent="1" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;" value="Actor" vertex="1">
      <mxGeometry height="60" width="30" x="70" y="280" as="geometry" />
    </mxCell>
  </root>
</mxGraphModel>
