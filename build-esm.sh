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

dir="build-esm"

rm -rf "$dir"

mkdir "$dir"

cp tsconfig.json "$dir"

cp -r src/* "$dir"
cd "$dir"
mv browser.ts index.ts
rm -r node
rm node.ts

browser_to_index .

tsc

cd ..

cp package.json "$dir"

cp README.md "$dir"