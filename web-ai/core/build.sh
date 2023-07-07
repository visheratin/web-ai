rm -rf ./build
mkdir ./build
cp package.json ./build/
cp tsconfig.json ./build/
cp -r src/* ./build/
cd build
tsc