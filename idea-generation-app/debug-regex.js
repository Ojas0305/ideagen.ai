const { createServerSupabaseClient } = require('./dist/lib/supabase/client');

async function debugRegex() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get the failing idea
    const { data: ideas } = await supabase
      .from('full_ideas')
      .select('*')
      .eq('session_id', '8ed648a2-4d04-4fab-9b97-2b65bfa0f14d')
      .eq('overall_score', 0);
    
    if (!ideas || ideas.length === 0) {
      console.log('No failing ideas found');
      return;
    }
    
    const idea = ideas[0];
    console.log('=== DEBUGGING REGEX PATTERNS ===');
    console.log('Title:', idea.title);
    console.log('Current problem:', idea.problem);
    console.log('Current solution:', idea.solution);
    console.log('\n=== FULL AI CONTENT ===');
    console.log(idea.description);
    console.log('\n=== TESTING REGEX PATTERNS ===');
    
    const content = idea.description;
    
    // Test current regex patterns
    const problemMatch = content.match(/(?:\*\*Problem Statement\*\*[:\s]*|\d+\.\s*\*\*Problem Statement\*\*[:\s]*|\d+\.\s*Problem Statement[:\s]*|Problem Statement[:\s]*|Problem[:\s]*)([\s\S]*?)(?=\n\s*(?:\*\*|Problem|Solution|Market|Target|Implementation|\d+\.)|$)/i);
    const solutionMatch = content.match(/(?:\*\*(?:Solution Description|Proposed Solution|Solution)\*\*[:\s]*|\d+\.\s*\*\*(?:Solution Description|Proposed Solution|Solution)\*\*[:\s]*|\d+\.\s*(?:Solution Description|Solution)[:\s]*|(?:Solution Description|Solution)[:\s]*)([\s\S]*?)(?=\n\s*(?:\*\*|Problem|Solution|Market|Target|Implementation|\d+\.)|$)/i);
    
    console.log('Problem regex match:', problemMatch ? problemMatch[1].trim().substring(0, 100) + '...' : 'NO MATCH');
    console.log('Solution regex match:', solutionMatch ? solutionMatch[1].trim().substring(0, 100) + '...' : 'NO MATCH');
    
    // Test simpler patterns
    console.log('\n=== TESTING SIMPLER PATTERNS ===');
    
    // Look for any section with "Problem"
    const simpleProblem = content.match(/Problem[\s\S]*?(?=\n[A-Z]|$)/i);
    console.log('Simple problem match:', simpleProblem ? simpleProblem[0].substring(0, 100) + '...' : 'NO MATCH');
    
    // Look for any section with "Solution"  
    const simpleSolution = content.match(/Solution[\s\S]*?(?=\n[A-Z]|$)/i);
    console.log('Simple solution match:', simpleSolution ? simpleSolution[0].substring(0, 100) + '...' : 'NO MATCH');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugRegex(); 