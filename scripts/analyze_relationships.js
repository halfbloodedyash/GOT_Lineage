const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('public/data/complete_lineage.json', 'utf8'));

console.log('Checking relationships for invalid references...\n');

const validPersonIds = new Set(data.persons.map(p => p.id));
const invalidRelationships = [];
const missingPersonIds = new Set();

data.relationships.forEach((rel, index) => {
    const fromValid = validPersonIds.has(rel.from);
    const toValid = validPersonIds.has(rel.to);

    if (!fromValid || !toValid) {
        invalidRelationships.push({
            index,
            from: rel.from,
            to: rel.to,
            type: rel.type,
            fromValid,
            toValid
        });

        if (!fromValid) missingPersonIds.add(rel.from);
        if (!toValid) missingPersonIds.add(rel.to);
    }
});

console.log(`Total relationships: ${data.relationships.length}`);
console.log(`Invalid relationships: ${invalidRelationships.length}`);
console.log(`\nMissing person IDs referenced in relationships:`);

const missingIds = Array.from(missingPersonIds).sort();
missingIds.forEach(id => {
    const count = invalidRelationships.filter(r => r.from === id || r.to === id).length;
    console.log(`  - ${id} (referenced ${count} times)`);
});

console.log(`\nFirst 10 invalid relationships:`);
invalidRelationships.slice(0, 10).forEach(rel => {
    console.log(`  ${rel.from} ${rel.fromValid ? '✓' : '✗'} -> ${rel.to} ${rel.toValid ? '✓' : '✗'} (${rel.type})`);
});

// Check if we should remove these relationships or if there's a pattern
console.log(`\nAnalyzing patterns...`);
const relationshipTypes = {};
invalidRelationships.forEach(rel => {
    relationshipTypes[rel.type] = (relationshipTypes[rel.type] || 0) + 1;
});

console.log('Invalid relationships by type:');
Object.entries(relationshipTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
});
