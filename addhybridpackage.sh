#!/bin/bash
#
#   Add package.json files to cjs/mjs subtrees
#

cat >dist/cjs/package.json <<!EOF
{
    "type": "commonjs",
    "exports": {
        "./*": {
          "import": "./src/*.js",
          "require": "./src/*.js"
        }
    }
}
!EOF

cat >dist/mjs/package.json <<!EOF
{
    "type": "module",
    "exports": {
        "./*": {
          "import": "./src/*.js",
          "require": "./src/*.js"
        }
    }
}
!EOF

find src -name '*.d.ts' -exec cp {} dist/mjs \;
find src -name '*.d.ts' -exec cp {} dist/cjs \;