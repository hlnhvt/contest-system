const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Get all problems for a contest
router.get('/contest/:contestId', async (req, res) => {
  const { data, error } = await supabase
    .from('problems')
    .select('id, label, title, time_limit, memory_limit')
    .eq('contest_id', req.params.contestId)
    .order('label');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get a single problem with sample cases
router.get('/:id', async (req, res) => {
  const { data: problem, error } = await supabase
    .from('problems')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !problem) return res.status(404).json({ error: 'Not found' });

  const { data: samples } = await supabase
    .from('sample_cases')
    .select('input, expected_output, order_num')
    .eq('problem_id', req.params.id)
    .order('order_num');

  res.json({ ...problem, samples: samples || [] });
});

module.exports = router;
