const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('public/data/complete_lineage.json', 'utf8'));

console.log('Adding missing houses...\n');

// Missing houses that are referenced by persons
const missingHouses = [
    {
        id: 'harlaw',
        name: 'House Harlaw',
        seat: 'Ten Towers',
        region: 'Iron Islands',
        words: null,
        sigil: 'A silver scythe on black',
        color: '#708090'
    },
    {
        id: 'ryswell',
        name: 'House Ryswell',
        seat: 'The Rills',
        region: 'The North',
        words: null,
        sigil: 'A black horse head on bronze',
        color: '#cd7f32'
    },
    {
        id: 'frey',
        name: 'House Frey',
        seat: 'The Twins',
        region: 'The Riverlands',
        words: 'We Stand Together',
        sigil: 'Two blue towers connected by a bridge on silver-grey',
        color: '#4682b4'
    },
    {
        id: 'whent',
        name: 'House Whent',
        seat: 'Harrenhal',
        region: 'The Riverlands',
        words: null,
        sigil: 'Nine black bats on a yellow field',
        color: '#ffd700'
    },
    {
        id: 'redwyne',
        name: 'House Redwyne',
        seat: 'The Arbor',
        region: 'The Reach',
        words: null,
        sigil: 'A burgundy grape cluster on blue',
        color: '#800020'
    },
    {
        id: 'thenn',
        name: 'House Thenn',
        seat: 'Beyond the Wall',
        region: 'The North',
        words: null,
        sigil: 'Unknown',
        color: '#696969'
    }
];

// Add missing houses
missingHouses.forEach(house => {
    console.log(`  ✅ Adding ${house.name} (${house.id})`);
    data.houses.push(house);
});

console.log(`\nTotal houses after adding missing: ${data.houses.length}`);

// Save the updated data
fs.writeFileSync('public/data/complete_lineage.json', JSON.stringify(data, null, 2));

console.log('\n✅ Missing houses added successfully!');
