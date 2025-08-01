const text = '1. **Problem Statement:** This is the problem text'

console.log('Text:', text)

// Test 1: Just find the number and bold text
const test1 = /1\. \*\*Problem Statement\*\*/
console.log('Test 1 (basic):', test1.test(text))

// Test 2: With capture group
const test2 = /1\. \*\*Problem Statement\*\*: (.+)/
const match2 = text.match(test2)
console.log('Test 2 (capture):', !!match2)
if (match2) console.log('Captured:', match2[1])

// Test 3: More flexible
const test3 = /\d+\. \*\*Problem Statement\*\*[:\s]*(.+)/
const match3 = text.match(test3)
console.log('Test 3 (flexible):', !!match3)
if (match3) console.log('Captured:', match3[1]) 