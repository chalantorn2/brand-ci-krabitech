from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen

root = Path(__file__).parent
font = instantiateVariableFont(TTFont(root / 'Montserrat.ttf'), {'wght': 700})
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
upm = font['head'].unitsPerEm

def lettering(text, x, y, size, color, tracking=0):
    parts = []
    scale = size / upm
    for char in text:
        name = cmap[ord(char)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        if pen.getCommands():
            parts.append(f'<path transform="translate({x:.4f} {y}) scale({scale} {-scale})" d="{pen.getCommands()}"/>')
        x += glyphs[name].width * scale + tracking
    return f'<g fill="{color}">' + ''.join(parts) + '</g>'

mark = '''<g fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="#041A53" d="M20 190 L32 148 V125 L50 107 H68 L80 119 V151 L96 174 L112 117 V89 L130 71 H152 L164 83 V128 L181 151 L196 88 V52 L218 30 H242 L260 48 V80"/>
  <path stroke="#0059FF" d="M260 80 V140 L282 162 H314 M260 104 H281 L303 82 H325 M260 80 V58 L280 38 H309"/>
  <path stroke="#0059FF" d="M20 215 C70 181 109 243 160 214 S247 194 314 210"/>
</g>
<circle cx="309" cy="38" r="9" fill="#09FFFF"/>
<circle cx="325" cy="82" r="9" fill="#0059FF"/>
<circle cx="314" cy="162" r="9" fill="#09FFFF"/>'''

def svg(width, height, body, title):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title"><title id="title">{title}</title><rect width="{width}" height="{height}" fill="#FFFFFF"/>{body}</svg>'''

body = '<g transform="translate(167 111)">' + mark + '</g>'
body += lettering('Krabi Digital', 557, 238, 70, '#041A53')
body += lettering('Solutions', 559, 293, 33, '#0059FF', 6)
(root / 'krabi-digital-solutions.svg').write_text(svg(1200, 480, body, 'Krabi Digital Solutions'), encoding='utf-8')
(root / 'krabi-digital-symbol.svg').write_text(svg(384, 320, '<g transform="translate(20 32)">' + mark + '</g>', 'Krabi Digital Solutions symbol'), encoding='utf-8')
# The compact mark has extra optical weight and fewer bends for tiny displays.
favicon = '''<g fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
<path stroke="#041A53" d="M3 22 L4 16 V14 L5.5 12.5 H7 L8 13.5 V17 L9.5 20 L11 14 V11 L12.5 9.5 H14.5 L16 11 V15 L17 18 L18.5 11 V7 L20.5 5 H22.5 L24 6.5 V10"/>
<path stroke="#0059FF" d="M24 10 V17 L26 19 H29 M24 10 L27 7 H29"/>
<path stroke="#0059FF" d="M3 25 C8 22 11 28 16 25 S23 23 29 25"/>
</g><circle cx="29" cy="7" r="1.1" fill="#09FFFF"/><circle cx="29" cy="19" r="1.1" fill="#09FFFF"/>'''
(root / 'favicon.svg').write_text(svg(32, 32, favicon, 'Krabi Digital Solutions favicon'), encoding='utf-8')
