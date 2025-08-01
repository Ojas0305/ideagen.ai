const text = '1. **Problem Statement:** This is the problem'

console.log('Text:', text)
console.log('Length:', text.length)

// Test without escaping
const pattern1 = /1. **Problem Statement:**/
console.log('Pattern 1 (no escape):', pattern1.test(text))

// Test with escaping
const pattern2 = /1\. \*\*Problem Statement\*\*:/
console.log('Pattern 2 (escaped):', pattern2.test(text))

// Test just the asterisks
const pattern3 = /\*\*Problem Statement\*\*/
console.log('Pattern 3 (just asterisks):', pattern3.test(text))

// Test character by character
console.log('\nCharacter analysis:')
for (let i = 0; i < Math.min(text.length, 30); i++) {
    console.log(`${i}: '${text[i]}' (${text.charCodeAt(i)})`)
} 