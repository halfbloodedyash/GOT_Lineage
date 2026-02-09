const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('public/data/complete_lineage.json', 'utf8'));

console.log('='.repeat(80));
console.log('DATA QUALITY REPORT FOR COMPLETE_LINEAGE.JSON');
console.log('='.repeat(80));

// Summary counts
console.log('\n📊 SUMMARY COUNTS:');
console.log(`   Houses: ${data.houses.length}`);
console.log(`   Persons: ${data.persons.length}`);
console.log(`   Relationships: ${data.relationships.length}`);

// Check for duplicates
console.log('\n🔍 DUPLICATE CHECK:');
const houseIds = new Set();
const duplicateHouses = [];
data.houses.forEach(house => {
    if (houseIds.has(house.id)) {
        duplicateHouses.push(house.id);
    }
    houseIds.add(house.id);
});

const personIds = new Set();
const duplicatePersons = [];
data.persons.forEach(person => {
    if (personIds.has(person.id)) {
        duplicatePersons.push(person.id);
    }
    personIds.add(person.id);
});

if (duplicateHouses.length === 0 && duplicatePersons.length === 0) {
    console.log('   ✅ No duplicates found!');
} else {
    console.log(`   ❌ Found ${duplicateHouses.length} duplicate houses`);
    console.log(`   ❌ Found ${duplicatePersons.length} duplicate persons`);
}

// List all houses
console.log('\n🏰 ALL HOUSES (sorted alphabetically):');
const sortedHouses = [...data.houses].sort((a, b) => a.name.localeCompare(b.name));
sortedHouses.forEach((house, index) => {
    const memberCount = data.persons.filter(p => p.house === house.id || p.marriedInto === house.id).length;
    console.log(`   ${(index + 1).toString().padStart(2)}. ${house.name.padEnd(25)} (${house.id.padEnd(15)}) - ${memberCount} members`);
});

// Check for orphaned references
console.log('\n🔗 REFERENCE VALIDATION:');
const validHouseIds = new Set(data.houses.map(h => h.id));
const orphanedPersons = data.persons.filter(p => {
    const houseValid = !p.house || validHouseIds.has(p.house);
    const marriedIntoValid = !p.marriedInto || validHouseIds.has(p.marriedInto);
    return !houseValid || !marriedIntoValid;
});

const validPersonIds = new Set(data.persons.map(p => p.id));
const orphanedRelationships = data.relationships.filter(r => {
    let person1Id, person2Id;

    if (r.type === 'parent-child') {
        person1Id = r.parent;
        person2Id = r.child;
    } else if (r.type === 'spouse') {
        person1Id = r.person1 || r.spouse1;
        person2Id = r.person2 || r.spouse2;
    } else {
        person1Id = r.from || r.person1;
        person2Id = r.to || r.person2;
    }

    const person1Valid = person1Id && validPersonIds.has(person1Id);
    const person2Valid = person2Id && validPersonIds.has(person2Id);

    return !person1Valid || !person2Valid;
});

if (orphanedPersons.length === 0 && orphanedRelationships.length === 0) {
    console.log('   ✅ All references are valid!');
} else {
    if (orphanedPersons.length > 0) {
        console.log(`   ❌ Found ${orphanedPersons.length} persons with invalid house references:`);
        orphanedPersons.forEach(p => {
            console.log(`      - ${p.id} (${p.name}): house=${p.house}, marriedInto=${p.marriedInto}`);
        });
    }
    if (orphanedRelationships.length > 0) {
        console.log(`   ❌ Found ${orphanedRelationships.length} relationships with invalid person references`);
    }
}

// Series breakdown
console.log('\n📺 SERIES BREAKDOWN:');
const seriesCounts = {};
data.persons.forEach(p => {
    const series = p.series || 'unknown';
    seriesCounts[series] = (seriesCounts[series] || 0) + 1;
});
Object.entries(seriesCounts).sort((a, b) => b[1] - a[1]).forEach(([series, count]) => {
    console.log(`   ${series.toUpperCase().padEnd(10)}: ${count} characters`);
});

// House size distribution
console.log('\n👥 HOUSE SIZE DISTRIBUTION:');
const houseSizes = data.houses.map(house => {
    const memberCount = data.persons.filter(p => p.house === house.id || p.marriedInto === house.id).length;
    return { name: house.name, id: house.id, count: memberCount };
}).sort((a, b) => b.count - a.count);

console.log('   Top 10 largest houses:');
houseSizes.slice(0, 10).forEach((house, index) => {
    console.log(`   ${(index + 1).toString().padStart(2)}. ${house.name.padEnd(25)} - ${house.count} members`);
});

console.log('\n   Houses with no members:');
const emptyHouses = houseSizes.filter(h => h.count === 0);
if (emptyHouses.length === 0) {
    console.log('   ✅ All houses have at least one member!');
} else {
    emptyHouses.forEach(house => {
        console.log(`   - ${house.name} (${house.id})`);
    });
}

console.log('\n' + '='.repeat(80));
console.log('✅ DATA VALIDATION COMPLETE');
console.log('='.repeat(80));
