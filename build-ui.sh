#!/bin/bash

rm -r dist/ui
cd mindmap-ui
npm ci
npm run build
cp -r dist ../dist/ui