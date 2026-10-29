import re

# 1. Update flower-geometries.js with larger main stem leaves
with open('src/meadow-lab/flower-geometries.js', 'r') as f:
    fg = f.read()

# Update stemLeaf2
fg = re.sub(
    r'const stemLeaf2 = new THREE\.Mesh\(createSculptedFoliageLeaf\([^)]+\), this\.leafMat\);',
    'const stemLeaf2 = new THREE.Mesh(createSculptedFoliageLeaf(0.52, 0.138, 10), this.leafMat);',
    fg
)

# Update stemLeaf3
fg = re.sub(
    r'const stemLeaf3 = new THREE\.Mesh\(createSculptedFoliageLeaf\([^)]+\), this\.leafMat\);',
    'const stemLeaf3 = new THREE.Mesh(createSculptedFoliageLeaf(0.56, 0.145, 10), this.leafMat);',
    fg
)

# Update stemLeaf4a
fg = re.sub(
    r'const stemLeaf4a = new THREE\.Mesh\(createSculptedFoliageLeaf\([^)]+\), this\.leafMat\);',
    'const stemLeaf4a = new THREE.Mesh(createSculptedFoliageLeaf(0.48, 0.125, 10), this.leafMat);',
    fg
)

# Update stemLeaf4b
fg = re.sub(
    r'const stemLeaf4b = new THREE\.Mesh\(createSculptedFoliageLeaf\([^)]+\), this\.leafMat\);',
    'const stemLeaf4b = new THREE.Mesh(createSculptedFoliageLeaf(0.40, 0.108, 10), this.leafMat);',
    fg
)

# Update pedLeaf1
fg = re.sub(
    r'const pedLeaf1 = new THREE\.Mesh\(createSculptedFoliageLeaf\([^)]+\), this\.leafMat\);',
    'const pedLeaf1 = new THREE.Mesh(createSculptedFoliageLeaf(0.30, 0.082, 8), this.leafMat);',
    fg
)

# Update pedLeaf2
fg = re.sub(
    r'const pedLeaf2 = new THREE\.Mesh\(createSculptedFoliageLeaf\([^)]+\), this\.leafMat\);',
    'const pedLeaf2 = new THREE.Mesh(createSculptedFoliageLeaf(0.24, 0.065, 8), this.leafMat);',
    fg
)

with open('src/meadow-lab/flower-geometries.js', 'w') as f:
    f.write(fg)

print("flower-geometries.js leaves updated!")
