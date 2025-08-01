const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function reParseIdea() {
  try {
    // Get the failing idea
    const { data: idea, error } = await supabase
      .from('full_ideas')
      .select('*')
      .eq('id', '042b6c05-45bc-46cc-9309-280d5b38a86b')
      .single();

    if (error || !idea) {
      console.error('Error fetching idea:', error);
      return;
    }

    console.log('Re-parsing idea:', idea.title);
    console.log('Description:', idea.description.substring(0, 200) + '...');

    const fullIdeaContent = idea.description;

    // Apply the new regex patterns exactly as they are in the server code
    let problem = 'Not specified';
    let solution = 'Not specified';
    let market_opportunity = 'Not specified';
    let target_audience = 'Not specified';
    let implementation = 'Not specified';

    // Try to extract problem from description
    const problemPatterns = [
      /(?:problem|challenge|issue)[:\s]+(.*?)(?=\n|solution|market|target|implementation|$)/is,
      /businesses are (?:confronted|facing|dealing) with (.*?)(?=\n|\.)/is,
      /(?:address|solve|tackle)[:\s]+(.*?)(?=\n|\.)/is,
      /\d+\.\s*\*\*Problem Statement\*\*[:\s]+(.*?)(?=\n\s*\d+\.|$)/is,
      /\*\*Problem Statement\*\*[:\s]+(.*?)(?=\n\s*\*\*|$)/is
    ];

    // Try to extract solution from description
    const solutionPatterns = [
      /(?:solution|approach|method)[:\s]+(.*?)(?=\n|market|target|implementation|$)/is,
      /(?:platform|system|service) (?:that|which) (.*?)(?=\n|\.)/is,
      /(?:provides|offers|enables) (.*?)(?=\n|\.)/is,
      /\d+\.\s*\*\*Solution Description\*\*[:\s]+(.*?)(?=\n\s*\d+\.|$)/is,
      /\*\*Solution Description\*\*[:\s]+(.*?)(?=\n\s*\*\*|$)/is
    ];

    // Try to extract market from description
    const marketPatterns = [
      /(?:market|opportunity|potential)[:\s]+(.*?)(?=\n|target|implementation|$)/is,
      /(?:industry|sector|business) (.*?)(?=\n|\.)/is,
      /\d+\.\s*\*\*Market Opportunity\*\*[:\s]+(.*?)(?=\n\s*\d+\.|$)/is,
      /\*\*Market Opportunity\*\*[:\s]+(.*?)(?=\n\s*\*\*|$)/is
    ];

    // Try to extract target audience
    const audiencePatterns = [
      /(?:target|audience|customers|users)[:\s]+(.*?)(?=\n|implementation|$)/is,
      /(?:for|serves|helps) (.*?) (?:businesses|companies|organizations)/is,
      /\d+\.\s*\*\*Target Audience\*\*[:\s]+(.*?)(?=\n\s*\d+\.|$)/is,
      /\*\*Target Audience\*\*[:\s]+(.*?)(?=\n\s*\*\*|$)/is
    ];

    // Try to extract implementation
    const implPatterns = [
      /(?:implementation|plan|strategy)[:\s]+(.*?)(?=\n|$)/is,
      /(?:using|through|via) (.*?)(?=\n|\.)/is,
      /\d+\.\s*\*\*Implementation Plan\*\*[:\s]+(.*?)(?=\n\s*\d+\.|$)/is,
      /\*\*Implementation Plan\*\*[:\s]+(.*?)(?=\n\s*\*\*|$)/is
    ];

    // Test all patterns and use the first match found
    for (const pattern of problemPatterns) {
      const match = fullIdeaContent.match(pattern);
      if (match && match[1] && match[1].trim().length > 10) {
        problem = match[1].trim();
        break;
      }
    }

    for (const pattern of solutionPatterns) {
      const match = fullIdeaContent.match(pattern);
      if (match && match[1] && match[1].trim().length > 10) {
        solution = match[1].trim();
        break;
      }
    }

    for (const pattern of marketPatterns) {
      const match = fullIdeaContent.match(pattern);
      if (match && match[1] && match[1].trim().length > 10) {
        market_opportunity = match[1].trim();
        break;
      }
    }

    for (const pattern of audiencePatterns) {
      const match = fullIdeaContent.match(pattern);
      if (match && match[1] && match[1].trim().length > 10) {
        target_audience = match[1].trim();
        break;
      }
    }

    for (const pattern of implPatterns) {
      const match = fullIdeaContent.match(pattern);
      if (match && match[1] && match[1].trim().length > 10) {
        implementation = match[1].trim();
        break;
      }
    }

    console.log('\n=== EXTRACTION RESULTS ===');
    console.log('Problem:', problem !== 'Not specified' ? problem.substring(0, 100) + '...' : 'Not specified');
    console.log('Solution:', solution !== 'Not specified' ? solution.substring(0, 100) + '...' : 'Not specified');
    console.log('Market:', market_opportunity !== 'Not specified' ? market_opportunity.substring(0, 100) + '...' : 'Not specified');
    console.log('Audience:', target_audience !== 'Not specified' ? target_audience.substring(0, 100) + '...' : 'Not specified');
    console.log('Implementation:', implementation !== 'Not specified' ? implementation.substring(0, 100) + '...' : 'Not specified');

    // Update the database with the extracted fields
    const { error: updateError } = await supabase
      .from('full_ideas')
      .update({
        problem: problem,
        solution: solution,
        market_opportunity: market_opportunity,
        target_audience: target_audience,
        implementation: implementation,
        updated_at: new Date().toISOString()
      })
      .eq('id', idea.id);

    if (updateError) {
      console.error('Error updating idea:', updateError);
      return;
    }

    console.log(' Successfully updated idea with extracted fields!');

  } catch (error) {
    console.error('Error:', error);
  }
}

reParseIdea(); 