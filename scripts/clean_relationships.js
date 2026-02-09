const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('public/data/complete_lineage.json', 'utf8'));

console.log('Validating and cleaning relationships...\n');

const validPersonIds = new Set(data.persons.map(p => p.id));
const validRelationships = [];
const invalidRelationships = [];

data.relationships.forEach((rel, index) => {
    // Check which fields are used
    let person1Id, person2Id;

    if (rel.type === 'parent-child') {
        person1Id = rel.parent;
        person2Id = rel.child;
    } else if (rel.type === 'spouse') {
        person1Id = rel.person1 || rel.spouse1 || rel.from;
        person2Id = rel.person2 || rel.spouse2 || rel.to;
    } else {
        person1Id = rel.from || rel.person1;
        person2Id = rel.to || rel.person2;
    }

    const person1Valid = person1Id && validPersonIds.has(person1Id);
    const person2Valid = person2Id && validPersonIds.has(person2Id);

    if (person1Valid && person2Valid) {
        validRelationships.push(rel);
    } else {
        invalidRelationships.push({
            index,
            relationship: rel,
            person1Id,
            person2Id,
            person1Valid,
            person2Valid
        });
    }
});

console.log(`Total relationships: ${data.relationships.length}`);
console.log(`Valid relationships: ${validRelationships.length}`);
console.log(`Invalid relationships: ${invalidRelationships.length}`);

if (invalidRelationships.length > 0) {
    console.log('\nInvalid relationships (first 20):');
    invalidRelationships.slice(0, 20).forEach(inv => {
        console.log(`  ${inv.person1Id || 'null'} ${inv.person1Valid ? '✓' : '✗'} -> ${inv.person2Id || 'null'} ${inv.person2Valid ? '✓' : '✗'} (${inv.relationship.type})`);
    });

    // Find missing person IDs
    const missingIds = new Set();
    invalidRelationships.forEach(inv => {
        if (!inv.person1Valid && inv.person1Id) missingIds.add(inv.person1Id);
        if (!inv.person2Valid && inv.person2Id) missingIds.add(inv.person2Id);
    });

    if (missingIds.size > 0) {
        console.log(`\nMissing person IDs (${missingIds.size} total):`);
        Array.from(missingIds).sort().slice(0, 20).forEach(id => {
            console.log(`  - ${id}`);
        });
    }
}

// Update the data with only valid relationships
data.relationships = validRelationships;

// Save the cleaned data
fs.writeFileSync('public/data/complete_lineage.json', JSON.stringify(data, null, 2));

console.log(`\n✅ Cleaned relationships saved! Removed ${invalidRelationships.length} invalid entries.`);
