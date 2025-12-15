<mxGraphModel dx="2641" dy="682" grid="0" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="850" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    <object label="&lt;b&gt;System User&lt;/b&gt;&lt;br&gt;[Person]&lt;br&gt;&lt;br&gt;Represents all users&lt;br&gt;(guests, customers, admins)&lt;br&gt; who interact with Wrencos." id="admin">
      <mxCell parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#08427b;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.person;align=center;metaEdit=1;resizable=0;" vertex="1">
        <mxGeometry height="180" width="200" x="-800" y="30" as="geometry" />
      </mxCell>
    </object>
    <mxCell id="wrencos_system" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#1168bd;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;" value="&lt;b&gt;Wrencos Platform&lt;/b&gt;&lt;br&gt;[Software System]&lt;br&gt;&lt;br&gt;AI-powered beauty &amp;amp; skincare e-commerce&lt;br&gt;platform with livestream shopping,&lt;br&gt;AI dermatology expert, and intelligent&lt;br&gt;customer support." vertex="1">
      <mxGeometry height="160" width="280" x="-840" y="300" as="geometry" />
    </mxCell>
    <mxCell id="gemini_api" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;" value="&lt;b&gt;Google Gemini AI API&lt;/b&gt;&lt;br&gt;[External System]&lt;br&gt;&lt;br&gt;Provides AI-powered dermatology&lt;br&gt;consultation, product recommendations,&lt;br&gt;and intelligent chat responses." vertex="1">
      <mxGeometry height="150" width="240" x="-1218" y="229" as="geometry" />
    </mxCell>
    <mxCell id="vnpay_gateway" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;" value="&lt;b&gt;VNPay Payment Gateway&lt;/b&gt;&lt;br&gt;[External System]&lt;br&gt;&lt;br&gt;Processes customer payments&lt;br&gt;and handles transactions&lt;br&gt;for orders." vertex="1">
      <mxGeometry height="150" width="240" x="-879" y="600" as="geometry" />
    </mxCell>
    <mxCell id="smtp_server" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;" value="&lt;b&gt;SMTP Email Server&lt;/b&gt;&lt;br&gt;[External System]&lt;br&gt;&lt;br&gt;Sends transactional emails,&lt;br&gt;marketing campaigns, and&lt;br&gt;newsletters." vertex="1">
      <mxGeometry height="150" width="240" x="-434" y="174" as="geometry" />
    </mxCell>
    <mxCell id="agora_sdk" parent="1" style="html=1;dashed=0;whitespace=wrap;fillColor=#999999;strokeColor=none;fontColor=#ffffff;shape=mxgraph.c4.softwareSystem;align=center;" value="&lt;b&gt;Agora Cloud&lt;/b&gt;&lt;br&gt;[External System]&lt;br&gt;&lt;br&gt;Powers live video streaming&lt;br&gt;for product demonstrations&lt;br&gt;on mobile apps." vertex="1">
      <mxGeometry height="150" width="240" x="-1203" y="455" as="geometry" />
    </mxCell>
    <mxCell id="edge2" edge="1" parent="1" source="admin" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;entryX=0.75;entryY=0;entryDx=0;entryDy=0;" target="wrencos_system" value="Sends requests&lt;span style=&quot;background-color: light-dark(#ffffff, var(--ge-dark-color, #121212)); color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));&quot;&gt;&amp;nbsp;to&lt;/span&gt;">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="edge4" edge="1" parent="1" source="wrencos_system" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;exitX=0;exitY=0;exitDx=0;exitDy=0;entryX=1;entryY=0.25;entryDx=0;entryDy=0;" target="gemini_api" value="Sends&amp;nbsp;&lt;div&gt;queries to&lt;/div&gt;">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="edge5" edge="1" parent="1" source="wrencos_system" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;entryX=0.75;entryY=0;entryDx=0;entryDy=0;exitX=0.75;exitY=1;exitDx=0;exitDy=0;" target="vnpay_gateway" value="Processes&amp;nbsp;&lt;div&gt;payments&lt;/div&gt;">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-651" y="442" as="sourcePoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="edge6" edge="1" parent="1" source="wrencos_system" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;entryX=0;entryY=0.75;entryDx=0;entryDy=0;" target="smtp_server" value="Sends emails&lt;br&gt;using">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="edge9" edge="1" parent="1" source="wrencos_system" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;entryX=0;entryY=0;entryDx=0;entryDy=15;entryPerimeter=0;" target="fi4ZDTuOSAJPf_ja8x6Q-1" value="Writes to">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-504.6511627906975" y="520" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="edge10" edge="1" parent="1" source="smtp_server" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;entryX=0.996;entryY=0.687;entryDx=0;entryDy=0;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryPerimeter=0;" target="admin" value="Sends emails to">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-434" y="146.03999999999996" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="title" parent="1" style="text;whiteSpace=wrap;html=1;" value="&lt;b&gt;&lt;font style=&quot;font-size: 17px;&quot;&gt;System Context Diagram for Wrencos Platform&lt;/font&gt;&lt;/b&gt;" vertex="1">
      <mxGeometry height="40" width="470" x="-890" y="770" as="geometry" />
    </mxCell>
    <mxCell id="LL61KMBgllRtVzSbYWRO-2" edge="1" parent="1" source="gemini_api" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;exitX=1;exitY=0.75;exitDx=0;exitDy=0;" target="wrencos_system" value="Sends AI&lt;div&gt;responses back&lt;/div&gt;">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-962" y="260.00000000000006" as="sourcePoint" />
        <mxPoint x="-1050" y="146.03999999999996" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="Wu80neo53i2lHHqhtAlD-1" edge="1" parent="1" source="wrencos_system" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;exitX=0;exitY=0.75;exitDx=0;exitDy=0;entryX=0.75;entryY=0;entryDx=0;entryDy=0;" target="agora_sdk" value="Views livestreams">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-1070" y="531" as="sourcePoint" />
        <mxPoint x="-1079" y="406" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="Wu80neo53i2lHHqhtAlD-4" edge="1" parent="1" source="vnpay_gateway" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;entryX=0.5;entryY=1;entryDx=0;entryDy=0;exitX=0.25;exitY=0;exitDx=0;exitDy=0;" target="wrencos_system" value="Sends payment&amp;nbsp;&lt;div&gt;&lt;span style=&quot;background-color: light-dark(#ffffff, var(--ge-dark-color, #121212)); color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));&quot;&gt;status back&lt;/span&gt;&lt;/div&gt;">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-506" y="593" as="sourcePoint" />
        <mxPoint x="-721" y="442" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="Wu80neo53i2lHHqhtAlD-6" edge="1" parent="1" source="wrencos_system" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;entryX=0.116;entryY=0.993;entryDx=0;entryDy=0;exitX=0.25;exitY=0;exitDx=0;exitDy=0;entryPerimeter=0;" value="Sends&amp;nbsp;&lt;div&gt;r&lt;span style=&quot;background-color: light-dark(#ffffff, var(--ge-dark-color, #121212)); color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));&quot;&gt;esponses&amp;nbsp;&lt;/span&gt;&lt;span style=&quot;color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255)); background-color: light-dark(#ffffff, var(--ge-dark-color, #121212));&quot;&gt;back&lt;/span&gt;&lt;/div&gt;">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-800" y="331" as="sourcePoint" />
        <mxPoint x="-748" y="210" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="QR_jDNLymTqPyQid7Dvc-1" edge="1" parent="1" source="fi4ZDTuOSAJPf_ja8x6Q-1" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;entryX=1;entryY=0.75;entryDx=0;entryDy=0;exitX=0;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;" target="wrencos_system" value="Reads from">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-340" y="520" as="sourcePoint" />
        <mxPoint x="-560" y="459" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="fi4ZDTuOSAJPf_ja8x6Q-1" parent="1" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#dae8fc;strokeColor=#6c8ebf;" value="&lt;b style=&quot;text-wrap-mode: nowrap;&quot;&gt;MongoDB Atlas&lt;/b&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;span style=&quot;text-wrap-mode: nowrap;&quot;&gt;[External System]&lt;/span&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;span style=&quot;text-wrap-mode: nowrap;&quot;&gt;Cloud database storing all&lt;/span&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;span style=&quot;text-wrap-mode: nowrap;&quot;&gt;application data (users, products,&lt;/span&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;span style=&quot;text-wrap-mode: nowrap;&quot;&gt;orders, conversations).&lt;/span&gt;" vertex="1">
      <mxGeometry height="167" width="268" x="-402" y="360" as="geometry" />
    </mxCell>
    <mxCell id="fi4ZDTuOSAJPf_ja8x6Q-2" parent="1" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#dae8fc;strokeColor=#6c8ebf;" value="&lt;b style=&quot;text-wrap-mode: nowrap;&quot;&gt;Vector Database (Qdrant)&lt;/b&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;span style=&quot;text-wrap-mode: nowrap;&quot;&gt;[Container]&lt;/span&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;br style=&quot;text-wrap-mode: nowrap;&quot;&gt;&lt;span style=&quot;text-wrap-mode: nowrap;&quot;&gt;Embeddings for RAG responses&lt;/span&gt;&lt;div&gt;&lt;span style=&quot;text-wrap-mode: nowrap;&quot;&gt;&amp;nbsp;and&amp;nbsp;&lt;/span&gt;&lt;span style=&quot;text-wrap-mode: nowrap; background-color: transparent; color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));&quot;&gt;recommendations.&lt;/span&gt;&lt;/div&gt;" vertex="1">
      <mxGeometry height="167" width="268" x="-569" y="572" as="geometry" />
    </mxCell>
    <mxCell id="hTVCLub9AD2BbMDmQiKA-1" edge="1" parent="1" source="fi4ZDTuOSAJPf_ja8x6Q-2" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;entryX=1;entryY=1;entryDx=0;entryDy=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;exitPerimeter=0;" target="wrencos_system" value="Reads from">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-494" y="546" as="sourcePoint" />
        <mxPoint x="-694" y="460" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="Ev7Y4hq71RNuIfRABWL0-1" edge="1" parent="1" source="wrencos_system" style="endArrow=block;dashed=1;html=1;rounded=0;strokeWidth=1;endFill=1;entryX=1;entryY=0.5;entryDx=0;entryDy=0;exitX=0;exitY=1;exitDx=0;exitDy=0;" target="agora_sdk" value="Broadcasts livestreams">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="-884" y="454" as="sourcePoint" />
        <mxPoint x="-701" y="419" as="targetPoint" />
      </mxGeometry>
    </mxCell>
  </root>
</mxGraphModel>
