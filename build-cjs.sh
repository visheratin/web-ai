#!/bin/bash

function browser_to_index() {
  local source="$1"

  for file in "$source"/*; do
    if [ -d "$file" ]; then
      browser_to_index "$file"
    elif [ -f "$file" ]; then
      ext="${file##*.}"

      if [ "$ext" != "ts" ]; then
        continue
      fi

      sed -i 's/from "..\/browser.js"/from "..\/index.js"/g' "$file"
    fi
  done
}

dir="build-cjs"

rm -rf "$dir"

mkdir "$dir"

cp tsconfig.cjs.json "$dir"/tsconfig.json

cp -r src/* "$dir"
cd "$dir"
mv node.ts index.ts
rm -r browser
rm browser.ts

browser_to_index .

tsc

cd ..

cp package.cjs.json "$dir"/package.json

cp README.md "$dir"