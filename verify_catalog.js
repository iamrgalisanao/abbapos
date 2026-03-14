import catalogEngine from './src/engines/catalog/index.js';

console.log('--- Initializing Catalog Engine Verification Test ---');

const mockData = {
  categories: [
    { id: 'cat1', name: 'Burgers', description: 'Juicy patties' },
    { id: 'cat2', name: 'Drinks', description: 'Cold beverages' },
  ],
  items: [
    {
      id: 'item1',
      name: 'Cheeseburger',
      categoryId: 'cat1',
      basePrice: 250.00,
      modifierGroups: [
        {
          id: 'mg1',
          name: 'Toppings',
          minSelect: 0,
          maxSelect: 3,
          modifiers: [
            { id: 'mod1', name: 'Bacon', price: 50.00 },
            { id: 'mod2', name: 'Extra Cheese', price: 30.00 },
            { id: 'mod3', name: 'Mushrooms', price: 40.00 },
          ],
        },
        {
          id: 'mg2',
          name: 'Doneness',
          minSelect: 1,
          maxSelect: 1,
          modifiers: [
            { id: 'mod4', name: 'Rare', price: 0 },
            { id: 'mod5', name: 'Medium', price: 0 },
            { id: 'mod6', name: 'Well Done', price: 0 },
          ],
        },
      ],
    },
    {
      id: 'item2',
      name: 'Soda',
      categoryId: 'cat2',
      basePrice: 60.00,
    }
  ],
};

console.log('Loading Mock Catalog Data...');
catalogEngine.loadCatalog(mockData);

// Test 1: Fetch Item & Category
console.log('Test 1: Verify Item and Category Retrieval');
const burger = catalogEngine.getItem('item1');
const drinksCat = catalogEngine.getCategory('cat2');

if (burger && burger.name === 'Cheeseburger' && drinksCat && drinksCat.name === 'Drinks') {
  console.log('SUCCESS: Item and Category retrieved correctly.');
} else {
  console.error('FAILURE: Retrieval failed.');
  process.exit(1);
}

// Test 2: Validation Logic (Success)
console.log('\nTest 2: Validation of Correct Modifier Selection');
const validSelection = {
  'mg1': ['mod1', 'mod2'], // Bacon, Extra Cheese (Allowed range 0-3)
  'mg2': ['mod5'],         // Medium (Allowed range 1-1)
};
const isValid = catalogEngine.validateSelection('item1', validSelection);
if (isValid) {
  console.log('SUCCESS: Valid selection accepted.');
} else {
  console.error('FAILURE: Valid selection rejected.');
  process.exit(1);
}

// Test 3: Validation Logic (Failure - Missing Required)
console.log('\nTest 3: Validation of Invalid Modifier Selection (Missing Required)');
const invalidSelection = {
  'mg1': ['mod1'],
  'mg2': [], // Doneness is required (min 1)
};
const shouldBeInvalid = catalogEngine.validateSelection('item1', invalidSelection);
if (!shouldBeInvalid) {
  console.log('SUCCESS: Invalid selection (missing required) correctly rejected.');
} else {
  console.error('FAILURE: Invalid selection (missing required) was accepted.');
  process.exit(1);
}

// Test 4: Validation Logic (Failure - Over Limit)
console.log('\nTest 4: Validation of Invalid Modifier Selection (Over Limit)');
const overLimitSelection = {
  'mg1': ['mod1', 'mod2', 'mod3', 'extra_mod'], // Over maxSelect 3
  'mg2': ['mod5'],
};
const shouldBeInvalidOverLimit = catalogEngine.validateSelection('item1', overLimitSelection);
if (!shouldBeInvalidOverLimit) {
  console.log('SUCCESS: Invalid selection (over limit) correctly rejected.');
} else {
  console.error('FAILURE: Invalid selection (over limit) was accepted.');
  process.exit(1);
}

console.log('\n--- Catalog Engine Verification Complete ---');
