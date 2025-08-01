const description = `1. **Problem Statement:** Businesses often have unused resources that are not fully utilized, leading to inefficiencies and wastage. Conversely, there are businesses that need these resources but cannot afford to buy them new or do not need them on a full-time basis. This gap creates a market inefficiency that needs to be addressed.

2. **Solution Description:** The Data-Driven Marketplace for Unused Business Resources is an online platform where businesses can list and sell their unused resources. These resources can range from surplus office supplies, unused software licenses, underutilized office spaces, or manpower.

3. **Market Opportunity:** According to a report by Accenture, companies worldwide are sitting on approximately $1 trillion in cash from unused assets.

4. **Target Audience:** The primary target audience is businesses of all sizes that have unused resources or need resources on a temporary or permanent basis.

5. **Implementation Plan:** 
- Phase 1: Develop a Minimum Viable Product (MVP) of the platform.
- Phase 2: Conduct a beta test with a small group of businesses.`

console.log(' Testing FIXED regex patterns...')

// Test the fixed patterns
const problemMatch = description.match(/(?:\*\*Problem Statement\*\*[:\s]*|\d+\.\s*\*\*Problem Statement\*\*[:\s]*|\d+\.\s*Problem Statement[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)
const solutionMatch = description.match(/(?:\*\*(?:Solution Description|Proposed Solution)\*\*[:\s]*|\d+\.\s*\*\*(?:Solution Description|Proposed Solution)\*\*[:\s]*|\d+\.\s*Solution Description[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)
const marketMatch = description.match(/(?:\*\*Market Opportunity\*\*[:\s]*|\d+\.\s*\*\*Market Opportunity\*\*[:\s]*|\d+\.\s*Market Opportunity[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)
const audienceMatch = description.match(/(?:\*\*Target Audience\*\*[:\s]*|\d+\.\s*\*\*Target Audience\*\*[:\s]*|\d+\.\s*Target Audience[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)
const implMatch = description.match(/(?:\*\*(?:Implementation (?:Plan|Strategy))\*\*[:\s]*|\d+\.\s*\*\*Implementation Plan\*\*[:\s]*|\d+\.\s*Implementation Plan[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)

console.log(`Problem found: ${!!problemMatch}`)
if (problemMatch) console.log(`   Problem: ${problemMatch[1].trim().substring(0, 80)}...`)

console.log(`Solution found: ${!!solutionMatch}`)
if (solutionMatch) console.log(`   Solution: ${solutionMatch[1].trim().substring(0, 80)}...`)

console.log(`Market found: ${!!marketMatch}`)
if (marketMatch) console.log(`   Market: ${marketMatch[1].trim().substring(0, 80)}...`)

console.log(`Audience found: ${!!audienceMatch}`)
if (audienceMatch) console.log(`   Audience: ${audienceMatch[1].trim().substring(0, 80)}...`)

console.log(`Implementation found: ${!!implMatch}`)
if (implMatch) console.log(`   Implementation: ${implMatch[1].trim().substring(0, 80)}...`)

console.log('\n SUCCESS! All patterns should now work correctly.') 