const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('public/data/complete_lineage.json', 'utf8'));

console.log('Original counts:');
console.log(`Houses: ${data.houses.length}`);
console.log(`Persons: ${data.persons.length}`);
console.log(`Relationships: ${data.relationships.length}`);

// Find and report duplicates in houses
const houseIds = new Map();
const duplicateHouses = [];
data.houses.forEach((house, index) => {
    if (houseIds.has(house.id)) {
        duplicateHouses.push({ id: house.id, firstIndex: houseIds.get(house.id), duplicateIndex: index });
    } else {
        houseIds.set(house.id, index);
    }
});

console.log('\nDuplicate houses found:');
duplicateHouses.forEach(dup => {
    console.log(`  - ${dup.id}: first at index ${dup.firstIndex}, duplicate at index ${dup.duplicateIndex}`);
});

// Find and report duplicates in persons
const personIds = new Map();
const duplicatePersons = [];
data.persons.forEach((person, index) => {
    if (personIds.has(person.id)) {
        duplicatePersons.push({ id: person.id, name: person.name, firstIndex: personIds.get(person.id), duplicateIndex: index });
    } else {
        personIds.set(person.id, index);
    }
});

console.log('\nDuplicate persons found:');
duplicatePersons.forEach(dup => {
    console.log(`  - ${dup.id} (${dup.name}): first at index ${dup.firstIndex}, duplicate at index ${dup.duplicateIndex}`);
});

// Remove duplicates by keeping only unique entries (first occurrence)
const uniqueHouses = [];
const seenHouseIds = new Set();
data.houses.forEach(house => {
    if (!seenHouseIds.has(house.id)) {
        uniqueHouses.push(house);
        seenHouseIds.add(house.id);
    }
});

const uniquePersons = [];
const seenPersonIds = new Set();
data.persons.forEach(person => {
    if (!seenPersonIds.has(person.id)) {
        uniquePersons.push(person);
        seenPersonIds.add(person.id);
    }
});

// Update the data object
data.houses = uniqueHouses;
data.persons = uniquePersons;

console.log('\nAfter removing duplicates:');
console.log(`Houses: ${data.houses.length} (removed ${houseIds.size - uniqueHouses.length})`);
console.log(`Persons: ${data.persons.length} (removed ${personIds.size - uniquePersons.length})`);
console.log(`Relationships: ${data.relationships.length}`);

// Write the cleaned data back to file
fs.writeFileSync('public/data/complete_lineage.json', JSON.stringify(data, null, 2));

console.log('\n✅ Duplicates removed successfully!');
