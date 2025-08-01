const description = `1. **Problem Statement:** Businesses often have unused resources that are not fully utilized, leading to inefficiencies and wastage.

2. **Solution Description:** The Data-Driven Marketplace for Unused Business Resources is an online platform.`

console.log('Step-by-step regex debugging...')
console.log('Description length:', description.length)
console.log('First 100 chars:', description.substring(0, 100))

// Test if we can find the basic number pattern
const numberPattern = /1\.\s*\*\*Problem Statement\*\*/i
const numberMatch = description.match(numberPattern)
console.log('\n1. Basic number pattern:', !!numberMatch)

// Test if we can find the text after it
const simplePattern = /1\.\s*\*\*Problem Statement\*\*[:\s]*(.+)/is
const simpleMatch = description.match(simplePattern)
console.log('2. Simple pattern (no lookahead):', !!simpleMatch)
if (simpleMatch) console.log('   Match:', simpleMatch[1].substring(0, 50) + '...')

// Test with different lookaheads
const lookahead1 = /1\.\s*\*\*Problem Statement\*\*[:\s]*(.+?)(?=\n2\.)/is
const match1 = description.match(lookahead1)
console.log('3. Lookahead for \\n2\\.:', !!match1)
if (match1) console.log('   Match:', match1[1].trim())

const lookahead2 = /1\.\s*\*\*Problem Statement\*\*[:\s]*(.+?)(?=\n\d+\.)/is  
const match2 = description.match(lookahead2)
console.log('4. Lookahead for \\n\\d+\\.:', !!match2)
if (match2) console.log('   Match:', match2[1].trim())

// Test the exact problematic pattern from our code
const complexPattern = /(?:\*\*Problem Statement\*\*[:\s]*|\d+\.\s*\*\*Problem Statement\*\*[:\s]*|\d+\.\s*Problem Statement[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is
const complexMatch = description.match(complexPattern)
console.log('5. Complex pattern:', !!complexMatch)
if (complexMatch) console.log('   Match:', complexMatch[1].trim()) 