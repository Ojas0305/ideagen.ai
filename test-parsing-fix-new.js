const description = `1. **Problem Statement:** Businesses often have unused resources that are not fully utilized, leading to inefficiencies and wastage. Conversely, there are businesses that need these resources but cannot afford to buy them new or do not need them on a full-time basis. This gap creates a market inefficiency that needs to be addressed.

2. **Solution Description:** The Data-Driven Marketplace for Unused Business Resources is an online platform where businesses can list and sell their unused resources. These resources can range from surplus office supplies, unused software licenses, underutilized office spaces, or manpower. The platform uses intelligent algorithms to match available resources with companies that need them. Predictive analytics are incorporated to forecast demand and supply trends, helping users make informed decisions about pricing and timing. The platform ensures a secure and transparent transaction process to build trust among its users.

3. **Market Opportunity:** According to a report by Accenture, companies worldwide are sitting on approximately $1 trillion in cash from unused assets. This represents a significant market opportunity. Furthermore, the trend towards a circular economy, where resources are reused and recycled, is growing, further increasing the potential market size.

4. **Target Audience:** The primary target audience is businesses of all sizes that have unused resources or need resources on a temporary or permanent basis. This includes small businesses, startups, and large corporations across various industries.

5. **Implementation Plan:** 
- Phase 1: Develop a Minimum Viable Product (MVP) of the platform.
   - Phase 2: Conduct a beta test with a small group of businesses.
   - Phase 3: Refine the platform based on feedback from the beta test.
   - Phase 4: Launch the platform on a larger scale.
   - Phase 5: Continuously improve the platform based on user feedback and data analysis.

6. **Competitive Advantage:** The platform's use of data science to drive the matching process and predict market trends sets it apart from existing platforms for selling used items. This data-driven approach optimizes the process, making it more efficient and effective.

7. **Risk Factors:** Potential risks include resistance from businesses to list their unused resources due to perceived risks or lack of understanding of the process. This can be mitigated by providing clear information about the process and the benefits of participating. Another risk is ensuring the platform's security to protect user data and transactions. This can be mitigated by implementing robust security measures and regularly reviewing and updating them.`

console.log(' Testing updated regex patterns...')

// Updated regex patterns to match ALL AI output formats
const problemMatch = description.match(/(?:\*\*Problem Statement\*\*[:\s]*|\d+\.\s*\*\*Problem Statement\*\*[:\s]*|\d+\.\s*Problem Statement[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)
const solutionMatch = description.match(/(?:\*\*(?:Solution Description|Proposed Solution)\*\*[:\s]*|\d+\.\s*\*\*(?:Solution Description|Proposed Solution)\*\*[:\s]*|\d+\.\s*Solution Description[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)
const marketMatch = description.match(/(?:\*\*Market Opportunity\*\*[:\s]*|\d+\.\s*\*\*Market Opportunity\*\*[:\s]*|\d+\.\s*Market Opportunity[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)
const audienceMatch = description.match(/(?:\*\*Target Audience\*\*[:\s]*|\d+\.\s*\*\*Target Audience\*\*[:\s]*|\d+\.\s*Target Audience[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)
const implMatch = description.match(/(?:\*\*(?:Implementation (?:Plan|Strategy))\*\*[:\s]*|\d+\.\s*\*\*Implementation Plan\*\*[:\s]*|\d+\.\s*Implementation Plan[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)

console.log(`Problem found: ${!!problemMatch}`)
if (problemMatch) console.log(`   Problem: ${problemMatch[1].trim().substring(0, 100)}...`)

console.log(`Solution found: ${!!solutionMatch}`)
if (solutionMatch) console.log(`   Solution: ${solutionMatch[1].trim().substring(0, 100)}...`)

console.log(`Market found: ${!!marketMatch}`)
if (marketMatch) console.log(`   Market: ${marketMatch[1].trim().substring(0, 100)}...`)

console.log(`Audience found: ${!!audienceMatch}`)
if (audienceMatch) console.log(`   Audience: ${audienceMatch[1].trim().substring(0, 100)}...`)

console.log(`Implementation found: ${!!implMatch}`)
if (implMatch) console.log(`   Implementation: ${implMatch[1].trim().substring(0, 100)}...`)

console.log('\n Results:')
console.log({
    problem: problemMatch ? problemMatch[1].trim() : 'Not found',
    solution: solutionMatch ? solutionMatch[1].trim() : 'Not found',
    market_opportunity: marketMatch ? marketMatch[1].trim() : 'Not found',
    target_audience: audienceMatch ? audienceMatch[1].trim() : 'Not found',
    implementation: implMatch ? implMatch[1].trim() : 'Not found'
}) 