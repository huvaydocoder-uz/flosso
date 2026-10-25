import sys, pymupdf
d = pymupdf.open(sys.argv[1])
for pno in [int(x) for x in sys.argv[2].split(',')]:
    p = d[pno-1]
    print('=== page', pno)
    for img in p.get_images(full=True):
        xref = img[0]
        for r in p.get_image_rects(xref):
            print('img', xref, img[2], img[3], 'smask', img[1], [round(v) for v in r])
    for b in p.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            t = ''.join(s['text'] for s in l['spans']).strip()
            if t: print('txt', repr(t), [round(v) for v in l['bbox']], l['spans'][0]['font'], round(l['spans'][0]['size'],1))
    dr = p.get_drawings()
    print('drawings', len(dr))
    for g in dr[:400]:
        print('dr', [round(v) for v in g['rect']], g.get('fill'), g.get('color'), len(g['items']))
