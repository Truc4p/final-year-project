<mxGraphModel dx="1241" dy="682" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2336" pageHeight="1654" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    <mxCell id="browser" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=16;" value="Browser" vertex="1">
      <mxGeometry height="60" width="120" x="430" y="240" as="geometry" />
    </mxCell>
    <mxCell id="router" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=16;" value="Router" vertex="1">
      <mxGeometry height="60" width="120" x="680" y="290" as="geometry" />
    </mxCell>
    <mxCell id="controller" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=16;" value="Controller" vertex="1">
      <mxGeometry height="60" width="120" x="430" y="440" as="geometry" />
    </mxCell>
    <mxCell id="view" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=16;" value="View" vertex="1">
      <mxGeometry height="60" width="120" x="210" y="440" as="geometry" />
    </mxCell>
    <mxCell id="model" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=16;" value="Model" vertex="1">
      <mxGeometry height="60" width="120" x="430" y="600" as="geometry" />
    </mxCell>
    <mxCell id="db" parent="1" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=16;" value="DB" vertex="1">
      <mxGeometry height="80" width="90" x="660" y="590" as="geometry" />
    </mxCell>
    <mxCell id="edge1" edge="1" parent="1" style="endArrow=classic;startArrow=classic;html=1;entryX=0.5;entryY=0;entryDx=0;entryDy=0;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" target="browser" value="">
      <mxGeometry height="50" relative="1" width="50" as="geometry">
        <mxPoint x="490" y="180" as="sourcePoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="edge3" edge="1" parent="1" source="JHFGG3xnVVAJ0bN_bPBE-1" style="endArrow=classic;html=1;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;" target="controller" value="">
      <mxGeometry height="50" relative="1" width="50" as="geometry" />
    </mxCell>
    <mxCell id="edge4" edge="1" parent="1" source="controller" style="endArrow=classic;html=1;exitX=0.75;exitY=1;exitDx=0;exitDy=0;entryX=0.75;entryY=0;entryDx=0;entryDy=0;" target="model" value="">
      <mxGeometry height="50" relative="1" width="50" as="geometry" />
    </mxCell>
    <mxCell id="edge6" edge="1" parent="1" source="model" style="endArrow=classic;html=1;exitX=0.25;exitY=0;exitDx=0;exitDy=0;entryX=0.25;entryY=1;entryDx=0;entryDy=0;" target="controller" value="">
      <mxGeometry height="50" relative="1" width="50" as="geometry" />
    </mxCell>
    <mxCell id="edge5a" edge="1" parent="1" source="model" style="endArrow=classic;html=1;exitX=1;exitY=0.25;exitDx=0;exitDy=0;entryX=0;entryY=0;entryDx=0;entryDy=27.5;entryPerimeter=0;" target="db" value="">
      <mxGeometry height="50" relative="1" width="50" as="geometry" />
    </mxCell>
    <mxCell id="edge5b" edge="1" parent="1" source="db" style="endArrow=classic;html=1;exitX=0;exitY=0;exitDx=0;exitDy=52.5;exitPerimeter=0;entryX=1;entryY=0.75;entryDx=0;entryDy=0;" target="model" value="">
      <mxGeometry height="50" relative="1" width="50" as="geometry" />
    </mxCell>
    <mxCell id="edge7a" edge="1" parent="1" source="controller" style="endArrow=classic;html=1;exitX=0;exitY=0.25;exitDx=0;exitDy=0;entryX=1;entryY=0.25;entryDx=0;entryDy=0;" target="view" value="">
      <mxGeometry height="50" relative="1" width="50" as="geometry" />
    </mxCell>
    <mxCell id="edge7b" edge="1" parent="1" source="view" style="endArrow=classic;html=1;exitX=1;exitY=0.75;exitDx=0;exitDy=0;entryX=0;entryY=0.75;entryDx=0;entryDy=0;" target="controller" value="">
      <mxGeometry height="50" relative="1" width="50" as="geometry" />
    </mxCell>
    <mxCell id="lbl1" parent="1" style="text;html=1;align=left;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" value="1.&amp;nbsp;user clicks a product to view product details&amp;nbsp;" vertex="1">
      <mxGeometry height="30" width="270" x="510" y="195" as="geometry" />
    </mxCell>
    <mxCell id="lbl2" parent="1" style="text;html=1;align=left;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" value="2. router finds the correct route." vertex="1">
      <mxGeometry height="30" width="190" x="600" y="250" as="geometry" />
    </mxCell>
    <mxCell id="lbl4" parent="1" style="text;html=1;align=left;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" value="5. controller asks model&lt;br&gt;for&amp;nbsp;&lt;span style=&quot;text-align: center;&quot;&gt;/product/productId&lt;/span&gt;" vertex="1">
      <mxGeometry height="40" width="150" x="530" y="520" as="geometry" />
    </mxCell>
    <mxCell id="lbl5" parent="1" style="text;html=1;align=left;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" value="6.&amp;nbsp;model&amp;nbsp;retrieves appropriate&amp;nbsp;product from database" vertex="1">
      <mxGeometry height="30" width="310" x="475" y="670" as="geometry" />
    </mxCell>
    <mxCell id="lbl7" parent="1" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" value="7. controller requests&amp;nbsp;view&amp;nbsp;&lt;div&gt;to update data&lt;br&gt;&lt;br&gt;&lt;/div&gt;" vertex="1">
      <mxGeometry height="60" width="170" x="290" y="390" as="geometry" />
    </mxCell>
    <mxCell id="lbl8" parent="1" style="text;html=1;align=right;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" value="8. controller&amp;nbsp;updates browser&amp;nbsp;&lt;div&gt;for user to view the product&lt;/div&gt;" vertex="1">
      <mxGeometry height="40" width="180" x="240" y="260" as="geometry" />
    </mxCell>
    <mxCell id="title" parent="1" style="text;html=1;align=left;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" value="&lt;font style=&quot;font-size: 24px;&quot;&gt;&lt;b&gt;MVC Diagram&amp;nbsp;&lt;/b&gt;&lt;/font&gt;" vertex="1">
      <mxGeometry height="40" width="190" x="400" y="30" as="geometry" />
    </mxCell>
    <mxCell id="WKlURENi9mMp3f5Z55zo-1" parent="1" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;" value="System User" vertex="1">
      <mxGeometry height="60" width="30" x="475" y="90" as="geometry" />
    </mxCell>
    <mxCell id="WKlURENi9mMp3f5Z55zo-2" edge="1" parent="1" source="controller" style="endArrow=classic;html=1;exitX=0.25;exitY=0;exitDx=0;exitDy=0;entryX=0.25;entryY=1;entryDx=0;entryDy=0;" target="browser" value="">
      <mxGeometry height="50" relative="1" width="50" as="geometry">
        <mxPoint x="470" y="450" as="sourcePoint" />
        <mxPoint x="370" y="450" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="WKlURENi9mMp3f5Z55zo-3" edge="1" parent="1" source="browser" style="endArrow=classic;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.25;entryDx=0;entryDy=0;" target="router" value="">
      <mxGeometry height="50" relative="1" width="50" as="geometry">
        <mxPoint x="690" y="430" as="sourcePoint" />
        <mxPoint x="590" y="510" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="JHFGG3xnVVAJ0bN_bPBE-1" parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=16;" value="Middleware" vertex="1">
      <mxGeometry height="60" width="120" x="700" y="430" as="geometry" />
    </mxCell>
    <mxCell id="JHFGG3xnVVAJ0bN_bPBE-5" parent="1" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" value="3. passes through&amp;nbsp;&lt;div&gt;middleware&amp;nbsp;&lt;span style=&quot;background-color: transparent; color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));&quot;&gt;to&amp;nbsp;&lt;/span&gt;&lt;span style=&quot;background-color: transparent; color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));&quot;&gt;check&amp;nbsp;&lt;/span&gt;&lt;/div&gt;&lt;div&gt;&lt;span style=&quot;background-color: transparent; color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));&quot;&gt;authentication,&lt;/span&gt;&lt;span style=&quot;background-color: transparent; color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));&quot;&gt;&amp;nbsp;authorization.&lt;/span&gt;&lt;/div&gt;" vertex="1">
      <mxGeometry height="60" width="180" x="765" y="360" as="geometry" />
    </mxCell>
    <mxCell id="JHFGG3xnVVAJ0bN_bPBE-6" parent="1" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" value="4. If allowed, proceeds&amp;nbsp;&lt;div&gt;to&amp;nbsp;&lt;span style=&quot;text-align: left;&quot;&gt;appropriate c&lt;/span&gt;ontroller&lt;/div&gt;" vertex="1">
      <mxGeometry height="40" width="150" x="550" y="410" as="geometry" />
    </mxCell>
    <mxCell id="JHFGG3xnVVAJ0bN_bPBE-7" edge="1" parent="1" source="router" style="endArrow=classic;html=1;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" target="JHFGG3xnVVAJ0bN_bPBE-1" value="">
      <mxGeometry height="50" relative="1" width="50" as="geometry">
        <mxPoint x="770" y="360" as="sourcePoint" />
        <mxPoint x="640" y="510" as="targetPoint" />
      </mxGeometry>
    </mxCell>
  </root>
</mxGraphModel>
