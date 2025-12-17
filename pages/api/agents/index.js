import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch agents from Supabase
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .order('last_check_in', { ascending: false });

    if (error) throw error;

    // Transform data to match our frontend format
    const formattedAgents = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description || 'No description available',
      status: agent.is_active ? 'Active' : 'Inactive',
      lastCheckIn: new Date(agent.last_check_in).getTime(),
      type: agent.type || 'automation'
    }));

    res.status(200).json(formattedAgents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ 
      error: 'Failed to fetch agents',
      details: error.message 
    });
  }
}
