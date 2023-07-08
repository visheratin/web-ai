rm -rf ./build

mkdir ./build

cp tsconfig.json ./build/
cp -r src/* ./build/
cd build
tsc

cd ..

cp package.json ./build/
cp README.md ./build/