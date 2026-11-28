#!/usr/bin/env python3
"""Stamp the game's version on every script it loads, so a phone or headset can never mix an old cached file with new
ones (the same as Ronnie Simulator's).

Run after bumping GAME_VERSION in js/xmas/menu.js (and adding its line to GAME_UPDATES / GAME_WHEN):
    python3 tools/stamp.py
  - writes version.json (the page checks it on load and reloads itself once if it's out of date)
  - rewrites the import map in index.html so every module under js/ is loaded as  js/x.js?v=<version>
  - sets window.GAME_BUILD and the ?v= on the two page scripts
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
menu = open(os.path.join(ROOT, 'js/xmas/menu.js')).read()
v = re.search(r"GAME_VERSION = '([^']+)'", menu).group(1)

mods = sorted(os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, '/')
              for d, _, fs in os.walk(os.path.join(ROOT, 'js')) for f in fs if f.endswith('.js'))
imports = {
    'three': 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js',
    'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/',
    'cannon-es': 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js',
    'meshoptimizer/simplifier': 'https://cdn.jsdelivr.net/npm/meshoptimizer@0.22.0/meshopt_simplifier.module.js',
}
for m in mods:
    imports['./' + m] = './' + m + '?v=' + v

p = os.path.join(ROOT, 'index.html')
html = open(p).read()
block = '<script type="importmap">\n' + json.dumps({'imports': imports}, indent=2) + '\n  </script>'
html = re.sub(r'<script type="importmap">.*?</script>', lambda _: block, html, count=1, flags=re.S)
html = re.sub(r"window\.GAME_BUILD = '[^']*'", "window.GAME_BUILD = '" + v + "'", html)
for s in ('menu', 'main'):
    html = re.sub(r'src="\./js/xmas/' + s + r'\.js(\?v=[^"]*)?"', 'src="./js/xmas/' + s + '.js?v=' + v + '"', html)
open(p, 'w').write(html)
open(os.path.join(ROOT, 'version.json'), 'w').write(json.dumps({'v': v}) + '\n')
print('stamped', v, len(mods), 'modules')
